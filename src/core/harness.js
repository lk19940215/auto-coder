'use strict';

const { execSync } = require('child_process');
const { log } = require('../common/config');
const { assets } = require('../common/assets');
const { getGitHead, isGitRepo, sleep, ensureGitignore } = require('../common/utils');
const { RETRY, TASK_STATUSES } = require('../common/constants');
const { loadTasks, saveTasks, getFeatures } = require('../common/tasks');

const MAX_RETRY = RETRY.MAX_ATTEMPTS;

// ─── Harness State (harness_state.json) ───────────────────────

const DEFAULT_STATE = Object.freeze({
  version: 1,
  next_task_id: 1,
  next_priority: 1,
  session_count: 0,
  last_simplify_session: 0,
  current_task_id: null,
});

function loadState() {
  return assets.readJson('harnessState', { ...DEFAULT_STATE });
}

function saveState(data) {
  assets.writeJson('harnessState', data);
}

function extractIdNum(id) {
  const m = String(id).match(/(\d+)$/);
  return m ? parseInt(m[1], 10) : 0;
}

/**
 * plan session 结束后调用：扫描 tasks.json，同步 next_task_id 和 next_priority
 */
function syncAfterPlan() {
  const state = loadState();
  const tasks = assets.readJson('tasks', null);
  if (!tasks || !tasks.features) return state;

  const features = tasks.features;
  state.next_task_id = features.reduce((max, f) => Math.max(max, extractIdNum(f.id)), 0) + 1;
  state.next_priority = features.reduce((max, f) => Math.max(max, f.priority || 0), 0) + 1;
  saveState(state);
  return state;
}

// ─── Task Scheduling ──────────────────────────────────────────

/**
 * 任务调度算法：failed(优先重试) > pending(依赖就绪) > in_progress
 */
function selectNextTask(taskData) {
  const features = getFeatures(taskData);

  const failed = features.filter(f => f.status === 'failed')
    .sort((a, b) => (a.priority || 999) - (b.priority || 999));
  if (failed.length > 0) return failed[0];

  const pending = features.filter(f => f.status === 'pending')
    .filter(f => {
      const deps = f.depends_on || [];
      return deps.every(depId => {
        const dep = features.find(x => x.id === depId);
        return dep && dep.status === 'done';
      });
    })
    .sort((a, b) => (a.priority || 999) - (b.priority || 999));
  if (pending.length > 0) return pending[0];

  const inProgress = features.filter(f => f.status === 'in_progress')
    .sort((a, b) => (a.priority || 999) - (b.priority || 999));
  return inProgress[0] || null;
}

// ─── Validation ───────────────────────────────────────────────

function _validateSessionResult() {
  if (!assets.exists('sessionResult')) {
    log('error', 'Agent 未生成 session_result.json');
    return { valid: false, reason: 'session_result.json 不存在' };
  }

  const raw = assets.readJson('sessionResult', null);
  if (raw === null) {
    log('warn', 'session_result.json 解析失败');
    return { valid: false, reason: 'JSON 解析失败', rawContent: assets.read('sessionResult') };
  }

  const data = raw.current && typeof raw.current === 'object' ? raw.current : raw;

  const required = ['session_result', 'status_after'];
  const missing = required.filter(k => !(k in data));
  if (missing.length > 0) {
    log('warn', `session_result.json 缺少字段: ${missing.join(', ')}`);
    return { valid: false, reason: `缺少字段: ${missing.join(', ')}`, data };
  }

  if (!['success', 'failed'].includes(data.session_result)) {
    return { valid: false, reason: `无效 session_result: ${data.session_result}`, data };
  }

  if (!TASK_STATUSES.includes(data.status_after)) {
    return { valid: false, reason: `无效 status_after: ${data.status_after}`, data };
  }

  const level = data.session_result === 'success' ? 'ok' : 'warn';
  log(level, `session_result.json 合法 (${data.session_result})`);
  return { valid: true, data };
}

