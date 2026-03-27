/**
 * grep 工具 — 正则搜索代码内容
 * 底层使用 @vscode/ripgrep
 */

import { execSync } from 'child_process';
import { rgPath } from '@vscode/ripgrep';
import { define } from './registry.mjs';

define(
  'grep',
  `正则搜索代码内容（ripgrep）。返回 文件:行号:匹配行。

用法：
- 支持完整正则语法（如 "log.*Error"、"function\\s+\\w+"、"import.*from"）
- 用 include 过滤文件类型减少噪音
- 输出模式：content（默认）、files_only（仅路径）、count（计数）
- 用 | 组合多个模式（如 "validate|validator"），一次调用覆盖全部目标
- ripgrep 语法：字面花括号需转义（用 interface\\{\\} 搜 Go 的 interface{}）
- 结果已含匹配行，通常无需再 read
- 复杂多轮搜索用 task 委派`,
  {
    pattern: { type: 'string', description: '正则表达式。支持 | 组合多个模式，\\b 词边界。' },
    path: { type: 'string', description: '搜索目录或文件，默认当前目录' },
    include: { type: 'string', description: '文件类型过滤 glob，如 "*.py"、"*.{js,ts,mjs}"、"*.go"' },
    output_mode: { type: 'string', description: 'content（默认，匹配行）| files_only（仅路径）| count（计数）' },
  },
  ['pattern'],
  async ({ pattern, path = '.', include, output_mode = 'content' }) => {
    try {
      const modeFlags = {
        files_only: '--files-with-matches',
        count: '--count',
        content: '--line-number --no-heading',
      };
      const flag = modeFlags[output_mode] || modeFlags.content;
      let cmd = `"${rgPath}" ${flag} --max-count 200 "${pattern}" "${path}"`;
      if (include) cmd += ` --glob "${include}"`;
      const output = execSync(cmd, { encoding: 'utf-8', timeout: 10_000, maxBuffer: 1024 * 1024, stdio: ['pipe', 'pipe', 'pipe'] });
      return output || `未找到匹配: ${pattern}`;
    } catch (e) {
      if (e.status === 1) return `未找到匹配: ${pattern}`;
      return e.stdout || e.stderr?.toString() || `搜索失败: ${e.message}`;
    }
  }
);
