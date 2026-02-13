# Atlas ERP Design System

**Aesthetic:** Dark Luxury (Charcoal + Gold)
**Last Updated:** 2026-02-12
**Maintained by:** Pixel (Frontend Engineer)

---

## 📎 Quick Reference

| Token | Hex | Usage |
|-------|-----|-------|
| `charcoal` | `#111111` | Main background |
| `surface` | `#1a1a1a` | Cards, containers |
| `elevated` | `#222222` | Hover states, elevated surfaces |
| `border` | `#2a2a2a` | All borders |
| `gold` | `#CDB49E` | Primary accent, CTAs |
| `goldHover` | `#d4c0ad` | Accent hover state |
| `goldMuted` | `#3a3028` | Accent backgrounds |
| `textPrimary` | `#f5f0eb` | Main text |
| `textMuted` | `#888888` | Secondary text |
| `textSubtle` | `#555555` | Disabled/tertiary text |

---

## 🎨 Color Palette

### Core Palette
```
Background Layers:
├── #111111 (charcoal)     → Base background
├── #1a1a1a (surface)      → Cards, panels, modals
├── #222222 (elevated)     → Hover states, active tabs
└── #2a2a2a (border)       → All borders

Accent (Gold):
├── #CDB49E (gold)         → Primary CTA, highlights
├── #d4c0ad (goldHover)    → Hover state
└── #3a3028 (goldMuted)    → Gold-tinted backgrounds

Text:
├── #f5f0eb (textPrimary)  → Headings, important text
├── #888888 (textMuted)    → Body text, labels
└── #555555 (textSubtle)   → Disabled, hints
```

### Status Colors
| Status | Text Color | Background | Border |
|--------|------------|------------|--------|
| Success | `emerald-400` | `emerald-500/10` | `emerald-500/20` |
| Error | `red-400` | `red-500/10` | `red-500/20` |
| Warning | `amber-400` | `amber-500/10` | `amber-500/20` |
| Info | `blue-400` | `blue-500/10` | `blue-500/20` |
| Neutral | `#888888` | `#222222` | `#2a2a2a` |

### Accent Colors (for categories/tags)
| Category | Text | Background |
|----------|------|------------|
| Violet | `violet-400` | `violet-500/10` |
| Blue | `blue-400` | `blue-500/10` |
| Pink | `pink-400` | `pink-500/10` |
| Cyan | `cyan-400` | `cyan-500/10` |
| Teal | `teal-400` | `teal-500/10` |

---

## 📝 Typography

### Font Stack
```css
font-family: 'Inter', system-ui, sans-serif;
```

### Scale
| Element | Class | Example |
|---------|-------|---------|
| Page Title | `text-2xl font-semibold tracking-tight text-[#f5f0eb]` | "Inventory" |
| Page Subtitle | `text-sm text-[#888888] mt-1` | "24 of 48 products" |
| Section Header | `text-sm font-semibold text-[#f5f0eb]` | Card titles |
| Section Label | `text-xs font-semibold uppercase tracking-widest text-[#888888]` | Form sections |
| Table Header | `text-[10px] font-semibold uppercase tracking-widest text-[#888888]` | Column headers |
| Body Text | `text-sm text-[#f5f0eb]` | Content |
| Muted Body | `text-sm text-[#888888]` | Secondary content |
| Caption | `text-xs text-[#888888]` | Labels, timestamps |
| Micro | `text-[11px] font-medium` | Badges, small labels |

### Font Weights
- Regular: `400` (body text)
- Medium: `500` (labels, secondary headings)
- Semibold: `600` (headings, emphasis)
- Bold: `700` (numbers, important values)

---

## 📐 Spacing System

### Base Unit: 4px (Tailwind default)

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| xs | 4px | `1` | Tight gaps |
| sm | 8px | `2` | Icon gaps |
| md | 12px | `3` | Between related items |
| lg | 16px | `4` | Section padding |
| xl | 20px | `5` | Card padding |
| 2xl | 24px | `6` | Large cards, modals |

### Common Patterns
```
Card padding:       p-5 or p-6
Table cell padding: px-4 py-4 or px-6 py-4
Button padding:     px-4 py-2.5 (secondary), px-5 py-2.5 (primary)
Input padding:      px-4 py-2.5
Modal padding:      px-6 py-5
Section gap:        space-y-6
Card gap:           gap-4
```

---

## 🧩 Component Patterns

### Cards
```tsx
// Standard card
<div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">

// Card with header
<div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
  <div className="px-6 py-5 border-b border-[#2a2a2a]">
    <h2 className="text-sm font-semibold text-[#f5f0eb]">Title</h2>
  </div>
  <div className="p-6">{/* content */}</div>
</div>

// Stat card with hover
<div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#CDB49E]/20 transition-all duration-300">
```

### Buttons

