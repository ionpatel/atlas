-- =============================================
-- HIGH PRIORITY FEATURES MIGRATION
-- Time Tracking, Leave Management, Expenses
-- =============================================

-- =============================================================
-- TIME ENTRIES (Time Tracking)
-- =============================================================

CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  task TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 0,
  billable BOOLEAN DEFAULT false,
  notes TEXT,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'paused', 'stopped')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for time entries
CREATE INDEX IF NOT EXISTS idx_time_entries_org ON time_entries(org_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project ON time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(start_time);
CREATE INDEX IF NOT EXISTS idx_time_entries_status ON time_entries(status);

-- RLS for time_entries
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "time_entries_org_isolation" ON time_entries
  FOR ALL USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

-- =============================================================
-- LEAVE REQUESTS
-- =============================================================

CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL CHECK (leave_type IN ('vacation', 'sick', 'personal', 'unpaid', 'bereavement', 'parental')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_requested DECIMAL(4,1) NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  reason TEXT,
  approved_by UUID REFERENCES employees(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for leave requests
CREATE INDEX IF NOT EXISTS idx_leave_requests_org ON leave_requests(org_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_user ON leave_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON leave_requests(start_date, end_date);

-- RLS for leave_requests
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leave_requests_org_isolation" ON leave_requests
  FOR ALL USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

-- =============================================================
-- LEAVE BALANCES
-- =============================================================

CREATE TABLE IF NOT EXISTS leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  vacation_days DECIMAL(4,1) DEFAULT 15,
  sick_days DECIMAL(4,1) DEFAULT 10,
  personal_days DECIMAL(4,1) DEFAULT 3,
  used_vacation DECIMAL(4,1) DEFAULT 0,
  used_sick DECIMAL(4,1) DEFAULT 0,
  used_personal DECIMAL(4,1) DEFAULT 0,
  carried_over DECIMAL(4,1) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, user_id, year)
);

-- Indexes for leave balances
CREATE INDEX IF NOT EXISTS idx_leave_balances_org ON leave_balances(org_id);
CREATE INDEX IF NOT EXISTS idx_leave_balances_user ON leave_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_leave_balances_year ON leave_balances(year);

-- RLS for leave_balances
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leave_balances_org_isolation" ON leave_balances
  FOR ALL USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

-- =============================================================
-- EXPENSE CATEGORIES
-- =============================================================

CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'receipt',
  default_limit DECIMAL(10,2),
  is_mileage BOOLEAN DEFAULT false,
  mileage_rate DECIMAL(4,2) DEFAULT 0.67,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default expense categories
INSERT INTO expense_categories (org_id, name, icon, default_limit, is_mileage, is_active) VALUES
  (NULL, 'Travel', 'plane', 5000, false, true),
  (NULL, 'Meals & Entertainment', 'utensils', 500, false, true),
  (NULL, 'Office Supplies', 'briefcase', 250, false, true),
  (NULL, 'Software & Subscriptions', 'monitor', 1000, false, true),
  (NULL, 'Mileage', 'car', NULL, true, true),
  (NULL, 'Professional Development', 'graduation-cap', 2000, false, true),
  (NULL, 'Communication', 'phone', 200, false, true),
  (NULL, 'Other', 'receipt', 500, false, true)
ON CONFLICT DO NOTHING;

-- Index for expense categories
CREATE INDEX IF NOT EXISTS idx_expense_categories_org ON expense_categories(org_id);

-- =============================================================
-- EXPENSES
-- =============================================================

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
  category_name TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'CAD',
  expense_date DATE NOT NULL,
  description TEXT,
  receipt_url TEXT,
  receipt_filename TEXT,
  vendor TEXT,
  is_mileage BOOLEAN DEFAULT false,
  mileage_distance DECIMAL(8,2),
  mileage_rate DECIMAL(4,2),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'reimbursed')),
  approved_by UUID REFERENCES employees(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  reimbursed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for expenses
CREATE INDEX IF NOT EXISTS idx_expenses_org ON expenses(org_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);

-- RLS for expenses
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "expenses_org_isolation" ON expenses
  FOR ALL USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

-- =============================================================
-- EXPENSE REPORTS (for grouping expenses)
-- =============================================================

CREATE TABLE IF NOT EXISTS expense_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  report_number TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'reimbursed')),
  total_amount DECIMAL(10,2) DEFAULT 0,
  submitted_at TIMESTAMPTZ,
  approved_by UUID REFERENCES employees(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  reimbursed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Link expenses to reports
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS report_id UUID REFERENCES expense_reports(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_expenses_report ON expenses(report_id);

-- Indexes for expense reports
CREATE INDEX IF NOT EXISTS idx_expense_reports_org ON expense_reports(org_id);
CREATE INDEX IF NOT EXISTS idx_expense_reports_user ON expense_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_expense_reports_status ON expense_reports(status);

-- RLS for expense_reports
ALTER TABLE expense_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "expense_reports_org_isolation" ON expense_reports
  FOR ALL USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

-- =============================================================
-- LEAVE POLICIES (org-level leave settings)
-- =============================================================

CREATE TABLE IF NOT EXISTS leave_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL CHECK (leave_type IN ('vacation', 'sick', 'personal', 'unpaid', 'bereavement', 'parental')),
  default_days DECIMAL(4,1) NOT NULL,
  accrual_rate DECIMAL(4,2) DEFAULT 0, -- days per month
  max_carryover DECIMAL(4,1) DEFAULT 5,
  requires_approval BOOLEAN DEFAULT true,
  min_notice_days INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(org_id, leave_type)
);

-- Index for leave policies
CREATE INDEX IF NOT EXISTS idx_leave_policies_org ON leave_policies(org_id);

-- RLS for leave_policies
ALTER TABLE leave_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leave_policies_org_isolation" ON leave_policies
  FOR ALL USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

-- =============================================================
-- TRIGGERS for updated_at
-- =============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_time_entries_updated_at ON time_entries;
CREATE TRIGGER update_time_entries_updated_at
  BEFORE UPDATE ON time_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leave_requests_updated_at ON leave_requests;
CREATE TRIGGER update_leave_requests_updated_at
  BEFORE UPDATE ON leave_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leave_balances_updated_at ON leave_balances;
CREATE TRIGGER update_leave_balances_updated_at
  BEFORE UPDATE ON leave_balances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_expense_reports_updated_at ON expense_reports;
CREATE TRIGGER update_expense_reports_updated_at
  BEFORE UPDATE ON expense_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================
-- GRANT PERMISSIONS
-- =============================================================

GRANT ALL ON time_entries TO authenticated;
GRANT ALL ON leave_requests TO authenticated;
GRANT ALL ON leave_balances TO authenticated;
GRANT ALL ON expense_categories TO authenticated;
GRANT ALL ON expenses TO authenticated;
GRANT ALL ON expense_reports TO authenticated;
GRANT ALL ON leave_policies TO authenticated;
