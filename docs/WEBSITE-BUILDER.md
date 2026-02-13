# Atlas Website Builder v2 Documentation

## Overview

The Atlas Website Builder is a visual drag-and-drop website editor built into Atlas ERP. It allows users to create professional websites without coding, with real-time preview and publishing capabilities.

## Features

### Templates (17 Premium Templates)

| Template | Category | Description |
|----------|----------|-------------|
| Athletic Pro | Fitness | Dark theme with sports imagery |
| SaaS Platform | Tech | Modern product marketing |
| Creative Agency | Business | Bold creative portfolio |
| Consulting Firm | Business | Professional corporate |
| Law Firm | Business | Classic professional |
| Real Estate | Business | Property listings |
| Medical Clinic | Health | Healthcare services |
| Wellness Spa | Health | Peaceful wellness |
| Fitness Gym | Fitness | High energy gym |
| E-Commerce | E-Commerce | Online store |
| Fashion Store | E-Commerce | Trendy fashion |
| Portfolio | Creative | Designer portfolio |
| Photography | Creative | Visual showcase |
| Restaurant | Food | Modern dining |
| Coffee Shop | Food | Cozy cafe vibe |
| Online Course | Education | Learning platform |
| Travel Agency | Travel | Adventure booking |

### Components

#### Layout Components
- Section, Container
- 2/3/4 Column layouts

#### Basic Components
- Heading, Subheading, Paragraph
- Button, Outline Button
- Text Link, Bullet List, Quote, Badge

#### Media Components
- Image, Rounded Image
- Video Embed, Video Background
- Icon, Avatar
- Image Gallery, Before/After Slider

#### Card Components
- Basic Card, Feature Card
- Profile Card, Pricing Card
- Testimonial Card, Stat Card
- Service Card, Product Card

#### Navigation
- Navbar (Light, Dark, Transparent)
- Footer (Standard, Simple, Dark)

#### Hero Sections
- Hero Center, Hero + Image
- Hero Split, Video Hero
- Gradient Hero, Minimal Hero
- Athletic Hero (with stats)

#### Section Components
- Features (3-col, 4-col, Icon Grid)
- Testimonials (Grid, Single)
- Pricing Tables
- Team Sections
- Stats (Static, Animated, With Image)
- FAQ (Simple, Accordion)
- CTA (Standard, Banner, Gradient)
- Contact (Form, Split)
- Logo Cloud, Services Grid
- Gallery (3-col, 4-col)
- Timeline, Process Steps
- Comparison Table
- Newsletter Signup
- Philosophy/About

#### Interactive Components (NEW)
- **Countdown Timer**: Target date, labels, completion text
- **Social Proof**: Notification popups with avatars
- **Accordion**: Expandable FAQ sections
- **Tab Panels**: Pills, underline, or boxed style

#### Utility
- Divider, Dots Divider
- Spacer, Large Spacer

---

## Style Editor

### Style Tab

**Typography** (for text elements)
- Font Size (12-96px slider)
- Font Weight (300-800)
- Text Align (left, center, right)
- Text Color (picker + hex input)

**Background**
- Solid color presets (Dark, Gray, Navy, Gold)
- 12 Gradient presets:
  - Purple, Pink, Indigo, Emerald, Orange, Cyan
  - Dark Blue, Dark Fade, Gold, Fire, Lime, Violet
- 2 Mesh gradients: Aurora, Night Sky
- Custom gradient input

**Border**
- Border radius (0-50px)

**Size** (for media)
- Width, Height controls

### Layout Tab

**Padding**
- All sides, Top, Left/Right, Bottom

**Margin**
- All sides, Auto center button

**Size**
- Width, Max Width, Height, Min Height

**Display**
- Block, Flex, Grid, None

**Flex Properties** (when display=flex)
- Direction: Row, Column
- Justify: start, center, end, between, around, evenly
- Align Items: start, center, end, stretch
- Gap

**Responsive Visibility**
- Show/hide on Desktop
- Show/hide on Tablet  
- Show/hide on Mobile

**Position**
- Relative, Absolute, Fixed

### Effects Tab

**Animation Presets**
- Fade In
- Slide Up / Down / Left / Right
- Scale In
- Bounce

**Animation Delay**
- 0s to 1s options

**Hover Effects**
- Lift (raises element)
- Glow (golden glow)
- Scale (grows on hover)

