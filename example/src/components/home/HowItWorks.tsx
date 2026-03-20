import React from 'react';
import ParticleContainer from '../common/ParticleContainer';

const steps = [
  {
    number: '1',
    title: '📝 描述需求',
    description: '一句话或 requirements.md，自然语言告诉 AI 你想要什么。go 命令还能交互式引导组装方案。',
  },
  {
    number: '2',
    title: '🎨 生成设计',
    description: 'design 命令自动生成 .pen UI 设计稿，包含配色、组件、布局规范。编码时 AI 自动参考。',
  },
  {
    number: '3',
    title: '📋 智能分解',
    description: 'AI 扫描项目技术栈，将需求拆分为可执行任务并按依赖排序，生成 tasks.json。',
  },
  {
    number: '4',
    title: '🔄 编码循环',
    description: 'Agent 多 Session 循环：编码 → 测试 → 提交 → 定期审查优化。失败自动回滚重试。',
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--bg-200)]">
      <div className="max-w-7xl mx-auto">
        <ParticleContainer autoTrigger={true} triggerDelay={300} className="w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-50)] mb-4">
              工作原理
            </h2>
            <p className="text-lg text-[var(--text-400)] max-w-2xl mx-auto">
              从需求到设计到代码，四步全自动交付
            </p>
          </div>
        </ParticleContainer>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className={`card text-center animate-float-delay-${index % 2}`}>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] flex items-center justify-center mb-4 mx-auto">
                  <span className="text-white font-bold text-lg">{step.number}</span>
                </div>
                <h3 className="text-xl font-semibold text-[var(--text-50)] mb-2">
                  {step.title}
                </h3>
                <p className="text-[var(--text-300)] leading-relaxed">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <svg
                    className="w-8 h-8 text-[var(--gradient-start)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
