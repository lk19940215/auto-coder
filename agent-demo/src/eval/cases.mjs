/**
 * Eval 测试用例
 *
 * 每个 case 结构:
 *   id       — 唯一标识，CLI 过滤用
 *   name     — 显示名称
 *   input    — 给 Agent 的指令
 *   expect   — 预期结果
 *     tools       — 预期使用的工具（任一匹配即可）
 *     maxAPICalls — 效率上限（轮次）
 *     validate    — 验证函数（检查文件内容/trace，返回 boolean）
 */

import { readFile } from 'fs/promises';

export const CASES = [
  // ─── 基础操作 ──────────────────────────────────────────

  {
    id: 'read_basic',
    name: '读取文件',
    input: '读取 test-example/README.md 的内容',
    expect: {
      tools: ['read'],
      maxAPICalls: 2,
      validate: (trace) => {
        return trace.toolCalls.find(t => t.name === 'read')?.success === true;
      },
    },
  },
  {
    id: 'list_dir',
    name: '列出目录',
    input: 'test-example 目录下有哪些子目录和文件？列出完整结构',
    expect: {
      tools: ['ls', 'glob'],
      maxAPICalls: 3,
      validate: (trace) => {
        return trace.toolCalls.some(t => t.name === 'ls' || t.name === 'glob');
      },
    },
  },

  // ─── shopping-cart 项目 ────────────────────────────────

  {
    id: 'search_function',
    name: '搜索函数',
    input: '在 test-example 目录中找到 calculateDiscount 函数的定义，告诉我它在哪个文件、什么逻辑',
    expect: {
      tools: ['grep', 'symbols'],
      maxAPICalls: 5,
      validate: (trace) => {
        return trace.toolCalls.some(t => t.name === 'grep' || t.name === 'symbols');
      },
    },
  },
  {
    id: 'fix_bug',
    name: '修复 Bug',
    input: 'test-example/shopping-cart/cart.mjs 的 getSubtotal() 方法有 bug：计算小计时应该用乘法 (price * quantity)，而不是加法 (price + quantity)。请修复。',
    expect: {
      tools: ['read', 'edit'],
      maxAPICalls: 5,
      validate: async () => {
        const content = await readFile('test-example/shopping-cart/cart.mjs', 'utf-8');
        return content.includes('item.price * item.quantity');
      },
    },
  },
  {
    id: 'multi_edit',
    name: '多处修改',
    input: '在 test-example/shopping-cart/utils.mjs 中：1) 给 calculateDiscount 函数加一个参数 vipLevel（默认 0），2) 把 validateQuantity 函数中 qty < 0 改成 qty <= 0',
    expect: {
      tools: ['read', 'multi_edit'],
      maxAPICalls: 4,
      validate: async () => {
        const content = await readFile('test-example/shopping-cart/utils.mjs', 'utf-8');
        return content.includes('vipLevel') && content.includes('qty <= 0');
      },
    },
  },
  {
    id: 'explore_then_edit',
    name: '探索后编辑',
    input: '在 test-example 中找到 TAX_RATE 常量，把它从 0.08 改成 0.1',
    expect: {
      tools: ['grep', 'read', 'edit'],
      maxAPICalls: 6,
      validate: async () => {
        const content = await readFile('test-example/shopping-cart/config.mjs', 'utf-8');
        return content.includes('0.1') && !content.includes('0.08');
      },
    },
  },

  // ─── todo-app 项目 ────────────────────────────────────

  {
    id: 'todo_add_feature',
    name: '添加功能',
    input: '给 test-example/todo-app/store.mjs 的 TodoStore 类添加一个 clear() 方法，清空所有 todo（this.todos = []）',
    expect: {
      tools: ['read', 'edit'],
      maxAPICalls: 4,
      validate: async () => {
        const content = await readFile('test-example/todo-app/store.mjs', 'utf-8');
        return content.includes('clear()') && content.includes('this.todos = []');
      },
    },
  },
  {
    id: 'todo_cross_file',
    name: '跨文件修改',
    input: '在 test-example/todo-app 中：1) 给 formatter.mjs 添加一个 formatSummary(todos) 函数，返回 "共N项，已完成M项" 格式的字符串，2) 在 cli.mjs 的 stats case 中使用 formatSummary 替代 formatStats',
    expect: {
      tools: ['read', 'edit', 'multi_edit'],
      maxAPICalls: 6,
      validate: async () => {
        const formatter = await readFile('test-example/todo-app/formatter.mjs', 'utf-8');
        const cli = await readFile('test-example/todo-app/cli.mjs', 'utf-8');
        return formatter.includes('formatSummary') && cli.includes('formatSummary');
      },
    },
  },

  // ─── string-utils 项目 ────────────────────────────────

  {
    id: 'improve_validation',
    name: '改进验证逻辑',
    input: 'test-example/string-utils/validate.mjs 中的 isEmail 函数太简单了（只检查是否包含@），请改进它，至少要检查：包含@、@前后都有字符、@后面有点号',
    expect: {
      tools: ['read', 'edit'],
      maxAPICalls: 4,
      validate: async () => {
        const content = await readFile('test-example/string-utils/validate.mjs', 'utf-8');
        return content.includes('isEmail') && !content.includes("return str.includes('@');");
      },
    },
  },
  {
    id: 'add_null_safety',
    name: '增加空值保护',
    input: 'test-example/string-utils/validate.mjs 中的 isEmpty 函数没有处理 null/undefined 输入会报错。请修复：当输入为 null 或 undefined 时返回 true',
    expect: {
      tools: ['read', 'edit'],
      maxAPICalls: 4,
      validate: async () => {
        const content = await readFile('test-example/string-utils/validate.mjs', 'utf-8');
        return content.includes('null') || content.includes('undefined') || content.includes('!str');
      },
    },
  },

  // ─── 跨项目 ───────────────────────────────────────────

  {
    id: 'cross_project_search',
    name: '跨项目搜索',
    input: '在 test-example 中搜索所有导出了 format 开头函数的文件，告诉我分别在哪些文件里',
    expect: {
      tools: ['grep'],
      maxAPICalls: 3,
      validate: (trace) => {
        return trace.toolCalls.some(t => t.name === 'grep') && trace.finalText.includes('format');
      },
    },
  },
  {
    id: 'bash_verify',
    name: '命令验证',
    input: '读取 test-example/shopping-cart/config.mjs，把 MAX_ITEMS 从 50 改成 100，然后用 bash 命令 grep MAX_ITEMS test-example/shopping-cart/config.mjs 验证修改成功',
    expect: {
      tools: ['read', 'edit', 'bash'],
      maxAPICalls: 6,
      validate: async (trace) => {
        const content = await readFile('test-example/shopping-cart/config.mjs', 'utf-8');
        const hasBash = trace.toolCalls.some(t => t.name === 'bash');
        return content.includes('100') && hasBash;
      },
    },
  },

  // ─── 多轮对话 ─────────────────────────────────────────

  {
    id: 'multi_turn_explore',
    name: '多轮探索修复',
    inputs: [
      '查看 test-example/shopping-cart/ 目录有哪些文件',
      '读取 cart.mjs，告诉我 getSubtotal 方法的逻辑',
      'getSubtotal 里 price + quantity 应该是 price * quantity，请修复',
    ],
    expect: {
      tools: ['ls', 'read', 'edit'],
      maxAPICalls: 8,
      validate: async () => {
        const content = await readFile('test-example/shopping-cart/cart.mjs', 'utf-8');
        return content.includes('item.price * item.quantity');
      },
    },
  },
  {
    id: 'multi_turn_refactor',
    name: '多轮重构',
    inputs: [
      '读取 test-example/string-utils/validate.mjs',
      '这些函数的空值处理都不好。isEmpty 没处理 null，isEmail 没处理 undefined。请用 multi_edit 同时修复这两个函数',
    ],
    expect: {
      tools: ['read', 'multi_edit', 'edit'],
      maxAPICalls: 6,
      validate: async () => {
        const content = await readFile('test-example/string-utils/validate.mjs', 'utf-8');
        const emailSafe = content.includes('!str') || content.includes('null') || content.includes('typeof');
        const emptySafe = content.includes('!str') || (content.includes('null') && content.includes('isEmpty'));
        return emailSafe && emptySafe;
      },
    },
  },

  // ─── SubAgent（task 工具）────────────────────────────

  {
    id: 'task_analyze',
    name: 'SubAgent 项目分析',
    input: '用 task 工具委派一个子任务：分析 test-example 目录下有哪些子项目，每个项目的核心文件和功能是什么。汇总结果告诉我。',
    expect: {
      tools: ['task'],
      maxAPICalls: 3,
      validate: (trace) => {
        const usedTask = trace.toolCalls.some(t => t.name === 'task' && t.success);
        const mentionsProjects = trace.finalText.includes('shopping') || trace.finalText.includes('todo');
        return usedTask && mentionsProjects;
      },
    },
  },

  // ─── 长上下文（注意力测试）────────────────────────────

  {
    id: 'context_attention',
    name: '长上下文注意力',
    prefill: buildLongContext(),
    input: '回到最初的问题：test-example/shopping-cart/config.mjs 中的 FREE_SHIPPING_THRESHOLD 是多少？请读取文件确认。',
    expect: {
      tools: ['read'],
      maxAPICalls: 3,
      validate: (trace) => {
        return trace.finalText.includes('99') && trace.toolCalls.some(t => t.name === 'read');
      },
    },
  },
];

