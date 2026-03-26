/**
 * Eval Report — 生成 Markdown 评估报告
 */

export function generateReport(results, model) {
  const lines = [];
  const now = new Date().toISOString().replace('T', ' ').split('.')[0];

  lines.push(`# Agent Eval Report`);
  lines.push(`时间: ${now} | 模型: ${model}`);
  lines.push('');

  // 总分表
  lines.push('| Case | 正确性 | 工具 | 效率 | 无错 | 总分 | 耗时 |');
  lines.push('|------|--------|------|------|------|------|------|');

  let totalScore = 0;
  for (const r of results) {
    const s = r.scores;
    totalScore += s.total;
    lines.push(`| ${r.caseName} | ${s.correctness}/50 | ${s.toolChoice}/20 | ${s.efficiency}/20 | ${s.noErrors}/10 | **${s.total}** | ${(r.elapsed / 1000).toFixed(1)}s |`);
  }

  const avg = (totalScore / results.length).toFixed(1);
  lines.push('');
  lines.push(`**平均得分: ${avg}/100**`);

  // 详情
  lines.push('');
  lines.push('## 工具调用详情');
  for (const r of results) {
    lines.push(`\n### ${r.caseId}: ${r.caseName}`);
    lines.push(`- 轮次: ${r.trace.turns}`);
    lines.push(`- Token: ${r.trace.tokens.input} (input) + ${r.trace.tokens.output} (output)`);
    lines.push(`- 工具调用:`);
    for (const tc of r.trace.toolCalls) {
      lines.push(`  - ${tc.name}: ${tc.success ? '✓' : '✗'} (${tc.resultLength} 字符)`);
    }
    const text = r.trace.finalText;
    lines.push(`- 最终回复: ${text.length > 100 ? text.substring(0, 100) + '...' : text}`);
  }

  // 总计
  const totalTokenIn = results.reduce((s, r) => s + r.trace.tokens.input, 0);
  const totalTokenOut = results.reduce((s, r) => s + r.trace.tokens.output, 0);
  const totalElapsed = results.reduce((s, r) => s + r.elapsed, 0);
  lines.push('');
  lines.push(`## 总计`);
  lines.push(`- Token: ${totalTokenIn} (input) + ${totalTokenOut} (output) = ${totalTokenIn + totalTokenOut}`);
  lines.push(`- 总耗时: ${(totalElapsed / 1000).toFixed(1)}s`);

  return lines.join('\n');
}
