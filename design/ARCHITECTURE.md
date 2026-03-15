# Claude Coder — 技术架构文档

> 本文件面向开发者和 AI，用于快速理解本工具的设计、文件结构、提示语架构和扩展方向。

---

## 一句话定位

一个基于 Claude Agent SDK 的**自主编码 harness**：自动扫描项目 → 拆解任务 → 逐个实现 → 校验 → 回滚/重试 → 推送，全程无需人工干预。

---

## 0. 核心设计规则（MUST READ）

> 以下规则按重要性排序（注意力 primacy zone），所有代码修改和架构决策必须遵循。

### 规则 1：长 Session 不停工

Agent 在单次 session 中应最大化推进任务进度。**任何非致命问题都不应中断 session**。

- 缺少 API Key → 用 mock 或代码逻辑验证替代，记录到 `test.env`，继续推进
- 测试环境未就绪 → 跳过该测试步骤，完成其余可验证的步骤
- 服务启动失败 → 尝试排查修复，无法修复则记录问题后推进代码实现
- **长时间思考是正常行为**：模型处理大文件（如 500+ 行的代码文件）时可能出现 10-20 分钟的思考间隔，不代表卡死

**反面案例**：Agent 因 `OPENAI_API_KEY` 缺失直接标记任务 `failed` → 浪费整个 session

> Harness 兜底机制：当工具调用间隔超过 `SESSION_STALL_TIMEOUT`（默认 20 分钟）时自动中断 session 并触发 rollback + 重试。此阈值设计为远超正常思考时长，仅捕捉真正的卡死场景。

### 规则 2：回滚即彻底回滚

`git reset --hard` 是全量回滚，不做部分文件保护。

- 凭证文件（`test.env`、`playwright-auth.json`、`browser-profile/`）应通过 `.gitignore` 排除在 git 之外
- 如果回滚发生，说明 session 确实失败，代码应全部还原
- 不需要 backup/restore 机制 — 这是过度设计

### 规则 3：分层校验 + AI 自愈（fatal / warn / pass）

不是所有校验失败都需要回滚。session_result.json 解析失败时，先尝试 AI 修复（`repair.js`），修复后重新校验：

| 情况 | 有新 commit | 处理 |
|------|------------|------|
| session_result.json 格式异常 | — | 先调用 AI 修复 → 重新校验 |
| AI 修复后仍异常 | 是 | **warn** — 代码已提交且可能正确，不回滚 |
| AI 修复后仍异常 | 否 | **fatal** — 无进展，回滚 |
| 全部通过 | — | **pass** — 推送 |

### 规则 4：凭证与代码分离

| 文件 | git 状态 | 说明 |
|------|---------|------|
| `test.env` | .gitignore | Agent 可写入发现的 API Key、测试账号 |
| `playwright-auth.json` | .gitignore | cookies + localStorage 快照（isolated 模式，`claude-coder auth` 生成） |
| `.runtime/browser-profile/` | .gitignore | 持久化浏览器 Profile（persistent 模式，`claude-coder auth` 生成） |
| `session_result.json` | git-tracked | Agent 每次 session 覆盖写入 |
| `tasks.json` | git-tracked | Agent 修改 status 字段 |

### 规则 5：Harness 准备上下文，Agent 直接执行

Agent 不应浪费工具调用读取 harness 已知的数据。所有可预读的上下文通过 prompt hint 注入（见第 5 节 Prompt 注入架构）。

### 规则 6：三层 Session 终止保护

SDK 的 `query()` 循环在模型产出**无 tool_use 的纯文本响应**时自动结束。但非 Claude 模型（GLM/Qwen/DeepSeek）可能不正确返回 `stop_reason: "end_turn"`，导致 SDK 继续发起新 turn 或模型陷入长时间思考。三层可配置的保护机制按优先级互补：

#### 第 1 层：完成检测（核心机制）

PostToolUse hook 监测模型对 `session_result.json` 的写入（Write 工具和 Bash 重定向）。检测到写入后，将超时从 20 分钟**缩短至 5 分钟**。模型在此窗口内未自行终止 → 自动中断。

**精准捕获「任务完成但 session 不终止」，不影响长时间自运行。**

#### 第 2 层：停顿检测（通用兜底）

