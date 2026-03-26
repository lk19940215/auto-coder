/**
 * Messages 管理
 *
 * - all: 完整历史
 * - current: 发送给 LLM 的消息（后续可加滑动窗口）
 * - 自动持久化到 JSON 文件（防崩溃丢失）
 * - load(): 恢复历史会话
 */

import { writeFile, readFile, mkdir } from 'fs/promises';

export class Messages {
  constructor() {
    this.all = [];
    this.file = null;
    this._saveTimer = null;
  }

  async init(logFileBase) {
    await mkdir('logs', { recursive: true });
    this.file = logFileBase ? logFileBase.replace('.log', '-messages.json') : null;
  }

  async load(filePath) {
    try {
      const data = JSON.parse(await readFile(filePath, 'utf-8'));
      if (!Array.isArray(data)) {
        console.warn('⚠️  消息历史格式错误');
        return { ok: false };
      }
      this.all = data;
      return { ok: true, count: this.all.length };
    } catch {
      return { ok: false };
    }
  }

  push(msg) {
    this.all.push(msg);
    this._debounceSave();
  }

  get current() {
    return this.all;
  }

  get length() {
    return this.all.length;
  }

  // 清理历史，保留最近 N 条
  trim(maxMessages = 100) {
    if (this.all.length > maxMessages) {
      this.all = this.all.slice(-maxMessages);
      this._debounceSave();
      return this.all.length;
    }
    return 0;
  }

  _debounceSave() {
    if (this._saveTimer) return;
    this._saveTimer = setTimeout(() => {
      this._saveTimer = null;
      this._save();
    }, 500);
  }

  async _save() {
    if (!this.file) return;
    try {
      // 美化格式方便调试
      const json = JSON.stringify(this.all, null, 2);
      await writeFile(this.file, json, 'utf-8');
    } catch (err) {
      console.error(`⚠️  消息保存失败: ${err.message}`);
    }
  }
}
