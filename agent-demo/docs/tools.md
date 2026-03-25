# 工具设计 + CLI vs IDE

---

## 工具注册模式

```javascript
define('tool_name', '描述（模型据此决定何时调用）', { 参数schema }, ['必填'], async (input) => { ... });
```

参考：`src/tools.mjs`

---

## Claude Code 工具列表

```
Bash, Read, Write, Edit, MultiEdit, Grep, Glob, LS,
WebFetch, WebSearch, Task, TodoWrite, NotebookRead, NotebookEdit, mcp__*
```

---

## 设计要点

- description 写清"能做什么"+"什么时候用"（模型选工具的唯一依据）
- JSON Schema 加约束（enum、maxLength）
- 返回结构化数据，结果截断（demo 用 8000 字符）
- 错误用 `is_error: true` 标记，让模型换策略重试

---

## CLI vs IDE 并发

| | CLI Agent（Claude Code / demo） | IDE Agent（Cursor） |
|--|------|------|
| 执行 | 串行：多个 tool_use 逐个执行 | 子代理并行：最多 8 个独立 worktree |
| 并行技巧 | "batch tool" 鼓励模型返回多 tool_use | 内置 Explore/Bash/Browser 子代理 |
| 文件访问 | 通过工具调用（消耗 token） | 直接文件系统 + LSP |

Cursor 更快：子代理并行 + 直接文件访问 + LSP 集成。

---

## 关键认知

- 所有 AI Coding Agent 都直接调 LLM API，没用框架
- Agent 就是 while 循环 + stop_reason 驱动
- 复杂性来自工程化：更多工具、上下文管理、错误恢复、权限控制
- CLI 吃透核心 → IDE 集成层，路径可行
