# SDK 上下文管理分析与优化建议

## 关于 additionalContext 的发现

**重要**：`additionalContext` 是 **Hook 回调的返回值**，而不是 `query()` 的直接参数。

### 用法示例

```typescript
const playwrightGuideHook: HookCallback = async (input, toolUseID, { signal }) => {
  const preInput = input as PreToolUseHookInput;

  // 当调用 Playwright MCP 工具时，注入使用指南
  if (preInput.tool_name.startsWith('mcp__playwright__')) {
    return {
      additionalContext: `
【Playwright MCP 使用规范】
- 使用 Smart Snapshot 模式，而非截图
- 等待元素时使用 browser_wait_for，避免硬编码 sleep
- 点击前先 hover 确保元素可见
      `.trim()
    };
  }
  return {};
};

// 注册 Hook
const options = {
  hooks: {
    PreToolUse: [{ matcher: '^mcp__playwright__', hooks: [playwrightGuideHook] }]
  }
};
```

### 可用的 Hook 类型

| Hook | 用途 | additionalContext 效果 |
|------|------|------------------------|
| `PreToolUse` | 工具调用前 | 注入工具使用规则 |
| `PostToolUse` | 工具调用后 | 追加到工具结果中 |
| `UserPromptSubmit` | 用户提交 prompt | 注入到对话上下文 |
| `SessionStart` | 会话开始 | 初始化上下文 |
| `SubagentStart` | 子 Agent 启动 | 向子 Agent 传递上下文 |

### systemMessage vs additionalContext

| 字段 | 位置 | 用途 |
|------|------|------|
| `systemMessage` | 返回值顶层 | 注入到整个对话，模型可见 |
| `additionalContext` | hookSpecificOutput 内 | 追加到当前操作的结果中 |

---

## 回答你的问题

### 2. 中断时如何传递上下文？

SDK 提供了多种方式：

**方案 A：使用 Stop Hook 捕获状态**
```typescript
const stopHook: HookCallback = async (input, toolUseID) => {
  // 保存当前状态到文件
  await saveSessionSnapshot({
    lastTool: input.last_tool,
    pendingWork: input.pending_work,
    summary: '中断时的上下文摘要'
  });
  return {};
};
```

**方案 B：使用 resume 恢复会话**
```typescript
// 第一个 session
for await (const msg of query({ prompt, options })) {
  if (msg.type === 'result') sessionId = msg.session_id;
}

// 下一个 session 恢复
for await (const msg of query({
  prompt: '继续之前的任务',
  options: { resume: sessionId }
})) { ... }
```

**方案 C：使用 systemMessage 注入摘要**
```typescript
const sessionMemoryHook: HookCallback = async (input) => {
  if (input.hook_event_name === 'SessionStart') {
    const lastSession = await loadLastSessionResult();
    return {
      systemMessage: `上次会话摘要: ${lastSession.summary}`
    };
  }
  return {};
};
```

---

### 代码实现

**修改 `src/hooks.js`**：

```javascript
'use strict';

const fs = require('fs');
const path = require('path');
const { inferPhaseStep } = require('./indicator');
const { log, paths } = require('./config');

// 加载 Playwright 规则文件
function loadPlaywrightRules() {
  const p = paths();
  const rulePath = path.join(p.loopDir, 'test_rule.md');
  if (!fs.existsSync(rulePath)) return '';

  const content = fs.readFileSync(rulePath, 'utf8');
  // 提取关键规则（避免注入整个文件）
  const sections = [
    '## 二、三步测试方法论',
    '## 四、Smart Snapshot 策略',
    '## 五、等待策略',
  ];

  // 简化：返回核心提示
  return `
