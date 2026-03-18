import React from 'react';
import { Link } from 'react-router-dom';
import ParticleContainer from '../common/ParticleContainer';

const CTASection: React.FC = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <div className="card p-12 relative overflow-hidden">
          {/* 渐变粒子背景 */}
          <ParticleContainer
            particleCount={18}
            particleSize={0.5}
            colors={['var(--primary-500)', 'var(--primary-400)', 'var(--gradient-start)', 'var(--gradient-end)']}
            autoTrigger
            triggerDelay={300}
            className="absolute inset-0 opacity-20 pointer-events-none"
          >
            <div className="w-full h-full" />
          </ParticleContainer>

          <div className="relative z-10">
            <ParticleContainer
              particleType="heart"
              particleCount={15}
              particleSize={0.6}
              colors={['var(--fish-gold)', 'var(--lazy-cyan)']}
              autoTrigger
              triggerDelay={200}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-50)] mb-4 cursor-pointer inline-block">
                准备好开始了吗？
              </h2>
            </ParticleContainer>
            <p className="text-lg text-[var(--text-400)] mb-8">
              几分钟内配置完成，立即体验自主编码 Agent 的强大能力。
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
                <p className="text-[var(--success-500)]">$ claude-coder run "创建个人博客"</p>
                <p className="text-[var(--text-400)] mt-2">✓ 分析需求...</p>
                <p className="text-[var(--text-400)]">✓ 生成任务计划 (5 个任务)</p>
                <p className="text-[var(--text-400)]">✓ 初始化项目配置</p>
                <p className="text-[var(--text-400)]">✓ 开始编码 Session 1/5</p>
                <p className="text-[var(--primary-400)] mt-2 animate-pulse">▎ 正在执行...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;