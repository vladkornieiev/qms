--liquibase formatted sql

--changeset app:008-1
CREATE SEQUENCE seq_invoice_number START 1;

CREATE TABLE invoices (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    quote_id        UUID REFERENCES quotes(id) ON DELETE SET NULL,
    project_id      UUID REFERENCES projects(id) ON DELETE SET NULL,
    client_id       UUID NOT NULL REFERENCES clients(id) ON DELETE SET NULL,
    invoice_number  VARCHAR(50) NOT NULL,
    status          VARCHAR(30) NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','sent','viewed','partially_paid','paid','overdue','void')),
    issued_date     DATE,
    due_date        DATE,
    paid_at         TIMESTAMPTZ,
    subtotal        NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_amount      NUMERIC(12,2) NOT NULL DEFAULT 0,
    total           NUMERIC(12,2) NOT NULL DEFAULT 0,
    amount_paid     NUMERIC(12,2) NOT NULL DEFAULT 0,
    balance_due     NUMERIC(12,2) NOT NULL DEFAULT 0,
    currency        VARCHAR(3) NOT NULL DEFAULT 'USD',
    external_accounting_id VARCHAR(100),
    notes           TEXT,
    internal_notes  TEXT,
    terms           TEXT,
    custom_fields   JSONB NOT NULL DEFAULT '{}',
    created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_invoices_org ON invoices(organization_id);
CREATE INDEX idx_invoices_client ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
SELECT fn_create_updated_at_trigger('invoices');

--changeset app:008-2
CREATE TABLE invoice_line_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    invoice_id      UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    quote_line_item_id UUID REFERENCES quote_line_items(id) ON DELETE SET NULL,
    product_id      UUID REFERENCES products(id) ON DELETE SET NULL,
    category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
    description     VARCHAR(500) NOT NULL,
    date_start      DATE,
    date_end        DATE,
    quantity        NUMERIC(10,2) NOT NULL DEFAULT 1,
    unit_price      NUMERIC(12,2) NOT NULL DEFAULT 0,
    unit            VARCHAR(30) DEFAULT 'each'
                    CHECK (unit IN ('each','day','hour','week','month','flat')),
    discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_rate        NUMERIC(5,2) NOT NULL DEFAULT 0,
    line_total      NUMERIC(12,2) NOT NULL DEFAULT 0,
    section         VARCHAR(100),
    display_order   INT NOT NULL DEFAULT 0,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_invoice_line_items_invoice ON invoice_line_items(invoice_id);

--changeset app:008-3
CREATE TABLE payments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    invoice_id      UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    amount          NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    currency        VARCHAR(3) NOT NULL DEFAULT 'USD',
    payment_method  VARCHAR(50)
                    CHECK (payment_method IS NULL OR
                           payment_method IN ('credit_card','bank_transfer','check','cash','paypal','other')),
    payment_reference VARCHAR(255),
    payment_date    DATE NOT NULL,
    notes           TEXT,
    external_payment_id VARCHAR(100),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_org ON payments(organization_id);
