-- ════════════════════════════════════════════════════════
--  NexusDesk MSP Platform — Database Schema
--  PostgreSQL 16
-- ════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Users & Auth ──
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'technician' CHECK (role IN ('admin', 'manager', 'technician', 'dispatcher', 'viewer')),
    avatar_url TEXT,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    mfa_enabled BOOLEAN DEFAULT false,
    mfa_secret VARCHAR(255),
    last_login TIMESTAMPTZ,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Clients / CRM ──
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    short_code VARCHAR(10) UNIQUE,
    client_type VARCHAR(50) NOT NULL DEFAULT 'managed' CHECK (client_type IN ('managed', 'break_fix', 'project', 'prospect')),
    industry VARCHAR(100),
    website VARCHAR(255),
    phone VARCHAR(50),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    zip VARCHAR(20),
    country VARCHAR(50) DEFAULT 'US',
    mrr DECIMAL(12,2) DEFAULT 0,
    health_score INT DEFAULT 100 CHECK (health_score BETWEEN 0 AND 100),
    sla_tier VARCHAR(50) DEFAULT 'standard' CHECK (sla_tier IN ('basic', 'standard', 'premium', 'enterprise')),
    contract_start DATE,
    contract_end DATE,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE client_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    flag_name VARCHAR(100) NOT NULL,
    flag_color VARCHAR(7) DEFAULT '#578AFF',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    role_title VARCHAR(100),
    is_primary BOOLEAN DEFAULT false,
    is_technical BOOLEAN DEFAULT false,
    can_approve BOOLEAN DEFAULT false,
    portal_access BOOLEAN DEFAULT false,
    portal_password_hash VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Tickets / Helpdesk ──
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number SERIAL UNIQUE,
    subject VARCHAR(500) NOT NULL,
    description TEXT,
    client_id UUID NOT NULL REFERENCES clients(id),
    contact_id UUID REFERENCES contacts(id),
    assigned_to UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    priority VARCHAR(10) NOT NULL DEFAULT 'P3' CHECK (priority IN ('P1', 'P2', 'P3', 'P4')),
    status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting', 'on_hold', 'resolved', 'closed')),
    category VARCHAR(100),
    subcategory VARCHAR(100),
    source VARCHAR(50) DEFAULT 'manual' CHECK (source IN ('manual', 'email', 'portal', 'phone', 'monitoring', 'api')),
    sla_response_due TIMESTAMPTZ,
    sla_resolution_due TIMESTAMPTZ,
    sla_responded_at TIMESTAMPTZ,
    sla_resolved_at TIMESTAMPTZ,
    sla_breached BOOLEAN DEFAULT false,
    time_spent_minutes INT DEFAULT 0,
    is_billable BOOLEAN DEFAULT true,
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}',
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ticket_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    contact_id UUID REFERENCES contacts(id),
    body TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    is_resolution BOOLEAN DEFAULT false,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ticket_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES ticket_comments(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ticket_time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    minutes INT NOT NULL,
    description TEXT,
    is_billable BOOLEAN DEFAULT true,
    rate DECIMAL(10,2),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Assets / Devices ──
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id),
    hostname VARCHAR(100) NOT NULL,
    asset_type VARCHAR(50) NOT NULL CHECK (asset_type IN ('server', 'workstation', 'laptop', 'firewall', 'switch', 'ap', 'nas', 'printer', 'phone', 'other')),
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    os VARCHAR(100),
    os_version VARCHAR(50),
    ip_address INET,
    mac_address MACADDR,
    status VARCHAR(50) DEFAULT 'online' CHECK (status IN ('online', 'offline', 'warning', 'decommissioned')),
    location VARCHAR(255),
    purchase_date DATE,
    warranty_expiry DATE,
    rmm_agent_id VARCHAR(255),
    notes TEXT,
    custom_fields JSONB DEFAULT '{}',
    last_seen TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Billing / Invoices ──
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number SERIAL UNIQUE,
    client_id UUID NOT NULL REFERENCES clients(id),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'outstanding', 'paid', 'overdue', 'cancelled', 'void')),
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    amount_paid DECIMAL(12,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    notes TEXT,
    is_recurring BOOLEAN DEFAULT false,
    recurring_interval VARCHAR(20) CHECK (recurring_interval IN ('monthly', 'quarterly', 'annually')),
    paid_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE invoice_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    total DECIMAL(12,2) NOT NULL,
    sort_order INT DEFAULT 0,
    ticket_id UUID REFERENCES tickets(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Contracts ──
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id),
    name VARCHAR(255) NOT NULL,
    contract_type VARCHAR(50) DEFAULT 'managed' CHECK (contract_type IN ('managed', 'break_fix', 'project', 'retainer', 'sla')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'expiring', 'expired', 'cancelled')),
    start_date DATE NOT NULL,
    end_date DATE,
    value DECIMAL(12,2),
    billing_cycle VARCHAR(20) DEFAULT 'monthly',
    auto_renew BOOLEAN DEFAULT false,
    document_path TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Knowledge Base ──
