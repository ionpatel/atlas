-- =============================================================
-- Atlas ERP - Critical Features Migration
-- Multi-warehouse, Quotations, Recurring Invoices, Credit Notes
-- =============================================================

-- =============================================================
-- 1. MULTI-WAREHOUSE SUPPORT
-- =============================================================

-- Warehouses/Locations table
CREATE TABLE warehouses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id          UUID NOT NULL REFERENCES organizations ON DELETE CASCADE,
  name            TEXT NOT NULL,
  code            TEXT NOT NULL,
  address         TEXT,
  city            TEXT,
  province        TEXT,
  postal_code     TEXT,
  country         TEXT DEFAULT 'Canada',
  is_default      BOOLEAN DEFAULT FALSE,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE (org_id, code)
);

CREATE INDEX idx_warehouses_org ON warehouses (org_id);

-- Stock levels per warehouse
CREATE TABLE stock_levels (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id          UUID NOT NULL REFERENCES organizations ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES products ON DELETE CASCADE,
  warehouse_id    UUID NOT NULL REFERENCES warehouses ON DELETE CASCADE,
  quantity        DECIMAL(15,4) NOT NULL DEFAULT 0,
  reserved_qty    DECIMAL(15,4) NOT NULL DEFAULT 0,
  available_qty   DECIMAL(15,4) GENERATED ALWAYS AS (quantity - reserved_qty) STORED,
  reorder_level   DECIMAL(15,4),
  last_counted_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE (product_id, warehouse_id)
);

CREATE INDEX idx_stock_levels_product ON stock_levels (product_id);
CREATE INDEX idx_stock_levels_warehouse ON stock_levels (warehouse_id);
CREATE INDEX idx_stock_levels_low ON stock_levels (warehouse_id) WHERE quantity <= reorder_level;

-- Stock transfers between warehouses
CREATE TABLE stock_transfers (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id            UUID NOT NULL REFERENCES organizations ON DELETE CASCADE,
  transfer_number   TEXT NOT NULL,
  from_warehouse_id UUID NOT NULL REFERENCES warehouses ON DELETE RESTRICT,
  to_warehouse_id   UUID NOT NULL REFERENCES warehouses ON DELETE RESTRICT,
  status            TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'in_transit', 'completed', 'cancelled')),
  notes             TEXT,
  requested_by      UUID REFERENCES auth.users ON DELETE SET NULL,
  approved_by       UUID REFERENCES auth.users ON DELETE SET NULL,
  shipped_at        TIMESTAMPTZ,
  received_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE (org_id, transfer_number)
);

CREATE INDEX idx_transfers_org ON stock_transfers (org_id);
CREATE INDEX idx_transfers_status ON stock_transfers (status);

-- Transfer line items
CREATE TABLE stock_transfer_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transfer_id     UUID NOT NULL REFERENCES stock_transfers ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES products ON DELETE RESTRICT,
  quantity        DECIMAL(15,4) NOT NULL,
  received_qty    DECIMAL(15,4) DEFAULT 0,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transfer_items_transfer ON stock_transfer_items (transfer_id);

-- =============================================================
-- 2. QUOTATIONS / ESTIMATES
-- =============================================================

CREATE TABLE quotations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id          UUID NOT NULL REFERENCES organizations ON DELETE CASCADE,
  quote_number    TEXT NOT NULL,
  contact_id      UUID NOT NULL REFERENCES contacts ON DELETE RESTRICT,
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired', 'converted')),
  issue_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date     DATE,
  subtotal        DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax_amount      DECIMAL(15,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  total           DECIMAL(15,2) NOT NULL DEFAULT 0,
  notes           TEXT,
  terms           TEXT,
  converted_to_invoice_id UUID REFERENCES invoices ON DELETE SET NULL,
  converted_at    TIMESTAMPTZ,
  created_by      UUID REFERENCES auth.users ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE (org_id, quote_number)
);

CREATE INDEX idx_quotations_org ON quotations (org_id);
CREATE INDEX idx_quotations_contact ON quotations (contact_id);
CREATE INDEX idx_quotations_status ON quotations (status);

CREATE TABLE quotation_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quotation_id    UUID NOT NULL REFERENCES quotations ON DELETE CASCADE,
  product_id      UUID REFERENCES products ON DELETE SET NULL,
  description     TEXT NOT NULL,
  quantity        DECIMAL(15,4) NOT NULL DEFAULT 1,
  unit_price      DECIMAL(15,2) NOT NULL,
  discount_pct    DECIMAL(5,2) DEFAULT 0,
  tax_rate        DECIMAL(5,2) DEFAULT 0,
  line_total      DECIMAL(15,2) NOT NULL,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quotation_items_quote ON quotation_items (quotation_id);