/**
 * 构建长上下文历史（模拟多轮对话后的注意力稀释）
 * 在 messages 里填充 8 轮无关对话，然后测试 Agent 是否还能准确处理新指令
 */
function buildLongContext() {
  const fillerTopics = [
    { q: '什么是 JavaScript 的闭包？', a: '闭包是函数和其词法环境的组合...' },
    { q: 'React 和 Vue 的区别是什么？', a: 'React 使用 JSX，Vue 使用模板语法...' },
    { q: '解释一下 Promise 和 async/await', a: 'Promise 是异步编程的基础...' },
    { q: 'CSS Grid 和 Flexbox 有什么不同？', a: 'Grid 是二维布局，Flexbox 是一维布局...' },
    { q: 'Node.js 的事件循环是怎么工作的？', a: '事件循环处理异步回调...' },
    { q: 'TypeScript 的泛型怎么用？', a: '泛型允许创建可重用的组件...' },
    { q: 'HTTP/2 相比 HTTP/1.1 有什么改进？', a: '多路复用、头部压缩、服务器推送...' },
    { q: 'Docker 和虚拟机的区别？', a: 'Docker 使用容器技术，共享内核...' },
  ];

  const messages = [];
  for (const topic of fillerTopics) {
    messages.push({ role: 'user', content: topic.q });
    messages.push({ role: 'assistant', content: [{ type: 'text', text: topic.a }] });
  }

  return messages;
}
