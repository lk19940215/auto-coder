<template>
  <section class="py-20 px-4 sm:px-6 lg:px-8 border-t border-[var(--border-300)]">
    <div class="max-w-4xl mx-auto text-center">
      <h2 class="text-3xl sm:text-4xl font-bold text-[var(--text-50)] mb-6">
        准备好提升开发效率了吗？
      </h2>
      <p class="text-lg text-[var(--text-400)] mb-8">
        安装 Claude Coder，让 AI 成为你团队的超级工程师
      </p>
      <div class="flex flex-wrap justify-center gap-4">
        <router-link to="/quick-start" class="btn-primary text-lg px-8 py-4">
          安装 Claude Coder
        </router-link>
        <span class="text-[var(--text-400)] self-center">
          已有账号？<router-link to="/docs" class="text-[var(--primary-400)] hover:underline">直接开始</router-link>
        </span>
      </div>
    </div>
  </section>
</template>

<script setup>
</script>
