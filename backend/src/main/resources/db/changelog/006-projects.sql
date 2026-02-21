-- Phase 6: Projects
-- Tables: projects, project_date_ranges, project_resources, project_products

CREATE SEQUENCE IF NOT EXISTS seq_project_number START 1;

CREATE TABLE projects (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_id       UUID REFERENCES clients(id) ON DELETE SET NULL,
    project_number  VARCHAR(50) NOT NULL,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    status          VARCHAR(30) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','in_progress','completed','cancelled')),
    priority        VARCHAR(20) DEFAULT 'normal'
                    CHECK (priority IN ('low','normal','high','urgent')),
    venue_name      VARCHAR(255),
    location        JSONB,
    onsite_contact  JSONB,
    total_billable      NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_cost          NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_profit        NUMERIC(12,2) NOT NULL DEFAULT 0,
    external_accounting_id VARCHAR(100),
    source          VARCHAR(50)
                    CHECK (source IS NULL OR source IN ('website_form','referral','repeat_client','manual','api')),
    inbound_request_id UUID,
    custom_fields   JSONB NOT NULL DEFAULT '{}',
    created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_projects_org ON projects(organization_id);
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(organization_id, status);
CREATE INDEX idx_projects_number ON projects(organization_id, project_number);
CREATE INDEX idx_projects_custom ON projects USING GIN (custom_fields);

CREATE TABLE project_date_ranges (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    date_start      DATE NOT NULL,
    date_end        DATE NOT NULL,
    label           VARCHAR(100),
    rate_multiplier NUMERIC(5,2) NOT NULL DEFAULT 1.00,
    notes           TEXT,
    display_order   INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (date_end >= date_start),
    CHECK (rate_multiplier >= 0)
);

CREATE INDEX idx_project_dates_project ON project_date_ranges(project_id);
CREATE INDEX idx_project_dates_range ON project_date_ranges(date_start, date_end);
CREATE INDEX idx_project_dates_org ON project_date_ranges(organization_id);

CREATE TABLE project_resources (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    resource_id     UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    role            VARCHAR(100),
    bill_rate       NUMERIC(10,2),
    pay_rate        NUMERIC(10,2),
    rate_unit       VARCHAR(20) DEFAULT 'day'
                    CHECK (rate_unit IN ('day','hour','flat','week')),
    per_diem        NUMERIC(10,2),
    date_range_ids  UUID[],
    status          VARCHAR(30) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','confirmed','declined','cancelled')),
    confirmed_at    TIMESTAMPTZ,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_proj_resources_project ON project_resources(project_id);
CREATE INDEX idx_proj_resources_resource ON project_resources(resource_id);
CREATE INDEX idx_proj_resources_org ON project_resources(organization_id);

CREATE TABLE project_products (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
    vendor_id       UUID REFERENCES vendors(id) ON DELETE SET NULL,
    quantity        NUMERIC(10,2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
    bill_rate       NUMERIC(10,2),
    cost_rate       NUMERIC(10,2),
    rate_unit       VARCHAR(20) DEFAULT 'day'
                    CHECK (rate_unit IN ('day','each','flat','week')),
    status          VARCHAR(30) NOT NULL DEFAULT 'requested'
                    CHECK (status IN ('requested','reserved','checked_out','returned','lost','consumed')),
    checked_out_at  TIMESTAMPTZ,
    returned_at     TIMESTAMPTZ,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_proj_products_project ON project_products(project_id);
CREATE INDEX idx_proj_products_product ON project_products(product_id);
CREATE INDEX idx_proj_products_vendor ON project_products(vendor_id);
CREATE INDEX idx_proj_products_item ON project_products(inventory_item_id);
CREATE INDEX idx_proj_products_org ON project_products(organization_id);

SELECT fn_create_updated_at_trigger('projects');
SELECT fn_create_updated_at_trigger('project_resources');
SELECT fn_create_updated_at_trigger('project_products');
