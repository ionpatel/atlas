-- ============================================================
-- MIGRATION 011: Contracts, Documents & Approval Workflows
-- ============================================================

-- =============================================================
-- CONTRACTS & AGREEMENTS
-- =============================================================

CREATE TYPE contract_status AS ENUM ('draft', 'pending', 'active', 'expired', 'terminated');
CREATE TYPE signature_status AS ENUM ('pending', 'signed', 'declined', 'expired');

-- Contracts table
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  parties JSONB NOT NULL DEFAULT '[]', -- Array of {name, email, role}
  start_date DATE NOT NULL,
  end_date DATE,
  value DECIMAL(15,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'CAD',
  payment_terms TEXT,
  status contract_status DEFAULT 'draft',
  auto_renew BOOLEAN DEFAULT false,
  renewal_days INTEGER DEFAULT 30, -- Days before expiry to send reminder
  document_url TEXT,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_contracts_org ON contracts(org_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_end_date ON contracts(end_date);

-- Contract templates
CREATE TABLE contract_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT NOT NULL, -- HTML/Markdown template
  variables JSONB DEFAULT '[]', -- Array of {name, type, default}
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_contract_templates_org ON contract_templates(org_id);

-- Contract signatures
CREATE TABLE contract_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  signer_name VARCHAR(255) NOT NULL,
  signer_email VARCHAR(255) NOT NULL,
  signer_role VARCHAR(100), -- e.g., 'Client', 'Vendor', 'Witness'
  status signature_status DEFAULT 'pending',
  signed_at TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  signature_data TEXT, -- Base64 signature image or typed name
  reminder_sent_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_contract_signatures_contract ON contract_signatures(contract_id);
CREATE INDEX idx_contract_signatures_status ON contract_signatures(status);

-- Contract activity log
CREATE TABLE contract_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- created, sent, viewed, signed, renewed, terminated
  actor_name VARCHAR(255),
  actor_email VARCHAR(255),
  details JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_contract_activities_contract ON contract_activities(contract_id);

-- =============================================================
-- DOCUMENT MANAGEMENT
-- =============================================================

-- Document folders
CREATE TABLE document_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES document_folders(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(20), -- Folder color for UI
  icon VARCHAR(50),
  permissions JSONB DEFAULT '{"view": "all", "edit": "admin"}', -- Permission levels
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_document_folders_org ON document_folders(org_id);
CREATE INDEX idx_document_folders_parent ON document_folders(parent_id);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES document_folders(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type VARCHAR(100), -- MIME type
  file_size BIGINT DEFAULT 0, -- Bytes
  version INTEGER DEFAULT 1,
  tags TEXT[] DEFAULT '{}',
  category VARCHAR(100),
  is_starred BOOLEAN DEFAULT false,
  uploaded_by UUID REFERENCES auth.users(id),
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_documents_org ON documents(org_id);
CREATE INDEX idx_documents_folder ON documents(folder_id);
CREATE INDEX idx_documents_name ON documents USING gin(to_tsvector('english', name));

-- Document versions (version history)
CREATE TABLE document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT DEFAULT 0,
  notes TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_document_versions_document ON document_versions(document_id);

-- Document shares (shareable links)
CREATE TABLE document_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  share_token VARCHAR(64) NOT NULL UNIQUE,
  permissions VARCHAR(20) DEFAULT 'view', -- view, download, edit
  password_hash TEXT,
  expires_at TIMESTAMPTZ,
  max_downloads INTEGER,
  download_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_document_shares_token ON document_shares(share_token);
CREATE INDEX idx_document_shares_document ON document_shares(document_id);

-- =============================================================
-- APPROVAL WORKFLOWS
-- =============================================================

CREATE TYPE approval_status AS ENUM ('pending', 'in_progress', 'approved', 'rejected', 'cancelled');
CREATE TYPE approver_type AS ENUM ('user', 'role', 'department', 'manager');
CREATE TYPE approval_action AS ENUM ('approve', 'reject', 'escalate', 'delegate');

-- Approval workflows
CREATE TABLE approval_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  applies_to VARCHAR(50) NOT NULL, -- expenses, purchase_orders, contracts, leave, invoices
  rules JSONB DEFAULT '{}', -- Conditions like {amount_min: 500, department: 'sales'}
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0, -- Higher priority workflows are evaluated first
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_approval_workflows_org ON approval_workflows(org_id);
CREATE INDEX idx_approval_workflows_applies ON approval_workflows(applies_to);

-- Approval steps (define the approval chain)
CREATE TABLE approval_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES approval_workflows(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  name VARCHAR(100),
  approver_type approver_type NOT NULL,
  approver_id UUID, -- User/Role/Department ID
  approver_name VARCHAR(255), -- Display name for UI
  conditions JSONB DEFAULT '{}', -- Step-specific conditions
  can_delegate BOOLEAN DEFAULT false,
  auto_approve_after_days INTEGER, -- Auto-escalate/approve if no action
  notify_on_pending BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_approval_steps_workflow ON approval_steps(workflow_id);
CREATE UNIQUE INDEX idx_approval_steps_order ON approval_steps(workflow_id, step_order);

-- Approval requests (instances of workflows)
CREATE TABLE approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  workflow_id UUID NOT NULL REFERENCES approval_workflows(id),
  workflow_name VARCHAR(255),
  record_type VARCHAR(50) NOT NULL, -- Same as applies_to
  record_id UUID NOT NULL,
  record_title VARCHAR(255), -- Display title
  record_amount DECIMAL(15,2),
  status approval_status DEFAULT 'pending',
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER DEFAULT 1,
  submitted_by UUID REFERENCES auth.users(id),
  submitted_by_name VARCHAR(255),
  submitted_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_approval_requests_org ON approval_requests(org_id);
CREATE INDEX idx_approval_requests_status ON approval_requests(status);
CREATE INDEX idx_approval_requests_record ON approval_requests(record_type, record_id);

-- Approval actions (history of actions on requests)
CREATE TABLE approval_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,
  step_id UUID REFERENCES approval_steps(id),
  step_order INTEGER,
  approver_id UUID REFERENCES auth.users(id),
  approver_name VARCHAR(255),
  action approval_action NOT NULL,
  comments TEXT,
  delegated_to UUID REFERENCES auth.users(id),
  delegated_to_name VARCHAR(255),
  ip_address INET,
  acted_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_approval_actions_request ON approval_actions(request_id);
CREATE INDEX idx_approval_actions_approver ON approval_actions(approver_id);

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_actions ENABLE ROW LEVEL SECURITY;

-- Contracts RLS policies
CREATE POLICY "Users can view contracts in their org"
  ON contracts FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage contracts in their org"
  ON contracts FOR ALL
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

-- Contract templates RLS
CREATE POLICY "Users can view templates in their org"
  ON contract_templates FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage templates in their org"
  ON contract_templates FOR ALL
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

-- Documents RLS policies
CREATE POLICY "Users can view documents in their org"
  ON documents FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage documents in their org"
  ON documents FOR ALL
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

-- Document folders RLS
CREATE POLICY "Users can view folders in their org"
  ON document_folders FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage folders in their org"
  ON document_folders FOR ALL
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

-- Approval workflows RLS
CREATE POLICY "Users can view workflows in their org"
  ON approval_workflows FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage workflows in their org"
  ON approval_workflows FOR ALL
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

-- Approval requests RLS
CREATE POLICY "Users can view approval requests in their org"
  ON approval_requests FOR SELECT
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage approval requests in their org"
  ON approval_requests FOR ALL
  USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

-- =============================================================
-- HELPER FUNCTIONS
-- =============================================================

-- Function to check if a contract is expiring soon
CREATE OR REPLACE FUNCTION get_expiring_contracts(
  p_org_id UUID,
  p_days_ahead INTEGER DEFAULT 30
)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  end_date DATE,
  days_until_expiry INTEGER,
  auto_renew BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.title,
    c.end_date,
    (c.end_date - CURRENT_DATE)::INTEGER as days_until_expiry,
    c.auto_renew
  FROM contracts c
  WHERE c.org_id = p_org_id
    AND c.status = 'active'
    AND c.end_date IS NOT NULL
    AND c.end_date <= CURRENT_DATE + p_days_ahead
    AND c.end_date >= CURRENT_DATE
  ORDER BY c.end_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get folder path
CREATE OR REPLACE FUNCTION get_folder_path(p_folder_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_path TEXT := '';
  v_current_id UUID := p_folder_id;
  v_parent_id UUID;
  v_name VARCHAR;
BEGIN
  WHILE v_current_id IS NOT NULL LOOP
    SELECT parent_id, name INTO v_parent_id, v_name
    FROM document_folders
    WHERE id = v_current_id;
    
    IF v_path = '' THEN
      v_path := v_name;
    ELSE
      v_path := v_name || '/' || v_path;
    END IF;
    
    v_current_id := v_parent_id;
  END LOOP;
  
  RETURN '/' || v_path;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to calculate folder size
CREATE OR REPLACE FUNCTION get_folder_size(p_folder_id UUID)
RETURNS BIGINT AS $$
DECLARE
  v_size BIGINT := 0;
BEGIN
  -- Get size of documents directly in this folder
  SELECT COALESCE(SUM(file_size), 0) INTO v_size
  FROM documents
  WHERE folder_id = p_folder_id;
  
  -- Add size of subfolders recursively
  SELECT v_size + COALESCE(SUM(get_folder_size(id)), 0) INTO v_size
  FROM document_folders
  WHERE parent_id = p_folder_id;
  
  RETURN v_size;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get pending approvals for a user
CREATE OR REPLACE FUNCTION get_pending_approvals(p_user_id UUID)
RETURNS TABLE (
  request_id UUID,
  workflow_name VARCHAR,
  record_type VARCHAR,
  record_title VARCHAR,
  record_amount DECIMAL,
  submitted_by_name VARCHAR,
  submitted_at TIMESTAMPTZ,
  current_step INTEGER,
  total_steps INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ar.id,
    ar.workflow_name,
    ar.record_type,
    ar.record_title,
    ar.record_amount,
    ar.submitted_by_name,
    ar.submitted_at,
    ar.current_step,
    ar.total_steps
  FROM approval_requests ar
  JOIN approval_steps ast ON ast.workflow_id = ar.workflow_id 
    AND ast.step_order = ar.current_step
  WHERE ar.status IN ('pending', 'in_progress')
    AND (
      ast.approver_id = p_user_id
      OR (ast.approver_type = 'role' AND ast.approver_id IN (
        SELECT role_id FROM user_roles WHERE user_id = p_user_id
      ))
    )
  ORDER BY ar.submitted_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================
-- TRIGGERS
-- =============================================================

-- Update contract status based on dates
CREATE OR REPLACE FUNCTION update_contract_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_date IS NOT NULL AND NEW.end_date < CURRENT_DATE AND NEW.status = 'active' THEN
    NEW.status := 'expired';
  END IF;
  
  IF NEW.start_date <= CURRENT_DATE AND NEW.status = 'pending' THEN
    NEW.status := 'active';
  END IF;
  
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_contract_status
  BEFORE UPDATE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_contract_status();

-- Update document version on edit
CREATE OR REPLACE FUNCTION update_document_version()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.file_url <> NEW.file_url THEN
    -- Archive old version
    INSERT INTO document_versions (document_id, version, file_url, file_size, uploaded_by)
    VALUES (OLD.id, OLD.version, OLD.file_url, OLD.file_size, OLD.uploaded_by);
    
    -- Increment version
    NEW.version := OLD.version + 1;
  END IF;
  
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_document_version
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_document_version();

-- Log contract activities
CREATE OR REPLACE FUNCTION log_contract_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO contract_activities (contract_id, action, details)
    VALUES (NEW.id, 'created', jsonb_build_object('title', NEW.title, 'status', NEW.status));
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status <> NEW.status THEN
      INSERT INTO contract_activities (contract_id, action, details)
      VALUES (NEW.id, 'status_changed', jsonb_build_object('from', OLD.status, 'to', NEW.status));
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_contract_activity
  AFTER INSERT OR UPDATE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION log_contract_activity();

-- =============================================================
-- SEED DATA: Default templates
-- =============================================================

-- Note: These would be inserted per-org when they first access contracts
-- Example template structure for reference:
/*
INSERT INTO contract_templates (org_id, name, description, content, variables, category) VALUES
(
  'org_id_here',
  'Service Agreement',
  'Standard service agreement template',
  '<h1>Service Agreement</h1><p>This agreement is made between {{company_name}} and {{client_name}}...</p>',
  '[{"name": "company_name", "type": "text", "default": ""}, {"name": "client_name", "type": "text", "default": ""}]'::jsonb,
  'Services'
);
*/
