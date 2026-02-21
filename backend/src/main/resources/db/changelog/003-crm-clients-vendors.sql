-- ============================================================================
-- ASAP Platform -- Phase 3: CRM (Clients & Vendors)
-- ============================================================================

-- §6. CLIENTS
CREATE TABLE clients (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name                    VARCHAR(255) NOT NULL,
    type                    VARCHAR(30) NOT NULL DEFAULT 'company'
                            CHECK (type IN ('company','individual')),
    email                   VARCHAR(320),
    phone                   VARCHAR(50),
    website                 TEXT,
    billing_address         JSONB,
    shipping_address        JSONB,
    notes                   TEXT,
    external_accounting_id  VARCHAR(100),
    pricing_tier            VARCHAR(50),
    custom_fields           JSONB NOT NULL DEFAULT '{}',
    is_active               BOOLEAN NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_clients_org ON clients(organization_id);
CREATE INDEX idx_clients_name ON clients(organization_id, name);
CREATE INDEX idx_clients_custom ON clients USING GIN (custom_fields);

CREATE TABLE client_contacts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_id       UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100),
    email           VARCHAR(320),
    phone           VARCHAR(50),
    role            VARCHAR(100),
    is_primary      BOOLEAN NOT NULL DEFAULT FALSE,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_client_contacts_client ON client_contacts(client_id);
CREATE INDEX idx_client_contacts_org ON client_contacts(organization_id);

SELECT fn_create_updated_at_trigger('clients');

-- §7. VENDORS
CREATE TABLE vendors (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name                    VARCHAR(255) NOT NULL,
    type                    VARCHAR(30) NOT NULL DEFAULT 'company'
                            CHECK (type IN ('company','individual')),
    email                   VARCHAR(320),
    phone                   VARCHAR(50),
    website                 TEXT,
    billing_address         JSONB,
    notes                   TEXT,
    external_accounting_id  VARCHAR(100),
    payment_info            JSONB NOT NULL DEFAULT '{}',
    custom_fields           JSONB NOT NULL DEFAULT '{}',
    is_active               BOOLEAN NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vendors_org ON vendors(organization_id);
CREATE INDEX idx_vendors_name ON vendors(organization_id, name);
CREATE INDEX idx_vendors_custom ON vendors USING GIN (custom_fields);

CREATE TABLE vendor_contacts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vendor_id       UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100),
    email           VARCHAR(320),
    phone           VARCHAR(50),
    role            VARCHAR(100),
    is_primary      BOOLEAN NOT NULL DEFAULT FALSE,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vendor_contacts_vendor ON vendor_contacts(vendor_id);
CREATE INDEX idx_vendor_contacts_org ON vendor_contacts(organization_id);

SELECT fn_create_updated_at_trigger('vendors');
