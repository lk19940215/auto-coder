/**
 * web_search — 互联网搜索工具
 * 底层使用 Tavily Search API（专为 AI Agent 优化）
 * 免费额度：1000 次/月（tavily.com 注册获取 API Key）
 */

import { define } from './registry.mjs';

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

define(
  'web_search',
  `搜索互联网，返回实时信息摘要和链接。用于获取训练数据之外的最新信息：文档、API 变更、技术新闻、版本发布等。

用法：
- 搜索关键词要具体，包含版本号或日期效果更好
- 返回内容已为 LLM 优化，包含标题、摘要和 URL
- 需要 TAVILY_API_KEY 环境变量（tavily.com 免费注册）`,
  {
    query: { type: 'string', description: '搜索关键词，如 "React 19 new features 2026"' },
    max_results: { type: 'number', description: '返回结果数量（1-10），默认 5' },
  },
  ['query'],
  async ({ query, max_results = 5 }) => {
    if (!TAVILY_API_KEY) {
      return '错误: 未配置 TAVILY_API_KEY。请在 .env 中添加（tavily.com 免费注册）';
    }

    try {
      const resp = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: TAVILY_API_KEY,
          query,
          search_depth: 'basic',
          max_results: Math.min(max_results, 10),
          include_answer: true,
        }),
        signal: AbortSignal.timeout(15_000),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        return `搜索失败 (HTTP ${resp.status}): ${err.detail?.error || resp.statusText}`;
      }

      const data = await resp.json();
      const parts = [];

      if (data.answer) {
        parts.push(`摘要: ${data.answer}\n`);
      }

      if (data.results?.length > 0) {
        parts.push('搜索结果:');
        for (const r of data.results) {
          parts.push(`\n[${r.title}](${r.url})\n${r.content}`);
        }
      }

      return parts.join('\n') || '未找到相关结果';
    } catch (e) {
      if (e.name === 'TimeoutError') return '搜索超时（15s）';
      return `搜索失败: ${e.message}`;
    }
  }
);
