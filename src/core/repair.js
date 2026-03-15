'use strict';

const fs = require('fs');
const path = require('path');
const { runSession } = require('./session');
const { buildQueryOptions } = require('./query');
const { log } = require('../common/config');

/**
 * 使用 AI 修复损坏的 JSON 文件
 * @param {string} filePath - 文件绝对路径
 * @param {object} [opts] - 透传给 runSession 的选项
 */
async function repairJsonFile(filePath, opts = {}) {
  if (!fs.existsSync(filePath)) return;

  const rawContent = fs.readFileSync(filePath, 'utf8');
  if (!rawContent || !rawContent.trim()) return;

  const fileName = path.basename(filePath);
  log('info', `正在使用 AI 修复 ${fileName}...`);

  const prompt = `文件 ${filePath} 的 JSON 格式已损坏，请修复并用 Write 工具写入原路径。\n\n当前损坏内容：\n${rawContent}`;

  try {
    await runSession('repair', {
      opts,
      sessionNum: 0,
      logFileName: `repair_${fileName.replace('.json', '')}.log`,
      label: `repair:${fileName}`,

      async execute(sdk, ctx) {
        const queryOpts = buildQueryOptions(ctx.config, opts);
        queryOpts.hooks = ctx.hooks;
        queryOpts.abortController = ctx.abortController;
        await ctx.runQuery(sdk, prompt, queryOpts);
        log('ok', `AI 修复 ${fileName} 完成`);
        return {};
      },
    });
  } catch (err) {
    log('warn', `AI 修复 ${fileName} 失败: ${err.message}`);
  }
}

module.exports = { repairJsonFile };
