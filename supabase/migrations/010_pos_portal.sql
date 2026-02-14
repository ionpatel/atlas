-- ============================================================================
-- Migration 010: POS Sessions, Transactions & Customer Portal
-- ============================================================================

-- ════════════════════════════════════════════════════════════════════════════
-- POS SESSIONS
-- Tracks cash register sessions for cashiers
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS pos_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  cashier_id UUID NOT NULL REFERENCES profiles(id),
  register_name TEXT NOT NULL DEFAULT 'Register 1',
  start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_time TIMESTAMPTZ,
  opening_cash DECIMAL(12,2) NOT NULL DEFAULT 0,
  closing_cash DECIMAL(12,2),
  expected_cash DECIMAL(12,2),
  cash_difference DECIMAL(12,2),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'suspended')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for quick lookup of open sessions
CREATE INDEX IF NOT EXISTS idx_pos_sessions_org_status ON pos_sessions(org_id, status);
CREATE INDEX IF NOT EXISTS idx_pos_sessions_cashier ON pos_sessions(cashier_id);

-- ════════════════════════════════════════════════════════════════════════════
-- POS TRANSACTIONS
-- Main transaction records for POS sales
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS pos_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES pos_sessions(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  transaction_number TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'split', 'store_credit')),
  payment_details JSONB DEFAULT '{}',
  amount_paid DECIMAL(12,2) NOT NULL DEFAULT 0,
  change_given DECIMAL(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'refunded', 'voided', 'pending')),
  refund_reason TEXT,
  refunded_by UUID REFERENCES profiles(id),
  refunded_at TIMESTAMPTZ,
  receipt_printed BOOLEAN NOT NULL DEFAULT false,
  receipt_emailed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique transaction number per org
CREATE UNIQUE INDEX IF NOT EXISTS idx_pos_transactions_number ON pos_transactions(org_id, transaction_number);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_session ON pos_transactions(session_id);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_customer ON pos_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_date ON pos_transactions(org_id, created_at DESC);

-- ════════════════════════════════════════════════════════════════════════════
-- POS TRANSACTION ITEMS
-- Individual line items for each transaction
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS pos_transaction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES pos_transactions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_sku TEXT,
  quantity DECIMAL(10,3) NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pos_transaction_items_tx ON pos_transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_pos_transaction_items_product ON pos_transaction_items(product_id);

-- ════════════════════════════════════════════════════════════════════════════
-- SUPPORT TICKETS
-- Customer support ticket system
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  ticket_number TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'billing', 'order', 'product', 'technical', 'other')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  first_response_at TIMESTAMPTZ,
  related_order_id UUID,
  related_invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique ticket number per org
CREATE UNIQUE INDEX IF NOT EXISTS idx_support_tickets_number ON support_tickets(org_id, ticket_number);
CREATE INDEX IF NOT EXISTS idx_support_tickets_customer ON support_tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(org_id, status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned ON support_tickets(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(org_id, priority, status);

-- ════════════════════════════════════════════════════════════════════════════
-- TICKET MESSAGES
-- Messages/replies within support tickets
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'staff', 'system')),
  sender_id UUID, -- NULL for system messages
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]', -- [{name, url, size, type}]
  is_internal BOOLEAN NOT NULL DEFAULT false, -- Internal staff notes
  read_at TIMESTAMPTZ, -- When customer read the message
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_sender ON ticket_messages(sender_id) WHERE sender_id IS NOT NULL;

-- ════════════════════════════════════════════════════════════════════════════
-- CUSTOMER PORTAL SESSIONS
-- Authentication sessions for customer portal access
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS customer_portal_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  token_hash TEXT NOT NULL, -- Hashed version for security
  ip_address INET,
  user_agent TEXT,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portal_sessions_token ON customer_portal_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_portal_sessions_customer ON customer_portal_sessions(customer_id);
CREATE INDEX IF NOT EXISTS idx_portal_sessions_expires ON customer_portal_sessions(expires_at) WHERE revoked_at IS NULL;

-- ════════════════════════════════════════════════════════════════════════════
-- CUSTOMER PORTAL CREDENTIALS
-- Login credentials for customer portal
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS customer_portal_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  email_verified_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  failed_login_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  password_reset_token TEXT,
  password_reset_expires TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, email)
);

CREATE INDEX IF NOT EXISTS idx_portal_credentials_customer ON customer_portal_credentials(customer_id);
CREATE INDEX IF NOT EXISTS idx_portal_credentials_email ON customer_portal_credentials(org_id, email);

-- ════════════════════════════════════════════════════════════════════════════
-- BARCODE SCAN LOGS
-- History of barcode scans for tracking and analysis
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS barcode_scan_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  barcode TEXT NOT NULL,
  scan_type TEXT NOT NULL DEFAULT 'lookup' CHECK (scan_type IN ('lookup', 'inventory_in', 'inventory_out', 'pos_sale', 'batch')),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_found BOOLEAN NOT NULL DEFAULT false,
  quantity_adjusted INTEGER,
  location TEXT,
  notes TEXT,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_barcode_scans_org ON barcode_scan_logs(org_id, scanned_at DESC);
CREATE INDEX IF NOT EXISTS idx_barcode_scans_product ON barcode_scan_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_barcode_scans_barcode ON barcode_scan_logs(barcode);

