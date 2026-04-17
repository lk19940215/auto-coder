# Animation Reference

8 animation types with CSS code. Choose by purpose, mix 2-3 per presentation.

## Selection Guide

| Animation | Motion | Best For | Max Per Slide |
|-----------|--------|----------|---------------|
| `floating` | Gentle Y hover | Covers, sections | 1 |
| `glowing` | Opacity + glow | Taglines | 1 |
| `slide-in` | X entrance | Sequential lists | 5-6 |
| `card-float` | Y hover | Feature cards | 3-4 |
| `card-pop` | Scale entrance | Grid tiles | 4-6 |
| `num-pulse` | Scale pulse | Statistics | 3 |
| `bounce` | Multi-bounce | Icons, CTAs | 1 |
| `v-click` | Click reveal | Conclusions | 1-2 |

## CSS Definitions

Define animations in per-slide `<style>` blocks (Slidev scopes them per slide).

### Floating (gentle hover)

```css
.floating { animation: float 4s ease-in-out infinite; }
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
```

Variant: `.floating-slow` with `5s` duration and `-6px` travel.

### Glowing (text pulse)

Use only 1-2 per presentation. Adjust `rgba` to match text color.

```css
.glowing { animation: glow 3s ease-in-out infinite; }
@keyframes glow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; text-shadow: 0 0 20px rgba(110,231,183,0.5); }
}
```

Color map: emerald `110,231,183`, cyan `103,232,249`, blue `96,165,250`.

### Slide-In (entrance)

Stagger with `style="animation-delay: 0.1s"` increments.

```css
.slide-in { animation: slideIn 0.6s ease-out both; }
@keyframes slideIn {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}
```

### Card Float (card hover)

Stagger with `style="animation-delay: 0.3s"` increments.

```css
.card-float { animation: cardFloat 3.5s ease-in-out infinite; }
@keyframes cardFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
```

### Card Pop (scale entrance)

Stagger with `style="animation-delay: 0.2s"` increments.

```css
.card-pop { animation: cardPop 0.5s ease-out both; }
@keyframes cardPop {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
```

### Number Pulse (stat emphasis)

```css
.num-pulse {
  display: inline-block;
  font-size: 1.5rem;
  font-weight: 800;
  color: #f87171;
  animation: numPulse 2s ease-in-out infinite;
}
@keyframes numPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.08); opacity: 0.8; }
}
```

### Bounce (attention)

Use sparingly — Q&A icons, call-to-action.

```css
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
```

### Slidev v-click (built-in)

No CSS needed. Use for major reveals only:

```html
<v-click>
Content that appears on click
</v-click>
```

**Rule**: Don't wrap short lists in `<v-clicks>`. Only use for punchlines or conclusions.
