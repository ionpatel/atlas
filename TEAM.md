# Atlas Development Team

## Team Structure

```
                    ┌─────────────────┐
                    │   Ion (Lead)    │
                    │  Tech Architect │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   Nexus       │   │    Pixel      │   │    Forge      │
│  Integration  │   │   Frontend    │   │   Backend     │
│     Lead      │   │   Engineer    │   │   Engineer    │
└───────────────┘   └───────────────┘   └───────────────┘
```

## Agent Roles

### Ion (Lead / Architect)
- **Role:** Technical Lead & Project Architect
- **Responsibilities:**
  - Overall architecture decisions
  - Code review and approval
  - Sprint planning and prioritization
  - Direct communication with Harshil
  - Coordination between all agents

### Nexus (Integration Lead)
- **Role:** Systems Integration Engineer
- **Focus:** Making all Atlas modules work together seamlessly
- **Responsibilities:**
  - Shared data models and stores
  - Cross-module data flow (Invoice → Accounting, Sales → Inventory, etc.)
  - API contracts between modules
  - Event system for real-time updates
  - Testing integration points

### Pixel (Frontend Engineer)
- **Role:** UI/UX & Design System
- **Focus:** Consistent, beautiful user experience
- **Responsibilities:**
  - Component library maintenance
  - Design system consistency (colors, spacing, typography)
  - Responsive design
  - Animation and micro-interactions
  - Accessibility (a11y)

### Forge (Backend Engineer)
- **Role:** Data & Business Logic
- **Focus:** Robust, scalable backend
- **Responsibilities:**
  - Supabase schema design
  - Database migrations
  - Business logic implementation
  - API endpoints
  - Performance optimization

## Module Ownership

| Module | Primary | Integration Points |
|--------|---------|-------------------|
| Dashboard | Pixel | All modules (aggregates data) |
| Inventory | Forge | Sales, Purchase, Invoices |
| Invoices | Forge | Contacts, Inventory, Accounting |
| Sales | Forge | Inventory, Contacts, Invoices |
| Purchase | Forge | Inventory, Contacts, Accounting |
| Accounting | Forge | Invoices, Payroll, all transactions |
| Contacts | Forge | Invoices, Sales, Purchase |
| CRM | Forge | Contacts, Sales |
| Employees | Forge | Payroll |
| Payroll | Forge | Employees, Accounting |
| Projects | Forge | Employees, Invoices |
| Settings | Pixel | All modules |
| AI Assistant | Ion | All modules |

## Communication Protocol

### Daily Standup (via session messages)
Each agent reports:
1. What they completed
2. What they're working on
3. Any blockers

### Code Integration Flow
1. Agent completes feature
2. Agent reports to Ion with file changes
3. Ion reviews and approves
4. Ion merges and coordinates with other agents if integration needed
5. Nexus validates cross-module functionality

### Escalation Path
Agent → Ion → Harshil (only for major decisions)

## Current Sprint

### Priority 1: Core Integration
- [ ] Unified data layer for all modules
- [ ] Shared component library audit
- [ ] Cross-module navigation

### Priority 2: Canadian Compliance
- [x] Payroll with CPP/EI/Tax ✅
- [ ] GST/HST automation in Invoices
- [ ] T4 generation
- [ ] ROE (Record of Employment)

### Priority 3: Data Flow
- [ ] Sales → Inventory (auto stock reduction)
- [ ] Invoice → Accounting (auto journal entries)
- [ ] Payroll → Accounting (expense entries)

## Design Principles (Team-wide)

1. **Simple > Complex** — If it needs a manual, redesign it
2. **Mobile-first** — Every feature works on phone
3. **Dark luxury** — Consistent charcoal + gold aesthetic
4. **Canadian-first** — Compliance built-in, not bolted on
5. **All-in-one** — Data flows automatically between modules