每 30 秒检查最后一次工具调用时间。无工具调用 > `SESSION_STALL_TIMEOUT`（默认 1200 秒 / 20 分钟）→ 自动中断 session → runner 重试逻辑。

#### 第 3 层：maxTurns（仅 CI 推荐）

SDK 内置轮次计数。默认 0（无限制），仅 CI/pipeline 需要时启用。

| 配置项 | 环境变量 | 默认值 | 说明 |
|--------|---------|--------|------|
| 完成检测超时 | `SESSION_COMPLETION_TIMEOUT` | 300 秒 | session_result 写入后的宽限期 |
| 停顿超时 | `SESSION_STALL_TIMEOUT` | 1200 秒 | 长时间无工具调用 |
| 最大轮次 | `SESSION_MAX_TURNS` | 0（无限制） | 仅 CI 推荐 |

配置方式：`claude-coder setup` → 配置安全限制，或直接编辑 `.claude-coder/.env`。

---

## 1. 核心架构

```mermaid
flowchart TB
    subgraph Runner["bin/cli.js → src/core/runner.js (编排循环)"]
        direction TB
        coding["coding.runCodingSession()<br/>编码 session"]
        simplify_r["simplify()<br/>代码审查"]
    end

    subgraph HarnessClass["src/core/harness.js (Harness 生命周期)"]
        direction TB
        env["ensureEnvironment()"]
        snapshot["snapshot() → headBefore, taskId"]
        validate["validate() → fatal/warn/pass"]
        repair["repair.js → AI 修复 JSON"]
        lifecycle["onSuccess / onFailure / onStall"]
    end

    subgraph SDK["Claude Agent SDK"]
        query["query() 函数"]
        hook_sys["PreToolUse hook<br/>hooks.js 工厂"]
    end

    subgraph Files["文件系统 (.claude-coder/)"]
        direction TB
        profile["project_profile.json<br/>tasks.json"]
        runtime["session_result.json<br/>progress.json"]
        phase[".runtime/<br/>harness_state.json / logs/"]
    end

    Runner -->|"runCodingSession"| SDK
    validate -->|"JSON 损坏"| repair
    repair -->|"runSession('repair')"| SDK
    simplify_r -->|"runSession('simplify')"| SDK

    query -->|PreToolUse 事件| hook_sys

    query -->|Agent 工具调用| Files
    validate -->|读取| runtime
    lifecycle -->|"pass → simplify? → push<br/>fatal → rollback + retry"| Runner
```

**核心特征：**
- **项目无关**：项目信息由 Agent 扫描后存入 `project_profile.json`，harness 不含项目特定逻辑
- **可恢复**：通过 `session_result.json` 跨会话记忆，任意 session 可断点续跑
- **可观测**：SDK 内联 `PreToolUse` hook 实时显示当前工具、操作目标和停顿警告
- **自愈**：JSON 损坏 AI 修复 + 编辑死循环检测 + 停顿超时自动中断 + runner 重试机制
- **跨平台**：纯 Node.js 实现，macOS / Linux / Windows 通用
- **零依赖**：`dependencies` 为空，Claude Agent SDK 作为 peerDependency

---

## 2. 执行流程

```mermaid
flowchart LR
    start(["claude-coder run ..."]) --> harness["Harness.ensureEnvironment()<br/>+ checkPrerequisites()"]

    harness --> loop["编码循环"]

    loop --> loadT["loadTasks()"]
    loadT -->|失败| repair["repairJsonFile()"]
    repair --> loadT2["再次 loadTasks()"]
    loadT2 -->|仍失败| abort([终止])

    loadT -->|成功| allDone{全部 done?}
    allDone -->|是| finalSimplify["needsFinalSimplify?<br/>→ simplify + push"]
    finalSimplify --> finish([完成])

    allDone -->|否| snapshot["harness.snapshot()"]
    snapshot --> session["runCodingSession(N)"]
    session -->|stalled| onStall["harness.onStall()<br/>回滚 + 重试"]
    onStall --> loop

    session -->|正常| val["harness.validate()<br/>(含 AI 修复)"]
    val -->|pass| onSuccess["harness.onSuccess()"]
    onSuccess --> simplifyCheck{shouldSimplify?}
    simplifyCheck -->|是| simplify["simplify() + afterSimplify()"]
    simplify --> push["harness.tryPush()"]
    simplifyCheck -->|否| push
    push --> loop

    val -->|fatal| onFailure["harness.onFailure()<br/>回滚 + 标记 failed?"]
    onFailure --> loop
```

