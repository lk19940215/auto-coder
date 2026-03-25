/**
 * AI Coding Agent - 主循环
 *
 * 整体流程:
 *   while(true) {
 *     1. 等待用户输入 → 加入 messages
 *     2. 调 LLM（带 tools + messages 历史）→ 阻塞等待响应
 *     3. 遍历响应内容:
 *        - text → 显示给用户
 *        - tool_use → 执行工具 → 收集结果
 *     4. 如果有工具结果 → 加入 messages → 跳过用户输入 → 回到 2（工具循环）
 *        如果没有工具结果（end_turn）→ 回到 1（等用户）
 *   }
 *
 * 运行: npm start
 * 恢复会话: RESUME_FILE=logs/xxx-messages.json npm start
 */

import Anthropic from '@anthropic-ai/sdk';
import * as readline from 'readline';

import { API_KEY, BASE_URL, DEFAULT_MODEL, MAX_TOKENS, DEBUG, SYSTEM_PROMPT, RESUME_FILE } from './config.mjs';
import { toolSchemas, executeTool } from './tools.mjs';
import { status } from './display.mjs';
import { Logger, C } from './logger.mjs';
import { Messages } from './messages.mjs';

// Anthropic SDK 客户端，支持 baseURL 切换模型提供商
const client = new Anthropic({ apiKey: API_KEY, baseURL: BASE_URL });
const logger = new Logger(DEBUG);
const messages = new Messages();

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise(resolve => rl.question(q, resolve));

  const logFile = logger.init();
  messages.init(logFile);

  if (RESUME_FILE) {
    messages.load(RESUME_FILE);
  }

  logger.start({
    model: DEFAULT_MODEL,
    tools: toolSchemas.map(t => t.name),
    logFile,
    systemPrompt: SYSTEM_PROMPT,
    toolSchemas,
  });

  // stopReason 驱动循环行为:
  // - 'tool_use' → 跳过用户输入，直接再调 LLM（模型还在工作）
  // - 'max_tokens' → 输出被截断，继续调 LLM 接着输出
  // - 'end_turn' 或 null → 等待用户输入
  let stopReason = null;

  while (true) {
    // ── 步骤 1: 获取用户输入（工具循环中跳过）──────────────    
    if (stopReason !== 'tool_use' && stopReason !== 'max_tokens') {
      status('waiting');
      const input = await ask(`\x1b[32m你: \x1b[0m`);
      if (!input || input.trim() === 'exit') break;
      messages.push({ role: 'user', content: input });
    }

    if (stopReason === 'max_tokens') {
      logger.print(`${C.yellow}[续] 输出被截断，继续请求...${C.reset}`);
    }

    status('thinking');

    const requestParams = {
      model: DEFAULT_MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      tools: toolSchemas,
      messages: messages.current,
    };

    logger.log('请求参数', {
      model: DEFAULT_MODEL,
      max_tokens: MAX_TOKENS,
      baseURL: BASE_URL || 'default',
      messages数量: messages.length,
    });

    let response;
    try {
      // ── 步骤 2: 调用 LLM ─────────────────────────────────
      // 每次都发送完整的 messages 历史 + 工具定义
      // 模型根据历史和工具描述，决定是回复文本还是调用工具
      response = await client.messages.create(requestParams);
    } catch (e) {
      status('error');
      logger.log('错误', e.message);
      stopReason = null;
      continue;
    }

    logger.log('响应内容', response);

    // 将 AI 响应加入历史（包含 text 和/或 tool_use blocks）
    messages.push({ role: 'assistant', content: response.content });
    stopReason = response.stop_reason;

    // ── 步骤 3: 处理响应内容 ──────────────────────────────
    const toolResults = [];

    for (const block of response.content) {
      if (block.type === 'text') {
        logger.print(`\n${C.cyan}Agent:${C.reset} ${block.text}\n`);

      } else if (block.type === 'tool_use') {
        status('calling');
        logger.log(`工具开始: ${block.name}`, block.input);

        const result = await executeTool(block.name, block.input);

        // 截断过长的工具结果，防止上下文窗口溢出
        const MAX = 8000;
        const truncated = result.length > MAX
          ? result.substring(0, MAX) + `\n... [截断，共 ${result.length} 字符]`
          : result;

        // 工具执行后记录
        logger.log(`工具完成: ${block.name}`, truncated);

        // tool_result 的 tool_use_id 必须匹配 tool_use 的 id（API 协议要求）
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: truncated,
        });
      }
    }

    // ── 步骤 4: 工具结果送回 → 决定下一轮行为 ──────────────
    if (toolResults.length > 0) {
      // 有工具结果 → 作为 user 消息送回（API 协议：tool_result 必须在 user 角色下）
      // stopReason 仍是 'tool_use'，下一轮会跳过用户输入，直接再调 LLM
      messages.push({ role: 'user', content: toolResults });
    } else if (stopReason === 'max_tokens') {
      // 截断时不等用户，继续调 LLM 接着输出
    } else {
      // 没有工具调用（end_turn）→ 任务完成，下一轮等待用户输入
      status('done');
    }
  }

  logger.print(`\n${C.dim}再见！${C.reset}\n`);
  rl.close();
}

main();
