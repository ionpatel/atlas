# Supabase Setup for Atlas

## Option A: Supabase Cloud (Recommended for MVP)

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Create new project → name it `atlas`, pick a strong DB password, region closest to you
3. Wait for project to provision (~2 min)
4. Go to **Project Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
5. Go to **SQL Editor** → paste the contents of `supabase/migrations/20260212050000_initial_schema.sql` → Run
6. Copy `.env.local.example` to `.env.local` and fill in the values

## Option B: Supabase CLI (Local Dev)

```bash
# Install CLI
npm install -g supabase

# Init (already done — supabase/ dir exists)
# supabase init

# Start local Supabase (needs Docker)
supabase start

# Apply migrations
supabase db reset

# Get local credentials
supabase status
```

## Auth Setup

After running the migration, configure auth in the Supabase dashboard:
- **Authentication → Providers** → Enable Email (already default)
- **Authentication → URL Configuration** → Set Site URL to `http://localhost:3000`
- Add redirect URLs: `http://localhost:3000/**`

## Verify

After running the migration, check the SQL Editor:
```sql
-- Should return all 10 tables
select table_name from information_schema.tables
where table_schema = 'public'
order by table_name;
```

Expected tables: `contacts`, `invoice_items`, `invoices`, `locations`,
`org_members`, `organizations`, `products`, `profiles`, `stock_levels`, `stock_movements`
