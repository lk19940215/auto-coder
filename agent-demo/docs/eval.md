# Agent 评估体系

## 为什么需要 Eval

手动测试的问题：

- 每次改 prompt/工具后手动输入相同问题、人眼看日志
- 无法对比改前改后的差异
- 无法量化"变好了还是变差了"

Eval 是 **Agent 开发的单元测试** — 让评估可重复、可对比、可自动化。

---

## SWE-bench — 行业标杆

Princeton NLP 发布的 coding agent benchmark，从真实 GitHub PR 提取任务。

**流程：**

```
GitHub Issue → 克隆代码库 → Agent 自动修复 → 跑测试套件 → 通过 = 得分
```

**三个版本：**

| 版本 | 任务数 | 说明 |
|------|--------|------|
| Full | 2294 | 完整集 |
| Lite | 300 | 精选子集 |
| Verified | 500 | 人工验证，目前主流 |

**典型得分（2025）：**

| Agent | Verified |
|-------|----------|
| Claude Code | ~72% |
| Cursor Agent | ~65% |
| Devin | ~53% |
| OpenAI Codex | ~70% |

SWE-bench 是 **结果导向** — 只看测试通过率。

---

## Eval Harness — 过程导向

生产级团队不只看结果，还评估过程。

**5 个核心组件：**

```
Dataset ──── 固定测试用例集（版本化）
Runner ───── 相同条件运行 Agent（锁定模型版本、超时、环境）
Evaluator ── 打分（确定性检查 + LLM-as-Judge）
Baseline ─── 与上一版对比（看 diff 不看绝对分）
Report ───── 输出报告 + CI 门禁
```

**两类评分器：**

1. **确定性检查** — bash/grep 检查文件是否被正确修改
2. **LLM-as-Judge** — 另一个 LLM 评估开放式输出质量

**pass@k 指标：**

- `pass@1` = 一次就对
- `pass@3` = 3 次里至少对 1 次（容忍非确定性）
- `pass^k` = 连续 k 次都对（关键路径用）

---

## Claude Code 的 Eval-Driven Development

```
定义预期行为 → 写 Eval → 改代码 → 跑 Eval → 对比 Baseline → 合格则合并
```

**三类 Eval：**

| 类型 | 用途 |
|------|------|
| Capability Eval | 新功能验证 |
| Regression Eval | 防退化 |
| Sandboxed Eval | 隔离环境端到端 |

---

## 实施路线

### Level 1：半自动（最小成本）

改造 `agentLoop` 支持非交互模式，编写固定 test case：

```javascript
// eval-runner.mjs
const cases = [
  {
    id: "read_basic",
    input: "读取 README.md",
    expect: { tools: ["read"], maxAPICalls: 2 }
  },
  {
    id: "search_edit",
    input: "找到 config.mjs 里的模型名，改成 gpt-4",
    expect: { tools: ["grep", "read", "edit"], maxAPICalls: 5 }
  },
  {
    id: "multi_edit_trigger",
    input: "把 tools.md 里所有 grep_search 改成 grep",
    expect: { tools: ["read", "multi_edit"], maxAPICalls: 4 }
  }
];

for (const c of cases) {
  const result = await agentLoop(c.input, { interactive: false });
  const score = evaluate(result, c);
  console.log(`${c.id}: ${score}/10`);
}
```

### Level 2：对比基线

```javascript
// 改 prompt 前存 baseline.json，改后对比 diff
const diff = compare(candidate, baseline);
// { improved: ["multi_edit_trigger"], regressed: [], unchanged: ["read_basic"] }
```

### Level 3：LLM-as-Judge

```javascript
const score = await judge({
  task: "解释 agent.mjs 的架构",
  response: agentResponse,
  criteria: ["准确性", "完整性", "简洁性"]
});
```

---

## 项目实现

### 架构改造

将原有 `agent.mjs` 拆分为两层：

```
AgentCore (core/agent-core.mjs)
  ├── agent.mjs  — 交互模式（Ink UI + 流式）
  └── eval.mjs   — 评估模式（batch + 评分）
```

`AgentCore.run()` 是纯逻辑引擎，通过选项注入与 UI 解耦：

```javascript
const trace = await agent.run(prompt, {
  messages,
  stream: true,
  maxTurns: 10,
  temperature: 0,
  on: {
    toolStart(name, input) {},
    toolEnd(name, result, success) {},
    text(chunk) {},
    thinking(chunk) {},
  },
});
```

### 代码结构

