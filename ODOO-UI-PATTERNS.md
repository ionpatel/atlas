# Odoo UI Patterns — Research from Demo Instance

## Key UX Patterns We Need to Match

### 1. Top Navigation Bar
- App icon + name on far left (clickable → home)
- **Horizontal menu bar**: Module-specific tabs (e.g., "Orders | To Invoice | Products | Reporting | Configuration")
- Each tab can be a dropdown with sub-items
- Search bar with filter pills (e.g., "My Pipeline ×")
- **View switchers** on far right: Kanban | List | Calendar | Pivot | Graph | Map | Activity icons
- Pager: "1-4 / 4" with < > arrows

### 2. CRM Pipeline (Kanban)
- **Column headers**: Stage name + "+" button + total dollar amount
- **Progress bar** under each header (green/yellow/red showing health)
- **Cards show**: Title, dollar amount, company logo, contact name, category tags, star rating, activity icons (phone, email, clock)
- **Assignee avatar** on bottom-right of each card
- "Generate Leads" dropdown button

### 3. Sales Quotations (List View)
- **Columns**: Number, Creation Date, Customer, Website, Salesperson, Activities, Company, Total, Status
- Status shown as colored pill badge ("Sales Or...")
- Checkboxes for bulk selection
- Monospace-style order numbers (S00069)
- Dollar amounts right-aligned, colored
- Activity indicators (clock icons, colored check marks with text like "Follow-up o...")

### 4. Inventory Overview
- **4-quadrant dashboard** (like accounting):
  - Receipts: "4 To Receive" badge + "Late 4" + bar chart
  - Delivery Orders: "18 To Deliver" + "Waiting 7" + "Late 22" + bar chart
  - Manufacturing: "3 To Manufacture" + "Late 3" + bar chart
  - PoS Orders: "Open" badge
- Each quadrant has colored bar charts showing volume over time
- Green bars = on time, Red/Pink = late

### 5. Employees (Kanban Cards)
- **Large photo/avatar** on left (or colored initial for no-photo)
- **Details on right**: Name, Job Title, Email, Phone, Start Date
- **Tags**: "Employee", "Consultant" as colored badges
- **Left sidebar**: Filter by Company, Department (with counts)
- Activity clock icon on each card

### 6. Project (Kanban Cards)  
- **Project cards** with: ★ favorite star, project name, customer, date range
- **Tags**: Architecture, Construction, Design, Interior (colored badges)
- **Metrics**: "11 Tasks", "🚩 1/3" (milestones), time allocation badge
- **Status dot** (green/yellow/red) + assignee avatars
- Left-colored border on some cards

### 7. Common Odoo Patterns We MUST Implement
- **"New" button** — Always green/accent, top-left
- **⋮ (three dots) menu** — Bulk actions
- **⚙ (gear) icon** — Settings/configuration
- **Filter pills** — Removable tags in search bar
- **Multi-view switching** — Kanban/List/Calendar/Pivot/Graph/Map/Activity
- **Breadcrumb navigation** — "Dashboard > Draft Bill" etc.
- **Pager** — "1-4 / 4" with arrows
- **Sticky top bar** — Nav + search always visible
- **Activity scheduling** — Clock icons to schedule calls/meetings/emails
- **Star/Favorite** — Star icon on records for quick access
- **Drag & drop** — Kanban columns allow dragging cards between stages
- **Colored status indicators** — Progress bars, dots, badges throughout
- **Company avatar/logo** — Shows company logo on records

## What Atlas Still Needs (Priority Order)

1. **CRM Pipeline page** — Full kanban with columns, cards, drag-drop
2. **Multi-view switching** — Kanban/List/Calendar icons on every list page
3. **Inventory Overview dashboard** — 4-quadrant (Receipts, Delivery, Manufacturing, POS) with charts
4. **Employees module** — Photo cards, department sidebar, skill tags
5. **Project Management** — Kanban project cards with tasks, milestones, tags
6. **Top navigation bar** — Horizontal tabs per module instead of sidebar-only
7. **Breadcrumb navigation** — Show where you are in the hierarchy
8. **Activity scheduling** — Schedule calls/meetings/emails on any record
9. **Pager component** — "1-20 / 156" with navigation
10. **Star/Favorite system** — Mark any record as favorite
