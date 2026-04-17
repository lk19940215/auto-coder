---
theme: default
title: Git 工作流最佳实践
transition: slide-left
mdc: true
layout: cover
class: text-center
background: https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=1920&q=80
---

<div class="backdrop-blur-sm bg-black/40 p-12 rounded-2xl floating">

# Git 工作流最佳实践

<div class="text-xl text-gray-200 mt-2">
从混乱到有序，团队协作的基石
</div>

<div class="text-2xl text-emerald-300 font-bold mt-4 glowing">
写好 commit、管好分支、用好工具
</div>

</div>

<style>
h1 { color: white !important; text-shadow: 0 2px 10px rgba(0,0,0,0.5); }
.floating { animation: float 4s ease-in-out infinite; }
.glowing { animation: glow 3s ease-in-out infinite; }
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
@keyframes glow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; text-shadow: 0 0 20px rgba(110,231,183,0.5); }
}
</style>

---
layout: section
---

<div class="floating-slow">

# 一、Commit 规范

<div class="text-xl text-gray-400 mt-2">好的 commit 是团队的共同语言</div>

</div>

<style>
.floating-slow { animation: floatSlow 5s ease-in-out infinite; }
@keyframes floatSlow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
</style>

---

<h1 class="gradient-title-red">为什么要规范 Commit？</h1>

<div class="mt-6 space-y-4">

<div class="p-4 bg-slate-800/50 border-l-4 border-red-500 rounded-r-xl text-xl flex items-center gap-3">
<span class="text-2xl">😱</span>
<code class="text-red-400">"fix bug"</code> — 哪个 bug？修了什么？
</div>

<div class="p-4 bg-slate-800/50 border-l-4 border-red-500 rounded-r-xl text-xl flex items-center gap-3">
<span class="text-2xl">😱</span>
<code class="text-red-400">"update"</code> — 更新了什么？为什么更新？
</div>

<div class="p-4 bg-slate-800/50 border-l-4 border-red-500 rounded-r-xl text-xl flex items-center gap-3">
<span class="text-2xl">😱</span>
<code class="text-red-400">"asdfgh"</code> — ？？？
</div>

</div>

<div class="mt-8 text-center">
<div class="inline-block px-6 py-3 bg-red-500/10 border border-red-500/30 rounded-xl">
<span class="text-lg font-bold text-red-400">三个月后你自己也看不懂</span>
</div>
</div>

---

<h1 class="gradient-title-green">Conventional Commits 格式</h1>

<div class="p-1 bg-gradient-to-r from-green-500/30 to-cyan-500/30 rounded-xl mt-4">
<div class="bg-slate-900 rounded-lg p-4">

```
<type>(<scope>): <description>

[optional body]
[optional footer]
```

</div>
</div>

<div class="mt-5 space-y-2">
<div class="grid grid-cols-[100px_1fr] gap-4 p-3 bg-green-500/10 rounded-lg items-center">
<span class="text-green-400 font-bold">feat</span>
<span>新功能 — <code>feat(auth): add JWT login</code></span>
</div>
<div class="grid grid-cols-[100px_1fr] gap-4 p-3 bg-blue-500/10 rounded-lg items-center">
<span class="text-blue-400 font-bold">fix</span>
<span>修复 Bug — <code>fix(cart): correct price calculation</code></span>
</div>
<div class="grid grid-cols-[100px_1fr] gap-4 p-3 bg-purple-500/10 rounded-lg items-center">
<span class="text-purple-400 font-bold">refactor</span>
<span>重构 — <code>refactor(api): simplify error handling</code></span>
</div>
<div class="grid grid-cols-[100px_1fr] gap-4 p-3 bg-orange-500/10 rounded-lg items-center">
<span class="text-orange-400 font-bold">docs</span>
<span>文档 — <code>docs(readme): update setup instructions</code></span>
</div>
</div>

---
layout: section
---

<div class="floating-slow">

# 二、分支策略

<div class="text-xl text-gray-400 mt-2">选对策略，少走弯路</div>

</div>

<style>
.floating-slow { animation: floatSlow 5s ease-in-out infinite; }
@keyframes floatSlow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
</style>

---

<h1 class="gradient-title-blue">三种主流分支策略</h1>

<div class="mt-4 space-y-4">

<div class="flex items-center gap-4 p-5 bg-blue-500/10 border border-blue-500/20 rounded-xl card-float">
<div class="text-4xl">🌊</div>
<div>
<div class="text-xl font-bold text-blue-400">Git Flow</div>
<div class="text-gray-400 mt-1">main / develop / feature / release / hotfix — 适合版本发布</div>
</div>
</div>

<div class="flex items-center gap-4 p-5 bg-green-500/10 border border-green-500/20 rounded-xl card-float" style="animation-delay: 0.4s">
<div class="text-4xl">🐙</div>
<div>
<div class="text-xl font-bold text-green-400">GitHub Flow</div>
<div class="text-gray-400 mt-1">main + feature branch + PR — 简单，适合持续部署</div>
</div>
</div>

<div class="flex items-center gap-4 p-5 bg-purple-500/10 border border-purple-500/20 rounded-xl card-float" style="animation-delay: 0.8s">
<div class="text-4xl">🦊</div>
<div>
<div class="text-xl font-bold text-purple-400">Trunk-Based</div>
<div class="text-gray-400 mt-1">直接提交 main + feature flag — 适合高频发布</div>
</div>
</div>