---

## 3. 目录结构与模块职责

```
claude-coder/
├── bin/
│   └── cli.js                    # CLI 入口：参数解析、命令路由
├── src/
│   ├── index.js                  # 模块导出入口（预留）
│   ├── common/                   # 共享基础设施
│   │   ├── assets.js             # 文件资产管理：路径注册、读写、模板渲染
│   │   ├── config.js             # .env 加载、模型映射、环境变量构建
│   │   ├── constants.js          # 常量集中管理（状态、超时、文件名）
│   │   ├── utils.js              # 公共工具（Git、休眠、gitignore 管理）
│   │   ├── tasks.js              # 任务数据读写 + 进度统计
│   │   ├── logging.js            # 日志工具（SDK 消息处理）
│   │   ├── sdk.js                # Claude Agent SDK 加载（缓存）
│   │   ├── indicator.js          # 终端进度指示器
│   │   └── interaction.js        # 人机交互 Hook
│   ├── core/                     # 核心运行时
│   │   ├── runner.js             # 编排循环：session → validate → simplify → push
│   │   ├── harness.js            # Harness 类：生命周期、状态、校验、回滚、任务调度
│   │   ├── session.js            # SDK query() 封装：通用 session 执行器
│   │   ├── coding.js             # 编码 session：prompt 构建 + 执行
│   │   ├── repair.js             # AI 驱动的 JSON 修复（session_result / tasks）
│   │   ├── simplify.js           # 代码审查 session
│   │   ├── context.js            # SessionContext：日志、hooks、indicator 管理
│   │   ├── hooks.js              # Hook 工厂：完成检测 + 停顿检测 + 编辑防护
│   │   ├── prompts.js            # 提示语构建：模板渲染 + 动态 hint 注入
│   │   ├── query.js              # SDK query 选项构建
│   │   ├── plan.js               # 计划生成 + 任务分解
│   │   └── scan.js               # 项目扫描
│   └── commands/                 # CLI 命令实现
│       ├── setup.js              # 交互式配置：模型选择、API Key、MCP 工具
│       ├── init.js               # 环境初始化：依赖安装、服务启动、健康检查
│       └── auth.js               # Playwright 凭证：导出登录状态 + MCP 配置
├── templates/                    # Prompt 模板目录
│   ├── coreProtocol.md           # 核心协议（全局铁律 + session_result 格式）
│   ├── codingSystem.md           # 编码 session 系统 prompt（3 步工作流）
│   ├── planSystem.md             # 计划 session 系统 prompt
│   ├── scanSystem.md             # 扫描 session 系统 prompt
│   ├── codingUser.md             # 编码 session 用户 prompt 模板
│   ├── scanUser.md               # 扫描 session 用户 prompt 模板
│   ├── addUser.md                # 任务分解用户 prompt 模板
│   ├── addGuide.md               # 任务分解指南
│   ├── guidance.json             # Hook 注入规则（Playwright、Bash 进程管理）
│   ├── playwright.md             # Playwright MCP 使用指南
│   └── bash-process.md           # 进程管理跨平台命令参考
└── design/                       # 设计文档
    ├── ARCHITECTURE.md           # 本文档
    ├── core-code.md              # 代码架构图
    └── model-config-flow.md      # 模型配置传导链路
```

### 模块职责说明

