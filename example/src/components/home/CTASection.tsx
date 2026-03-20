import React from 'react';
import { Link } from 'react-router-dom';

const CTASection: React.FC = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <div className="card p-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-50)] mb-4">
            一行命令，剩下的交给 AI
          </h2>
          <p className="text-lg text-[var(--text-400)] mb-8">
            30 秒配置，数小时自动编码。你的下一个项目，从这里开始。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/quick-start" className="btn-primary animate-pulse-glow text-base no-underline">
              快速开始
            </Link>
            <Link
              to="/docs"
              className="px-6 py-3 text-[var(--text-200)] hover:text-[var(--text-50)] transition-colors link-underline"
            >
              阅读文档 →
            </Link>
          </div>

          {/* Terminal Preview */}
          <div className="mt-12 terminal">
            <div className="terminal-header">
              <div className="terminal-dot red" />
              <div className="terminal-dot yellow" />
              <div className="terminal-dot green" />
              <span className="ml-2 text-[var(--text-400)] text-sm">Terminal</span>
            </div>
            <div className="terminal-body text-left">
              <p className="text-[var(--success-500)]">$ claude-coder design "个人博客"</p>
              <p className="text-[var(--text-400)] mt-1">✓ 生成 UI 设计稿 (3 页)</p>
              <p className="text-[var(--success-500)] mt-2">$ claude-coder run</p>
              <p className="text-[var(--text-400)] mt-1">✓ 分解为 5 个任务</p>
              <p className="text-[var(--text-400)]">✓ Session 1: 项目脚手架 ✅</p>
              <p className="text-[var(--text-400)]">✓ Session 2: 首页 + 读取设计 ✅</p>
              <p className="text-[var(--primary-400)] mt-1 animate-pulse">▸ Session 3: 文章列表...</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;