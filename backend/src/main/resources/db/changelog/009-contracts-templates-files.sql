--liquibase formatted sql
--changeset asap:009-contracts-templates-files

-- § Contracts
CREATE TABLE contracts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id      UUID REFERENCES projects(id) ON DELETE SET NULL,
    client_id       UUID REFERENCES clients(id) ON DELETE SET NULL,
    resource_id     UUID REFERENCES resources(id) ON DELETE SET NULL,
    vendor_id       UUID REFERENCES vendors(id) ON DELETE SET NULL,
    contract_type   VARCHAR(50) NOT NULL
                    CHECK (contract_type IN ('service_agreement','rental_agreement','subcontractor','nda','other')),
    title           VARCHAR(255) NOT NULL,
    template_content TEXT,
    generated_file_url TEXT,
    status          VARCHAR(30) NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','sent','viewed','signed','expired','cancelled')),
    sent_at         TIMESTAMPTZ,
    signed_at       TIMESTAMPTZ,
    signed_file_url TEXT,
    signing_provider VARCHAR(50),
    external_signing_id VARCHAR(255),
    expires_at      DATE,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_contracts_org ON contracts(organization_id);
CREATE INDEX idx_contracts_project ON contracts(project_id);
CREATE INDEX idx_contracts_status ON contracts(organization_id, status);
CREATE INDEX idx_contracts_vendor ON contracts(vendor_id);

-- § File Attachments
CREATE TABLE file_attachments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    entity_type     VARCHAR(50) NOT NULL,
    entity_id       UUID NOT NULL,
    file_name       VARCHAR(500) NOT NULL,
    file_url        TEXT NOT NULL,
    file_size_bytes BIGINT,
    mime_type       VARCHAR(100),
    category        VARCHAR(100),
    uploaded_by     UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_files_entity ON file_attachments(entity_type, entity_id);
CREATE INDEX idx_files_org ON file_attachments(organization_id);

-- § Templates
CREATE TABLE templates (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    template_type   VARCHAR(30) NOT NULL
                    CHECK (template_type IN ('inbound_form','quote','project','contract')),
    is_client_facing BOOLEAN NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    settings        JSONB NOT NULL DEFAULT '{}',
    created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_templates_org ON templates(organization_id);
CREATE INDEX idx_templates_type ON templates(organization_id, template_type);

CREATE TABLE template_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    template_id     UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    item_type       VARCHAR(30) NOT NULL
                    CHECK (item_type IN ('product','resource_role','line_item','form_field','date_range','fee')),
    product_id      UUID REFERENCES products(id) ON DELETE SET NULL,
    category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
    label           VARCHAR(255) NOT NULL,
    description     TEXT,
    default_quantity    NUMERIC(10,2),
    default_unit_price  NUMERIC(12,2),
    default_unit        VARCHAR(30),
    field_type      VARCHAR(30),
    field_options   JSONB,
    is_required     BOOLEAN NOT NULL DEFAULT FALSE,
    depends_on_item_id UUID REFERENCES template_items(id) ON DELETE SET NULL,
    depends_on_value   TEXT,
    section         VARCHAR(100),
    display_order   INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_template_items_template ON template_items(template_id);
CREATE INDEX idx_template_items_org ON template_items(organization_id);

-- Link inbound_requests to templates
ALTER TABLE inbound_requests ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES templates(id) ON DELETE SET NULL;