| 模块 | 职责 |
|------|------|
| `bin/cli.js` | CLI 入口，解析命令行参数，路由到对应模块 |
| `src/common/assets.js` | 文件资产管理：路径注册表、读写接口、模板渲染 |
| `src/common/config.js` | .env 文件解析、模型配置加载、环境变量构建 |
| `src/common/constants.js` | 常量集中管理：任务状态、超时默认值、文件名 |
| `src/common/utils.js` | 公共工具：Git 操作、gitignore 管理、休眠函数 |
| `src/common/tasks.js` | 任务数据读写：loadTasks / saveTasks / getStats / printStats |
| `src/common/logging.js` | 日志工具：SDK 消息处理、结果提取、Session 分隔符 |
| `src/common/indicator.js` | 终端进度显示：spinner + 工具目标 + 停顿警告 |
| `src/core/runner.js` | 编排循环：加载任务 → session → validate → simplify → push |
| `src/core/harness.js` | Harness 类：环境准备、状态管理、任务调度、校验、回滚、推送 |
| `src/core/session.js` | 通用 session 执行器：SDK 加载 + 日志 + hooks + 执行回调 |
| `src/core/coding.js` | 编码 session：构建 coding prompt + 执行 query |
| `src/core/repair.js` | AI 驱动的 JSON 文件修复：session_result.json / tasks.json |
| `src/core/simplify.js` | 代码审查 session：git diff → AI 审查 → 代码简化 |
| `src/core/hooks.js` | Hook 工厂：PreToolUse 拦截、PostToolUse 完成检测、停顿检测 |
| `src/core/prompts.js` | Prompt 构建：系统 prompt 组装 + 用户 prompt 模板渲染 + hint 注入 |
| `src/core/plan.js` | 计划生成：需求 → 方案文档 → 任务分解 |
| `src/core/scan.js` | 项目扫描：技术栈识别、服务发现、文档收集 |
| `src/commands/setup.js` | 交互式配置向导：模型提供商选择、API Key 输入 |
| `src/commands/init.js` | 环境初始化：npm install、服务启动、健康检查 |
| `src/commands/auth.js` | Playwright 登录态导出：cookies + localStorage |

---

## 4. 文件清单

### 用户项目运行时数据（.claude-coder/）

| 文件 | 生成时机 | 用途 |
|------|----------|------|
| `.env` | `claude-coder setup` | 模型配置 + API Key（gitignored） |
| `project_profile.json` | 首次扫描 | 项目元数据 |
| `tasks.json` | `claude-coder plan` | 任务列表 + 状态跟踪 |
| `progress.json` | 每次 session 结束 | 结构化会话日志 + 成本记录 |
| `session_result.json` | 每次 session 结束 | 当前 session 结果（供下次 session 上下文注入） |
| `test.env` | Agent 写入 | 测试凭证：API Key、测试账号等 |
| `playwright-auth.json` | `claude-coder auth`（isolated 模式） | 浏览器 cookies + localStorage 快照 |
| `.runtime/harness_state.json` | 编码循环 | Harness 状态：session 计数、simplify 记录 |
| `.runtime/browser-profile/` | `claude-coder auth`（persistent 模式） | 持久化浏览器 Profile |
| `.runtime/logs/` | 每次 session | 每 session 独立日志文件 |

---

## 5. Prompt 注入架构

### 架构图

```mermaid
flowchart TB
    subgraph PromptFiles["templates/ (模板文件)"]
        agent_md["agentProtocol.md<br/>Agent 协议"]
        scan_md["scanProtocol.md<br/>扫描协议"]
        coding_tpl["codingUser.md<br/>编码 prompt 模板"]
        scan_tpl["scanUser.md<br/>扫描 prompt 模板"]
        add_tpl["addUser.md<br/>ADD prompt 模板"]
        add_guide["addGuide.md<br/>任务分解指南"]
    end

    subgraph Prompts["src/modules/prompts.js (renderTemplate 引擎)"]
        sys_p["buildSystemPrompt()"]
        coding_p["buildCodingPrompt()"]
        scan_p["buildScanPrompt()"]
        add_p["buildAddPrompt()"]
    end

    subgraph Session["src/core/session.js (SDK 调用)"]
        query["SDK query()<br/>systemPrompt + prompt"]
    end

    agent_md --> sys_p
    scan_md --> sys_p
    coding_tpl -->|"renderTemplate({{hints}})"| coding_p
    scan_tpl -->|"renderTemplate({{vars}})"| scan_p
    add_tpl -->|"renderTemplate({{vars}})"| add_p
    add_guide --> add_p
    sys_p --> query
    coding_p --> query
    scan_p --> query
    add_p --> query
```

### Session 类型与注入内容

