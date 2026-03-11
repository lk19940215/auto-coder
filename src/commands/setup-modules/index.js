'use strict';

// ── setup 子模块统一入口 ──

const helpers = require('./helpers');
const provider = require('./provider');
const mcp = require('./mcp');
const safety = require('./safety');
const simplify = require('./simplify');

module.exports = {
  // helpers
  createInterface: helpers.createInterface,
  ask: helpers.ask,
  askChoice: helpers.askChoice,
  askApiKey: helpers.askApiKey,
  writeConfig: helpers.writeConfig,
  ensureGitignore: helpers.ensureGitignore,
  showCurrentConfig: helpers.showCurrentConfig,

  // provider
  PROVIDER_MENU: provider.PROVIDER_MENU,
  PROVIDER_CONFIG: provider.PROVIDER_CONFIG,
  configureDefault: provider.configureDefault,
  configureCodingPlan: provider.configureCodingPlan,
  configureAPI: provider.configureAPI,
  configureDeepSeekMode: provider.configureDeepSeekMode,
  configureCustomAPI: provider.configureCustomAPI,
  selectProvider: provider.selectProvider,
  updateApiKeyOnly: provider.updateApiKeyOnly,

  // mcp
  configureMCP: mcp.configureMCP,
  appendMcpConfig: mcp.appendMcpConfig,
  updateMCPOnly: mcp.updateMCPOnly,

  // safety
  updateSafetyLimits: safety.updateSafetyLimits,

  // simplify
  updateSimplifyConfig: simplify.updateSimplifyConfig,
};