-- =============================================================
-- 3. RECURRING INVOICES
-- =============================================================

CREATE TABLE recurring_invoices (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id          UUID NOT NULL REFERENCES organizations ON DELETE CASCADE,
  contact_id      UUID NOT NULL REFERENCES contacts ON DELETE RESTRICT,
  name            TEXT NOT NULL,
  frequency       TEXT NOT NULL CHECK (frequency IN ('weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
  day_of_month    INTEGER CHECK (day_of_month BETWEEN 1 AND 31),
  day_of_week     INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  next_invoice_date DATE NOT NULL,
  end_date        DATE,
  subtotal        DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax_amount      DECIMAL(15,2) NOT NULL DEFAULT 0,
  total           DECIMAL(15,2) NOT NULL DEFAULT 0,
  notes           TEXT,
  terms           TEXT,
  auto_send       BOOLEAN DEFAULT FALSE,
  is_active       BOOLEAN DEFAULT TRUE,
  invoices_generated INTEGER DEFAULT 0,
  last_generated_at TIMESTAMPTZ,
  created_by      UUID REFERENCES auth.users ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_recurring_org ON recurring_invoices (org_id);
CREATE INDEX idx_recurring_next ON recurring_invoices (next_invoice_date) WHERE is_active;

CREATE TABLE recurring_invoice_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recurring_id    UUID NOT NULL REFERENCES recurring_invoices ON DELETE CASCADE,
  product_id      UUID REFERENCES products ON DELETE SET NULL,
  description     TEXT NOT NULL,
  quantity        DECIMAL(15,4) NOT NULL DEFAULT 1,
  unit_price      DECIMAL(15,2) NOT NULL,
  tax_rate        DECIMAL(5,2) DEFAULT 0,
  line_total      DECIMAL(15,2) NOT NULL,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_recurring_items ON recurring_invoice_items (recurring_id);

-- =============================================================
-- 4. CREDIT NOTES / REFUNDS
-- =============================================================

CREATE TABLE credit_notes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id          UUID NOT NULL REFERENCES organizations ON DELETE CASCADE,
  credit_note_number TEXT NOT NULL,
  invoice_id      UUID REFERENCES invoices ON DELETE SET NULL,
  contact_id      UUID NOT NULL REFERENCES contacts ON DELETE RESTRICT,
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'applied', 'voided')),
  issue_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  reason          TEXT,
  subtotal        DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax_amount      DECIMAL(15,2) NOT NULL DEFAULT 0,
  total           DECIMAL(15,2) NOT NULL DEFAULT 0,
  amount_applied  DECIMAL(15,2) DEFAULT 0,
  amount_remaining DECIMAL(15,2) GENERATED ALWAYS AS (total - amount_applied) STORED,
  notes           TEXT,
  created_by      UUID REFERENCES auth.users ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE (org_id, credit_note_number)
);

CREATE INDEX idx_credit_notes_org ON credit_notes (org_id);
CREATE INDEX idx_credit_notes_invoice ON credit_notes (invoice_id);
CREATE INDEX idx_credit_notes_contact ON credit_notes (contact_id);

CREATE TABLE credit_note_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  credit_note_id  UUID NOT NULL REFERENCES credit_notes ON DELETE CASCADE,
  product_id      UUID REFERENCES products ON DELETE SET NULL,
  description     TEXT NOT NULL,
  quantity        DECIMAL(15,4) NOT NULL DEFAULT 1,
  unit_price      DECIMAL(15,2) NOT NULL,
  tax_rate        DECIMAL(5,2) DEFAULT 0,
  line_total      DECIMAL(15,2) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credit_note_items ON credit_note_items (credit_note_id);

-- Credit note applications (when applied to invoices)
CREATE TABLE credit_note_applications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  credit_note_id  UUID NOT NULL REFERENCES credit_notes ON DELETE CASCADE,
  invoice_id      UUID NOT NULL REFERENCES invoices ON DELETE CASCADE,
  amount          DECIMAL(15,2) NOT NULL,
  applied_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  applied_by      UUID REFERENCES auth.users ON DELETE SET NULL
);

CREATE INDEX idx_cn_applications_cn ON credit_note_applications (credit_note_id);
CREATE INDEX idx_cn_applications_inv ON credit_note_applications (invoice_id);

-- =============================================================
-- 5. BANK RECONCILIATION
-- =============================================================

