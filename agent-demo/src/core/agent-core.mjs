/**
 * Agent Core — 纯逻辑引擎，无 UI 依赖
 *
 * 支持三种模式：
 * 1. 交互模式（agent.mjs）：流式输出 + UI 回调
 * 2. 评估模式（eval.mjs）：非交互，返回结构化 trace
 * 3. SubAgent 模式（task 工具）：受限工具集，独立上下文
 *
 * 通过回调注入实现解耦：
 *   onToolStart(name, input)
 *   onToolEnd(name, result, success)
 *   onText(chunk)
 *   onThinking(chunk)
 *   onBlockStart(type)   — 'thinking' | 'text'
 *   onBlockEnd(type)
 */

import Anthropic from '@anthropic-ai/sdk';
import { toolSchemas as defaultToolSchemas, executeTool as defaultExecuteTool } from '../tools/index.mjs';

const MAX_TOOL_RESULT_LENGTH = 8000;

export class AgentCore {
  /**
   * @param {Object} config
   * @param {string} config.apiKey
   * @param {string} config.baseURL
   * @param {string} config.model
   * @param {number} [config.maxTokens=8192]
   * @param {string} config.systemPrompt
   * @param {Logger} [config.logger]
   * @param {Array} [config.tools] - 自定义工具 schema（默认全部工具）
   * @param {Function} [config.executor] - 自定义工具执行器（默认全局 executeTool）
   */
  constructor({ apiKey, baseURL, model, maxTokens = 8192, systemPrompt, logger, tools, executor }) {
    this.client = new Anthropic({ apiKey, baseURL });
    this.model = model;
    this.maxTokens = maxTokens;
    this.systemPrompt = systemPrompt;
    this.logger = logger;
    this.toolSchemas = tools || defaultToolSchemas;
    this.executeTool = executor || defaultExecuteTool;
  }

  /**
   * 执行单轮对话（可能包含多次工具调用循环）
   *
   * @param {string} input - 用户输入
   * @param {Array|Messages} messages - 消息存储（plain array 或 Messages 实例）
   * @param {Object} callbacks - 可选回调
   * @param {Object} options - { maxTurns, stream }
   * @returns {Object} trace - { toolCalls, finalText, turns, tokens, stopReason }
   */
  async run(input, messages, callbacks = {}, options = {}) {
    // 支持 plain array 和 Messages 实例（duck typing）
    const msgPush = (msg) => messages.push(msg);
    const msgAll = () => messages.current ?? messages;

    const { maxTurns = 20, stream = false } = options;
    const {
      onToolStart, onToolEnd,
      onText, onThinking,
      onBlockStart, onBlockEnd,
      onStatus, onError,
    } = callbacks;

    const trace = {
      toolCalls: [],
      finalText: '',
      turns: 0,
      tokens: { input: 0, output: 0 },
      stopReason: null,
    };

    // 记录 run 开始前的 messages 数量，异常时回滚
    // 防止 API 错误导致 messages 出现 [user, user] 破坏交替角色
    const msgCountBeforeRun = msgAll().length;
    msgPush({ role: 'user', content: input });

    let stopReason = 'tool_use';

    while (stopReason === 'tool_use' || stopReason === 'max_tokens') {
      if (trace.turns >= maxTurns) {
        trace.stopReason = 'max_turns';
        break;
      }

      trace.turns++;
      onStatus?.('thinking');
      this.logger?.log('请求参数', { turn: trace.turns, messages数量: msgAll().length });

      let response;
      try {
        if (stream) {
          response = await this._streamCall(msgAll(), callbacks);
        } else {
          response = await this._batchCall(msgAll());
        }
      } catch (e) {
        onStatus?.('error');
        onError?.(e);
        this.logger?.log('错误', e.message);
        const all = msgAll();
        while (all.length > msgCountBeforeRun) all.pop();
        trace.stopReason = 'error';
        trace.error = e.message;
        break;
      }

      this.logger?.log('响应内容', response);

      trace.tokens.input += response.usage?.input_tokens || 0;
      trace.tokens.output += response.usage?.output_tokens || 0;

      msgPush({ role: 'assistant', content: response.content });
      stopReason = response.stop_reason;
      trace.stopReason = stopReason;

      const toolResults = [];

      for (const block of response.content) {
        if (block.type === 'text') {
          trace.finalText = block.text;
        }

        if (block.type === 'tool_use') {
          onStatus?.('calling');
          onToolStart?.(block.name, block.input);
          this.logger?.log(`工具开始: ${block.name}`, block.input);

          const result = await this.executeTool(block.name, block.input);
          const truncated = result.length > MAX_TOOL_RESULT_LENGTH
            ? result.substring(0, MAX_TOOL_RESULT_LENGTH) + `\n... [截断，共 ${result.length} 字符]`
            : result;

          const isError = /^(错误|失败|编辑失败|写入失败|列出失败|搜索失败|rg:)/.test(result);

          trace.toolCalls.push({
            name: block.name,
            input: block.input,
            resultLength: result.length,
            success: !isError,
          });

          onToolEnd?.(block.name, result, !isError);
          this.logger?.log(`工具完成: ${block.name}`, truncated);

          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: truncated,
          });
        }
      }

      if (toolResults.length > 0) {
        msgPush({ role: 'user', content: toolResults });
      } else {
        onStatus?.('done');
      }
    }

    return trace;
  }

  async _batchCall(messages) {
    return await this.client.messages.create({
      model: this.model,
      max_tokens: this.maxTokens,
      system: this.systemPrompt,
      tools: this.toolSchemas,
      messages,
    });
  }

  async _streamCall(messages, callbacks) {
    const { onText, onThinking, onBlockStart, onBlockEnd } = callbacks;

    const stream = this.client.messages.stream({
      model: this.model,
      max_tokens: this.maxTokens,
      system: this.systemPrompt,
      tools: this.toolSchemas,
      messages,
    });

    stream.on('streamEvent', (event) => {
      if (event.type === 'content_block_start') {
        const t = event.content_block.type;
        if (t === 'thinking') onBlockStart?.('thinking');
        else if (t === 'text') onBlockStart?.('text');
      } else if (event.type === 'content_block_delta') {
        if (event.delta.type === 'thinking_delta') {
          onThinking?.(event.delta.thinking);
        } else if (event.delta.type === 'text_delta') {
          onText?.(event.delta.text);
        }
      } else if (event.type === 'content_block_stop') {
        onBlockEnd?.();
      }
    });

    return await stream.finalMessage();
  }
}