function _checkGitProgress(headBefore) {
  if (!headBefore) {
    log('info', '未提供 head_before，跳过 git 检查');
    return { hasCommit: false, warning: false };
  }

  const projectRoot = assets.projectRoot;
  const headAfter = getGitHead(projectRoot);

  if (headBefore === headAfter) {
    log('warn', '本次会话没有新的 git 提交');
    return { hasCommit: false, warning: true };
  }

  try {
    const msg = execSync('git log --oneline -1', { cwd: projectRoot, encoding: 'utf8' }).trim();
    log('ok', `检测到新提交: ${msg}`);
  } catch { /* ignore */ }

  return { hasCommit: true, warning: false };
}

function _inferFromTasks(taskId) {
  if (!taskId) return null;
  const data = loadTasks();
  if (!data) return null;
  const task = getFeatures(data).find(f => f.id === taskId);
  return task ? task.status : null;
}

// ─── Harness Lifecycle Class ──────────────────────────────────

/**
 * Harness 生命周期管理
 *
 * 职责：环境准备、状态持久化、任务调度、校验、回滚、清理
 *
 * 方法                  阶段       说明
 * ensureEnvironment()   循环前     目录创建、gitignore、git 初始化
 * checkPrerequisites()  循环前     检查 profile/tasks 是否存在
 * snapshot(taskData)    会话前     快照 HEAD、选取并持久化当前任务
 * isAllDone(taskData)   会话前     判断是否全部完成
 * validate(...)         会话后     校验 session_result + git 进度（含 AI 修复）
 * onSuccess(...)        会话后     递增计数、记录进度
 * onFailure(...)        会话后     回滚、超限跳过、记录进度
 * onStall(...)          会话后     回滚、超限跳过、记录进度
 * shouldSimplify()      会话后     判断是否需要周期性 simplify
 * needsFinalSimplify()  全部完成   判断是否需要最终 simplify
 * afterSimplify(msg)    simplify后 标记状态 + commit
 * tryPush()             推送       推送代码到远程
 * cleanup()             循环后     杀停服务进程
 */
class Harness {
  constructor(config) {
    this.config = config;
    this.projectRoot = assets.projectRoot;
  }

  // ─── Phase: Pre-loop Setup ──────────────────────────────────

  ensureEnvironment() {
    assets.ensureDirs();
    ensureGitignore(this.projectRoot);

    if (!isGitRepo(this.projectRoot)) {
      log('info', '初始化 git 仓库...');
      execSync('git init', { cwd: this.projectRoot, stdio: 'inherit' });
      execSync('git add -A && git commit -m "init: 项目初始化" --allow-empty', {
        cwd: this.projectRoot,
        stdio: 'inherit',
      });
    }
  }

  checkPrerequisites() {
    if (!assets.exists('profile')) {
      return { ok: false, msg: 'profile 不存在，请先运行 claude-coder init 初始化项目' };
    }
    if (!assets.exists('tasks')) {
      return { ok: false, msg: 'tasks.json 不存在，请先运行 claude-coder plan 生成任务' };
    }
    return { ok: true };
  }

  // ─── Phase: Per-session Snapshot ────────────────────────────

  snapshot(taskData) {
    const nextTask = selectNextTask(taskData);
    const taskId = nextTask?.id || 'unknown';

    const state = loadState();
    state.current_task_id = taskId;
    saveState(state);

    return {
      headBefore: getGitHead(this.projectRoot),
      taskId,
    };
  }

  isAllDone(taskData) {
    const features = getFeatures(taskData);
    return features.length > 0 && features.every(f => f.status === 'done');
  }

  // ─── Phase: Post-session Lifecycle ──────────────────────────

  async onSuccess(session, { taskId, sessionResult, validateResult }) {
    this._incrementSession();

    this._appendProgress({
      session,
      timestamp: this._timestamp(),
      result: 'success',
      cost: sessionResult.cost,
      taskId,
      statusAfter: validateResult.sessionData?.status_after || null,
      notes: validateResult.sessionData?.notes || null,
    });

    return { consecutiveFailures: 0, lastFailReason: '' };
  }