</div>

<style>
.card-float { animation: cardFloat 3.5s ease-in-out infinite; }
@keyframes cardFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
</style>

---

<h1 class="gradient-title-cyan">怎么选？</h1>

<div class="grid grid-cols-2 gap-8 mt-6">
<div class="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl relative overflow-hidden">
<div class="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-bl-full"></div>
<div class="text-blue-400 text-xl font-bold mb-4">🏢 传统项目</div>
<div class="text-lg leading-relaxed space-y-2">
<div>版本发布周期固定</div>
<div>需要维护多个版本</div>
<div class="text-blue-400 font-bold mt-3">→ Git Flow</div>
</div>
</div>
<div class="p-6 bg-green-500/10 border border-green-500/20 rounded-xl relative overflow-hidden">
<div class="absolute top-0 right-0 w-20 h-20 bg-green-500/5 rounded-bl-full"></div>
<div class="text-green-400 text-xl font-bold mb-4">🚀 互联网产品</div>
<div class="text-lg leading-relaxed space-y-2">
<div>持续部署</div>
<div>快速迭代</div>
<div class="text-green-400 font-bold mt-3">→ GitHub Flow / Trunk-Based</div>
</div>
</div>
</div>

<div class="mt-6 text-center">
<div class="inline-block px-6 py-3 bg-gradient-to-r from-blue-500/20 to-green-500/20 border border-cyan-500/30 rounded-xl floating-slow">
<span class="text-lg font-bold">选最简单的能满足需求的策略</span>
</div>
</div>

<style>
.floating-slow { animation: floatSlow 3.5s ease-in-out infinite; }
@keyframes floatSlow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
</style>

---
layout: section
---

<div class="floating-slow">

# 三、实用技巧

<div class="text-xl text-gray-400 mt-2">日常开发中的 Git 锦囊</div>

</div>

<style>
.floating-slow { animation: floatSlow 5s ease-in-out infinite; }
@keyframes floatSlow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
</style>

---

<h1 class="gradient-title-purple">日常必备命令</h1>

<div class="mt-4 space-y-3">

<div class="flex items-center gap-4 p-4 bg-blue-500/10 border-l-4 border-blue-400 rounded-r-xl text-lg">
<span class="text-blue-400 font-bold text-xl w-8">1</span>
<span><strong class="text-blue-400">git stash</strong> — 临时保存改动，切分支不丢代码</span>
</div>

<div class="flex items-center gap-4 p-4 bg-cyan-500/10 border-l-4 border-cyan-400 rounded-r-xl text-lg">
<span class="text-cyan-400 font-bold text-xl w-8">2</span>
<span><strong class="text-cyan-400">git rebase -i</strong> — 整理 commit，合并琐碎提交</span>
</div>

<div class="flex items-center gap-4 p-4 bg-green-500/10 border-l-4 border-green-400 rounded-r-xl text-lg">
<span class="text-green-400 font-bold text-xl w-8">3</span>
<span><strong class="text-green-400">git bisect</strong> — 二分法定位引入 bug 的 commit</span>
</div>

<div class="flex items-center gap-4 p-4 bg-purple-500/10 border-l-4 border-purple-400 rounded-r-xl text-lg">
<span class="text-purple-400 font-bold text-xl w-8">4</span>
<span><strong class="text-purple-400">git cherry-pick</strong> — 精确摘取某个 commit 到当前分支</span>
</div>

<div class="flex items-center gap-4 p-4 bg-orange-500/10 border-l-4 border-orange-400 rounded-r-xl text-lg">
<span class="text-orange-400 font-bold text-xl w-8">5</span>
<span><strong class="text-orange-400">git log --oneline --graph</strong> — 可视化分支历史</span>
</div>

</div>

---

<h1 class="gradient-title-orange">危险操作 ⚠️</h1>

<div class="mt-6 space-y-4">

<div class="p-5 bg-red-500/10 border border-red-500/20 rounded-xl">
<div class="text-red-400 text-lg font-bold mb-2">🚫 永远不要对已 push 的 commit</div>
<div class="space-y-2 text-lg">
<div><code class="text-red-400">git push --force</code> — 会覆盖他人工作</div>
<div><code class="text-red-400">git rebase</code> 已共享的分支 — 会制造冲突地狱</div>
<div><code class="text-red-400">git reset --hard</code> — 不可逆，代码永久丢失</div>
</div>
</div>

<div class="p-5 bg-green-500/10 border border-green-500/20 rounded-xl">
<div class="text-green-400 text-lg font-bold mb-2">✅ 安全替代方案</div>
<div class="space-y-2 text-lg">
<div><code class="text-green-400">git push --force-with-lease</code> — 检查远程是否被人更新</div>
<div><code class="text-green-400">git revert</code> — 创建反向 commit，安全撤销</div>
<div><code class="text-green-400">git reflog</code> — 恢复误删的 commit</div>
</div>
</div>

</div>

---
layout: center
class: text-center
---

<div class="space-y-6">

<div class="text-6xl mb-4 floating-slow">🎯</div>

# Q&A

<div class="text-2xl text-gray-400 mt-4">
分享你踩过的 Git 坑！
</div>

</div>

<style>
.floating-slow { animation: floatSlow 3s ease-in-out infinite; }
@keyframes floatSlow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
</style>
