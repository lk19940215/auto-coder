# Oral / Voiceover PPT Mode

Instructions for creating presentation slides designed for video scripts, voiceover recordings, or 口播 scenarios.

## Key Differences from Share Mode

| Aspect | Share Mode | Oral Mode |
|--------|-----------|-----------|
| Text per slide | 3-5 bullet points | 1 keyword or short phrase |
| Images | Decorative, small | Core content, full-width |
| Speaker Notes | Optional | Required (contains full script) |
| Slides count | 5-20 | 10-30 (more slides, less per slide) |
| Animation | Subtle micro-effects | Bold transitions, strong reveals |
| Aspect ratio | 16/9 (default) | 16/9 or 9/16 (vertical for short video) |

## Frontmatter for Oral Mode

### Horizontal (standard video)

```yaml
---
theme: default
title: Title
transition: slide-left
mdc: true
layout: cover
class: text-center
background: https://images.unsplash.com/photo-ID?w=1920&q=80
---
```

### Vertical (short video / mobile)

```yaml
---
theme: default
title: Title
transition: slide-up
mdc: true
aspectRatio: 9/16
canvasWidth: 540
---
```

Do NOT use `layout: cover` or `background:` in vertical frontmatter. The cover slide is built with HTML + scoped `<style>` CSS.

## Speaker Notes (Script)

Place the voiceover script in HTML comments. Viewers cannot see these; they appear only in Presenter Mode (`/presenter/`).

```markdown
---
# Core Keyword

<div class="text-6xl text-center mt-20">🎯</div>
<div class="text-4xl text-center mt-8 font-bold">One Big Idea</div>

<!--
这里写口播稿。观众看不到这些内容。

大家好，今天要跟大家聊一个话题——Git 的常用命令。
很多同学虽然每天都在用 Git，但其实只用了最基础的几个命令...
-->
```

Access notes: run Slidev and open `http://localhost:PORT/presenter/`

## Slide Design Principles

### 1. One Concept Per Slide

Each slide should convey exactly ONE idea. If you need to explain multiple points, use multiple slides.

```markdown
---
# ❌ Bad: Too much on one slide
- Point 1
- Point 2
- Point 3
- Point 4

---
# ✅ Good: One idea, full visual impact

<div class="text-8xl text-center mt-16">📦</div>
<div class="text-4xl text-center mt-8 font-bold text-blue-400">git stash</div>
<div class="text-2xl text-center mt-4 text-gray-400">临时保存，随时恢复</div>

<!-- 
口播稿：
git stash 是我日常用得最多的一个命令。
想象这个场景：你正在开发一个功能，突然产品经理说线上有个紧急 bug...
-->
```

### 2. Large Visual Elements

Use oversized text (text-6xl to text-8xl), large emojis, or full-slide images:

```html
<div class="flex flex-col items-center justify-center h-full">
  <div class="text-8xl mb-8">🚀</div>
  <div class="text-5xl font-bold text-blue-400">git push</div>
</div>
```

### 3. Full-Slide Background Images

For visual slides, set background via scoped CSS (NOT frontmatter `background:`):

```html
<div class="flex flex-col items-center justify-center h-full">
<div class="backdrop-blur-sm bg-black/30 p-8 rounded-2xl inline-block">
<div class="text-4xl font-bold text-white">团队协作的基石</div>
</div>
</div>

<style>
.slidev-layout {
  background-image: url(https://images.unsplash.com/photo-{ID}?w=1080&h=1920&fit=crop&q=80);
  background-size: cover;
  background-position: center;
}
</style>

<!--
口播稿：Git 的分支模型是团队协作的核心...
-->
```

**IMPORTANT**: `background:` frontmatter does NOT work on content slides (`default` layout). Only `layout: cover` handles it. Always use scoped `<style>` CSS for content slides.

### 4. Transition Slides

Use section dividers between major topics. Keep them dramatic:

```markdown
---
layout: center
class: text-center
---

<div class="space-y-4">
<div class="text-6xl floating">⚡</div>
<div class="text-5xl font-bold gradient-text">进阶技巧</div>
<div class="text-xl text-gray-500">从"能用"到"好用"</div>
</div>
```

## Recommended Animation Choices

For oral mode, prefer bolder animations:

