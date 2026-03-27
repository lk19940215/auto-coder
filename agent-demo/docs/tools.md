# 工具设计

---

## 工具注册模式

```javascript
define('tool_name', '描述（模型据此决定何时调用）', { 参数schema }, ['必填'], async (input) => { ... });
```

参考：`src/tools/`（按工具名拆分为独立文件：file.mjs / grep.mjs / glob.mjs / ls.mjs / symbols.mjs / bash.mjs / task.mjs）

---

## 当前工具集（10 个）

工具命名对齐 Claude Code 风格（短名称）。

| 工具 | 用途 | 依赖 | Claude Code 对应 |
|------|------|------|-----------------|
| `read` | 读取文件内容 | Node fs | Read |
| `write` | 创建新文件 | Node fs | Write |
| `edit` | Search & Replace 修改文件 | Node fs | Edit |
| `multi_edit` | 同一文件多处 S&R | Node fs | MultiEdit |
| `grep` | 正则搜索代码内容 | @vscode/ripgrep | Grep |
| `glob` | 按文件名模式查找文件 | @vscode/ripgrep | Glob |
| `ls` | 列出目录文件树 | @vscode/ripgrep | LS |
| `symbols` | AST 分析（17 种语言） | web-tree-sitter | — |
| `bash` | 执行 bash 命令 | child_process | Bash |
| `task` | SubAgent 委派 | AgentCore | Task |

---

## 工具调用链 — AI 如何决定调什么

AI 的调用链完全由 LLM 自主决策，Agent Loop 不做编排。

典型场景："把 config.mjs 里的 MAX_TOKENS 改成 16384"

```
用户 → "把 MAX_TOKENS 改成 16384"
AI 推理 → 路径不确定 → glob("**/config.*") → src/config.mjs
结果返回 → read("src/config.mjs")
结果返回 → AI 看到 '8192' → edit(path, old_string='8192', new_string='16384')
结果返回 → AI 确认完成 → end_turn
```

你的代码不关心 AI 调了什么工具、按什么顺序，只做：
```
LLM 返回 tool_use → 执行 → 结果送回 → 再调 LLM → 重复
```

SYSTEM_PROMPT 的作用是引导 AI 的工具选择偏好（如"搜索用 grep，不要用 bash"）。

---

## edit 原理

```
readFile(path)
  → content.split(old_string).length - 1  // 计算匹配次数
  → 0 次 → 报错"未找到"
  → >1 次 → 报错"不够唯一"
  → 1 次 → content.replace(old_string, new_string) → writeFile
```

模型怎么知道 old_string？Agent Loop 自然流程保证：
先 read → 内容进 messages → 模型从中复制出精确的 old_string。

---

## grep 原理

底层使用 ripgrep（通过 `@vscode/ripgrep` npm 包），VS Code 和 Cursor 用的同一个方案。

```javascript
import { rgPath } from '@vscode/ripgrep';
execSync(`"${rgPath}" ${modeFlag} --max-count 200 "${pattern}" "${path}" --glob "${include}"`);
```

### output_mode 参数

| 模式 | ripgrep 参数 | 返回内容 | 用途 |
|------|-------------|---------|------|
| `content`（默认） | `--line-number --no-heading` | 文件:行号:匹配行 | 查看具体匹配 |
| `files_only` | `--files-with-matches` | 仅文件路径 | 快速定位文件 |
| `count` | `--count` | 文件:匹配数 | 评估匹配范围 |

ripgrep 特性：自动遵守 .gitignore、跳过二进制文件、速度极快。

### ripgrep 自动忽略规则

ripgrep 默认忽略以下内容，**不需要手动配置**：

**1. `.gitignore` 文件中声明的路径**

本项目 `.gitignore`：
```
node_modules/
.env
logs/
*.log
```

所以 `grep`、`glob`、`ls` 默认**不会搜索/列出** `node_modules/`、`logs/`、`*.log` 文件。

**2. ripgrep 内置跳过**
- 二进制文件（图片、编译产物等）
- `.git/` 目录
- 隐藏文件（以 `.` 开头的文件/目录，默认跳过）

