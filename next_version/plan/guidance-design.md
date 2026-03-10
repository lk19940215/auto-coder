# GuidanceInjector 实现总结

## 一、设计目标

通过 `PreToolUse` Hook 的 `additionalContext` 返回值，在工具调用时按需注入规则。

### 效果对比

| 场景 | 旧方式（session 开始注入） | 新方式（工具调用时注入） |
|------|---------------------------|------------------------|
| Token 消耗 | 每次 session 发送完整规则 | 仅调用时发送精简规则 |
| 规则更新 | 需重启 session | 实时生效 |
| 灵活性 | 固定内容 | 根据工具动态调整 |

---

## 二、架构设计

```
.claude-coder/
  assets/
    playwright.md         # Playwright 规则文件
    bash-process.md       # Bash 进程管理规则
  guidance.json           # 规则配置入口
```

### 配置文件格式

```json
{
  "rules": [
    {
      "name": "playwright",
      "matcher": "^mcp__playwright__",
      "file": { "path": "assets/playwright.md", "injectOnce": true },
      "toolTips": {
        "injectOnce": false,
        "extractor": "browser_(\\w+)",
        "items": {
          "snapshot": "snapshot 消耗 3-8K tokens，仅在必要时使用。",
          "wait_for": "设置合理 timeout，AI 生成任务建议 60-180s。"
        }
      }
    }
  ]
}
```

---

## 三、核心功能

| 功能 | 说明 |
|------|------|
| `matcher` | 正则匹配工具名称 |
| `condition` | 条件匹配，支持 `field` + `pattern` 或 `any` 数组（OR 逻辑） |
| `file` | 规则文件路径，`injectOnce` 控制是否仅注入一次 |
| `toolTips` | 从工具名提取关键词，动态注入精确提示 |
| 缓存 | 文件内容缓存，避免重复读取 |

### toolTips 机制（实际实现优于计划）

根据工具名称动态提取关键词（如 `browser_snapshot` → `snapshot`），注入对应的精确提示。这是计划中没有的设计，避免了每次都注入完整规则文件。

---

## 四、Hook 类型与 additionalContext

**重要发现**：`additionalContext` 是 Hook 回调的返回值，而非 `query()` 的直接参数。

| Hook | 用途 | additionalContext 效果 |
|------|------|------------------------|
| `PreToolUse` | 工具调用前 | 注入工具使用规则 ✅ |
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

## 五、Session 类型与功能矩阵

| Session 类型 | 规则注入 | Edit 防护 | 完成检测 | 停顿检测 |
|--------------|----------|-----------|----------|----------|
| `coding` | ✅ | ✅ | ✅ | ✅ |
| `scan` | ❌ | ❌ | ❌ | ✅ |
| `add` | ❌ | ❌ | ❌ | ✅ |
| `simplify` | ❌ | ❌ | ❌ | ✅ |

---

## 六、CLAUDE.md 与 SessionStart Hook 的协调

### 内容分工

| 文件/来源 | 内容 | 原因 |
|-----------|------|------|
| `CLAUDE.md` | 静态行为准则、编码规范、工具使用指南 | SDK 自动加载，稳定不变 |
| `SessionStart Hook` | 动态上下文（上次摘要、任务状态、环境变量） | 每个 session 可能不同 |

### 建议

**暂不添加 SessionStart Hook**：
1. 当前的 `buildCodingPrompt()` 已通过 prompt 注入动态上下文
2. `CLAUDE.md` 已包含行为准则
3. 避免在 Hook 中重复 CLAUDE.md 的内容

---

## 七、设计决策

### 不实现摘要提取功能

**理由**：
1. **用户责任**：规则文件由用户提供，质量由用户负责
2. **避免复杂度**：内部不支持摘要提取逻辑，保持代码简洁
3. **替代方案**：用户可在 `guidance.json` 中直接提供 `summary` 字段

### 实际实现状态

| 功能 | 状态 |
|------|------|
| JSON 配置加载 | ✅ |
| matcher 正则匹配 | ✅ |
| condition 条件匹配（含 OR 逻辑） | ✅ |
| file 注入 + injectOnce 控制 | ✅ |
| toolTips 动态提示 | ✅ 优于计划 |
| 缓存机制 | ✅ |
| injectSummary / extractSummary | ❌ 已决定不实现 |
| getDefaultRules() 回退 | ❌ 已决定不实现 |

---

## 八、`/simplify` 功能调研

### 结论

**当前实现正确**：通过 `query({ prompt: "/simplify" })` 直接调用，SDK 会自动识别并执行。

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
- 已添加 `maxTurns: 1` 优化

### 检测可用命令

通过 `message.slash_commands` 获取当前 session 可用的 slash commands 列表。

### 扩展

可通过 `.claude/commands/simplify.md` 自定义行为，SDK 会自动识别。

---

## 九、中断时上下文传递方案

| 方案 | 实现方式 | 适用场景 |
|------|----------|----------|
| Stop Hook | 在 Stop Hook 中保存状态到文件 | 需要捕获精确的中断状态 |
| resume | 使用 `resume: sessionId` 恢复会话 | 继续未完成的任务 |
| systemMessage | 在 SessionStart Hook 中注入上次摘要 | 需要跨 session 共享上下文 |