【Playwright MCP 规则提醒】
1. 使用 Smart Snapshot：navigate → snapshot → 操作 → wait_for → snapshot（仅 2-3 次）
2. 等待用 browser_wait_for，不要轮询 snapshot
3. 失败时：snapshot → console_messages → 记录后继续
详细规则见 .claude-coder/test_rule.md
`.trim();
}

// Playwright MCP 规则注入 Hook
function createPlaywrightGuidanceHook() {
  let rulesCache = null;

  return async (input) => {
    // 懒加载规则，缓存避免重复读取
    if (!rulesCache) {
      rulesCache = loadPlaywrightRules();
    }

    // 根据具体工具注入不同提示
    const toolName = input.tool_name;
    let specificTip = '';

    if (toolName === 'mcp__playwright__browser_snapshot') {
      specificTip = '\n提示：snapshot 消耗 3-8K tokens，仅在必要时使用。';
    } else if (toolName === 'mcp__playwright__browser_wait_for') {
      specificTip = '\n提示：设置合理 timeout，AI 生成任务建议 60-180s。';
    } else if (toolName === 'mcp__playwright__browser_click') {
      specificTip = '\n提示：点击前确认元素已通过 snapshot 获取 ref。';
    }

    return {
      additionalContext: rulesCache + specificTip
    };
  };
}

/**
 * Create unified session hooks with:
 * - Stall detection
 * - Edit guard
 * - Completion detection
 * - Tool-specific guidance injection (NEW)
 */
function createSessionHooks(indicator, logStream, options = {}) {
  const {
    enableStallDetection = false,
    stallTimeoutMs = 1200000,
    abortController = null,
    enableEditGuard = false,
    editThreshold = DEFAULT_EDIT_THRESHOLD,
    enableCompletionDetection = true,
    completionTimeoutMs = 300000,
    enableGuidanceInjection = true,  // NEW: 规则注入开关
  } = options;

  const editCounts = {};
  let stallDetected = false;
  let stallChecker = null;
  let completionDetectedAt = 0;

  // ... 原有的 stall 检测代码 ...

  // 创建 Playwright 规则注入 Hook
  const playwrightGuidanceHook = enableGuidanceInjection
    ? createPlaywrightGuidanceHook()
    : null;

  const hooks = {
    PreToolUse: [
      // 原有的通用 Hook（日志、Edit 防护）
      {
        matcher: '*',
        hooks: [async (input) => {
          inferPhaseStep(indicator, input.tool_name, input.tool_input);
          logToolCall(logStream, input);

          if (enableEditGuard) {
            const target = input.tool_input?.file_path || input.tool_input?.path || '';
            if (['Write', 'Edit', 'MultiEdit'].includes(input.tool_name) && target) {
              editCounts[target] = (editCounts[target] || 0) + 1;
              if (editCounts[target] > editThreshold) {
                return {
                  hookSpecificOutput: {
                    hookEventName: 'PreToolUse',
                    permissionDecision: 'deny',
                    permissionDecisionReason: `已对 ${target} 编辑 ${editCounts[target]} 次，疑似死循环。`,
                  },
                };
              }
            }
          }
          return {};
        }]
      },
      // NEW: Playwright MCP 规则注入
      {
        matcher: '^mcp__playwright__',
        hooks: [playwrightGuidanceHook].filter(Boolean)
      }
    ],
    // ... PostToolUse 等其他 hooks ...
  };

  return { hooks, cleanup, isStalled };
}
```

### 效果对比

| 场景 | 当前方式 | 优化后 |
|------|----------|--------|
| 规则注入时机 | 每次 session 开始时 | 调用工具时按需注入 |
| Token 消耗 | 每次 session 都发送完整规则 | 仅调用时发送精简规则 |
| 规则更新 | 需要重启 session | 实时生效（重新读取文件） |
| 灵活性 | 固定内容 | 可根据工具动态调整 |

### 扩展：其他工具的规则注入

同样的模式可以扩展到其他工具：

```javascript
// Bash 进程管理规则
{
  matcher: 'Bash',
  hooks: [async (input) => {
    const cmd = input.tool_input?.command || '';
    if (cmd.includes('kill') || cmd.includes('pkill')) {
      return {
        additionalContext: '【进程管理】停止服务前检查 project_profile.json 的 services 配置，确保端口正确。'
      };
    }
    return {};
  }]
}

// Write/Edit 文件操作规则
{
  matcher: 'Write|Edit',
  hooks: [async (input) => {
    const filePath = input.tool_input?.file_path || '';
    if (filePath.includes('.env')) {
      return {
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'deny',
          permissionDecisionReason: '不允许修改 .env 文件',
        }
      };
    }
    return {};
  }]
}
```

---

## 通用方案：可配置的规则注入系统

### 架构设计

```
.claude-coder/
  guidance/                    # 规则文件目录
    playwright.md             # Playwright MCP 规则
    bash-process.md           # Bash 进程管理规则
    file-operations.md        # 文件操作规则
  guidance.json               # 规则配置文件
```

