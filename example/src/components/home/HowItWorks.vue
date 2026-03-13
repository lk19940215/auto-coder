<template>
  <section class="py-20 px-4 sm:px-6 lg:px-8 border-t border-[var(--border-300)]">
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-3xl sm:text-4xl font-bold text-[var(--text-50)] mb-4">工作原理</h2>
        <p class="text-lg text-[var(--text-400)] max-w-2xl mx-auto">
          从需求输入到功能交付的完整流程
        </p>
      </div>

      <!-- Flow Diagram -->
      <div class="relative">
        <!-- Desktop Flow -->
        <div class="hidden lg:flex items-center justify-center space-x-4">
          <!-- Step 1 -->
          <div class="flow-node">
            <div class="node-icon bg-[var(--primary-600)]">1</div>
            <span class="node-label">需求输入</span>
          </div>
          <div class="flow-arrow">→</div>

          <!-- Step 2 -->
          <div class="flow-node">
            <div class="node-icon bg-[var(--primary-600)]">2</div>
            <span class="node-label">项目扫描</span>
          </div>
          <div class="flow-arrow">→</div>

          <!-- Step 3 -->
          <div class="flow-node">
            <div class="node-icon bg-[var(--primary-600)]">3</div>
            <span class="node-label">任务分解</span>
          </div>
          <div class="flow-arrow">→</div>

          <!-- Step 4: Session Loop -->
          <div class="card p-6 bg-[var(--bg-200)]">
            <div class="text-center mb-4">
              <div class="node-icon bg-[var(--gradient-start)] mx-auto">4</div>
              <span class="node-label mt-2">编码循环</span>
            </div>
            <div class="space-y-2 text-sm text-[var(--text-400)]">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-[var(--primary-500)]"></span>
                <span>Session N</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-[var(--primary-500)]"></span>
                <span>Claude SDK</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-[var(--primary-500)]"></span>
                <span>6 步流程</span>
              </div>
            </div>
          </div>
          <div class="flow-arrow">→</div>

          <!-- Step 5: Harness Check -->
          <div class="flow-node">
            <div class="node-icon bg-[var(--warning-500)]">5</div>
            <span class="node-label">harness 校验</span>
          </div>
          <div class="flow-arrow">→</div>

          <!-- Decision -->
          <div class="text-center">
            <div class="space-y-3">
              <div class="flex items-center gap-2 text-[var(--success-500)]">
                <span class="text-sm">通过</span>
                <span>→</span>
                <span class="text-sm">下一个任务</span>
              </div>
              <div class="flex items-center gap-2 text-[var(--error-500)]">
                <span class="text-sm">失败</span>
                <span>→</span>
                <span class="text-sm">git 回滚 + 重试</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile Flow -->
        <div class="lg:hidden space-y-6">
          <div v-for="(step, index) in steps" :key="index" class="card flex items-center gap-4">
            <div class="node-icon bg-[var(--primary-600)] flex-shrink-0">{{ index + 1 }}</div>
            <div>
              <h3 class="font-semibold text-[var(--text-50)]">{{ step.title }}</h3>
              <p class="text-sm text-[var(--text-400)]">{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const steps = [
  { title: '需求输入', desc: '接收自然语言需求描述' },
  { title: '项目扫描', desc: '分析项目结构和技术栈' },
  { title: '任务分解', desc: '将需求拆分为可执行任务' },
  { title: '编码循环', desc: '多 session 持续编码实现' },
  { title: 'harness 校验', desc: '自动测试验证功能' }
]
</script>

<style scoped>
.flow-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.node-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.node-label {
  color: var(--text-200);
  font-size: 0.875rem;
  font-weight: 500;
}

.flow-arrow {
  color: var(--text-400);
  font-size: 1.5rem;
}
</style>