**3. 注意事项**
- 直接指定路径时会绕过 `.gitignore`：`rg --files ./logs` 能列出 logs 下的文件
- 从父目录遍历时遵守：`rg --files .` 不会进入 logs/
- `read` 工具用 Node.js `fs.readFile`，不受 `.gitignore` 影响

---

## glob 原理

按文件名模式查找文件。路径不确定时先用 glob 精确定位。

```
glob("**/agent.*")           → src/agent.mjs
glob("**/*.test.{js,ts}")    → 找所有测试文件
glob("src/**/*.mjs")         → 找 src 下所有 .mjs 文件
```

### 与 ls / grep 的区别

| 工具 | 搜什么 | 场景 |
|------|--------|------|
| `glob` | 按文件**名称**模式匹配 | 知道文件名但不知道路径 |
| `ls` | 列出目录所有文件 | 了解项目结构 |
| `grep` | 按文件**内容**正则匹配 | 找代码中的关键词 |

底层使用 ripgrep `--files --glob`，结果超过 100 个文件自动截断。

---

## ls 原理

列出目录文件树。和 `glob` 共享 ripgrep `--files` 底层。

```javascript
execSync(`"${rgPath}" --files --max-depth ${max_depth} "${path}"`);
```

- 自动遵守 `.gitignore`
- 比 Node.js `readdir` 递归快一个数量级
- 支持 `max_depth` 控制递归深度

---

## multi_edit 原理

### 为什么需要 MultiEdit

`edit` 每次只能改一处。改 N 处 = N 次工具调用 = N 次 API 往返，token 开销巨大。

MultiEdit 把 N 次操作合并为 1 次：

```javascript
multi_edit(path, [
  { old_string: 'A', new_string: 'A2' },
  { old_string: 'B', new_string: 'B2' },
])
```

### 关键细节

1. **顺序执行**：edits 从上到下依次应用，后续 old_string 匹配**更新后的内容**
2. **唯一性检查**：每个 old_string 必须精确匹配 1 次
3. **部分成功**：某处失败不影响其他编辑
4. **与 Apply Patch 的区别**：MultiEdit 依赖精确字符串匹配（不依赖行号），Apply Patch 依赖 unified diff 格式

---

## task / SubAgent 原理

将子任务委托给独立的 Agent Loop，SubAgent 有独立 messages 历史，完成后只返回摘要。

### 架构

```
父 Agent (全部 10 个工具 + 流式 UI)
  ├─ read, write, edit, multi_edit, grep, glob, ls, symbols, bash
  └─ task → SubAgent (只读工具 + 独立上下文 + batch 模式)
              └─ read, grep, glob, ls, symbols
```

### 核心设计

- **独立上下文** — SubAgent 使用空 messages，不污染父 Agent 上下文
- **受限工具集** — 只给只读工具，不能修改文件
- **EventEmitter** — 通过事件向父 Agent 发送进度，驱动 Ink UI 显示
- **独立日志** — `AGENT_DEBUG=true` 时生成 `logs/sub-agent-*.log`

父 Agent 和 SubAgent 复用同一个 `AgentCore` 类，通过注入不同的 tools/executor 实现差异化。

---

## 未实现工具

### WebFetch

获取 URL 内容，转为可读文本。实现方案：Node.js `fetch` + `turndown`（HTML→Markdown）。

### WebSearch

搜索互联网，返回摘要和链接。实现方案：调第三方搜索 API（Brave Search 免费 2000次/月）。

### TodoWrite

模型自行创建和管理 TODO 列表（不是给用户看的，是模型给自己用的）。维护内存中的 `_todos` 数组。

---

## 设计要点

- description 决定模型何时调用（能力 + 约束，不教策略）
- JSON Schema 加约束（enum、maxLength）
- 返回结果截断（8000 字符），防止上下文溢出
- 错误用明确消息返回，让模型换策略重试
- description 写法参考 [架构参考](prompt-architecture.md) 中的设计原则