### 配置文件格式

**`.claude-coder/guidance.json`**：

```json
{
  "rules": [
    {
      "name": "playwright",
      "matcher": "^mcp__playwright__",
      "file": "guidance/playwright.md",
      "cache": true,
      "injectSummary": true
    },
    {
      "name": "bash-process",
      "matcher": "Bash",
      "file": "guidance/bash-process.md",
      "condition": {
        "field": "tool_input.command",
        "pattern": "kill|pkill|stop|shutdown"
      },
      "cache": true
    },
    {
      "name": "file-protection",
      "matcher": "Write|Edit",
      "file": "guidance/file-operations.md",
      "condition": {
        "field": "tool_input.file_path",
        "pattern": "\\.env$|\\.pem$|credentials"
      }
    }
  ]
}
```

### 代码实现

**修改 `src/hooks.js`**：

```javascript
'use strict';

const fs = require('fs');
const path = require('path');
const { inferPhaseStep } = require('./indicator');
const { log, paths } = require('./config');

// ── 通用规则注入系统 ──

class GuidanceInjector {
  constructor() {
    this.rules = [];
    this.cache = {};
    this.loaded = false;
  }

  load() {
    if (this.loaded) return;

    const p = paths();
    const configPath = path.join(p.loopDir, 'guidance.json');

    if (!fs.existsSync(configPath)) {
      // 使用默认配置
      this.rules = this.getDefaultRules(p.loopDir);
    } else {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        this.rules = config.rules || [];
      } catch {
        this.rules = this.getDefaultRules(p.loopDir);
      }
    }

    this.loaded = true;
  }

  getDefaultRules(loopDir) {
    // 内置默认规则
    return [
      {
        name: 'playwright',
        matcher: '^mcp__playwright__',
        content: this.getPlaywrightSummary(),
        cache: true
      },
      {
        name: 'bash-process',
        matcher: 'Bash',
        condition: { field: 'tool_input.command', pattern: 'kill|pkill' },
        content: '【进程管理】停止服务前检查 project_profile.json 的 services 配置。'
      }
    ];
  }

  getPlaywrightSummary() {
    return `
