<template>
  <section class="py-20 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-3xl sm:text-4xl font-bold text-[var(--text-50)] mb-4">核心功能</h2>
        <p class="text-lg text-[var(--text-400)] max-w-2xl mx-auto">
          三大核心特性，让编码自动化成为可能
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Feature 1 -->
        <div class="card text-center">
          <div class="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--gradient-start)] flex items-center justify-center">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-[var(--text-50)] mb-3">Hook 提示注入</h3>
          <p class="text-[var(--text-400)]">
            通过 JSON 配置在工具调用时向模型注入上下文引导，零代码扩展规则
          </p>
        </div>

        <!-- Feature 2 -->
        <div class="card text-center">
          <div class="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] flex items-center justify-center">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-[var(--text-50)] mb-3">长时间自循环</h3>
          <p class="text-[var(--text-400)]">
            多 session 编排 + 倒计时监控 + git 回滚重试，数小时持续编码
          </p>
        </div>

        <!-- Feature 3 -->
        <div class="card text-center">
          <div class="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[var(--gradient-end)] to-[var(--primary-500)] flex items-center justify-center">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-[var(--text-50)] mb-3">配置驱动</h3>
          <p class="text-[var(--text-400)]">
            支持 Claude 官方、Coding Plan、DeepSeek 等任意 API，灵活的模型路由
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
</script>
