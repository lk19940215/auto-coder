---
name: ppt-creator
description: >-
  Generate beautiful Slidev presentations from markdown documents or topics.
  Creates slides.md with animations, gradient titles, styled cards, and
  consistent visual design. Use when the user wants to create a PPT,
  presentation, slideshow, slides, 演示文稿, 幻灯片, or convert a markdown
  document to a presentation.
---

# Slidev PPT Creator

Generate polished Slidev presentations with background images, frosted-glass covers, gradient text, animated cards, and modern layouts.

## Presentation Modes

Determine the mode before starting. Default is **Share** mode.

| Mode | When | Key Traits |
|------|------|------------|
| **Share** | Tech talks, team sharing | Medium text, card layouts, multi-point slides |
| **Oral** | Video scripts, voiceover, 口播 | Minimal text, large images, speaker notes for script |

For **Oral** mode details and vertical (9/16) templates, see [reference-oral-mode.md](reference-oral-mode.md).

## Reference Files

| File | Contents | When to Read |
|------|----------|-------------|
| [reference-visuals.md](reference-visuals.md) | Background images, frosted glass, gradient titles, color palette, layout patterns | Every time (core visual system) |
| [reference-animations.md](reference-animations.md) | 8 animation types with CSS code, selection guide | Every time (animation system) |
| [reference-oral-mode.md](reference-oral-mode.md) | Oral mode design, vertical templates | Only in Oral mode |
| [style-template.css](style-template.css) | CSS gradient styles for h1 titles | Copy to project root as `style.css` |
| [example-share.md](example-share.md) | Share mode example (horizontal, 16/9) | Reference for Share patterns |
| [example-oral.md](example-oral.md) | Oral mode example (vertical, 9/16) | Reference for Oral patterns |

## Prerequisites

```bash
npm install @slidev/cli @slidev/theme-default
```

Run with: `npx @slidev/cli slides.md --open`

## Output Files

| File | Purpose |
|------|---------|
| `slides.md` | Main presentation content |
| `style.css` | Global styles (copy from style-template.css) |

---

## Slide Structure

### Frontmatter

```yaml
---
theme: default
title: Presentation Title
transition: slide-left
mdc: true
layout: cover
class: text-center
background: https://images.unsplash.com/photo-ID?w=1920&q=80
---
```

For vertical/oral: add `aspectRatio: 9/16` and `canvasWidth: 540`. Do NOT use `layout: cover` in vertical mode.

### Slide Types

| Type | Frontmatter | Background Method | Use For |
|------|-------------|-------------------|---------|
| Cover | `layout: cover` + `class: text-center` + `background:` | Frontmatter (cover layout handles it) | First slide only (horizontal) |
| Cover (vertical) | (none, no layout) | `<style>` CSS block | First slide in 9/16 mode |
| Section | `layout: section` | `<style>` CSS block | Chapter dividers (optional) |
| Content | (none) | `<style>` CSS block | Regular content |
| Center | `layout: center` + `class: text-center` | `<style>` CSS block | Q&A, closing |

**CRITICAL**: Only `layout: cover` handles `background:` frontmatter. All other layouts require CSS backgrounds via per-slide `<style>` blocks. See [reference-visuals.md](reference-visuals.md) for details.

### Slide Sequence

```
Cover → [Section →] Content slides → [Section →] Content slides → Q&A
```

Section slides are optional for short presentations (< 8 pages).

---

## Global Styles (style.css)

**CRITICAL**: Slidev scopes `<style>` blocks per slide. For global styles, create `style.css` in the project root (copy from [style-template.css](style-template.css)).

Key CSS pitfalls:

1. **`display: inline-block` required** on h1 for `background-clip: text`.
2. **Every gradient class must repeat** `-webkit-background-clip` and `-webkit-text-fill-color`.
3. **Scope under `.slidev-layout`** to avoid leaking into presenter UI.
4. **Use `!important`** to override theme defaults.
5. **Section/center h1**: Use markdown `#` for section slides, `<h1 class>` for content slides.
6. **Oral/vertical mode**: Add `.slidev-layout { padding: 0 !important; }` to remove the default 56px horizontal padding.

---

## Workflow

1. **Analyze source content** — read the markdown document or understand the topic
2. **Determine mode** — Share (default) or Oral (see [reference-oral-mode.md](reference-oral-mode.md))
3. **Search background images** — use WebSearch + WebFetch to find 5-8 Unsplash photos (see [reference-visuals.md](reference-visuals.md) for keyword formula and quality checklist)
4. **Plan slide structure** — divide into chapters and content slides
5. **Create `style.css`** — copy [style-template.css](style-template.css) to project root
6. **Write `slides.md`** — apply visual patterns from [reference-visuals.md](reference-visuals.md) and animations from [reference-animations.md](reference-animations.md)
7. **Start Slidev** — `npx @slidev/cli slides.md --open` (new `style.css` requires restart)
8. **Visual review** — if Chrome DevTools MCP is available, use `take_screenshot` + `press_key ArrowRight` to review each slide
9. **Iterate** — fix issues found during review

## Speaker Notes

**Both modes** should include speaker notes in HTML comments at the bottom of each slide:

```markdown
---
# Slide content here

<!--
Speaker notes / 口播稿 / 演讲提示
观众看不到，只在 Presenter Mode 显示
-->
```

| Mode | Notes content |
|------|---------------|
| **Share** | Key talking points, data sources, transition cues |
| **Oral** | Complete voiceover script (full sentences) |

Access notes: open `http://localhost:PORT/presenter/`

---

## Content Guidelines

- **One idea per slide** — don't overcrowd
- **Max 5-6 items per list** — split into multiple slides if needed
- **Use cards instead of tables** for 4+ column data
- **Keep code blocks short** — max 8-10 lines per slide
- **Mix 2-3 animation types** per presentation — variety without chaos
- **Cover page always has**: background image (via frontmatter for horizontal, CSS for vertical) + frosted glass + floating + glowing
- **Every content page has**: background via `<style>` CSS (image or gradient) + frosted-glass container (`bg-black/30`, no gradient overlays)
- **NEVER use `background:` frontmatter on content slides** — only `layout: cover` handles it
- **Every page has**: speaker notes (talking points or full script)
- **End with a centered Q&A slide** using `layout: center`
- **Oral/vertical mode**: Add `.slidev-layout { padding: 0 !important; }` to `style.css`
