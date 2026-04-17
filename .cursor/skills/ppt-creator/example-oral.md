---
theme: default
title: AskQuestion 机制
transition: slide-up
mdc: true
aspectRatio: 9/16
canvasWidth: 540
---

<div class="flex flex-col items-center justify-center h-full">
<div class="backdrop-blur-md bg-black/30 p-8 rounded-2xl w-[85%] floating text-center">
<div class="text-4xl font-extrabold text-white leading-tight">AskQuestion<br/>机制</div>
<div class="text-lg text-gray-200 mt-4">让 AI 会话"永不结束"</div>
<div class="text-xl text-emerald-300 font-bold mt-5 glowing">压榨每一次 session</div>
</div>
</div>

<style>
h1 { display: none !important; }
.slidev-layout {
  background-image: url(https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1080&h=1920&fit=crop&q=80);
  background-size: cover;
  background-position: center;
}
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

<!--
大家好，今天跟大家聊一个使用 Cursor 过程中发现的核心技巧——AskQuestion 机制。
它可以让你的一次 AI 会话持续处理多个任务，大幅节省额度。
-->

---

<div class="flex flex-col items-center justify-center h-full">
<div class="backdrop-blur-sm bg-black/30 p-8 rounded-2xl w-[90%] text-center">

<div class="num-pulse text-7xl">500</div>
<div class="text-2xl text-gray-200 mt-6 font-medium">每月请求额度</div>
<div class="text-base text-gray-400 mt-3">公司账号的总额度</div>

</div>
</div>

<style>
.slidev-layout {
  background-image: url(https://images.unsplash.com/photo-1770159116807-9b2a7bb82294?w=1080&h=1920&fit=crop&q=80);
  background-size: cover;
  background-position: center;
}
.num-pulse {
  display: inline-block;
  font-weight: 800;
  color: #f87171;
  animation: numPulse 2s ease-in-out infinite;
}
@keyframes numPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.08); opacity: 0.8; }
}
</style>

<!--
先说一个扎心的数字——公司账号每个月只有 500 次请求额度。
听起来好像挺多的对吧？
-->

---

<div class="flex flex-col items-center justify-center h-full">
<div class="backdrop-blur-sm bg-black/30 p-8 rounded-2xl w-[90%] text-center">

<div class="num-pulse text-7xl" style="color: #fb923c">11</div>
<div class="text-2xl text-gray-200 mt-6 font-medium">每天可用次数</div>
<div class="text-lg text-orange-200/80 mt-4">Opus Thinking 消耗 2 倍</div>
<div class="text-base text-gray-400 mt-1">250 ÷ 22 天 ≈ 11 次</div>

</div>
</div>

<style>
.slidev-layout {
  background-image: url(https://images.unsplash.com/photo-1592609931041-40265b692757?w=1080&h=1920&fit=crop&q=80);
  background-size: cover;
  background-position: center;
}
.num-pulse {
  display: inline-block;
  font-weight: 800;
  animation: numPulse 2s ease-in-out infinite;
}
@keyframes numPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.08); opacity: 0.8; }
}
</style>

<!--
但如果你用 Opus Thinking 模型，每次消耗 2 倍额度。
500 除以 2 等于 250，再除以 22 个工作日，平均每天只有 11 次。
也就是说你一天只能发起 11 次新会话。
-->

---

<div class="flex flex-col items-center justify-center h-full">
<div class="backdrop-blur-sm bg-black/30 p-8 rounded-2xl w-[90%] text-center">

<div class="text-6xl mb-6 bounce">💡</div>
<div class="text-3xl font-bold text-blue-300">计费单位</div>
<div class="text-3xl font-bold text-cyan-300 mt-2">是 Session</div>
<div class="text-xl text-gray-300 mt-5">不是单条消息</div>
<div class="text-base text-blue-200/60 mt-3">一个 session 内发多少条<br/>都只算一次</div>

</div>
</div>

