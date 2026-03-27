# Agent 演进记录

> **记录原则**：只记录做了什么、改进了什么。关注 before/after。

---

## v8 — 2026-03-27

- 全部工具描述参考 Claude Code 重写，遵循 **"能力 + 约束，不教策略"** 原则
- grep: +正则示例、+ripgrep 转义说明、+复杂搜索委派 task
- bash: 负面约束结构化列表（→ 箭头格式）、+write 约束
- edit: +缩进保留警告
- task: 列出 SubAgent 工具集（透明性）
- prompt-architecture.md: 新增核心设计原则（P1-P5）、Prompt Caching 说明
- eval 98.8/100，无退化

## v7 — 2026-03-27

- SYSTEM_PROMPT 对齐 Claude Code "一句话路由" 模式
- Bash 负面约束从 SYSTEM_PROMPT 移到 bash description
- 加入输出效率原则
- prompt-architecture.md 文档：Claude Code + Cursor 提示词架构全面分析

## v6 — 2026-03-27

- 工具文件重命名：`search.mjs` → `grep.mjs` + `ls.mjs`，`ast.mjs` → `symbols.mjs`
- symbols 扩展至 17 种语言，修复 Go/Rust name 提取
- test-example 新增 Python/Go/Rust 项目
- eval 重构：16 个多语言 case、temperature=0、Pass@k、多维评分、Baseline 对比
- SYSTEM_PROMPT 去除 JS 特定示例，完全语言无关

---

## v1~v5 — 2026-03-25~27

从零搭建到 Claude Code 同级效率。

**基准任务**：搜索所有 export 函数并分类汇总

| 指标 | v1 (起点) | v5 (当前) | Claude Code |
|------|-----------|-----------|-------------|
| grep 调用 | 分散多次 | **1 次** | 1 次 |
| API 轮次 | 4+ | **2** | 2 |
| 耗时 | ~145s | **27s** | 32s |

**关键里程碑**：

| 版本 | 核心改进 |
|------|---------|
| v1 | 基础架构（AgentCore + Ink + 10 个工具 + eval 框架） |
| v2 | SubAgent（task 工具）+ 工具效率从 41 次降到 4 次 |
| v3 | 并行执行 + `run(prompt, options)` API + headless 模式 |
| v4 | SYSTEM_PROMPT 精简 + maxToolCalls + 工具描述优化 |
| v5 | 正则 `\|` 合并指导 → grep 从 4 次降到 1 次 |
