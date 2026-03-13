<template>
  <div class="min-h-screen">
    <Header />
    <main class="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <!-- Sidebar -->
          <aside class="lg:col-span-1">
            <nav class="card sticky top-24">
              <h3 class="text-[var(--text-50)] font-semibold mb-4 px-2">文档目录</h3>
              <ul class="space-y-1">
                <li v-for="item in docs" :key="item.id">
                  <a :href="`#${item.id}`" class="nav-item" :class="{ active: activeDoc === item.id }" @click="activeDoc = item.id">
                    {{ item.title }}
                  </a>
                </li>
              </ul>
            </nav>
          </aside>

          <!-- Content -->
          <div class="lg:col-span-3">
            <h1 class="text-4xl font-bold text-[var(--text-50)] mb-8">文档中心</h1>

            <div class="space-y-8">
              <!-- Getting Started -->
              <section id="getting-started" class="card">
                <h2 class="text-2xl font-bold text-[var(--text-50)] mb-4">入门指南</h2>
                <p class="text-[var(--text-400)] mb-4">了解 Claude Coder 的基本概念和快速开始方法。</p>
                <ul class="list-disc list-inside text-[var(--text-400)] space-y-2">
                  <li><router-link to="/quick-start" class="text-[var(--primary-400)] hover:underline">安装指南</router-link></li>
                  <li>配置说明</li>
                  <li>第一个项目</li>
                </ul>
              </section>

              <!-- Core Concepts -->
              <section id="core-concepts" class="card">
                <h2 class="text-2xl font-bold text-[var(--text-50)] mb-4">核心概念</h2>
                <div class="space-y-4">
                  <div>
                    <h3 class="text-lg font-semibold text-[var(--text-50)]">Hook 注入机制</h3>
                    <p class="text-[var(--text-400)]">在特定工具调用时自动注入上下文提示，扩展 AI 能力。</p>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-[var(--text-50)]">Session 守护</h3>
                    <p class="text-[var(--text-400)]">监控 Session 状态，处理中断和恢复，保证长时间运行。</p>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-[var(--text-50)]">任务分解</h3>
                    <p class="text-[var(--text-400)]">将复杂需求拆分为可执行的子任务，按优先级排序。</p>
                  </div>
                </div>
              </section>

              <!-- Commands -->
              <section id="commands" class="card">
                <h2 class="text-2xl font-bold text-[var(--text-50)] mb-4">命令参考</h2>
                <div class="space-y-3">
                  <div class="flex items-center gap-4">
                    <code class="code-block px-3 py-1 text-sm">setup</code>
                    <span class="text-[var(--text-400)]">交互式配置向导</span>
                  </div>
                  <div class="flex items-center gap-4">
                    <code class="code-block px-3 py-1 text-sm">init</code>
                    <span class="text-[var(--text-400)]">初始化项目配置</span>
                  </div>
                  <div class="flex items-center gap-4">
                    <code class="code-block px-3 py-1 text-sm">plan</code>
                    <span class="text-[var(--text-400)]">生成任务计划</span>
                  </div>
                  <div class="flex items-center gap-4">
                    <code class="code-block px-3 py-1 text-sm">run</code>
                    <span class="text-[var(--text-400)]">执行编码任务</span>
                  </div>
                  <div class="flex items-center gap-4">
                    <code class="code-block px-3 py-1 text-sm">simplify</code>
                    <span class="text-[var(--text-400)]">代码简化审查</span>
                  </div>
                  <div class="flex items-center gap-4">
                    <code class="code-block px-3 py-1 text-sm">auth</code>
                    <span class="text-[var(--text-400)]">认证凭证管理</span>
                  </div>
                  <div class="flex items-center gap-4">
                    <code class="code-block px-3 py-1 text-sm">status</code>
                    <span class="text-[var(--text-400)]">查看系统状态</span>
                  </div>
                </div>
              </section>

              <!-- Troubleshooting -->
              <section id="troubleshooting" class="card">
                <h2 class="text-2xl font-bold text-[var(--text-50)] mb-4">故障排查</h2>
                <div class="space-y-4">
                  <div>
                    <h3 class="text-lg font-semibold text-[var(--text-50)]">余额不足</h3>
                    <p class="text-[var(--text-400)]">检查 API Key 余额，或切换至其他模型提供商。</p>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-[var(--text-50)]">中断恢复</h3>
                    <p class="text-[var(--text-400)]">Session 会自动保存状态，重新运行即可从断点继续。</p>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-[var(--text-50)]">长时间无响应</h3>
                    <p class="text-[var(--text-400)]">检查网络连接，或增加 API 超时设置。</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Header from '../components/common/Header.vue'
import Footer from '../components/common/Footer.vue'

const docs = [
  { id: 'getting-started', title: '入门指南' },
  { id: 'core-concepts', title: '核心概念' },
  { id: 'commands', title: '命令参考' },
  { id: 'troubleshooting', title: '故障排查' }
]

const activeDoc = ref('getting-started')
</script>

<style scoped>
.nav-item {
  display: block;
  padding: 0.5rem 0.75rem;
  color: var(--text-400);
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.nav-item:hover {
  color: var(--text-50);
  background-color: var(--bg-100);
}

.nav-item.active {
  color: var(--text-50);
  background-color: var(--primary-600);
}
</style>