<style>
.slidev-layout {
  background-image: url(https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1080&h=1920&fit=crop&q=80);
  background-size: cover;
  background-position: center;
}
.bounce {
  display: inline-block;
  animation: bounce 2s ease-in-out infinite;
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  30% { transform: translateY(-15px); }
  50% { transform: translateY(0); }
  70% { transform: translateY(-8px); }
}
</style>

<!--
但这里有个关键信息——Cursor 的计费单位是 session，是一次会话，而不是你发的每条消息。
只要不开新会话，在同一个 session 里发多少条消息都只算一次。
这就是突破口。
-->

---

<div class="flex flex-col items-center justify-center h-full">
<div class="backdrop-blur-sm bg-black/30 p-8 rounded-2xl w-[90%] text-center">

<div class="text-6xl mb-5 floating">🔄</div>
<div class="text-3xl font-bold text-emerald-300">AskQuestion</div>

<div class="mt-6 space-y-2">
<div class="text-lg text-white/90">Agent 完成任务</div>
<div class="text-2xl text-emerald-400">↓</div>
<div class="text-lg text-white/90">向你提问</div>
<div class="text-2xl text-emerald-400">↓</div>
<div class="text-lg text-white/90">你回答</div>
<div class="text-2xl text-emerald-400">↓</div>
<div class="text-lg text-green-400 font-bold">继续工作 ♻️</div>
</div>

</div>
</div>

<style>
.slidev-layout {
  background-image: url(https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1080&h=1920&fit=crop&q=80);
  background-size: cover;
  background-position: center;
}
.floating { animation: float 4s ease-in-out infinite; }
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
</style>

<!--
AskQuestion 就是让 AI Agent 完成任务后，不直接结束，而是向你提问。
它问你：做完了，还有别的事要处理吗？
你回答后，它继续在同一个 session 里工作。
不消耗新额度。
-->

---

<div class="flex flex-col items-center justify-center h-full">
<div class="backdrop-blur-sm bg-black/30 p-6 rounded-2xl w-[90%] text-center">

<div class="text-xl text-indigo-300 mb-5 font-medium">创建规则触发</div>

<div class="p-1 bg-blue-500/20 rounded-xl">
<div class="bg-slate-900/80 rounded-lg p-4 text-left text-base">

```markdown
---
alwaysApply: true
---
# 核心原则
- 完成后必须用
  AskQuestion 确认
- 禁止未确认就结束
- 通过后主动问
  "还有其他事吗？"
```

</div>
</div>

</div>
</div>

<style>
.slidev-layout {
  background-image: url(https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=1080&h=1920&fit=crop&q=80);
  background-size: cover;
  background-position: center;
}
</style>

<!--
怎么触发？在 .cursor/rules 下创建规则。
三句话：完成后用 AskQuestion 确认，禁止未确认就结束，通过后主动问有没有其他事。
-->

---

<div class="flex flex-col items-center justify-center h-full">
<div class="backdrop-blur-sm bg-black/30 p-6 rounded-2xl w-[90%] text-center">

<div class="flex flex-col gap-4">
<div class="p-6 bg-red-500/15 border border-red-500/30 rounded-2xl card-pop">
<div class="text-red-400 text-xl font-bold">❌ 之前</div>
<div class="text-4xl font-bold text-red-400 mt-2">1 次</div>
<div class="text-base text-red-200/60 mt-2">做完就结束</div>
</div>

<div class="p-6 bg-green-500/15 border border-green-500/30 rounded-2xl card-pop" style="animation-delay: 0.3s">
<div class="text-green-400 text-xl font-bold">✅ 之后</div>
<div class="text-4xl font-bold text-green-400 mt-2">N 次</div>
<div class="text-base text-green-200/60 mt-2">连续做多件事</div>
</div>
</div>

</div>
</div>