```
src/
  eval.mjs           # 入口（解析参数，初始化 Logger + AgentCore）
  eval/
    cases.mjs        # 测试用例定义（16 个，含多轮 + 上下文 + SubAgent）
    runner.mjs       # 运行器 + 评分 + 沙盒管理
    report.mjs       # Markdown 报告生成
```

### 运行评估

```bash
node src/eval.mjs              # 全部 16 个用例
node src/eval.mjs fix_bug      # 单个用例
node src/eval.mjs fix_bug multi_edit  # 多个指定用例
node src/eval.mjs --list       # 列出可用用例
node src/eval.mjs --log        # 开启详细日志
node src/eval.mjs fix_bug --log  # 组合使用
```

也可通过 `.env` 配置默认开启日志：`EVAL_LOG=true`

### 输出

| 文件 | 何时生成 | 内容 |
|------|---------|------|
| `eval-reports/*.md` | 始终 | 评分报告（总分表 + 工具调用详情） |
| `logs/eval-*.log` | `--log` 或 `EVAL_LOG=true` | 详细日志（格式与交互模式一致，支持 VS Code 缩进折叠） |

16 个 case 生成**一个**日志文件，每个 case 作为一个轮次（`#1 | 用户输入`），可按缩进折叠快速跳转。

---

## 沙盒机制（代码隔离）

Eval 不会污染项目代码，运行流程：

```
开始
  ↓
backupSandbox()  ── 把 test-example/ 整体复制到 .eval-backup/
  ↓
for each case:
  restoreSandbox()  ── 从备份恢复 test-example/ 到初始状态
  AgentCore.run()   ── Agent 可以自由 edit/write 文件
  validate()        ── 检查修改结果
  ↓
restoreSandbox()  ── 最后一次恢复
rm .eval-backup/  ── 清理备份
```

**关键特性：**

- 每个 case 前自动恢复到初始状态，case 之间互不影响
- Agent 的 edit/write 操作只在单个 case 的验证期间存在
- 运行结束后 test-example/ 恢复原样，不会被 git 检测到变更
- `.eval-backup/` 是临时目录，运行结束自动删除

---

## 测试项目 (test-example/)

包含 3 个子项目的测试集合，覆盖不同代码模式：

```
test-example/
  README.md
  shopping-cart/      # 购物车（类+计算逻辑+已知 bug）
    cart.mjs          # ShoppingCart 类（getSubtotal 有 bug：+ 应为 *）
    utils.mjs         # calculateDiscount, formatPrice, validateQuantity
    config.mjs        # TAX_RATE, MAX_ITEMS 等常量
  todo-app/           # 待办应用（多文件+异步+CLI）
    store.mjs         # TodoStore 类（增删改查+持久化）
    formatter.mjs     # 格式化函数
    cli.mjs           # CLI 入口
  string-utils/       # 字符串工具库（纯函数+导出）
    index.mjs         # 聚合导出
    transform.mjs     # capitalize, camelCase, slugify, truncate
    validate.mjs      # isEmail(过于简单), isURL, isEmpty(缺空值保护)
```

**已埋 bug：** `shopping-cart/cart.mjs` 的 `getSubtotal()` 中 `item.price + item.quantity` 应为 `item.price * item.quantity`。

---

## 评分机制

每个 case 满分 100，由 4 个维度加权：

| 维度 | 权重 | 如何衡量 |
|------|------|---------|
| 正确性 | 50% | `validate()` 函数检查最终结果（文件内容是否符合预期） |
| 工具选择 | 20% | 是否使用了预期工具（如修 bug 应该用 read + edit） |
| 效率 | 20% | API 调用轮次是否在 maxAPICalls 内 |
| 无错误 | 10% | 工具调用是否全部成功（无报错） |

**效率分级：**

- ≤ maxAPICalls → 满分 20
- ≤ maxAPICalls × 1.5 → 10 分
- 超过 → 0 分

---

## 现有测试用例（16 个）

### 基础操作

| Case ID | 名称 | 测试能力 | 最大轮次 |
|---------|------|---------|---------|
| read_basic | 读取文件 | 文件读取 | 2 |
| list_dir | 列出目录 | 目录探索 | 3 |

### JS 项目（shopping-cart）

| Case ID | 名称 | 测试能力 | 最大轮次 |
|---------|------|---------|---------|
| fix_bug | JS 修复 Bug | read → edit | 5 |
| multi_edit | JS 多处修改 | read → multi_edit | 4 |
| explore_then_edit | JS 探索后编辑 | grep → read → edit | 6 |

