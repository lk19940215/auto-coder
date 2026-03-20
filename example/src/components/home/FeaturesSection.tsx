import React from 'react';
import ParticleContainer from '../common/ParticleContainer';

const features = [
  {
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    title: '需求 → 任务 → 代码',
    description: '一句话或需求文档输入，AI 自动分解为任务队列，逐个实现、验证、提交，从零到交付一气呵成。',
  },
  {
    icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    title: '数小时无人值守',
    description: '多 Session 循环编排 + 活跃度监控 + 失败自动回滚重试 + JSON 自愈修复。Agent 连续编码数小时不中断。',
  },
  {
    icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    title: 'AI 生成 UI 设计',
    description: 'design 命令自动生成 .pen 设计稿，编码阶段 AI 自动参考设计还原 UI，实现设计到代码的全链路。',
  },
  {
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    title: 'Hook 注入 · 行为引导',
    description: 'JSON 配置在工具调用时注入规则引导，零代码修改即可扩展 AI 行为，代码审查自动护航。',
  },
  {
    icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
    title: '任意模型 · 自由切换',
    description: 'Claude、DeepSeek、GLM-5、Qwen 等任意兼容 API，多模型路由灵活编排，按场景选择最优模型。',
  },
  {
    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    title: '自动测试 · 交付即用',
    description: 'Playwright / Chrome DevTools 一键集成，登录态持久化，Agent 编码后自动验证，交付即可用。',
  },
];

const FeaturesSection: React.FC = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <ParticleContainer autoTrigger={true} triggerDelay={300} className="w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-50)] mb-4">
              核心特性
            </h2>
            <p className="text-lg text-[var(--text-400)] max-w-2xl mx-auto">
              不只是代码补全，而是从需求分析到验证交付的全流程自主 Agent
            </p>
          </div>
        </ParticleContainer>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`card card-hover-enhanced animate-float-delay-${index % 3}`}
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={feature.icon}
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[var(--text-50)] mb-2">
                {feature.title}
              </h3>
              <p className="text-[var(--text-300)] leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
