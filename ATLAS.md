# Project Atlas

## Vision
AI-native business platform. Odoo killer. Cheaper, faster, smarter.

## Tech Stack
- **Frontend:** Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Database:** Supabase (PostgreSQL + Auth + Realtime + Storage)
- **AI:** Claude API for smart features, local models for predictions
- **Deployment:** Vercel (frontend) + Supabase (backend)
- **State:** Zustand
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts
- **Tables:** TanStack Table
- **Icons:** Lucide React

## MVP Modules (Phase 1 - 8 weeks)
1. **Auth & Multi-tenant** - Sign up, login, org creation, invite team
2. **Dashboard** - Real-time overview, charts, alerts
3. **Inventory** - Products, stock levels, multi-location, transfers, barcode
4. **Invoicing** - Create/send/track invoices, PDF export
5. **Contacts** - Customers & vendors directory
6. **AI Assistant** - Natural language queries on business data

## Database Schema (Core)
- organizations (multi-tenant root)
- users + org_members (roles: owner, admin, manager, staff)
- products (name, sku, barcode, category, cost, price)
- locations (stores/warehouses per org)
- stock_levels (product + location + quantity)
- stock_movements (transfers, adjustments, receipts)
- contacts (customers + vendors)
- invoices + invoice_items
- expenses

## Project Structure
```
atlas/
├── src/
│   ├── app/             # Next.js App Router pages
│   │   ├── (auth)/      # Login, signup, forgot password
│   │   ├── (dashboard)/ # Main app layout
│   │   │   ├── page.tsx           # Dashboard home
│   │   │   ├── inventory/        # Inventory module
│   │   │   ├── invoices/         # Invoicing module
│   │   │   ├── contacts/         # Contacts module
│   │   │   └── settings/         # Org settings
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/          # shadcn components
│   │   ├── layout/      # Sidebar, header, etc
│   │   └── modules/     # Module-specific components
│   ├── lib/
│   │   ├── supabase/    # Client + server + middleware
│   │   ├── ai/          # AI assistant logic
│   │   └── utils.ts
│   ├── hooks/           # Custom React hooks
│   ├── stores/          # Zustand stores
│   └── types/           # TypeScript types
├── supabase/
│   └── migrations/      # SQL migrations
├── public/
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Design System
- Dark mode first (matches Apex Athletic / Ion aesthetic)
- Clean, minimal, lots of whitespace
- Inter font family
- Accent: Blue (#3b82f6) + Purple (#8b5cf6)
- Cards with subtle borders, no heavy shadows
- Glassmorphism for overlays (subtle)

## Team Agents
- **Ion (Lead)** - Architecture, coordination, critical decisions
- **Forge** - Backend, database, API, Supabase setup
- **Nova** - Frontend, UI/UX, components, pages
- **Pulse** - AI features, smart predictions, assistant