【Playwright MCP 规则】
1. Smart Snapshot: navigate→snapshot→操作→wait_for→snapshot (仅2-3次)
2. 等待用 browser_wait_for，不轮询 snapshot
3. 失败时: snapshot→console_messages→记录后继续
`.trim();
  }

  getRuleContent(rule, loopDir) {
    if (rule.cache && this.cache[rule.name]) {
      return this.cache[rule.name];
    }

    let content = rule.content;

    if (rule.file && !content) {
      const filePath = path.join(loopDir, rule.file);
      if (fs.existsSync(filePath)) {
        content = fs.readFileSync(filePath, 'utf8');
        // 如果文件太大，提取摘要
        if (content.length > 500 && rule.injectSummary) {
          content = this.extractSummary(content);
        }
      }
    }

    if (rule.cache && content) {
      this.cache[rule.name] = content;
    }

    return content;
  }

  extractSummary(content) {
    // 提取关键章节
    const sections = content.split(/^## /m);
    const summary = [];

    for (const section of sections) {
      const lines = section.split('\n');
      const title = lines[0];
      // 提取核心内容
      const coreContent = lines.slice(1, 6).join('\n');
      summary.push(`**${title}**\n${coreContent}`);
    }

    return summary.slice(0, 3).join('\n\n');
  }

  checkCondition(input, condition) {
    if (!condition) return true;

    const fieldPath = condition.field.split('.');
    let value = input;

    for (const key of fieldPath) {
      value = value?.[key];
      if (value === undefined) return false;
    }

    return new RegExp(condition.pattern, 'i').test(String(value));
  }

  createHook() {
    return async (input) => {
      this.load();

      const toolName = input.tool_name;
      const matchedRules = [];

      for (const rule of this.rules) {
        // 检查 matcher
        if (!new RegExp(rule.matcher).test(toolName)) continue;

        // 检查 condition
        if (!this.checkCondition(input, rule.condition)) continue;

        matchedRules.push(rule);
      }

      if (matchedRules.length === 0) return {};

      const p = paths();
      const contents = matchedRules.map(rule => this.getRuleContent(rule, p.loopDir));
      const guidance = contents.filter(Boolean).join('\n\n');

      if (!guidance) return {};

      return { additionalContext: guidance };
    };
  }
}

// 单例
const guidanceInjector = new GuidanceInjector();

// ── 原有 Hook 逻辑 ──

const DEFAULT_EDIT_THRESHOLD = 15;
const SESSION_RESULT_FILENAME = 'session_result.json';

function logToolCall(logStream, input) {
  // ... 原有代码 ...
}

function isSessionResultWrite(toolName, toolInput) {
  // ... 原有代码 ...
}

/**
 * Create unified session hooks with guidance injection.
 */
function createSessionHooks(indicator, logStream, options = {}) {
  const {
    enableStallDetection = false,
    stallTimeoutMs = 1200000,
    abortController = null,
    enableEditGuard = false,
    editThreshold = DEFAULT_EDIT_THRESHOLD,
    enableCompletionDetection = true,
    completionTimeoutMs = 300000,
    enableGuidanceInjection = true,
  } = options;

  const editCounts = {};
  let stallDetected = false;
  let stallChecker = null;
  let completionDetectedAt = 0;

  // ... stall 检测代码 ...

  const hooks = {
    PreToolUse: [
      // 通用 Hook：日志、Edit 防护
      {
        matcher: '*',
        hooks: [async (input) => {
          inferPhaseStep(indicator, input.tool_name, input.tool_input);
          logToolCall(logStream, input);

          if (enableEditGuard) {
            // ... Edit 防护代码 ...
          }

          return {};
        }]
      },
      // 规则注入 Hook（通用方案）
      ...(enableGuidanceInjection ? [{
        matcher: '*',
        hooks: [guidanceInjector.createHook()]
      }] : [])
    ],
    PostToolUse: [
      // ... 原有 PostToolUse 代码 ...
    ]
  };

  return {
    hooks,
    cleanup() {
      if (stallChecker) clearInterval(stallChecker);
    },
    isStalled() {
      return stallDetected;
    }
  };
}

module.exports = { createSessionHooks, GuidanceInjector };
```

### 规则文件示例

**`.claude-coder/guidance/playwright.md`**：

```markdown
【Playwright MCP 规则】

## Smart Snapshot 策略
- 必须：首次加载、关键断言、操作失败
- 可选：中间操作后确认
- 跳过：连续同类操作、等待循环中

## 等待策略
- 短等(表单): browser_wait_for text="成功" timeout=10000
- 长等(AI生成): browser_wait_for timeout=60000-180000
- 不轮询 snapshot

## 失败处理
阻断性(停止): 服务未启动、500错误、凭证缺失
非阻断性(继续): 样式异常、console warning
```

**`.claude-coder/guidance/bash-process.md`**：

```markdown
【进程管理规则】

1. 停止服务前检查 project_profile.json 的 services 配置
2. 使用配置中的端口进行精确 kill
3. 单次模式：收尾时停止所有后台服务
4. 连续模式：保持服务运行供下个 session 使用
```

### 使用方式

```javascript
// 默认使用内置规则
const { hooks } = createSessionHooks(indicator, logStream);

// 自定义规则：编辑 .claude-coder/guidance.json
// 或添加规则文件到 .claude-coder/guidance/ 目录
```

### 扩展新规则

只需添加配置项：

```json
{
  "rules": [
    {
      "name": "git-operations",
      "matcher": "Bash",
      "condition": { "field": "tool_input.command", "pattern": "git\\s+(push|force)" },
      "content": "【Git 操作】force push 前确认分支状态，避免覆盖他人提交。"
    }
  ]
}
```

---

## 实施步骤

1. **修改 `src/hooks.js`**：添加 `GuidanceInjector` 类
2. **创建规则目录**：`.claude-coder/guidance/`
3. **编写规则文件**：`playwright.md`, `bash-process.md`
4. **测试验证**：确保规则在工具调用时正确注入

---

## Hook 系统架构设计

### 三种 Session 类型的需求差异

| Session 类型 | 规则注入 | Edit 防护 | 完成检测 | 停顿检测 |
|--------------|----------|-----------|----------|----------|
| `runCodingSession` | ✅ | ✅ | ✅ | ✅ |
| `runScanSession` | ⚪ 可选 | ❌ | ❌ | ✅ |
| `runAddSession` | ❌ | ❌ | ❌ | ✅ |

