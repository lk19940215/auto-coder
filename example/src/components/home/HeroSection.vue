<template>
  <section class="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <!-- Left: Text Content -->
        <div class="space-y-6">
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--text-50)] leading-tight">
            <span class="gradient-text">Claude Coder</span>
          </h1>
          <p class="text-xl sm:text-2xl text-[var(--text-200)]">
            长时间自运行的自主编码 Agent Harness
          </p>
          <p class="text-lg text-[var(--primary-400)]">
            一句话需求 → 完整项目，全自动交付
          </p>
          <div class="flex flex-wrap gap-4 pt-4">
            <router-link to="/quick-start" class="btn-primary">
              立即开始
            </router-link>
            <router-link to="/docs" class="px-6 py-3 border border-[var(--border-400)] rounded-lg text-[var(--text-200)] hover:border-[var(--primary-500)] hover:text-[var(--text-50)] transition-all">
              查看文档
            </router-link>
          </div>
        </div>

        <!-- Right: Terminal Demo -->
        <div class="terminal">
          <div class="terminal-header">
            <div class="terminal-dot red"></div>
            <div class="terminal-dot yellow"></div>
            <div class="terminal-dot green"></div>
            <span class="ml-4 text-[var(--text-400)] text-sm">claude-coder</span>
          </div>
          <div class="terminal-body text-[var(--text-200)]">
            <div class="space-y-2">
              <div>
                <span class="text-[var(--primary-400)]">$</span>
                <span class="text-[var(--text-50)]"> claude-coder run "实现用户注册和登录功能"</span>
              </div>
              <div class="text-[var(--text-400)]">
                <div class="flex items-center gap-2">
                  <span class="text-[var(--primary-500)]">🔍</span>
                  <span>扫描项目技术栈...</span>
                </div>
              </div>
              <div class="text-[var(--text-400)]">
                <div class="flex items-center gap-2">
                  <span class="text-[var(--primary-500)]">📋</span>
                  <span>生成任务计划...</span>
                </div>
              </div>
              <div class="text-[var(--text-400)]">
                <div class="flex items-center gap-2">
                  <span class="text-[var(--primary-500)]">🤖</span>
                  <span>开始编码循环...</span>
                </div>
              </div>
              <div class="text-[var(--success-500)]">
                <div class="flex items-center gap-2">
                  <span>✅</span>
                  <span>功能实现完成！</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped>
.gradient-text {
  background: linear-gradient(135deg, var(--gradient-start), var(--gradient-end));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