| Animation | Oral Mode Usage |
|-----------|----------------|
| `floating` | Large icons, key visuals |
| `bounce` | Attention-grabbing reveals |
| `card-pop` | Before/after comparisons |
| `v-click` | Progressive story reveals |

Avoid `slide-in` and `card-float` in oral mode — they're too subtle for video.

---

## Vertical (9/16) Layout Templates

When using `aspectRatio: 9/16`, apply these overrides to ALL templates.

### Padding Override (REQUIRED)

Slidev's default `.slidev-layout` has `px-14` (56px horizontal padding). On a 540px canvas, this wastes 112px. **You MUST add this to `style.css`** for vertical/oral presentations:

```css
.slidev-layout {
  padding: 0 !important;
}
```

### Text Size Scale-Up

| Element | Horizontal (16/9) | Vertical (9/16) |
|---------|-------------------|-----------------|
| Title | `text-4xl` - `text-5xl` | `text-3xl` - `text-4xl` |
| Key number | `text-8xl` | `text-7xl` - `text-8xl` |
| Body text | `text-lg` - `text-xl` | `text-lg` - `text-xl` |
| Subtitle | `text-sm` | `text-base` |

### Vertical Container (required on every slide)

Use `bg-black/30` for a clean overlay that lets the background image show through:

```html
<div class="flex flex-col items-center justify-center h-full">
<div class="backdrop-blur-sm bg-black/30 p-8 rounded-2xl w-[90%] text-center">
<!-- content here -->
</div>
</div>

<style>
.slidev-layout {
  background-image: url(https://images.unsplash.com/photo-{ID}?w=1080&h=1920&fit=crop&q=80);
  background-size: cover;
  background-position: center;
}
</style>
```

**IMPORTANT**: Do NOT use `background:` in frontmatter for content slides — it does nothing with the `default` layout. Always use the `<style>` block approach above.

**Do NOT use gradient overlays** like `bg-gradient-to-b from-xxx to-xxx` on containers — they add visual noise. Use simple `bg-black/30` or `bg-black/40` for all frosted glass containers.

`w-[90%]` fills the narrow width without edge clipping.

### Vertical Cover

Do NOT use `layout: cover` in vertical mode — Slidev's built-in cover layout is designed for 16/9 and may break. Use a plain slide with scoped CSS for the background:

```html
<div class="flex flex-col items-center justify-center h-full">
<div class="backdrop-blur-md bg-black/30 p-8 rounded-2xl w-[85%] floating text-center">
<div class="text-4xl font-extrabold text-white leading-tight">Title</div>
<div class="text-lg text-gray-200 mt-4">Subtitle</div>
<div class="text-xl text-emerald-300 font-bold mt-5 glowing">Tagline</div>
</div>
</div>
```

**IMPORTANT**: The frosted glass container MUST include `text-center` to ensure text is centered after removing the default 56px padding.

Cover page needs these `<style>` overrides:

```html
<style>
h1 { display: none !important; }
.slidev-layout {
  background-image: url(https://images.unsplash.com/photo-{ID}?w=1080&h=1920&fit=crop&q=80);
  background-size: cover;
  background-position: center;
}
</style>
```

### Vertical Comparison (stacked, not side-by-side)

```html
<div class="flex flex-col gap-4 w-[90%]">
<div class="p-6 bg-red-500/15 border border-red-500/30 rounded-2xl card-pop">
<div class="text-red-400 text-xl font-bold">❌ Before</div>
<div class="text-3xl font-bold text-red-400 mt-2">Value</div>
</div>
<div class="p-6 bg-green-500/15 border border-green-500/30 rounded-2xl card-pop" style="animation-delay: 0.3s">
<div class="text-green-400 text-xl font-bold">✅ After</div>
<div class="text-3xl font-bold text-green-400 mt-2">Value</div>
</div>
</div>
```

---

## Workflow Differences

1. **Outline first** — write the script outline before designing slides
2. **Script in notes** — complete voiceover script goes in `<!-- -->` comments
3. **One idea = one slide** — split aggressively
4. **Visual hierarchy** — emoji/icon > big text > small text > no bullet lists
5. **Review in Presenter Mode** — use `/presenter/` to read notes while viewing slides