CREATE TABLE kb_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    category VARCHAR(100),
    tags TEXT[],
    is_public BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    author_id UUID REFERENCES users(id),
    view_count INT DEFAULT 0,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Integrations ──
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    status VARCHAR(50) DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error', 'pending')),
    config JSONB DEFAULT '{}',
    credentials_encrypted TEXT,
    last_sync TIMESTAMPTZ,
    sync_frequency VARCHAR(20) DEFAULT '5m',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Audit Log ──
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Notifications ──
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'critical', 'success')),
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Custom Fields Definition ──
CREATE TABLE custom_field_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('ticket', 'client', 'contact', 'asset', 'invoice')),
    field_name VARCHAR(100) NOT NULL,
    field_label VARCHAR(100) NOT NULL,
    field_type VARCHAR(50) NOT NULL CHECK (field_type IN ('text', 'textarea', 'number', 'date', 'select', 'multiselect', 'checkbox', 'url', 'email')),
    options JSONB DEFAULT '[]',
    is_required BOOLEAN DEFAULT false,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════
--  INDEXES
-- ══════════════════════════════════════
CREATE INDEX idx_tickets_client ON tickets(client_id);
CREATE INDEX idx_tickets_assigned ON tickets(assigned_to);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_created ON tickets(created_at DESC);
CREATE INDEX idx_tickets_sla_breach ON tickets(sla_breached) WHERE sla_breached = true;

CREATE INDEX idx_contacts_client ON contacts(client_id);
CREATE INDEX idx_assets_client ON assets(client_id);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_invoices_client ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
CREATE INDEX idx_client_flags_client ON client_flags(client_id);
CREATE INDEX idx_kb_articles_category ON kb_articles(category);
CREATE INDEX idx_contracts_client ON contracts(client_id);
CREATE INDEX idx_contracts_status ON contracts(status);

-- ══════════════════════════════════════
--  FUNCTIONS & TRIGGERS
-- ══════════════════════════════════════

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_clients_updated BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_contacts_updated BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_tickets_updated BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_assets_updated BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_invoices_updated BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_contracts_updated BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_integrations_updated BEFORE UPDATE ON integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-calculate SLA due dates on ticket insert
CREATE OR REPLACE FUNCTION calculate_sla_dates()
RETURNS TRIGGER AS $$
BEGIN
    CASE NEW.priority
        WHEN 'P1' THEN
            NEW.sla_response_due = NOW() + INTERVAL '15 minutes';
            NEW.sla_resolution_due = NOW() + INTERVAL '1 hour';
        WHEN 'P2' THEN
            NEW.sla_response_due = NOW() + INTERVAL '1 hour';
            NEW.sla_resolution_due = NOW() + INTERVAL '4 hours';
        WHEN 'P3' THEN
            NEW.sla_response_due = NOW() + INTERVAL '4 hours';
            NEW.sla_resolution_due = NOW() + INTERVAL '8 hours';
        WHEN 'P4' THEN
            NEW.sla_response_due = NOW() + INTERVAL '8 hours';
            NEW.sla_resolution_due = NOW() + INTERVAL '24 hours';
    END CASE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ticket_sla BEFORE INSERT ON tickets FOR EACH ROW EXECUTE FUNCTION calculate_sla_dates();