**Shadow Presets**
- None, SM, MD, LG (standard)
- Gold Glow, Neon Blue, Neon Pink, Soft

**Opacity**
- 0-100% slider

**Transform**
- Rotate (-180° to 180°)
- Scale (50% to 150%)

---

## Database Schema

### website_pages
```sql
id              uuid PRIMARY KEY
org_id          uuid NOT NULL → organizations
name            text DEFAULT 'Untitled Website'
slug            text DEFAULT '/'
template        text
elements        jsonb NOT NULL DEFAULT '[]'
settings        jsonb DEFAULT '{}'
is_published    boolean DEFAULT false
published_at    timestamptz
created_at      timestamptz
updated_at      timestamptz
```

### website_assets
```sql
id              uuid PRIMARY KEY
org_id          uuid NOT NULL → organizations
filename        text NOT NULL
storage_path    text NOT NULL
mime_type       text
size_bytes      bigint
alt_text        text
created_at      timestamptz
```

### website_domains
```sql
id              uuid PRIMARY KEY
org_id          uuid NOT NULL → organizations
domain          text NOT NULL UNIQUE
is_verified     boolean DEFAULT false
verified_at     timestamptz
ssl_enabled     boolean DEFAULT false
created_at      timestamptz
```

---

## CSS Animations

The following keyframe animations are available in `globals.css`:

```css
@keyframes fadeIn { ... }
@keyframes slideUp { ... }
@keyframes slideDown { ... }
@keyframes slideLeft { ... }
@keyframes slideRight { ... }
@keyframes scaleIn { ... }
@keyframes bounce { ... }
@keyframes float { ... }
@keyframes pulse { ... }
@keyframes shimmer { ... }
```

Hover effect classes:
- `.hover-lift` - Lifts element on hover
- `.hover-glow` - Adds golden glow
- `.hover-scale` - Scales up to 1.05x

---

## Usage

1. Navigate to Website module in dashboard
2. Select a template or start from scratch
3. Add components from the left panel
4. Select elements and customize in right panel
5. Preview with device switcher (Desktop/Tablet/Mobile)
6. Save progress (auto-saves every 30 seconds)
7. Publish when ready

---

## Multi-Page Support

- Create multiple pages per website
- Each page has unique slug
- Switch between pages in the Pages panel
- Rename and delete pages

---

## Accessibility Features (NEW in v2.3)

### Keyboard Navigation
- **Skip Link**: Press Tab to reveal "Skip to main content" link
- **Arrow Keys**: Navigate between elements in lists/grids
- **Escape**: Deselect current element
- **Ctrl/Cmd + Z/Y**: Undo/Redo
- **Ctrl/Cmd + S**: Save
- **Ctrl/Cmd + D**: Duplicate element
- **Delete/Backspace**: Remove selected element
- **Ctrl/Cmd + P**: Toggle preview

### Screen Reader Support
- ARIA labels on all interactive elements
- Live regions for dynamic updates
- Focus management in modals/panels

### Motion Preferences
- Respects `prefers-reduced-motion` system setting
- Animations disabled when user prefers reduced motion

### High Contrast
- Supports `prefers-contrast: high` system setting
- Enhanced borders and text contrast

---

## Mobile Editor (NEW in v2.3)

### Touch Interactions
- **Swipe**: Navigate between panels
- **Long Press**: Context menu on elements
- **Pinch**: Zoom canvas
- **Touch Drag**: Reorder elements in layers panel

### Mobile-Optimized UI
- 44px minimum touch targets
- Touch-friendly spacing
- Responsive panels that stack on small screens

---

## Performance Optimizations (NEW in v2.3)

### Lazy Loading
- Images load only when entering viewport
- 200px preload margin for smooth scrolling
- Placeholder shimmer during load
- Graceful error fallback for failed images

### Error Handling
- Error boundaries catch component failures
- User-friendly error messages
- "Try Again" and "Go to Dashboard" recovery options
- Error details visible in development mode

---

## Version History

- **v2.0** (Feb 2026): Complete rebuild with 17 templates, 60+ components
- **v2.1** (Feb 2026): Animation presets, gradients, responsive controls
- **v2.2** (Feb 2026): Interactive components (countdown, social proof, accordion, tabs)
- **v2.3** (Feb 2026): Accessibility, mobile editor, performance, error handling