CREATE TABLE bank_accounts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id          UUID NOT NULL REFERENCES organizations ON DELETE CASCADE,
  name            TEXT NOT NULL,
  account_number  TEXT,
  institution     TEXT,
  account_type    TEXT DEFAULT 'checking' CHECK (account_type IN ('checking', 'savings', 'credit_card')),
  currency        TEXT DEFAULT 'CAD',
  opening_balance DECIMAL(15,2) DEFAULT 0,
  current_balance DECIMAL(15,2) DEFAULT 0,
  is_active       BOOLEAN DEFAULT TRUE,
  last_reconciled_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bank_accounts_org ON bank_accounts (org_id);

CREATE TABLE bank_transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id          UUID NOT NULL REFERENCES organizations ON DELETE CASCADE,
  bank_account_id UUID NOT NULL REFERENCES bank_accounts ON DELETE CASCADE,
  transaction_date DATE NOT NULL,
  description     TEXT NOT NULL,
  reference       TEXT,
  amount          DECIMAL(15,2) NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'transfer', 'fee', 'interest')),
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'reconciled', 'excluded')),
  matched_invoice_id UUID REFERENCES invoices ON DELETE SET NULL,
  matched_expense_id UUID,
  import_id       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bank_trans_account ON bank_transactions (bank_account_id);
CREATE INDEX idx_bank_trans_date ON bank_transactions (transaction_date);
CREATE INDEX idx_bank_trans_status ON bank_transactions (status);

CREATE TABLE bank_reconciliations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id          UUID NOT NULL REFERENCES organizations ON DELETE CASCADE,
  bank_account_id UUID NOT NULL REFERENCES bank_accounts ON DELETE CASCADE,
  statement_date  DATE NOT NULL,
  statement_balance DECIMAL(15,2) NOT NULL,
  reconciled_balance DECIMAL(15,2),
  difference      DECIMAL(15,2),
  status          TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  completed_at    TIMESTAMPTZ,
  completed_by    UUID REFERENCES auth.users ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reconciliations_account ON bank_reconciliations (bank_account_id);

-- =============================================================
-- RLS POLICIES
-- =============================================================

ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transfer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_note_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_note_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_reconciliations ENABLE ROW LEVEL SECURITY;

-- Org member policies (simplified - members can access their org's data)
CREATE POLICY "Members can access warehouses" ON warehouses
  FOR ALL USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Members can access stock_levels" ON stock_levels
  FOR ALL USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Members can access stock_transfers" ON stock_transfers
  FOR ALL USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Members can access transfer_items" ON stock_transfer_items
  FOR ALL USING (transfer_id IN (SELECT id FROM stock_transfers WHERE org_id IN (SELECT get_user_org_ids())));

CREATE POLICY "Members can access quotations" ON quotations
  FOR ALL USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Members can access quotation_items" ON quotation_items
  FOR ALL USING (quotation_id IN (SELECT id FROM quotations WHERE org_id IN (SELECT get_user_org_ids())));

CREATE POLICY "Members can access recurring_invoices" ON recurring_invoices
  FOR ALL USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Members can access recurring_items" ON recurring_invoice_items
  FOR ALL USING (recurring_id IN (SELECT id FROM recurring_invoices WHERE org_id IN (SELECT get_user_org_ids())));

CREATE POLICY "Members can access credit_notes" ON credit_notes
  FOR ALL USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Members can access credit_note_items" ON credit_note_items
  FOR ALL USING (credit_note_id IN (SELECT id FROM credit_notes WHERE org_id IN (SELECT get_user_org_ids())));

CREATE POLICY "Members can access cn_applications" ON credit_note_applications
  FOR ALL USING (credit_note_id IN (SELECT id FROM credit_notes WHERE org_id IN (SELECT get_user_org_ids())));

CREATE POLICY "Members can access bank_accounts" ON bank_accounts
  FOR ALL USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Members can access bank_transactions" ON bank_transactions
  FOR ALL USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Members can access bank_reconciliations" ON bank_reconciliations
  FOR ALL USING (org_id IN (SELECT get_user_org_ids()));

-- =============================================================
-- HELPER FUNCTIONS
-- =============================================================

-- Convert quotation to invoice
CREATE OR REPLACE FUNCTION convert_quote_to_invoice(p_quote_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_quote RECORD;
  v_invoice_id UUID;
  v_invoice_number TEXT;
BEGIN
  -- Get quote
  SELECT * INTO v_quote FROM quotations WHERE id = p_quote_id;
  
  IF v_quote IS NULL THEN
    RAISE EXCEPTION 'Quotation not found';
  END IF;
  
  IF v_quote.status = 'converted' THEN
    RAISE EXCEPTION 'Quotation already converted';
  END IF;
  
  -- Generate invoice number
  SELECT 'INV-' || LPAD((COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 5) AS INTEGER)), 0) + 1)::TEXT, 6, '0')
  INTO v_invoice_number
  FROM invoices WHERE org_id = v_quote.org_id;
  
  -- Create invoice
  INSERT INTO invoices (org_id, invoice_number, contact_id, issue_date, due_date, subtotal, tax_amount, total, notes, terms, status)
  VALUES (v_quote.org_id, v_invoice_number, v_quote.contact_id, CURRENT_DATE, CURRENT_DATE + 30, v_quote.subtotal, v_quote.tax_amount, v_quote.total, v_quote.notes, v_quote.terms, 'draft')
  RETURNING id INTO v_invoice_id;
  
  -- Copy line items
  INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price, tax_rate, line_total)
  SELECT v_invoice_id, product_id, description, quantity, unit_price, tax_rate, line_total
  FROM quotation_items WHERE quotation_id = p_quote_id;
  
  -- Update quotation
  UPDATE quotations 
  SET status = 'converted', converted_to_invoice_id = v_invoice_id, converted_at = NOW()
  WHERE id = p_quote_id;
  
  RETURN v_invoice_id;