| Session 类型 | systemPrompt | user prompt | 触发条件 |
|---|---|---|---|
| **编码** | codingSystem.md + coreProtocol.md | `buildCodingContext()` + 条件 hint | 主循环每次迭代 |
| **扫描** | scanSystem.md + coreProtocol.md | `buildScanPrompt()` + profile 质量要求 | `claude-coder init` |
| **计划** | planSystem.md + coreProtocol.md | `buildPlanPrompt()` + addGuide.md | `claude-coder plan` |
| **修复** | 无 | AI 修复 JSON 文件的内联 prompt | JSON 解析失败时 |
| **审查** | 无 | git diff + 审查指令 | 周期性 / 最终审查 |

### 编码 Session 的条件 Hint

| # | Hint | 触发条件 | 影响 |
|---|---|---|---|
| 1 | `taskContext` | 始终注入 | 任务 ID、描述、步骤、进度（结构化注入） |
| 2 | `memoryHint` | session_result.json 存在 | 上次会话摘要 |
| 3 | `envHint` | 按 session 编号和失败状态 | 环境提示 |
| 4 | `docsHint` | profile.existing_docs 非空 | 编码前读文档 |
| 5 | `testEnvHint` | test.env 存在 | 测试凭证提示 |
| 6 | `mcpHint` | MCP_PLAYWRIGHT=true 且任务需要 Web | Playwright 工具提示 |
| 7 | `playwrightAuthHint` | MCP_PLAYWRIGHT=true 且任务需要 Web | Playwright 模式提示 |
| 8 | `retryContext` | 上次校验失败 | 避免同样的问题 |
| 9 | `serviceHint` | 始终注入 | 服务管理策略 |

---

## 6. 注意力机制与设计决策

### U 型注意力优化

System prompt 按 LLM 注意力 U 型曲线排列（`buildSystemPrompt` 将特定协议置于核心协议之前）：

```
顶部 (primacy zone)    → 特定协议（工作流 + 铁律）  → 最高行为合规率
中部 (低注意力区)      → 参考数据（文件格式等）      → 按需查阅
底部 (recency zone)    → 核心协议（全局铁律）        → 最高约束遵循率
```

### 关键设计决策

| 决策 | 理由 |
|------|------|
| **特定协议置顶** | 编码/扫描/计划各有独立的系统 prompt，置于核心协议之前获得 primacy zone 注意力 |
| **Harness 类封装** | 生命周期、状态、校验、回滚统一在一个类中，runner.js 只负责编排流程 |
| **AI 修复 JSON** | 用 repair.js 替代 regex 硬提取，更可靠且可扩展 |
| **任务上下文注入** | `buildTaskContext()` 将完整的任务信息（ID、描述、步骤）结构化注入 user prompt |
| **simplify 由 runner 调度** | simplify 是流程编排决策，不是生命周期策略，由 runner 判断时机 |
| **prompts.js 模板分离** | 静态文本抽离到 templates/ 目录，prompts.js 仅负责变量计算和渲染 |

---

## 7. Hook 数据流

SDK 的 hooks 是**进程内回调**（非独立进程），零延迟、无 I/O 开销：

```mermaid
sequenceDiagram
    participant SDK as Claude Agent SDK
    participant Hook as inferPhaseStep()
    participant Ind as Indicator (setInterval)
    participant Stall as stallChecker (30s)
    participant Term as 终端

    SDK->>Hook: PreToolUse 回调<br/>{tool_name: "Edit", tool_input: {path: "src/app.tsx"}}
    Hook->>Hook: 推断阶段: Edit → coding
    Hook->>Ind: updatePhase("coding")
    Hook->>Ind: lastToolTime = now
    Hook->>Ind: toolTarget = "src/app.tsx"
    Hook->>Ind: appendActivity("Edit", "src/app.tsx")

    Note over SDK,Hook: 同步回调，return {decision: "allow"}

    loop 每 1s
        Ind->>Term: ⠋ [Session 3] 编码中 02:15 | 读取文件: ppt_generator.py
    end

    loop 每 30s
        Stall->>Ind: 检查 now - lastToolTime
        alt 超过 STALL_TIMEOUT
            Stall->>SDK: stallDetected = true → break for-await
        end
    end
```

---

## 8. 相关文档

- [代码架构图](./core-code.md) — 各模块调用链路详解
- [模型配置传导链路](./model-config-flow.md) — .env 到 SDK 的完整路径
- [测试凭证持久化方案](../docs/PLAYWRIGHT_CREDENTIALS.md) — Playwright 登录态管理