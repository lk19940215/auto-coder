# Agent 架构参考

> **Claude Code**: [Piebald-AI/claude-code-system-prompts](https://github.com/Piebald-AI/claude-code-system-prompts) (v2.1.85, 134+ 版本迭代)
> **Cursor**: [x1xhlol/system-prompts-and-models-of-ai-tools](https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools) → `Cursor Prompts/Agent Prompt 2.0.txt` + `Agent Tools v1.0.json`
> **逆向工程**: [Reverse engineering Claude Code](https://www.reidbarber.com/blog/reverse-engineering-claude-code)
> **最小实现**: [nano-claude-code](https://github.com/cthiriet/nano-claude-code) — 200 行 Claude Code

---

## 架构概览

**Claude Code** = 简单工具 + 强模型（把复杂性交给 LLM，工具层保持薄）
**Cursor** = 工程优化（自研模型 + AST 解析 + 推测性编辑，降低延迟和成本）

| 维度 | Claude Code (CLI) | Cursor (IDE) |
|------|-------------------|--------------|
| 形态 | 终端 CLI | VS Code Fork (Electron) |
| 模型策略 | 单模型（Claude） | 分层路由（Composer + 前沿模型） |
| 上下文 | 按需工具读取（每次消耗 token） | Merkle Tree 主动同步 + AST 语义分块 |
| 并行 | AgentTool 子代理（串行工具执行） | Git Worktree 多代理（最多 8 个并行） |
| 文件编辑 | Search & Replace（精确匹配） | Speculative Edits（次级模型 250 tok/s） |
| 适合 | 自动化流水线、CI/CD、学习理解 | 交互式开发 |

**启示**：我们走 Claude Code 路线（while 循环 + 薄工具层），后期可借鉴 Cursor 的工程优化（多模型路由、语义搜索、子代理并行）。

---

## 提示词注入机制

### API 的三个注入位置

Anthropic API 有三个位置可以注入提示词，Claude Code 全部使用：

```javascript
const response = await client.messages.create({
  model: "claude-sonnet",
  
  // 位置 1: system 参数 — 拼装 40+ 个 system-prompt-* 片段
  system: "你是编程助手... 搜索内容用 Grep... 修改前先读... 独立操作并行...",
  
  // 位置 2: tools[i].description — 每个工具的专属说明
  tools: [{
    name: "Grep",
    description: "A powerful search tool built on ripgrep...",  // 300 tokens
    input_schema: { pattern: {...}, path: {...} }
  }, {
    name: "Bash",
    description: "执行命令... 不要用于搜索... 沙箱规则...",  // ~3000 tokens（30+ 子片段）
    input_schema: { command: {...} }
  }],
  
  // 位置 3: messages — 运行时动态注入 system-reminder
  messages: [
    { role: "user", content: "..." },
    // 运行时可插入 system 类型消息（文件修改提醒、token 用量等）
  ]
});
```

| 提示词类型 | 注入位置 | 内容 | 何时注入 |
|-----------|---------|------|---------|
| `system-prompt-*` | `system` 参数 | 行为指导、工具路由 | 首次组装 |
| `tool-description-*` | `tools[i].description` | 工具能力、用法、约束 | 首次组装 |
| `system-reminder-*` | `messages` 中动态插入 | 文件修改、截断、token 用量 | 运行时按事件触发 |
| `CLAUDE.md` | 拼入 `system` 参数 | 项目级指令 | 首次组装 |
| `agent-prompt-*` | SubAgent 的 `system` 参数 | SubAgent 角色和约束 | 创建 SubAgent 时 |

### 动态拼装流程

Claude Code 有 110+ 个字符串片段，每次 API 调用前按当前状态拼装：

```
最终 system 参数 = 环境信息（模型、平台、日期、CWD）
  + 模式片段（plan / auto / minimal）
  + system-prompt-* 片段（~40个，按条件包含）
  + CLAUDE.md（项目级 > 目录级 > 全局级）

tools[i].description = tool-description-* 片段拼接
  例: Bash description = bash-overview + bash-alternatives(6个)
      + bash-sandbox(15个) + bash-git(4个) + bash-sleep(4个) + ...
```

**条件包含** 用 JS 模板字面量：
```javascript
${AVAILABLE_TOOL_NAMES.has("Bash") ? bashFragments : ""}
${isSubAgentContext ? "限制可用工具..." : "完整工具集..."}
```

**模板变量** 统一引用工具名：`${GREP_TOOL_NAME}` → "Grep"，改名只改一处。

总计 ~27,000-30,000 tokens。Bash 工具 description 自己就占 ~3,000（30+ 子片段拼接）。

---

## 提示词写法模式

这是整个文档的核心。Claude Code 的提示词遵循几个明确的写法模式：

### 模式 1：系统提示词 = 一句话路由

系统提示词只做一件事：**告诉模型用什么工具，不要用什么**。

```
# 搜索内容
To search the content of files, use Grep instead of grep or rg

# 搜索文件
To search for files use Glob instead of find or ls

# 读文件
To read files use Read instead of cat, head, tail, or sed

# 编辑文件
To edit files use Edit instead of sed or awk

# Bash 定位
Reserve using Bash exclusively for system commands and terminal operations
that require shell execution. If unsure and there is a relevant dedicated tool,
default to using the dedicated tool.
```

每个片段 20-30 tokens。不解释为什么，不给示例，不教策略。

### 模式 2：工具描述 = 能力说明 + 边界约束

工具描述回答两个问题：**这个工具能做什么** 和 **怎么避免出错**。

以 Grep 为例（300 tokens）：

```
A powerful search tool built on ripgrep

Usage:
- ALWAYS use Grep for search tasks. NEVER invoke grep or rg as a Bash command.
- Supports full regex syntax (e.g., "log.*Error", "function\s+\w+")
- Filter files with glob/type parameter
- Output modes: "content" / "files_with_matches" (default) / "count"
- Use Task tool for open-ended searches requiring multiple rounds
- Pattern syntax: Uses ripgrep — literal braces need escaping
  (use interface\{\} to find interface{} in Go code)
- Multiline matching: use multiline: true for cross-line patterns
```

注意它写了什么和**没写什么**：

| 写了 | 没写 |
|------|------|
| 支持完整正则 | "应该用 \| 组合多个模式" |
| 有 output_mode 参数 | "避免多次调用" |
| 转义规则（Go `interface\{\}`） | "搜关键词用 keyword1\|keyword2" |
| 复杂搜索用 Task | "grep 结果无需再 read" |

**Claude Code 不指导搜索策略**。因为 Claude Sonnet/Opus 自己知道怎么搜。

再看 Edit（246 tokens）：

```
Performs exact string replacements in files.

Usage:
- [必须先 Read]
- 保留 Read 输出中的精确缩进（制表符/空格）
- old_string 必须在文件中唯一，否则用 replace_all
- replace_all 适用于重命名变量
- ALWAYS prefer editing existing files. NEVER write new files unless required.
```

写法模式一致：**能力 + 约束，不教策略**。

### 模式 3：负面约束集中在 Bash

所有 "NOT xxx" 都附在 Bash 工具描述上，不在系统提示词里：

```
Content search: Use Grep (NOT grep or rg)
File search: Use Glob (NOT find or ls)
Edit files: Use Edit (NOT sed/awk)
Read files: Use Read (NOT cat/head/tail)
Write files: Use Write (NOT echo >/cat <<)
Communication: Output text directly (NOT echo/printf)
```

加上一个兜底：
```
While Bash can do similar things, it's better to use the built-in tools
as they provide a better user experience and make it easier to review
tool calls and give permission.
```

**原理**：模型倾向用 Bash 做一切（因为 Bash 最灵活），需要在 Bash 的入口处拦截。

### 模式 4：SubAgent 提示词 = 角色 + 约束 + 效率要求

Explore SubAgent（494 tokens）的结构：

```
1. 角色定义：You are a file search specialist. You excel at navigating codebases.

2. 硬约束（大写强调）：
   === CRITICAL: READ-ONLY MODE ===
   STRICTLY PROHIBITED from creating/modifying/deleting files.

3. 能力描述：
   - Rapidly finding files using glob patterns
   - Searching code with powerful regex patterns  
   - Reading and analyzing file contents

4. 工具指导：
   - Use Glob/Grep for search
   - Use Read when you know the specific file path
   - Use Bash ONLY for read-only operations

5. 效率要求：
   You are meant to be a fast agent. In order to achieve this you must:
   - Make efficient use of tools: be smart about how you search
   - Wherever possible spawn multiple parallel tool calls
```

General Purpose SubAgent（277 tokens）更简洁：

```
Do what has been asked; nothing more, nothing less.
Report concisely — the caller will relay to the user.

Guidelines:
- Search broadly when you don't know where something lives.
- Start broad and narrow down.
- Use multiple search strategies if the first doesn't yield results.
- Be thorough: Check multiple locations, consider different naming conventions.
```

### 模式 5：委派提示词写法指导

Claude Code 有一个专门教「怎么给 SubAgent 写 prompt」的片段（365 tokens）：

```
有上下文继承时（fork）：
- Agent 已经知道一切，不需要解释背景
- Prompt 是指令：做什么、范围多大、不做什么
- 需要短回复就明说（"under 200 words"）

无上下文时（指定 subagent_type）：
- 像对一个刚走进房间的聪明同事做简报
- 解释你要完成什么、为什么
- 描述你已经了解或排除的内容

核心原则：永远不要委派理解。
不要写 "based on your findings, fix the bug"。
包含文件路径、行号、具体要改什么。
```

配有完整示例：

```javascript
// 好的委派 — 具体、有上下文
Task({
  description: "Independent migration review",
  subagent_type: "code-reviewer",
  prompt: "Review migration 0042_user_schema.sql for safety.
    Context: adding a NOT NULL column to a 50M-row table.
    Existing rows get a backfill default. I want a second
    opinion on whether the backfill is safe under concurrent writes."
})

// 坏的委派 — 模糊、委派理解
Task({ prompt: "Review the migration and fix any issues." })
```

### 模式 6：输出效率 = 行动优先

```
IMPORTANT: Go straight to the point. Try the simplest approach first
without going in circles. Do not overdo it. Be extra concise.

Lead with the answer or action, not the reasoning.
Skip filler words, preamble, and unnecessary transitions.
Do not restate what the user said — just do it.

Focus text output on:
- Decisions that need the user's input
- High-level status updates at natural milestones
- Errors or blockers that change the plan

If you can say it in one sentence, don't use three.
```

---

## 核心设计原则

从 Claude Code 和 Cursor 的提示词架构中提取的通用设计原则：

### P1: 能力 + 约束，不教策略

工具描述只回答两个问题：**能做什么**（能力边界）和**怎么避免出错**（约束）。不告诉模型"应该怎么搜索"或"应该用什么模式"。

```
✅ "支持完整正则语法（如 log.*Error）"          — 能力
✅ "old_string 必须唯一匹配，否则提供更多上下文行" — 约束
❌ "应该用 | 组合多个模式来提高效率"              — 策略（Claude Code 不写）
```

**例外**：当模型能力不足时（如 GLM-5 vs Claude Sonnet），需要在工具描述中添加**策略补偿**。这是位置正确的临时方案，模型升级后可移除。

### P2: 系统提示词 = What，工具描述 = How

- 系统提示词："搜索内容 → grep"（路由）
- 工具描述："支持正则、有 output_mode、转义规则..."（用法）

### P3: 负面约束集中在 Bash

所有 "不要用 xxx" 集中在 Bash 工具描述上。原理：模型倾向用 Bash 做一切，需要在入口处拦截。

### P4: 模型能力决定策略密度

| 模型 | 策略密度 | 做法 |
|------|---------|------|
| Claude Sonnet/Opus | 零策略 | 只写能力+约束，模型自行判断 |
| GLM-5 | 适量策略 | 在工具描述中加入搜索模式建议 |

### P5: 每次 API 调用都传完整 system + tools

Anthropic API 要求 `system` 和 `tools` 参数在**每次** `messages.create()` 中传入。这不是"首次注入"，而是每轮都全量传递。

**Prompt Caching**（仅 Anthropic 原生 API）：通过 `cache_control: { type: "ephemeral" }` 标记可缓存内容，缓存命中时 token 费用降低 90%。

```javascript
// Anthropic 原生 API 示例（DashScope 等兼容 API 不支持）
system: [{
  type: "text",
  text: "大段不变的系统提示词...",
  cache_control: { type: "ephemeral" }  // ← 缓存标记
}]
```

| API 环境 | 支持缓存 | 备注 |
|---------|---------|------|
| Anthropic 原生 + Claude 模型 | ✅ | 缓存命中 -90% token 费 |
| DashScope + GLM-5（我们） | ❌ | 每轮全量计费 |
| OpenAI 兼容 API | ❌ | 无此特性 |

---

## 片段选用规则

| 触发条件 | 包含的片段 |
|----------|----------|
| **始终包含** | `parallel-tool-call-note`, `doing-tasks-*`(10+个), `tool-usage-*`(10+个), `output-efficiency` |
| **有 Bash 工具** | `bash-overview` + 30+ 子片段（alternatives, sandbox, git, sleep...） |
| **有 Task 工具** | `agent-when-to-launch`, `agent-usage-notes`, `writing-subagent-prompts`, `delegation-examples` |
| **Plan 模式** | `plan-mode-is-active` (923-1297 tokens) |
| **Auto 模式** | `auto-mode` (255 tokens) |
| **SubAgent 上下文** | 限制工具集，移除部分参数说明 |
| **运行时事件** | `file-modified`, `file-truncated`, `token-usage` 等 system-reminder 动态注入 |

---

## 与我们的对比

| 维度 | Claude Code | 我们（GLM-5） |
|------|------------|---------------|
| **注入位置** | system + tools[].description + 动态 reminder | system + tools[].description ✅ |
| **system 拼装** | 40+ 片段条件组装 | 单一字符串 |
| **tools[].description** | 片段拼接（Bash ~3000 tokens） | 每工具一个字符串 ✅ |
| **grep 描述** | 能力说明，无策略 | 能力 + **策略补偿** ✅ |
| **Bash 约束** | description 中 30+ 子片段 | description 中一段话 ✅ |
| **SubAgent** | Explore / General Purpose / code-reviewer | task（单一类型） |
| **模板变量** | `${GREP_TOOL_NAME}` 替换 | 硬编码 |
| **动态提醒** | system-reminder 运行时注入 | 无 |

### v7 改动（提示词架构对齐）

- SYSTEM_PROMPT 采用 "→ 工具名（不要用 bash xxx）" 路由模式（模式 1）
- Bash 负面约束从 SYSTEM_PROMPT 移到 bash description（模式 3）
- 加入输出效率原则（模式 6）
- task description 补充 "SubAgent 结果需要转述"

### v8 改动（工具描述全面优化）

参考 Claude Code "能力 + 约束，不教策略" 原则，全部工具描述重写：

| 工具 | 改动 | 参考 |
|------|------|------|
| grep | +正则示例（`log.*Error`）、+ripgrep 转义说明、+复杂搜索用 task | 模式 2 |
| bash | 负面约束结构化列表（→ 箭头格式）、+write 约束 | 模式 3 |
| edit | +缩进保留警告 | Claude Code Edit |
| read | +说明 why：确保 old_string 精确匹配 | 模式 2 |
| glob | +glob 语法示例、+不要用 bash find | 模式 2 |
| symbols | 结构化 list/definition/语言列表 | 模式 2 |
| task | 列出 SubAgent 工具集（透明性） | 模式 4 |

eval 结果：16/16 通过，98.8/100，无退化。

### GLM-5 的策略补偿

Claude Code 的 grep description 无策略指导（靠 Claude Sonnet/Opus 自行判断）。
GLM-5 需要额外引导：
- 去掉策略 → export 搜索从 1 次 grep 退化到 12 次
- 加回策略（在 description 中）→ 恢复到 1 次 grep
- **位置正确**（在工具描述而非系统提示词），当模型能力提升后可去掉

### 可进一步借鉴

| 方向 | 做法 | 优先级 |
|------|------|--------|
| 动态 Reminder | 运行时注入文件修改/token 用量提醒 | 中 |
| explanation 参数 | Cursor: 每个搜索工具要求解释用途 | 可选 |
| 语义搜索 | Cursor: codebase_search（向量化） | 高（已有规划） |
| 模块化拆分 | Claude Code: 40+ 片段条件组装 | 低（学习项目暂不需要） |
| sketch 编辑 | Cursor: 次级模型应用编辑 | 低（需要多模型） |

---

## Cursor 提示词架构

> 来源：[shahshrey/cursor-system-prompts](https://github.com/shahshrey/cursor-system-prompts)
> 这个仓库把 Cursor 的系统提示词和**每个工具的 JSON schema** 都拆分到独立文件中，比 `x1xhlol` 的全量文本更易分析。

### Cursor 的工具集

```
tools/
├── codebase_search.json   ← 语义搜索（向量化）
├── grep_search.json       ← 正则搜索（ripgrep）
├── file_search.json       ← 文件名搜索
├── list_dir.json          ← 目录列表
├── search_symbols.json    ← 符号搜索（VSCode LSP）
├── read_file.json         ← 文件读取
├── edit_file.json         ← 文件编辑（sketch 模式）
├── delete_file.json       ← 文件删除
├── run_terminal_cmd.json  ← 终端命令
├── web_search.json        ← 网页搜索
├── reapply.json           ← 重试编辑（Cursor 独有）
└── diff_history.json      ← 编辑历史（Cursor 独有）
```

### Cursor vs Claude Code vs 我们

| 能力 | Cursor | Claude Code | 我们 |
|------|--------|------------|------|
| 语义搜索 | `codebase_search`（内置向量化） | 无（靠 Task explore） | 无 |
| 正则搜索 | `grep_search`（ripgrep） | `Grep`（ripgrep） | `grep`（ripgrep） |
| 符号搜索 | `search_symbols`（VSCode LSP） | `LSP` | `symbols`（tree-sitter） |
| 文件编辑 | sketch 模式 + 次级模型应用 | exact old_string 替换 | exact old_string 替换 |
| 解释参数 | 每个搜索工具都有 `explanation` | 无 | 无 |
| 工具优先级 | description 中明确写优先级 | 无明确优先级 | SYSTEM_PROMPT 路由 |

### Cursor 的关键设计差异

**1. 内置语义搜索优先**

```json
// codebase_search.json
"description": "Find snippets of code from the codebase most relevant to the search query.
This is a semantic search tool... 
This should be heavily preferred over using the grep search,
file search, and list dir tools."
```

Cursor 有内置向量化索引，语义搜索是**第一优先级**。grep 只在"知道精确关键词"时用。

**2. grep 明确定位为 "精确匹配"**

```json
// grep_search.json  
"description": "Fast text-based regex search that finds exact pattern matches...
This is best for finding exact text matches or regex patterns.
More precise than semantic search for finding specific strings or patterns.
This is preferred over semantic search when we know the exact
symbol/function name/etc."
```

注意：Cursor 也没有 "用 | 组合" 或 "避免多次调用" 的策略指导。

**3. edit 用 sketch 模式**

```json
// edit_file.json
"description": "This will be read by a less intelligent model, which will 
quickly apply the edit... specify each edit with the special comment 
// ... existing code ... to represent unchanged code"
```

不需要 `old_string` 精确匹配，由次级模型理解意图并应用编辑。降低了对精确性的要求。

**4. 每个搜索工具有 `explanation` 参数**

```json
"explanation": {
  "description": "One sentence explanation as to why this tool is being used, 
  and how it contributes to the goal.",
  "type": "string"
}
```

强制模型解释为什么用这个工具。有助于调试和理解模型决策。

---

## 完整片段索引

110+ 个片段按功能分类：

```
system-prompt-doing-tasks-*     (10个) — 任务执行原则
system-prompt-tool-usage-*      (10个) — 工具选择路由
system-prompt-*                 (20个) — 其他行为指导
tool-description-*              (18个) — 工具专属描述
tool-description-bash-*         (30个) — Bash 子片段
agent-prompt-*                  (25个) — SubAgent + 工具提示词
system-reminder-*               (30个) — 运行时动态提醒
data-*                          (20个) — SDK/API 参考数据
skill-*                         (10个) — 内置技能
```

完整列表见 [GitHub 仓库](https://github.com/Piebald-AI/claude-code-system-prompts)。

---

## 参考资料

- [Piebald-AI/claude-code-system-prompts](https://github.com/Piebald-AI/claude-code-system-prompts) — Claude Code 134+ 版本提示词
- [shahshrey/cursor-system-prompts](https://github.com/shahshrey/cursor-system-prompts) — Cursor 工具 JSON Schema
- [x1xhlol/system-prompts-and-models-of-ai-tools](https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools) — 30+ AI 编程工具提示词合集
- [Reverse engineering Claude Code](https://www.reidbarber.com/blog/reverse-engineering-claude-code)
- [nano-claude-code](https://github.com/cthiriet/nano-claude-code) — 200 行最小实现
- [claude-agent-sdk-python](https://github.com/anthropics/claude-agent-sdk-python) — 官方 Python SDK
