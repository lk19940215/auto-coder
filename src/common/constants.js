'use strict';

// ─────────────────────────────────────────────────────────────
// 常量集中管理
// ─────────────────────────────────────────────────────────────

/**
 * 任务状态
 */
const TASK_STATUSES = Object.freeze(['pending', 'in_progress', 'testing', 'done', 'failed']);

/**
 * 状态迁移规则
 */
const STATUS_TRANSITIONS = Object.freeze({
  pending: ['in_progress'],
  in_progress: ['testing'],
  testing: ['done', 'failed'],
  failed: ['in_progress'],
  done: [],
});

/**
 * 文件名常量
 */
const FILES = Object.freeze({
  SESSION_RESULT: 'session_result.json',
  TASKS: 'tasks.json',
  PROFILE: 'project_profile.json',
  PROGRESS: 'progress.json',
  TESTS: 'tests.json',
  TEST_ENV: 'test.env',
  PLAYWRIGHT_AUTH: 'playwright-auth.json',
  ENV: '.env',
  MCP_CONFIG: '.mcp.json',
});

/**
 * 超时默认值（秒）
 */
const TIMEOUTS = Object.freeze({
  STALL: 1200,           // 20 分钟
  COMPLETION: 300,       // 5 分钟
  API: 3000000,          // 50 分钟（毫秒）
  MCP_TOOL: 30000,       // 30 秒（毫秒）
});

/**
 * 重试配置
 */
const RETRY = Object.freeze({
  MAX_ATTEMPTS: 3,
  SCAN_ATTEMPTS: 3,
});

/**
 * 编辑防护阈值
 */
const EDIT_THRESHOLD = 15;

module.exports = {
  TASK_STATUSES,
  STATUS_TRANSITIONS,
  FILES,
  TIMEOUTS,
  RETRY,
  EDIT_THRESHOLD,
};