<style>
.slidev-layout {
  background-image: url(https://images.unsplash.com/photo-1756830242843-7642e98ab5a3?w=1080&h=1920&fit=crop&q=80);
  background-size: cover;
  background-position: center;
}
.card-pop { animation: cardPop 0.5s ease-out both; }
@keyframes cardPop {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
</style>

<!--
效果对比：之前一个 session 做一件事就结束，11 次很快用完。
之后一次 session 连续处理多件事，一天只需要 3 到 5 个 session。
-->

---

<div class="flex flex-col items-center justify-center h-full">
<div class="backdrop-blur-sm bg-black/30 p-8 rounded-2xl w-[90%] text-center">

<div class="text-6xl mb-6 floating">⚠️</div>
<div class="text-3xl font-bold text-orange-300">Rules 会被稀释</div>
<div class="text-xl text-gray-200 mt-5">对话越长</div>
<div class="text-xl text-orange-300/80">→ 注意力分散</div>
<div class="text-xl text-red-400/80">→ Rules 影响力下降</div>

</div>
</div>

<style>
.slidev-layout {
  background-image: url(https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1080&h=1920&fit=crop&q=80);
  background-size: cover;
  background-position: center;
}
.floating { animation: float 4s ease-in-out infinite; }
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
</style>

<!--
不过有个坑。随着对话越来越长，Rules 的影响力会逐渐减弱。
这是大语言模型注意力机制决定的，对话越长，每个 token 分到的注意力越少。
-->

---

<div class="flex flex-col items-center justify-center h-full">
<div class="backdrop-blur-sm bg-black/30 p-6 rounded-2xl w-[90%] text-center">

<div class="flex flex-col gap-4">
<div class="p-5 bg-blue-500/15 border border-blue-400/30 rounded-2xl card-pop">
<div class="text-blue-300 text-xl font-bold">📍 开头</div>
<div class="text-lg text-blue-100/80 mt-2">Rules → Primacy</div>
</div>

<div class="p-5 bg-green-500/15 border border-green-400/30 rounded-2xl card-pop" style="animation-delay: 0.3s">
<div class="text-green-300 text-xl font-bold">🎯 结尾</div>
<div class="text-lg text-green-100/80 mt-2">AskQuestion → Recency</div>
</div>
</div>

<div class="mt-5">
<div class="inline-block px-6 py-3 bg-black/40 border border-cyan-400/40 rounded-xl floating-slow">
<span class="text-xl font-bold text-cyan-200">首尾夹击 🎯</span>
</div>
</div>

</div>
</div>

<style>
.slidev-layout {
  background-image: url(https://images.unsplash.com/photo-1768167630789-925bc3c70db7?w=1080&h=1920&fit=crop&q=80);
  background-size: cover;
  background-position: center;
}
.card-pop { animation: cardPop 0.5s ease-out both; }
@keyframes cardPop {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
.floating-slow { animation: floatSlow 3.5s ease-in-out infinite; }
@keyframes floatSlow {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
</style>

<!--
解决方案是双端强化。
Rules 在上下文开头，Primacy 优势。
AskQuestion 回答在最后面，Recency 优势。
首尾夹击，确保模型始终记得核心指令。
-->

---

<div class="flex flex-col items-center justify-center h-full">
<div class="backdrop-blur-md bg-black/30 p-8 rounded-2xl w-[90%] text-center">

<div class="text-5xl mb-6 bounce">🎯</div>
<div class="text-3xl font-bold text-white mb-6">总结</div>

<div class="text-xl text-gray-200 space-y-5">
<div><strong class="text-blue-300">1.</strong> 计费 = session</div>
<div><strong class="text-green-300">2.</strong> AskQuestion 延续</div>
<div><strong class="text-orange-300">3.</strong> 双端强化</div>
</div>

<div class="text-base text-purple-200/60 mt-8">感谢观看！</div>

</div>
</div>

<style>
.slidev-layout {
  background-image: url(https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1080&h=1920&fit=crop&q=80);
  background-size: cover;
  background-position: center;
}
.bounce {
  display: inline-block;
  animation: bounce 2s ease-in-out infinite;
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  30% { transform: translateY(-15px); }
  50% { transform: translateY(0); }
  70% { transform: translateY(-8px); }
}
</style>

<!--
总结三个核心要点：
第一，计费单位是 session，不是消息。
第二，AskQuestion 让 session 持续工作。
第三，双端强化对抗 Rules 稀释。
掌握这个技巧，500 次额度就能发挥几倍价值。感谢大家！
-->