  async onFailure(session, { headBefore, taskId, sessionResult, validateResult, consecutiveFailures }) {
    const reason = validateResult.reason || '校验失败';
    log('error', `Session ${session} 校验失败 (连续失败: ${consecutiveFailures + 1}/${MAX_RETRY})`);
    return this._handleRetryOrSkip(session, {
      headBefore, taskId, sessionResult, consecutiveFailures,
      result: 'fatal', reason,
      lastFailMsg: `上次校验失败: ${reason}，代码已回滚`,
    });
  }

  async onStall(session, { headBefore, taskId, sessionResult, consecutiveFailures }) {
    log('warn', `Session ${session} 因停顿超时中断，跳过校验直接重试`);
    return this._handleRetryOrSkip(session, {
      headBefore, taskId, sessionResult, consecutiveFailures,
      result: 'stalled', reason: '停顿超时',
      lastFailMsg: '上次会话停顿超时，已回滚',
    });
  }

  cleanup() {
    this._killServicesByProfile();
  }

  // ─── Phase: Post-session Validation ─────────────────────────

  async validate(headBefore, taskId) {
    log('info', '========== 开始校验 ==========');

    let srResult = _validateSessionResult();
    const gitResult = _checkGitProgress(headBefore);

    if (!srResult.valid && srResult.rawContent) {
      const srPath = assets.path('sessionResult');
      if (srPath) {
        const { repairJsonFile } = require('./repair');
        await repairJsonFile(srPath);
        srResult = _validateSessionResult();
      }
    }

    let fatal = false;
    let hasWarnings = false;

    if (srResult.valid) {
      hasWarnings = gitResult.warning;
    } else {
      if (gitResult.hasCommit) {
        const taskStatus = _inferFromTasks(taskId);
        if (taskStatus === 'done' || taskStatus === 'testing') {
          log('warn', `session_result.json 异常，但 tasks.json 显示 ${taskId} 已 ${taskStatus}，且有新提交，降级为警告`);
        } else {
          log('warn', 'session_result.json 异常，但有新提交，降级为警告（不回滚代码）');
        }
        hasWarnings = true;
      } else {
        log('error', '无新提交且 session_result.json 异常，视为致命');
        fatal = true;
      }
    }

    if (fatal) {
      log('error', '========== 校验失败 (致命) ==========');
    } else if (hasWarnings) {
      log('warn', '========== 校验通过 (有警告) ==========');
    } else {
      log('ok', '========== 校验全部通过 ==========');
    }

    const reason = fatal ? (srResult.reason || '无新提交且 session_result.json 异常') : '';
    return { fatal, hasWarnings, sessionData: srResult.data, reason };
  }

  // ─── Internal: Retry / Skip ─────────────────────────────────

  async _handleRetryOrSkip(session, { headBefore, taskId, sessionResult, consecutiveFailures, result, reason, lastFailMsg }) {
    const newFailures = consecutiveFailures + 1;
    const exceeded = newFailures >= MAX_RETRY;

    await this._rollback(headBefore, reason);

    if (exceeded) {
      log('error', `连续失败 ${MAX_RETRY} 次，跳过当前任务`);
      this._markTaskFailed(taskId);
    }

    const entry = { session, timestamp: this._timestamp(), result, cost: sessionResult.cost, taskId };
    if (result === 'fatal') entry.reason = reason;
    this._appendProgress(entry);

    if (exceeded) return { consecutiveFailures: 0, lastFailReason: '' };
    return { consecutiveFailures: newFailures, lastFailReason: lastFailMsg };
  }

  // ─── Internal: Utilities ────────────────────────────────────