END;
$$;

-- Generate invoice from recurring template
CREATE OR REPLACE FUNCTION generate_recurring_invoice(p_recurring_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_recurring RECORD;
  v_invoice_id UUID;
  v_invoice_number TEXT;
  v_next_date DATE;
BEGIN
  SELECT * INTO v_recurring FROM recurring_invoices WHERE id = p_recurring_id AND is_active;
  
  IF v_recurring IS NULL THEN
    RAISE EXCEPTION 'Recurring invoice not found or inactive';
  END IF;
  
  -- Generate invoice number
  SELECT 'INV-' || LPAD((COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 5) AS INTEGER)), 0) + 1)::TEXT, 6, '0')
  INTO v_invoice_number
  FROM invoices WHERE org_id = v_recurring.org_id;
  
  -- Create invoice
  INSERT INTO invoices (org_id, invoice_number, contact_id, issue_date, due_date, subtotal, tax_amount, total, notes, terms, status)
  VALUES (v_recurring.org_id, v_invoice_number, v_recurring.contact_id, CURRENT_DATE, CURRENT_DATE + 30, v_recurring.subtotal, v_recurring.tax_amount, v_recurring.total, v_recurring.notes, v_recurring.terms, 
    CASE WHEN v_recurring.auto_send THEN 'sent' ELSE 'draft' END)
  RETURNING id INTO v_invoice_id;
  
  -- Copy line items
  INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price, tax_rate, line_total)
  SELECT v_invoice_id, product_id, description, quantity, unit_price, tax_rate, line_total
  FROM recurring_invoice_items WHERE recurring_id = p_recurring_id;
  
  -- Calculate next invoice date
  v_next_date := CASE v_recurring.frequency
    WHEN 'weekly' THEN v_recurring.next_invoice_date + INTERVAL '1 week'
    WHEN 'biweekly' THEN v_recurring.next_invoice_date + INTERVAL '2 weeks'
    WHEN 'monthly' THEN v_recurring.next_invoice_date + INTERVAL '1 month'
    WHEN 'quarterly' THEN v_recurring.next_invoice_date + INTERVAL '3 months'
    WHEN 'yearly' THEN v_recurring.next_invoice_date + INTERVAL '1 year'
  END;
  
  -- Update recurring invoice
  UPDATE recurring_invoices
  SET next_invoice_date = v_next_date,
      invoices_generated = invoices_generated + 1,
      last_generated_at = NOW(),
      is_active = CASE WHEN v_recurring.end_date IS NOT NULL AND v_next_date > v_recurring.end_date THEN FALSE ELSE TRUE END
  WHERE id = p_recurring_id;
  
  RETURN v_invoice_id;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER warehouses_updated_at BEFORE UPDATE ON warehouses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER stock_levels_updated_at BEFORE UPDATE ON stock_levels FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER stock_transfers_updated_at BEFORE UPDATE ON stock_transfers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER quotations_updated_at BEFORE UPDATE ON quotations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER recurring_invoices_updated_at BEFORE UPDATE ON recurring_invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER credit_notes_updated_at BEFORE UPDATE ON credit_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER bank_accounts_updated_at BEFORE UPDATE ON bank_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER bank_transactions_updated_at BEFORE UPDATE ON bank_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================
-- SEED DEFAULT WAREHOUSE FOR DEMO ORG
-- =============================================================

INSERT INTO warehouses (org_id, name, code, is_default)
SELECT '00000000-0000-0000-0000-000000000001', 'Main Warehouse', 'MAIN', TRUE
WHERE EXISTS (SELECT 1 FROM organizations WHERE id = '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;
