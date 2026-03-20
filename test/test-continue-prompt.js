'use strict';

const { loadSDK } = require('../src/common/sdk');
const { loadConfig, buildEnvVars } = require('../src/common/config');
const { assets } = require('../src/common/assets');
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'test-continue-prompt.log');

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

function logMessage(label, message) {
  const summary = JSON.stringify({
    type: message.type,
    subtype: message.subtype,
    session_id: message.session_id,
    ...(message.type === 'system' ? { model: message.model, tools: message.tools?.length } : {}),
    ...(message.type === 'assistant' ? {
      content: message.message?.content?.filter(b => b.type === 'text').map(b => b.text).join('')
    } : {}),
    ...(message.type === 'result' ? {
      result: message.result,
      cost: message.total_cost_usd,
      turns: message.num_turns,
      session_id: message.session_id,
    } : {}),
  }, null, 2);
  log(`[${label}] ${summary}`);
}

async function runQuery(sdk, label, { systemPrompt, prompt, continueFlag, maxTurns = 1 }) {
  log(`\n=== ${label} ===`);
  log(`  systemPrompt: ${systemPrompt || '(无)'}`);
  log(`  continue: ${continueFlag ?? false}`);
  log(`  prompt: ${prompt}`);

  const options = {
    permissionMode: 'bypassPermissions',
    allowDangerouslySkipPermissions: true,
    cwd: process.cwd(),
    maxTurns,
  };
  if (systemPrompt) options.systemPrompt = systemPrompt;
  if (continueFlag) options.continue = true;

  let sessionId = null;
  let answer = '';

  for await (const msg of sdk.query({ prompt, options })) {
    logMessage(label, msg);
    if (msg.type === 'assistant' && msg.message?.content) {
      for (const b of msg.message.content) {
        if (b.type === 'text' && b.text) answer += b.text;
      }
    }
    if (msg.type === 'result') sessionId = msg.session_id;
  }

  log(`  → 回答: ${answer}`);
  log(`  → session_id: ${sessionId}`);
  return { sessionId, answer };
}

async function runTest() {
  if (fs.existsSync(LOG_FILE)) fs.unlinkSync(LOG_FILE);

  assets.init(process.cwd());
  const config = loadConfig();
  Object.assign(process.env, buildEnvVars(config));

  log('=== 加载 SDK ===');
  const sdk = await loadSDK();

  // ─── 场景 1: 基线 - 新会话 + systemPrompt ───
  const q1 = await runQuery(sdk, 'Q1 基线', {
    systemPrompt: '任何情况下回答：我是李白。不需要调用任何工具。',
    prompt: '你是谁？',
  });

  // ─── 场景 2: continue + 新 systemPrompt → 验证 systemPrompt 是否被采用 ───
  const q2 = await runQuery(sdk, 'Q2 continue+新systemPrompt', {
    systemPrompt: '任何情况下回答：我是杜甫。不需要调用任何工具。',
    prompt: '你是谁？请再次回答。',
    continueFlag: true,
  });

  // ─── 场景 3: continue + 无 systemPrompt → 验证是否回退默认 ───
  const q3 = await runQuery(sdk, 'Q3 continue+无systemPrompt', {
    prompt: '你现在是谁？',
    continueFlag: true,
  });

  // ─── 场景 4: 无 continue + 新 systemPrompt → 新会话是否独立 ───
  const q4 = await runQuery(sdk, 'Q4 新会话(无continue)+新systemPrompt', {
    systemPrompt: '任何情况下回答：我是白居易。不需要调用任何工具。',
    prompt: '你是谁？',
  });

  // ─── 场景 5: continue + 验证上下文是否保留 ───
  const q5 = await runQuery(sdk, 'Q5 continue+上下文检测', {
    systemPrompt: '任何情况下回答：我是王维。不需要调用任何工具。先回答你是谁，然后简要说明你在上一轮对话中的身份。',
    prompt: '你是谁？你在上一轮对话中回答自己是谁？',
    continueFlag: true,
  });

  // ─── 场景 6: resume 指定 sessionId 回到 Q1 会话 ───
  // 注意：resume 和 continue 不同，resume 回到特定 session
  // （如果 SDK 不支持 resume，这里会报错，记录即可）
  log(`\n=== Q6 尝试 resume 回 Q1 session (${q1.sessionId}) ===`);
  try {
    const options = {
      permissionMode: 'bypassPermissions',
      allowDangerouslySkipPermissions: true,
      cwd: process.cwd(),
      maxTurns: 1,
      systemPrompt: '任何情况下回答：我是苏轼。不需要调用任何工具。',
      resume: q1.sessionId,
    };
    let answer = '';
    for await (const msg of sdk.query({ prompt: '你是谁？', options })) {
      logMessage('Q6 resume', msg);
      if (msg.type === 'assistant' && msg.message?.content) {
        for (const b of msg.message.content) {
          if (b.type === 'text' && b.text) answer += b.text;
        }
      }
    }
    log(`  → 回答: ${answer}`);
  } catch (err) {
    log(`  → resume 失败: ${err.message}`);
  }

  // ─── 总结 ───
  log('\n========== 测试总结 ==========');
  log(`Q1 session_id: ${q1.sessionId}`);
  log(`Q2 session_id: ${q2.sessionId} (与Q1${q2.sessionId === q1.sessionId ? '相同' : '不同'})`);
  log(`Q3 session_id: ${q3.sessionId} (与Q1${q3.sessionId === q1.sessionId ? '相同' : '不同'})`);
  log(`Q4 session_id: ${q4.sessionId} (与Q1${q4.sessionId === q1.sessionId ? '相同 ⚠️' : '不同 ✓ 新会话'})`);
  log(`Q5 session_id: ${q5.sessionId} (与Q4${q5.sessionId === q4.sessionId ? '相同' : '不同'})`);

  log('\n核心结论:');
  log(`  1. continue+新systemPrompt → 新systemPrompt生效? ${q2.answer.includes('杜甫') ? '✓ 是' : '✗ 否'}`);
  log(`  2. continue+无systemPrompt → 回退默认?          ${!q3.answer.includes('杜甫') && !q3.answer.includes('李白') ? '✓ 是' : '✗ 否'}`);
  log(`  3. 无continue → 新独立会话?                     ${q4.sessionId !== q1.sessionId ? '✓ 是' : '✗ 否'}`);
  log(`  4. continue 保留上下文?                          (见Q5回答)`);
  log(`  5. Q5回答: ${q5.answer}`);

  log(`\n日志已写入: ${LOG_FILE}`);
}

runTest().catch(err => {
  log(`错误: ${err.message}\n${err.stack}`);
  process.exit(1);
});