  _timestamp() {
    return new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12);
  }

  // ─── Internal: State Operations ─────────────────────────────

  _incrementSession() {
    const state = loadState();
    state.session_count++;
    saveState(state);
  }

  _markSimplifyDone() {
    const state = loadState();
    state.last_simplify_session = state.session_count;
    saveState(state);
  }

  // ─── Internal: Git Operations ───────────────────────────────

  async _rollback(headBefore, reason) {
    if (!headBefore || headBefore === 'none') return;

    this._killServicesByProfile();
    if (process.platform === 'win32') await sleep(1500);

    const cwd = this.projectRoot;
    const gitEnv = { ...process.env, GIT_TERMINAL_PROMPT: '0' };

    log('warn', `回滚到 ${headBefore} ...`);

    let success = false;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        execSync(`git reset --hard ${headBefore}`, { cwd, stdio: 'pipe', env: gitEnv });
        execSync('git clean -fd', { cwd, stdio: 'pipe', env: gitEnv });
        log('ok', '回滚完成');
        success = true;
        break;
      } catch (err) {
        if (attempt === 1) {
          log('warn', `回滚首次失败，等待后重试: ${err.message}`);
          await sleep(2000);
        } else {
          log('error', `回滚失败: ${err.message}`);
        }
      }
    }

    this._appendProgress({
      type: 'rollback',
      timestamp: this._timestamp(),
      reason: reason || 'harness 校验失败',
      rollbackTo: headBefore,
      success,
    });
  }

  tryPush() {
    try {
      const cwd = this.projectRoot;
      const remotes = execSync('git remote', { cwd, encoding: 'utf8' }).trim();
      if (!remotes) return;
      log('info', '正在推送代码...');
      execSync('git push', { cwd, stdio: 'inherit' });
      log('ok', '推送成功');
    } catch {
      log('warn', '推送失败 (请检查网络或权限)，继续执行...');
    }
  }

  _commitIfDirty(message) {
    try {
      execSync('git diff --quiet HEAD', { cwd: this.projectRoot, stdio: 'pipe' });
    } catch {
      execSync(`git add -A && git commit -m "${message}"`, { cwd: this.projectRoot, stdio: 'pipe' });
      log('ok', '代码优化已提交');
    }
  }

  // ─── Simplify Scheduling (called by runner) ────────────────

  shouldSimplify() {
    const { simplifyInterval } = this.config;
    if (simplifyInterval <= 0) return false;
    const state = loadState();
    return state.session_count % simplifyInterval === 0;
  }

  needsFinalSimplify() {
    const { simplifyInterval } = this.config;
    if (simplifyInterval <= 0) return false;
    const state = loadState();
    return state.last_simplify_session < state.session_count;
  }

  afterSimplify(commitMsg = 'style: simplify optimization') {
    this._markSimplifyDone();
    this._commitIfDirty(commitMsg);
  }

  // ─── Internal: Task & Progress ──────────────────────────────

  _markTaskFailed(taskId) {
    if (!taskId) return;
    const data = loadTasks();
    if (!data) return;
    const features = getFeatures(data);
    const task = features.find(f => f.id === taskId);
    if (task && task.status !== 'done') {
      task.status = 'failed';
      saveTasks(data);
      log('warn', `已将任务 ${taskId} 强制标记为 failed`);
    }
  }

  _appendProgress(entry) {
    let progress = assets.readJson('progress', { sessions: [] });
    if (!Array.isArray(progress.sessions)) progress.sessions = [];
    progress.sessions.push(entry);
    assets.writeJson('progress', progress);
  }

  // ─── Internal: Process Management ──────────────────────────

  _killServicesByProfile() {
    const profile = assets.readJson('profile', null);
    if (!profile) return;
    const ports = (profile.services || []).map(s => s.port).filter(Boolean);
    if (ports.length === 0) return;

    for (const port of ports) {
      try {
        if (process.platform === 'win32') {
          const out = execSync(`netstat -ano | findstr :${port} | findstr LISTENING`, { encoding: 'utf8', stdio: 'pipe' }).trim();
          const pids = [...new Set(out.split('\n').map(l => l.trim().split(/\s+/).pop()).filter(Boolean))];
          for (const pid of pids) { try { execSync(`taskkill /F /T /PID ${pid}`, { stdio: 'pipe' }); } catch { /* ignore */ } }
        } else {
          execSync(`lsof -ti :${port} | xargs kill -9 2>/dev/null`, { stdio: 'pipe' });
        }
      } catch { /* no process on port */ }
    }
    log('info', `已停止端口 ${ports.join(', ')} 上的服务`);
  }
}

module.exports = {
  Harness,
  loadState,
  syncAfterPlan,
  selectNextTask,
};
