'use strict';

const readline = require('readline');
const { log, loadConfig } = require('../common/config');
const { assets } = require('../common/assets');
const { loadTasks, getFeatures, getStats, printStats } = require('../common/tasks');
const { runCodingSession } = require('./coding');
const { Harness, selectNextTask } = require('./harness');
const { simplify } = require('./simplify');
const { repairJsonFile } = require('./repair');

// ─── Display Helpers ──────────────────────────────────────────

function printBanner(dryRun) {
  console.log('');
  console.log('============================================');
  console.log(`  Claude Coder${dryRun ? ' (预览模式)' : ''}`);
  console.log('============================================');
  console.log('');
}

function printSessionHeader(session, maxSessions) {
  console.log('');
  console.log('--------------------------------------------');
  log('info', `Session ${session} / ${maxSessions}`);
  console.log('--------------------------------------------');
}

function printProgress(taskData) {
  const stats = getStats(taskData);
  log('info', `进度: ${stats.done}/${stats.total} done, ${stats.in_progress} in_progress, ${stats.testing} testing, ${stats.failed} failed, ${stats.pending} pending`);
}

function printDryRun(taskData) {
  const next = selectNextTask(taskData);
  log('info', `[DRY-RUN] 下一个任务: ${next ? `${next.id} - ${next.description}` : '无待处理任务'}`);

  if (!next) {
    log('ok', '[DRY-RUN] 无可执行任务，预览结束');
    return;
  }

  console.log('');
  log('info', '[DRY-RUN] 任务队列:');
  const features = getFeatures(taskData);
  for (const f of features) {
    const st = f.status || 'unknown';
    const icon = { done: '✓', in_progress: '▸', pending: '○', failed: '✗', testing: '◇' }[st] || '?';
    log('info', `  ${icon} [${st.padEnd(11)}] ${f.id} - ${f.description || ''}`);
  }
}

function printEndBanner() {
  console.log('');
  console.log('============================================');
  console.log('  运行结束');
  console.log('============================================');
  console.log('');
}

async function promptContinue() {
  if (!process.stdin.isTTY) return true;
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question('是否继续？(y/n) ', answer => {
      rl.close();
      resolve(/^[Yy]/.test(answer.trim()));
    });
  });
}

// ─── Simplify Helper ─────────────────────────────────────────

async function tryRunSimplify(harness, config, msg, commitMsg) {
  log('info', msg || `每 ${config.simplifyInterval} 个成功 session 运行代码审查...`);
  try {
    await simplify(null, { n: config.simplifyCommits });
    harness.afterSimplify(commitMsg);
  } catch (err) {
    log('warn', `代码审查失败，跳过: ${err.message}`);
  }
}

// ─── Main Orchestration Loop ──────────────────────────────────

async function run(opts = {}) {
  const config = loadConfig();
  const harness = new Harness(config);

  harness.ensureEnvironment();

  const dryRun = opts.dryRun || false;
  const maxSessions = opts.max || 50;
  const pauseEvery = opts.pause ?? 0;

  printBanner(dryRun);

  if (config.provider !== 'claude' && config.baseUrl) {
    log('ok', `模型配置已加载: ${config.provider}${config.model ? ` (${config.model})` : ''}`);
  }

  const prereq = harness.checkPrerequisites();
  if (!prereq.ok) {
    log('error', prereq.msg);
    process.exit(1);
  }

  printStats();

  log('info', `开始编码循环 (最多 ${maxSessions} 个会话) ...`);
  console.log('');

  let state = { consecutiveFailures: 0, lastFailReason: '' };

  for (let session = 1; session <= maxSessions; session++) {
    printSessionHeader(session, maxSessions);

    let taskData = loadTasks();
    if (!taskData) {
      const tasksPath = assets.path('tasks');
      if (tasksPath) await repairJsonFile(tasksPath);
      taskData = loadTasks();
      if (!taskData) {
        log('error', 'tasks.json 无法读取且修复失败，终止循环');
        break;
      }
    }

    if (harness.isAllDone(taskData)) {
      if (!dryRun) {
        if (harness.needsFinalSimplify()) {
          await tryRunSimplify(harness, config, '所有任务完成，运行最终代码审查...', 'style: final simplify');
        }
        harness.tryPush();
      }
      console.log('');
      log('ok', '所有任务已完成！');
      printStats();
      break;
    }

    printProgress(taskData);

    if (dryRun) {
      printDryRun(taskData);
      break;
    }

    const { headBefore, taskId } = harness.snapshot(taskData);

    const sessionResult = await runCodingSession(session, {
      projectRoot: harness.projectRoot,
      taskId,
      consecutiveFailures: state.consecutiveFailures,
      maxSessions,
      lastValidateLog: state.lastFailReason,
    });

    if (sessionResult.stalled) {
      state = await harness.onStall(session, { headBefore, taskId, sessionResult, ...state });
      continue;
    }

    log('info', '开始 harness 校验 ...');
    const validateResult = await harness.validate(headBefore, taskId);

    if (!validateResult.fatal) {
      const level = validateResult.hasWarnings ? 'warn' : 'ok';
      log(level, `Session ${session} 校验通过${validateResult.hasWarnings ? ' (有警告)' : ''}`);
      state = await harness.onSuccess(session, { taskId, sessionResult, validateResult });

      if (harness.shouldSimplify()) {
        await tryRunSimplify(harness, config);
      }
      harness.tryPush();
    } else {
      state = await harness.onFailure(session, { headBefore, taskId, sessionResult, validateResult, ...state });
    }

    if (pauseEvery > 0 && session % pauseEvery === 0) {
      console.log('');
      printStats();
      if (!await promptContinue()) {
        log('info', '手动停止');
        break;
      }
    }
  }

  harness.cleanup();
  printEndBanner();
  printStats();
}

module.exports = { run };
