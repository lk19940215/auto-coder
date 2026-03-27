/**
 * bash — 命令执行工具
 */

import { execSync } from 'child_process';
import { define } from './registry.mjs';

define(
  'bash',
  `执行 bash 命令。用于系统操作：git、npm、测试、构建、环境管理。

以下操作有专用工具，不要用 bash：
- 搜索内容 → grep（不要 grep/rg/awk）
- 搜索文件 → glob（不要 find/ls）
- 读文件 → read（不要 cat/head/tail）
- 写文件 → write（不要 echo >/cat <<）
- 编辑文件 → edit/multi_edit（不要 sed/awk）
专用工具提供更好的结构化输出和错误处理，优先使用。`,
  { command: { type: 'string', description: '要执行的 bash 命令' } },
  ['command'],
  async ({ command }) => {
    try {
      const output = execSync(command, {
        encoding: 'utf-8',
        timeout: 30_000,
        maxBuffer: 1024 * 1024,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      return output || '(命令执行成功，无输出)';
    } catch (e) {
      return [
        `退出码: ${e.status ?? 'unknown'}`,
        e.stdout ? `stdout:\n${e.stdout}` : '',
        e.stderr ? `stderr:\n${e.stderr}` : ''
      ].filter(Boolean).join('\n');
    }
  }
);
