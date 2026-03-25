/**
 * Messages 管理
 *
 * - all: 完整历史（不裁剪）
 * - current: 发送给 LLM 的消息（后续可裁剪）
 * - 每次变更自动持久化到 JSON 文件
 * - load(): 从 JSON 文件恢复历史会话
 */

import { writeFileSync, readFileSync, mkdirSync } from 'fs';

export class Messages {
  constructor() {
    this.all = [];
    this.file = null;
  }

  init(logFileBase) {
    mkdirSync('logs', { recursive: true });
    this.file = logFileBase ? logFileBase.replace('.log', '-messages.json') : null;
    this._save();
  }

  /** 从已有 JSON 文件加载消息历史（会话恢复） */
  load(filePath) {
    try {
      const data = JSON.parse(readFileSync(filePath, 'utf-8'));
      this.all = Array.isArray(data) ? data : [];
      console.log(`\x1b[2m已加载 ${this.all.length} 条历史消息: ${filePath}\x1b[0m`);
      this._save();
    } catch (e) {
      console.error(`\x1b[33m加载消息失败: ${e.message}\x1b[0m`);
    }
  }

  push(msg) {
    this.all.push(msg);
    this._save();
  }

  get current() {
    return this.all;
  }

  get length() {
    return this.all.length;
  }

  _save() {
    if (!this.file) return;
    writeFileSync(this.file, JSON.stringify(this.all, null, 2), 'utf-8');
  }
}
