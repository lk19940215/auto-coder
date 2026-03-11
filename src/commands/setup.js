'use strict';

const fs = require('fs');
const { paths, log, COLOR, ensureLoopDir, parseEnvFile } = require('../common/config');
const {
  createInterface,
  ask,
  askChoice,
  writeConfig,
  ensureGitignore,
  showCurrentConfig,
  selectProvider,
  updateApiKeyOnly,
  configureMCP,
  appendMcpConfig,
  updateMCPOnly,
  updateSafetyLimits,
  updateSimplifyConfig,
} = require('./setup-modules');

// ── 主函数 ──

async function setup() {
  const p = paths();
  ensureLoopDir();
  const rl = createInterface();

  // 加载现有配置
  let existing = {};
  if (fs.existsSync(p.envFile)) {
    existing = parseEnvFile(p.envFile);
  }

  console.log('');
  console.log('============================================');
  console.log('  Claude Coder 配置');
  console.log('============================================');

  // 首次配置：引导完整流程
  if (!fs.existsSync(p.envFile) || !existing.MODEL_PROVIDER) {
    console.log('');
    console.log('  检测到未配置，开始初始化...');
    console.log('');

    const configResult = await selectProvider(rl, existing);
    const mcpConfig = await configureMCP(rl);

    appendMcpConfig(configResult.lines, mcpConfig);
    writeConfig(p.envFile, configResult.lines);
    ensureGitignore();

    // 如果启用了 MCP，生成 .mcp.json
    if (mcpConfig.enabled && mcpConfig.mode) {
      const { updateMcpConfig } = require('./auth');
      updateMcpConfig(p, mcpConfig.mode);
    }

    console.log('');
    log('ok', `配置完成！提供商: ${configResult.summary}`);
    console.log('');
    console.log(`  配置文件: ${p.envFile}`);
    console.log('  使用方式: claude-coder run "你的需求"');
    console.log('  重新配置: claude-coder setup');
    console.log('');
    console.log(`  ${COLOR.yellow}安全限制: 默认 20 分钟无工具调用自动中断，写入 session_result 后 5 分钟${COLOR.reset}`);
    console.log(`  ${COLOR.yellow}调整方式: claude-coder setup → 配置安全限制${COLOR.reset}`);
    console.log('');

    rl.close();
    return;
  }

  // 已有配置：菜单选择
  while (true) {
    existing = parseEnvFile(p.envFile);
    showCurrentConfig(existing);

    console.log('请选择要执行的操作:');
    console.log('');
    console.log('  1) 切换模型提供商');
    console.log('  2) 更新 API Key');
    console.log('  3) 配置 MCP');
    console.log('  4) 配置安全限制');
    console.log('  5) 配置自动审查');
    console.log('  6) 完全重新配置');
    console.log('  7) 退出');
    console.log('');

    const action = await askChoice(rl, '选择 [1-7]: ', 1, 7);
    console.log('');

    if (action === 7) {
      log('info', '退出配置');
      break;
    }

    switch (action) {
      case 1: {
        const configResult = await selectProvider(rl, existing);
        appendMcpConfig(configResult.lines, {
          enabled: existing.MCP_PLAYWRIGHT === 'true',
          mode: existing.MCP_PLAYWRIGHT_MODE || null,
        });
        writeConfig(p.envFile, configResult.lines);
        log('ok', `已切换到: ${configResult.summary}`);
        break;
      }
      case 2: {
        await updateApiKeyOnly(rl, existing);
        break;
      }
      case 3: {
        await updateMCPOnly(rl);
        break;
      }
      case 4: {
        await updateSafetyLimits(rl, existing);
        break;
      }
      case 5: {
        await updateSimplifyConfig(rl, existing);
        break;
      }
      case 6: {
        const configResult = await selectProvider(rl, existing);
        const mcpConfig = await configureMCP(rl);
        appendMcpConfig(configResult.lines, mcpConfig);
        writeConfig(p.envFile, configResult.lines);

        if (mcpConfig.enabled && mcpConfig.mode) {
          const { updateMcpConfig } = require('./auth');
          updateMcpConfig(p, mcpConfig.mode);
        }

        log('ok', '配置已更新');
        break;
      }
    }

    console.log('');
    const cont = await ask(rl, '继续配置其他项？(y/N) ');
    if (!/^[Yy]/.test(cont.trim())) break;
  }

  rl.close();
}

module.exports = { setup };