# Visual Design Reference

Background images, frosted glass, gradient titles, color palette, and layout patterns.

## Background Image Discovery

### Search Keywords

Background images must be **clean, dark, low-contrast** — they serve as backdrop, not content. Never let the background compete with the foreground text.

**Keyword formula**: `unsplash {topic} dark minimal blurred` or `unsplash {topic} dark bokeh soft`

Good modifiers: `minimal`, `dark`, `blurred`, `bokeh`, `soft focus`, `muted`, `low contrast`, `abstract dark`

Bad modifiers (produce busy/flashy images): `wallpaper`, `neon`, `vibrant`, `colorful`, `bright`

### Search Steps

1. **WebSearch**: Search for 5-8 photos with 2-3 different keyword combinations
   - Only use images marked "Free to use under the Unsplash License" — skip "Unsplash+" (paid)
   - **CRITICAL**: The slug ID in `unsplash.com/photos/{title}-{slugID}` is NOT the photo ID. Use WebFetch to open the photo page and extract the real photo ID from `<img src="https://images.unsplash.com/photo-{REAL_ID}?...">`.
   - Build image URL: `https://images.unsplash.com/photo-{REAL_ID}?w=1920&q=80` (horizontal) or `?w=1080&h=1920&fit=crop&q=80` (vertical)

2. **Known IDs** (quick fallback when WebSearch fails):

| Topic | Unsplash Photo ID |
|-------|-------------------|
| Code / Programming | `photo-1555066931-4365d14bab8c` |
| Git / Version Control | `photo-1556075798-4825dfaaf498` |
| AI / Technology | `photo-1677442136019-21780ecad995` |
| Data / Analytics | `photo-1551288049-bebda4e38f71` |
| Cloud / DevOps | `photo-1451187580459-43490279c0fa` |
| Security | `photo-1563986768609-322da13575f2` |
| Dark abstract | `photo-1534996858221-380b92700493` |

### Image Quality Checklist

- [ ] Dark overall tone (light backgrounds make white text unreadable)
- [ ] Low contrast / soft focus (busy details distract from content)
- [ ] No bright/saturated colors that clash with text
- [ ] Real photograph (not gradient wallpaper or solid color)
- [ ] Each slide uses a different image

## Cover Page

### Frosted-Glass Overlay

```html
<div class="backdrop-blur-md bg-black/30 p-8 rounded-2xl floating text-center">

# Title

<div class="text-xl text-gray-200 mt-2">Subtitle</div>
<div class="text-2xl text-emerald-300 font-bold mt-4 glowing">Tagline</div>

</div>
```

### Cover h1 Style Override

Cover page h1 must override global gradient to show white text:

```html
<style>
h1 { color: white !important; text-shadow: 0 2px 10px rgba(0,0,0,0.5); }
</style>
```

## Content Page Backgrounds

**Every page** must have a background. Never use plain default.

### CRITICAL: How Slidev Backgrounds Work

Slidev's `default` layout does NOT process the `background:` frontmatter prop — it renders as a useless HTML attribute. Only `layout: cover` (from theme-default) handles it via `handleBackground()`.

**Rules:**
- **Cover slide**: Use `background:` in frontmatter (works because `layout: cover` handles it)
- **Content slides**: Use per-slide `<style>` block to set CSS background on `.slidev-layout`
- **NEVER** use `background:` in frontmatter for content slides — it does nothing

### Per-Slide Background (content slides)

Set background via scoped CSS in the `<style>` block:

```html
<style>
.slidev-layout {
  background-image: url(https://images.unsplash.com/photo-{ID}?w=1080&q=80);
  background-size: cover;
  background-position: center;
}
</style>
```

This CSS is scoped per slide automatically by Slidev, so each slide can have a different background.

### Frosted-Glass Container (required on all background pages)

```html
<div class="backdrop-blur-sm bg-black/30 p-8 rounded-2xl">
<!-- slide content here -->
</div>
```

Use `bg-black/30` for a clean, neutral overlay that lets the background image show through clearly. Keep opacity at `/30` ~ `/40`. **Do NOT use gradient overlays** like `bg-gradient-to-b from-xxx to-xxx` — they add visual noise and clash with background images.

### Fallback: Dark Gradient

When no suitable background image is available:

```html
<style>
.slidev-layout {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important;
}
</style>
```

## Gradient Titles

In content slides, use `<h1>` tags with gradient classes:

```html
<h1 class="gradient-title-blue">My Title</h1>
```

| Class | Colors | Use For |
|-------|--------|---------|
| (default) | Blue → Cyan | General content |
| `gradient-title-red` | Red → Orange | Problems, warnings |
| `gradient-title-blue` | Blue → Cyan | Core features |
| `gradient-title-cyan` | Cyan → Blue | Instructions |
| `gradient-title-green` | Green → Cyan | Results, tips |
| `gradient-title-purple` | Purple → Blue | Architecture |
| `gradient-title-orange` | Orange → Yellow | Cautions |

## Content Styling Patterns

| Pattern | Key Classes | Use For |
|---------|-------------|---------|
| Card List | `flex items-center gap-4 p-4 bg-{color}-500/10 border-l-4 border-{color}-500 rounded-r-xl` | Sequential items |
| Two-Column | `grid grid-cols-2 gap-8` with red/green cards | Before/after |
| 2x2 Grid | `grid grid-cols-2 gap-4` with `card-pop` | Feature tiles |
| Conclusion Box | `inline-block px-6 py-3 bg-blue-500/10 border rounded-xl` | Takeaways |
| Gradient Conclusion | `bg-gradient-to-r from-blue-500/20 to-green-500/20 border-cyan-500/30` | Insights |
| Row Data | `grid grid-cols-3 gap-2 p-3 bg-{color}-500/10 rounded-lg` | Tabular data |

See [example-share.md](example-share.md) for complete code examples of each pattern.

## Color Palette

All colors use Tailwind classes with opacity:

| Purpose | Background | Border | Text |
|---------|-----------|--------|------|
| Blue | `bg-blue-500/10` | `border-blue-500/20` | `text-blue-400` |
| Green | `bg-green-500/10` | `border-green-500/20` | `text-green-400` |
| Red | `bg-red-500/10` | `border-red-500/20` | `text-red-400` |
| Orange | `bg-orange-500/10` | `border-orange-500/20` | `text-orange-400` |
| Purple | `bg-purple-500/10` | `border-purple-500/20` | `text-purple-400` |
| Cyan | `bg-cyan-500/10` | `border-cyan-500/20` | `text-cyan-400` |
| Neutral | `bg-slate-800/50` | `border-slate-600/30` | `text-gray-300` |