### 重构方案：Hook 工厂模式

**修改 `src/hooks.js`**：

### 使用方式

**`src/session.js` 修改**：

---

## 关于 CLAUDE.md 与 SessionStart Hook 的协调

### 内容分工

| 文件/来源 | 内容 | 原因 |
|-----------|------|------|
| `CLAUDE.md` | 静态行为准则、编码规范、工具使用指南 | SDK 自动加载，稳定不变 |
| `SessionStart Hook` | 动态上下文（上次摘要、任务状态、环境变量） | 每个 session 可能不同 |

### 避免重复

```javascript
// ❌ 不好的做法：在 Hook 中重复 CLAUDE.md 的内容
async (input) => ({
  systemMessage: '使用 Smart Snapshot 策略...'  // CLAUDE.md 已经有了
})

// ✅ 好的做法：注入动态信息
async (input) => ({
  systemMessage: `上次会话: ${lastSession.summary}\n当前任务: ${task.id}`
})
```

### 是否需要 SessionStart Hook？

**建议暂不添加**，原因：
1. 当前的 `buildCodingPrompt()` 已经通过 prompt 注入了动态上下文
2. `CLAUDE.md` 已包含行为准则
3. 如果要优化，应该先确认 SDK 的 `settingSources` 是否正常加载 CLAUDE.md

---

## 设计决策：不实现摘要提取功能

### 决策

**不实现 `injectSummary` 和 `extractSummary` 功能。**

### 理由

1. **用户责任**：规则文件由用户提供，质量由用户负责。效果不佳是因为文档写得不好，而非缺少摘要功能。

2. **避免复杂度**：内部不支持摘要提取逻辑，保持代码简洁。

3. **替代方案**：用户可在 `guidance.json` 中直接提供 `summary` 字段：
   ```json
   {
     "name": "playwright",
     "file": "assets/playwright.md",
     "summary": "【Playwright 规则】Smart Snapshot 策略、合理等待、失败处理流程。"
   }
   ```

### 实际实现状态

当前 `GuidanceInjector` 类已实现：
- ✅ JSON 配置加载
- ✅ matcher 正则匹配
- ✅ condition 条件匹配（含 OR 逻辑）
- ✅ file 注入 + injectOnce 控制
- ✅ toolTips 动态提示（优于计划）
- ✅ 缓存机制

未实现（已决定不实现）：
- ❌ injectSummary / extractSummary

---

## `/simplify` 功能调研

### SDK 支持的 Skill 机制

```typescript
// Options 中的 skills 参数
skills?: string[];

// SlashCommand 类型定义
type SlashCommand = {
  name: string;          // skill 名称（不含 /）
  description: string;   // 功能描述
  argumentHint: string;  // 参数提示
};

// Query 实例方法
query.supportedCommands(): Promise<SlashCommand[]>;
```

### 当前实现分析

```javascript
// src/session.js:344-375
async function runSimplifySession(focus = '', opts = {}) {
  const prompt = focus ? `/simplify ${focus}` : '/simplify';
  const session = sdk.query({ prompt, options: queryOpts });
  // ...
}
```

### 调研结论

**✅ 当前实现正确**

根据官方文档确认：
- Slash command 可以通过 `query()` 的 `prompt` 直接发送
- `/simplify` 是内置 skill，SDK 会自动识别并执行
- 不需要特殊 API

```ts
// 官方推荐方式
for await (const msg of query({
  prompt: "/simplify",
  options: { maxTurns: 1 }
})) {
  if (msg.type === "result") {
    return msg.result;
  }
}
```

### 关键机制

```
query("/simplify")
     ↓
Claude Code harness
     ↓
Slash Command Router
     ↓
执行 /simplify skill
```

- Slash command 是 **system-level action**
- 执行优先级：`/command` > `system prompt` > `user prompt`

### 检测可用命令

```ts
if (message.type === "system" && message.subtype === "init") {
  console.log(message.slash_commands);
  // ["/clear", "/compact", "/simplify", "/help"]
}
```

### 自定义 simplify

可通过 `.claude/commands/simplify.md` 覆盖默认行为：

```markdown
Rewrite output with:
- fewer words
- clearer structure
- no redundancy
```
