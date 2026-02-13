# Changelog

All notable changes to Atlas ERP will be documented in this file.

## [Unreleased]

## [3.0.0] - 2026-02-13

### Added
- **E-commerce Components**
  - Shopping Cart with item list, totals, and checkout button
  - Cart Item component with quantity controls
  - Checkout Form with multi-step progress (Shipping/Payment/Review)
  - Order Summary with promo code support
  - Product Grid with badges, ratings, quick view
  - Product Quick View modal with variants
  - Add to Cart button with quantity selector
  - Wishlist Button component

- **Blog Components**
  - Article Card with author, date, read time
  - Featured Article Card (large layout)
  - Author Bio with social links and stats
  - Related Posts grid
  - Blog Hero with category filters
  - Category Tags (pills/badges)
  - Reading Progress indicator
  - Table of Contents with active highlighting

- **Parallax & Scroll Animations**
  - Parallax Section with background image
  - Parallax Image with scale effect
  - Scroll Reveal animation
  - Fade on Scroll effect
  - Slide on Scroll effect
  - Scale on Scroll effect
  - Animated Counter on scroll

- **Light/Dark Theme Support**
  - Toggle between dark and light mode
  - Theme-aware color system
  - Persists preference

- **Import/Export JSON**
  - Import designs from JSON file or paste
  - Export full project to JSON
  - Supports single page or multi-page projects
  - Includes SEO settings and style presets

- **Collaboration Comments UI**
  - Comment threads on elements
  - Reply support
  - Resolve/unresolve comments
  - Comment count badge
  - Real-time comment panel

## [2.3.0] - 2026-02-13

### Added
- **Accessibility Improvements**
  - Skip link for keyboard navigation
  - ARIA labels and roles throughout the app
  - Focus trap for modals and dialogs
  - Arrow key navigation in lists
  - Screen reader announcements for dynamic content
  - Respects `prefers-reduced-motion` system setting
  - High contrast mode support

- **Mobile Editor Enhancements**
  - Swipe gestures for panel navigation
  - Long press for context menus
  - Pinch-to-zoom on canvas
  - Touch-friendly drag and drop
  - 44px minimum touch targets
  - Responsive panel layouts

- **Performance Optimizations**
  - Lazy loading for images with IntersectionObserver
  - Image placeholder shimmer during load
  - Graceful error fallbacks for failed images
  - Code splitting preparation

- **Error Handling**
  - ErrorBoundary component wrapping dashboard
  - User-friendly error messages
  - Recovery options (Try Again, Go to Dashboard)
  - Development mode error details

- **New Hooks**
  - `useLazyImage`: Lazy load images with intersection observer
  - `useFocusTrap`: Trap focus in modals
  - `useArrowNavigation`: Keyboard navigation for lists
  - `useAnnounce`: Screen reader announcements
  - `useLiveRegion`: ARIA live regions
  - `useSwipe`: Touch swipe detection
  - `useLongPress`: Long press gesture
  - `usePinchZoom`: Pinch-to-zoom gesture
  - `useTouchDrag`: Touch-friendly drag and drop
  - `useIsTouchDevice`: Touch device detection

- **New CSS Utilities**
  - `.sr-only`: Screen reader only content
  - `.focus-visible-ring`: Focus indicator
  - `.touch-target`: 44px minimum touch areas
  - `.touch-feedback`: Touch feedback animation
  - `.drag-handle`: Drag indicator styles
  - `.drop-zone`: Drop target indicators
  - `.error-shake`: Error feedback animation
  - `.success-pulse`: Success feedback
  - `.skeleton`: Loading placeholder
  - `.loading-spinner`: Spinning loader

### Changed
- Dashboard layout now includes ErrorBoundary wrapper
- Main content area has `role="main"` attribute
- Improved responsive CSS for mobile devices

### Fixed
- Removed unused `Target` import from website builder

## [2.2.0] - 2026-02-13

### Added
- Interactive components: Countdown, Social Proof, Accordion, Tabs
- Modal/Popup component
- Image Carousel with auto-play
- Content Slider
- Progress Bar with animation
- Form components: Contact Form, Lead Capture, Newsletter, Feedback, Event Registration, Custom Form

## [2.1.0] - 2026-02-12

### Added
- Image Library panel
- SEO Settings panel
- Global Style Presets
- Form Builder
- Integrations Panel (Analytics, Chat, CRM)
- Code Injection (Head/Body scripts)
- Page Settings
- Version History with restore
- Domain Settings with DNS verification
- Template Preview Modal

## [2.0.0] - 2026-02-12

### Added
- Complete website builder rebuild
- 17 premium templates across 9 categories
- 60+ component types
- Real-time preview with device switching
- Animation presets (fade, slide, scale, bounce)
- Gradient backgrounds (12 presets + mesh)
- Responsive visibility controls
- Multi-page support
- Undo/Redo with history
- Keyboard shortcuts

---

## Legend
- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Features to be removed
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements
