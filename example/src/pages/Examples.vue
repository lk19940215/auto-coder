<template>
  <div class="min-h-screen">
    <Header />
    <main class="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <h1 class="text-4xl font-bold text-[var(--text-50)] mb-4">使用案例</h1>
        <p class="text-lg text-[var(--text-400)] mb-12">探索 Claude Coder 在实际项目中的应用</p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Case 1 -->
          <div class="card">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-lg bg-[var(--primary-600)] flex items-center justify-center text-white font-bold">1</div>
              <h2 class="text-xl font-bold text-[var(--text-50)]">Todo 应用</h2>
            </div>
            <p class="text-[var(--text-400)] mb-4">用 Express + React 快速搭建 Todo 应用。</p>
            <div class="code-block mb-4">
              <pre class="text-[var(--text-200)]">claude-coder run "用 Express + React 做 Todo 应用"</pre>
            </div>
            <p class="text-sm text-[var(--text-400)]">✓ 自动生成前后端代码结构</p>
          </div>

          <!-- Case 2 -->
          <div class="card">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-lg bg-[var(--primary-600)] flex items-center justify-center text-white font-bold">2</div>
              <h2 class="text-xl font-bold text-[var(--text-50)]">头像上传功能</h2>
            </div>
            <p class="text-[var(--text-400)] mb-4">为现有项目新增头像上传功能。</p>
            <div class="code-block mb-4">
              <pre class="text-[var(--text-200)]">claude-coder run "新增头像上传功能"</pre>
            </div>
            <p class="text-sm text-[var(--text-400)]">✓ 自动检测项目技术栈并生成对应代码</p>
          </div>

          <!-- Case 3 -->
          <div class="card">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-lg bg-[var(--primary-600)] flex items-center justify-center text-white font-bold">3</div>
              <h2 class="text-xl font-bold text-[var(--text-50)]">需求文档驱动</h2>
            </div>
            <p class="text-[var(--text-400)] mb-4">从 requirements.md 自动生成任务队列。</p>
            <div class="code-block mb-4">
              <pre class="text-[var(--text-200)]"># 创建 requirements.md 后
claude-coder run
claude-coder add -r  # 同步新任务</pre>
            </div>
            <p class="text-sm text-[var(--text-400)]">✓ 支持复杂需求的分阶段实现</p>
          </div>

          <!-- Case 4 -->
          <div class="card">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-lg bg-[var(--primary-600)] flex items-center justify-center text-white font-bold">4</div>
              <h2 class="text-xl font-bold text-[var(--text-50)]">自动测试</h2>
            </div>
            <p class="text-[var(--text-400)] mb-4">导出浏览器登录态用于自动化测试。</p>
            <div class="code-block mb-4">
              <pre class="text-[var(--text-200)]">claude-coder auth http://localhost:3000</pre>
            </div>
            <p class="text-sm text-[var(--text-400)]">✓ 自动生成测试凭证文件</p>
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import Header from '../components/common/Header.vue'
import Footer from '../components/common/Footer.vue'
</script>
