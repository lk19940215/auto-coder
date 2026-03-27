# Agent Demo 文档

> 归档规则：掌握的标 ✅，正在学的标 ▶，文件内容不用搬。

---

## 基础（已掌握）

- ✅ [Agent Loop + 消息协议 + SDK](core.md) — while 循环、stop_reason、tool_use/tool_result、API 调用
- ✅ [工具设计](tools.md) — 注册模式、description 要点、10 个工具实现原理

## 进阶（当前聚焦）

- ▶ [上下文管理 + 显示层](advanced.md) — Search & Replace、裁剪策略、多模型路由
- ✅ [架构参考](prompt-architecture.md) — Claude Code/Cursor 架构对比、提示词写法模式、设计原则
- ✅ [评估体系](eval.md) — Eval Harness、16 个测试用例、Pass@k、沙盒机制
- ✅ [AST + 语义搜索](semantic-search.md) — tree-sitter、Embedding、向量库
- ✅ [演进记录](changelog.md) — 版本变更 + 效率指标

## 路线图

```
阶段 1（你在这里）: 底层实现
      ↓
阶段 2: Vercel AI SDK
      ↓
阶段 3: LangGraph 多代理
      ↓
阶段 4: CLI → VS Code 插件 → Fork
```