-- ════════════════════════════════════════════════════════════════════════════
-- POS CASH MOVEMENTS
-- Track cash in/out during POS sessions
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS pos_cash_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES pos_sessions(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'drop', 'pickup')),
  amount DECIMAL(12,2) NOT NULL,
  reason TEXT NOT NULL,
  performed_by UUID NOT NULL REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cash_movements_session ON pos_cash_movements(session_id);

-- ════════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════════════════════

ALTER TABLE pos_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_portal_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_portal_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE barcode_scan_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_cash_movements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for POS Sessions
CREATE POLICY "pos_sessions_org_access" ON pos_sessions
  FOR ALL USING (
    org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
  );

-- RLS Policies for POS Transactions  
CREATE POLICY "pos_transactions_org_access" ON pos_transactions
  FOR ALL USING (
    org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
  );

-- RLS Policies for Transaction Items
CREATE POLICY "pos_tx_items_org_access" ON pos_transaction_items
  FOR ALL USING (
    transaction_id IN (
      SELECT id FROM pos_transactions 
      WHERE org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
    )
  );

-- RLS Policies for Support Tickets
CREATE POLICY "support_tickets_org_access" ON support_tickets
  FOR ALL USING (
    org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
  );

-- RLS Policies for Ticket Messages
CREATE POLICY "ticket_messages_org_access" ON ticket_messages
  FOR ALL USING (
    ticket_id IN (
      SELECT id FROM support_tickets 
      WHERE org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
    )
  );

-- RLS Policies for Portal Sessions
CREATE POLICY "portal_sessions_org_access" ON customer_portal_sessions
  FOR ALL USING (
    org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
  );

-- RLS Policies for Portal Credentials
CREATE POLICY "portal_credentials_org_access" ON customer_portal_credentials
  FOR ALL USING (
    org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
  );

-- RLS Policies for Barcode Scans
CREATE POLICY "barcode_scans_org_access" ON barcode_scan_logs
  FOR ALL USING (
    org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
  );

-- RLS Policies for Cash Movements
CREATE POLICY "cash_movements_org_access" ON pos_cash_movements
  FOR ALL USING (
    session_id IN (
      SELECT id FROM pos_sessions 
      WHERE org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
    )
  );

-- ════════════════════════════════════════════════════════════════════════════
-- HELPER FUNCTIONS
-- ════════════════════════════════════════════════════════════════════════════

-- Generate unique transaction number
CREATE OR REPLACE FUNCTION generate_pos_transaction_number(p_org_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_date TEXT;
  v_count INTEGER;
BEGIN
  v_date := to_char(CURRENT_DATE, 'YYYYMMDD');
  
  SELECT COUNT(*) + 1 INTO v_count
  FROM pos_transactions
  WHERE org_id = p_org_id
    AND created_at >= CURRENT_DATE
    AND created_at < CURRENT_DATE + INTERVAL '1 day';
  
  RETURN 'POS-' || v_date || '-' || LPAD(v_count::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Generate unique ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number(p_org_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO v_count
  FROM support_tickets
  WHERE org_id = p_org_id;
  
  RETURN 'TKT-' || LPAD(v_count::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Update session expected cash on transaction
CREATE OR REPLACE FUNCTION update_session_expected_cash()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND NEW.payment_method IN ('cash', 'split') THEN
    UPDATE pos_sessions
    SET expected_cash = COALESCE(expected_cash, opening_cash) + 
      CASE 
        WHEN NEW.payment_method = 'cash' THEN NEW.amount_paid - NEW.change_given
        WHEN NEW.payment_method = 'split' THEN COALESCE((NEW.payment_details->>'cash_amount')::DECIMAL, 0)
        ELSE 0
      END
    WHERE id = NEW.session_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_session_cash
  AFTER INSERT ON pos_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_session_expected_cash();

-- Update ticket on new message
CREATE OR REPLACE FUNCTION update_ticket_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE support_tickets
  SET 
    updated_at = now(),
    first_response_at = CASE 
      WHEN first_response_at IS NULL AND NEW.sender_type = 'staff' 
      THEN now() 
      ELSE first_response_at 
    END,
    status = CASE
      WHEN NEW.sender_type = 'staff' AND status = 'open' THEN 'in_progress'
      WHEN NEW.sender_type = 'customer' AND status = 'waiting_customer' THEN 'in_progress'
      ELSE status
    END
  WHERE id = NEW.ticket_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_ticket_on_message
  AFTER INSERT ON ticket_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_on_message();

-- ════════════════════════════════════════════════════════════════════════════
-- GRANTS
-- ════════════════════════════════════════════════════════════════════════════

GRANT ALL ON pos_sessions TO authenticated;
GRANT ALL ON pos_transactions TO authenticated;
GRANT ALL ON pos_transaction_items TO authenticated;
GRANT ALL ON support_tickets TO authenticated;
GRANT ALL ON ticket_messages TO authenticated;
GRANT ALL ON customer_portal_sessions TO authenticated;
GRANT ALL ON customer_portal_credentials TO authenticated;
GRANT ALL ON barcode_scan_logs TO authenticated;
GRANT ALL ON pos_cash_movements TO authenticated;