```tsx
// Primary (Gold CTA)
<button className="flex items-center gap-2 px-5 py-2.5 bg-[#CDB49E] text-[#111111] rounded-lg text-sm font-semibold hover:bg-[#d4c0ad] transition-all duration-200">
  <Plus className="w-4 h-4" />
  Add Item
</button>

// Secondary (Ghost)
<button className="flex items-center gap-2 px-4 py-2.5 border border-[#2a2a2a] rounded-lg text-sm text-[#888888] hover:text-[#f5f0eb] hover:bg-[#1a1a1a] transition-all duration-200">
  <Filter className="w-4 h-4" />
  Filter
</button>

// Icon button
<button className="p-2 rounded-lg text-[#888888] hover:text-[#CDB49E] hover:bg-[#3a3028] transition-all duration-200">
  <Pencil className="w-3.5 h-3.5" />
</button>

// Danger icon button
<button className="p-2 rounded-lg text-[#888888] hover:text-red-400 hover:bg-red-500/10 transition-all duration-200">
  <Trash2 className="w-3.5 h-3.5" />
</button>
```

### Form Inputs

```tsx
// Text input
<input
  className="w-full px-4 py-2.5 bg-[#111111] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f0eb] placeholder:text-[#888888]/50 focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 focus:border-[#CDB49E]/50 transition-all duration-200"
  placeholder="Enter value..."
/>

// Select
<select className="px-4 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm text-[#f5f0eb] focus:outline-none focus:ring-2 focus:ring-[#CDB49E]/30 focus:border-[#CDB49E]/50 transition-all duration-200">

// Search input (with icon)
<div className="flex items-center gap-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2.5 focus-within:border-[#CDB49E]/40 transition-colors duration-200">
  <Search className="w-4 h-4 text-[#888888]" />
  <input className="bg-transparent border-none outline-none text-sm w-full text-[#f5f0eb] placeholder:text-[#888888]/60" />
</div>

// Toggle switch
<div className="relative">
  <input type="checkbox" className="sr-only peer" />
  <div className="w-9 h-5 bg-[#2a2a2a] rounded-full peer-checked:bg-[#CDB49E] transition-colors duration-200" />
  <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-[#111111] rounded-full peer-checked:translate-x-4 transition-transform duration-200" />
</div>
```

### Tables

```tsx
<div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden">
  <table className="w-full">
    <thead>
      <tr className="border-b border-[#2a2a2a]">
        <th className="text-left px-6 py-4 text-[10px] font-semibold text-[#888888] uppercase tracking-widest">
          Column
        </th>
      </tr>
    </thead>
    <tbody>
      <tr className="hover:bg-[#222222] transition-colors duration-150 border-b border-[#2a2a2a]/50 last:border-0">
        <td className="px-6 py-4 text-sm text-[#f5f0eb]">Value</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Badges / Status Pills

```tsx
// Status badge
<span className="px-2.5 py-1 rounded-full text-[11px] font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
  Active
</span>

// Gold accent badge
<span className="px-2.5 py-1 rounded-full text-[11px] font-medium border bg-[#3a3028] text-[#CDB49E] border-[#CDB49E]/20">
  Premium
</span>

// Category tag
<span className="px-2 py-0.5 rounded-full text-[10px] font-medium border bg-violet-500/10 text-violet-400 border-violet-500/20">
  Category
</span>
```

### Modals

```tsx
// See /src/components/ui/modal.tsx
// Key styles:
// - Overlay: bg-black/70 backdrop-blur-sm
// - Dialog: bg-[#1a1a1a] border-[#2a2a2a] rounded-2xl
// - Header: px-6 py-5 border-b border-[#2a2a2a]
// - Body: px-6 py-5
```

---

## 🚦 Transitions

### Standard Durations
| Duration | Usage |
|----------|-------|
| `duration-150` | Micro-interactions (hovers) |
| `duration-200` | Buttons, links, toggles |
| `duration-300` | Cards, panels sliding |
| `duration-500` | Charts, progress bars |

### Common Patterns
```
transition-all duration-200     → Default for interactive elements
transition-colors duration-200  → Color-only changes
transition-transform duration-200 → Scale/translate only
```

---

## 📏 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-lg` | 8px | Buttons, inputs, small elements |
| `rounded-xl` | 12px | Cards, containers |
| `rounded-2xl` | 16px | Modals, large panels |
| `rounded-full` | 9999px | Badges, avatars, toggles |

---

## ⚠️ Known Inconsistencies (To Fix)

### ✅ Fixed
1. **Header component** - Was using CSS variables while rest of app uses hex. Now uses hex values consistent with design system.

### ⚠️ Future Improvements
1. **Migrate to design tokens** - Import from `/src/lib/design-tokens.ts` instead of hardcoding hex values everywhere.
2. **Standardize table padding** - Some tables use `px-4`, others `px-6`. Standardize to `px-6`.

---

## 📁 File Locations

- **Design Tokens:** `/src/lib/design-tokens.ts`
- **Global CSS:** `/src/app/globals.css`
- **Tailwind Config:** `/tailwind.config.ts`
- **UI Components:** `/src/components/ui/`

---

## ✨ Best Practices

1. **Always use design tokens** - Import from `@/lib/design-tokens` rather than hardcoding hex values
2. **Consistent hover states** - Use `hover:border-[#CDB49E]/20` for cards, `hover:bg-[#1a1a1a]` for buttons
3. **Animation timing** - Use `transition-all duration-200` as default
4. **Icon sizing** - Use `w-4 h-4` for inline icons, `w-3.5 h-3.5` for small buttons
5. **Font sizes** - Stick to the typography scale; avoid arbitrary pixel sizes
