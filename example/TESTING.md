# Claude Coder 本地测试指南

本目录用于在开发阶段测试 claude-coder 工具的完整流程，无需发包或 npm link。

## 前置条件

```bash
# 在项目根目录安装依赖（含 peerDependency: @anthropic-ai/claude-agent-sdk）
cd <project-root>
npm install
```

确保已有可用的 API Key（Claude / GLM / DeepSeek 等）。

## 测试流程

所有命令在 `example/` 目录下执行，通过 `node ../bin/cli.js` 调用本地开发版 CLI。

### 0. 进入测试目录

```bash
cd example
```

### 1. 配置模型（首次）

```bash
node ../bin/cli.js setup
```

按提示选择模型提供商、填入 API Key。配置会写入 `example/.claude-coder/.env`。

### 2. 预览模式（不消耗 token）

```bash
node ../bin/cli.js run --dry-run
```

验证 CLI 参数解析、文件读取等基础流程是否正确。

### 3. 单次运行（scan + add + 编码）

```bash
node ../bin/cli.js run --max 1
```

这会依次执行：
1. **scan** — 识别为新项目，搭建脚手架，生成 `project_profile.json`
2. **用户确认** — 提示「是否继续？(y/n)」，输入 y 进入任务分解
3. **add** — 读取 `requirements.md`，分解为 `tasks.json`
4. **coding session** — 执行第一个任务

> **注意**：步骤 2 会阻塞等待键盘输入。如果通过脚本自动执行（如 CI），可通过管道传入 `echo y | node ../bin/cli.js run --max 1`，非 TTY 模式下会自动跳过确认。

### 4. 手动追加任务

```bash
node ../bin/cli.js add "新增一个健康检查接口"
```

### 5. 从 requirements.md 追加任务

```bash
node ../bin/cli.js add -r
```

### 6. 查看任务状态

```bash
node ../bin/cli.js status
```

### 7. 多 session 运行

```bash
node ../bin/cli.js run --max 3
```

### 8. 校验上次 session

```bash
node ../bin/cli.js validate
```

## 终止保护

### 完成检测（核心）

模型写入 `session_result.json` 后（Write 工具或 Bash 重定向），超时从 20 分钟缩短至 5 分钟。

### 停顿超时（兜底）

默认 20 分钟无工具调用自动中断当前 session 并触发回滚重试。

### maxTurns（仅 CI 推荐）

默认 0 = 无限制。仅 CI/pipeline 需要时设置。

### 调整方式

```bash
node ../bin/cli.js setup
# 选择「4) 配置安全限制」
```

或直接编辑 `example/.claude-coder/.env`：

```env
SESSION_COMPLETION_TIMEOUT=300   # 完成检测超时（秒），默认 300
SESSION_STALL_TIMEOUT=1200       # 停顿超时（秒），默认 1200
SESSION_MAX_TURNS=0              # 最大轮次，0=无限制
```

### 测试终止保护

**测试完成检测**：

```bash
# 缩短完成检测超时到 30 秒，便于观察
# 编辑 .claude-coder/.env: SESSION_COMPLETION_TIMEOUT=30
node ../bin/cli.js run --max 1
# 观察日志：COMPLETION_DETECTED 后 30 秒内应自动中断（如果模型未自行终止）
```

**测试停顿超时**：

```bash
# 缩短停顿超时到 2 分钟
# 编辑 .claude-coder/.env: SESSION_STALL_TIMEOUT=120
node ../bin/cli.js run --max 1
# 如果模型卡在思考，2 分钟后会触发 STALL 中断
```

## 清理测试环境

重置到初始状态，可重新测试完整流程：

```bash
# 删除运行时文件
rm -rf .claude-coder/ .mcp.json .claude/

# 恢复 git（如果在 git 管理下）
git checkout -- .
git clean -fd
```

Windows PowerShell：

```powershell
Remove-Item -Recurse -Force .claude-coder, .mcp.json, .claude -ErrorAction SilentlyContinue
```

## 目录说明

| 文件 | 用途 | git 状态 |
|------|------|----------|
| `requirements.md` | 示例需求输入 | 跟踪 |
| `TESTING.md` | 本文件，测试指南 | 跟踪 |
| `.mcp.json` | MCP 配置（自动生成） | 跟踪 |
| `.claude-coder/tasks.json` | 任务列表 | 跟踪 |
| `.claude-coder/session_result.json` | 上次 session 结果 | 跟踪 |
| `.claude-coder/project_profile.json` | 项目扫描结果 | 跟踪 |
| `.claude-coder/tests.json` | 验证记录 | 跟踪 |
| `.claude-coder/test_rule.md` | 测试规则 | 跟踪 |
| `.claude-coder/.env` | API Key 等敏感配置 | gitignored |
| `.claude-coder/.runtime/` | 日志、浏览器 profile | gitignored |
| `node_modules/` | 依赖 | gitignored |
