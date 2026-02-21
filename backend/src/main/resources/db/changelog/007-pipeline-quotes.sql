--liquibase formatted sql

--changeset app:007-1
CREATE TABLE inbound_requests (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    submitter_name  VARCHAR(255),
    submitter_email VARCHAR(320),
    submitter_phone VARCHAR(50),
    submitter_company VARCHAR(255),
    client_id       UUID REFERENCES clients(id) ON DELETE SET NULL,
    template_id     UUID,
    form_data       JSONB NOT NULL DEFAULT '{}',
    status          VARCHAR(30) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','reviewing','approved','denied')),
    reviewed_by     UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at     TIMESTAMPTZ,
    denial_reason   TEXT,
    project_id      UUID REFERENCES projects(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_inbound_requests_org ON inbound_requests(organization_id);
CREATE INDEX idx_inbound_requests_status ON inbound_requests(status);
SELECT fn_create_updated_at_trigger('inbound_requests');

--changeset app:007-2
CREATE SEQUENCE seq_quote_number START 1;

CREATE TABLE quotes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id      UUID REFERENCES projects(id) ON DELETE SET NULL,
    client_id       UUID NOT NULL REFERENCES clients(id) ON DELETE SET NULL,
    quote_number    VARCHAR(50) NOT NULL,
    version         INT NOT NULL DEFAULT 1,
    title           VARCHAR(255),
    status          VARCHAR(30) NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','sent','viewed','approved','declined','expired','converted')),
    issued_date     DATE,
    valid_until     DATE,
    approved_at     TIMESTAMPTZ,
    subtotal        NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_amount      NUMERIC(12,2) NOT NULL DEFAULT 0,
    total           NUMERIC(12,2) NOT NULL DEFAULT 0,
    currency        VARCHAR(3) NOT NULL DEFAULT 'USD',
    notes           TEXT,
    internal_notes  TEXT,
    terms           TEXT,
    external_accounting_id VARCHAR(100),
    approved_by_name    VARCHAR(255),
    approved_by_email   VARCHAR(320),
    approval_signature_url TEXT,
    custom_fields   JSONB NOT NULL DEFAULT '{}',
    created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_quotes_org_number_version ON quotes(organization_id, quote_number, version);
CREATE INDEX idx_quotes_org ON quotes(organization_id);
CREATE INDEX idx_quotes_client ON quotes(client_id);
CREATE INDEX idx_quotes_status ON quotes(status);
SELECT fn_create_updated_at_trigger('quotes');

--changeset app:007-3
CREATE TABLE quote_line_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    quote_id        UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    product_id      UUID REFERENCES products(id) ON DELETE SET NULL,
    resource_id     UUID REFERENCES resources(id) ON DELETE SET NULL,
    category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
    description     VARCHAR(500) NOT NULL,
    date_start      DATE,
    date_end        DATE,
    quantity        NUMERIC(10,2) NOT NULL DEFAULT 1,
    unit_price      NUMERIC(12,2) NOT NULL DEFAULT 0,
    unit            VARCHAR(30) DEFAULT 'each'
                    CHECK (unit IN ('each','day','hour','week','month','flat')),
    discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (discount_percent BETWEEN 0 AND 100),
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_rate        NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (tax_rate >= 0),
    line_total      NUMERIC(12,2) NOT NULL DEFAULT 0,
    cost_per_unit   NUMERIC(12,2),
    cost_total      NUMERIC(12,2),
    section         VARCHAR(100),
    display_order   INT NOT NULL DEFAULT 0,
    is_visible      BOOLEAN NOT NULL DEFAULT TRUE,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quote_line_items_quote ON quote_line_items(quote_id);