### Python 项目（py-utils）

| Case ID | 名称 | 测试能力 | 最大轮次 |
|---------|------|---------|---------|
| py_search | 搜索函数 | grep / symbols | 4 |
| py_fix | 修复 Bug | read → edit | 4 |

### Go 项目（go-api）

| Case ID | 名称 | 测试能力 | 最大轮次 |
|---------|------|---------|---------|
| go_search | 搜索函数 | grep / symbols | 4 |
| go_fix | 修改配置 | read → edit | 4 |

### Rust 项目（rust-lib）

| Case ID | 名称 | 测试能力 | 最大轮次 |
|---------|------|---------|---------|
| rust_search | 搜索结构 | symbols | 4 |

### 跨语言

| Case ID | 名称 | 测试能力 | 最大轮次 |
|---------|------|---------|---------|
| cross_lang_search | 跨语言搜索 | grep 跨 JS/Python/Go | 3 |
| bash_verify | 命令验证 | read → edit → bash | 6 |

### SubAgent

| Case ID | 名称 | 测试能力 | 最大轮次 |
|---------|------|---------|---------|
| task_analyze | 多语言分析 | task 委派 | 3 |

### 多轮对话

| Case ID | 名称 | 测试能力 | 最大轮次 |
|---------|------|---------|---------|
| multi_turn_explore | 多轮探索修复 (3 轮) | 上下文保持 + 跨轮次编辑 | 8 |
| multi_turn_refactor | 多轮重构 (2 轮) | 上下文保持 + multi_edit | 6 |

### 长上下文注意力

| Case ID | 名称 | 测试能力 | 最大轮次 |
|---------|------|---------|---------|
| context_attention | 长上下文注意力 | 8 轮无关对话后准确执行 | 3 |

---

## 如何添加新 Case

在 `src/eval/cases.mjs` 的 `CASES` 数组中添加：

```javascript
{
  id: 'my_case',           // 唯一 ID
  name: '测试名称',         // 显示名
  input: '给 Agent 的指令', // 用户输入
  expect: {
    tools: ['read', 'edit'],  // 预期使用的工具（任一匹配即可）
    maxAPICalls: 5,            // 最大 API 轮次
    validate: async (trace) => {
      // 验证逻辑 — 返回 true/false
      const content = await readFile('test-example/xxx.mjs', 'utf-8');
      return content.includes('expected content');
    },
  },
}
```

`validate` 函数可以：
- 检查文件内容是否被正确修改
- 检查文件是否被创建
- 检查 trace.toolCalls 的调用链

### 多轮用例

用 `inputs`（数组）替代 `input`（字符串），runner 会按顺序逐轮发送，共享同一个 messages：

```javascript
{
  id: 'multi_turn_fix',
  name: '多轮修复',
  inputs: [
    '查看 xxx 目录有哪些文件',
    '读取 xxx.mjs，告诉我逻辑',
    '修复 bug',
  ],
  expect: { /* ... */ },
}
```

### 长上下文用例

用 `prefill` 预填充 messages 历史，测试模型在大量无关上下文后的注意力：

```javascript
{
  id: 'context_test',
  prefill: buildLongContext(),  // 预填 8 轮无关对话
  input: '回到最初的问题...',
  expect: { /* ... */ },
}
```

---

## 对比基线

每次跑 eval 都会生成 `eval-reports/YYYY-MM-DD-HH-mm-ss.md`。

对比方式：

1. **改 prompt 前** — 跑一次 eval，记录分数
2. **改 prompt 后** — 再跑一次 eval
3. **对比两份报告** — 看哪些 case 涨了哪些跌了

未来可实现自动 baseline 对比（存储上一次结果为 `baseline.json`，自动 diff）。

---

## 常见错误

| 错误 | 后果 |
|------|------|
| 数据集不固定 | 无法对比 |
| 模型版本不锁定 | 同 prompt 不同天结果不同 |
| 只看绝对分不看 diff | 不知道进步还是退步 |
| 不保存中间产物 | 出问题没法 debug |

---

## 参考资源

- [SWE-bench](https://www.swebench.com/) — 行业标杆
- [Agent Patterns - Eval Harness](https://www.agentpatterns.tech/en/testing-ai-agents/eval-harness)
- [Promptfoo - Evaluate Coding Agents](https://www.promptfoo.dev/docs/guides/evaluate-coding-agents/)
- [HAL Harness](https://github.com/princeton-pli/hal-harness/) — 统一 CLI 跑多个 benchmark
