-- Phase 5: Resources
-- Tables: resources, resource_availability, resource_payouts

CREATE TABLE resources (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    type            VARCHAR(30) NOT NULL DEFAULT 'contractor'
                    CHECK (type IN ('contractor','employee')),
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(320),
    phone           VARCHAR(50),
    avatar_url      TEXT,
    location_city       VARCHAR(100),
    location_state      VARCHAR(100),
    location_country    VARCHAR(100),
    default_day_rate    NUMERIC(10,2),
    default_hour_rate   NUMERIC(10,2),
    currency            VARCHAR(3) DEFAULT 'USD',
    custom_fields       JSONB NOT NULL DEFAULT '{}',
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_resources_org ON resources(organization_id);
CREATE INDEX idx_resources_type ON resources(organization_id, type);
CREATE INDEX idx_resources_location ON resources(organization_id, location_country, location_state, location_city);
CREATE INDEX idx_resources_custom ON resources USING GIN (custom_fields);

CREATE TABLE resource_availability (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    resource_id     UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    date_start      DATE NOT NULL,
    date_end        DATE NOT NULL,
    status          VARCHAR(30) NOT NULL DEFAULT 'available'
                    CHECK (status IN ('available','unavailable','tentative','booked')),
    reason          TEXT,
    project_id      UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (date_end >= date_start)
);

CREATE INDEX idx_resource_avail_resource ON resource_availability(resource_id);
CREATE INDEX idx_resource_avail_dates ON resource_availability(date_start, date_end);
CREATE INDEX idx_resource_avail_org ON resource_availability(organization_id);

CREATE TABLE resource_payouts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    resource_id     UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    project_id      UUID,
    description     VARCHAR(500),
    amount          NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    currency        VARCHAR(3) NOT NULL DEFAULT 'USD',
    status          VARCHAR(30) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','paid','cancelled')),
    approved_at     TIMESTAMPTZ,
    approved_by     UUID REFERENCES users(id) ON DELETE SET NULL,
    payment_method  VARCHAR(50)
                    CHECK (payment_method IS NULL OR
                           payment_method IN ('bank_transfer','check','cash','paypal','payroll','other')),
    payment_reference VARCHAR(255),
    paid_at         TIMESTAMPTZ,
    period_start    DATE,
    period_end      DATE,
    external_accounting_id VARCHAR(100),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payouts_org ON resource_payouts(organization_id);
CREATE INDEX idx_payouts_resource ON resource_payouts(resource_id);
CREATE INDEX idx_payouts_project ON resource_payouts(project_id);
CREATE INDEX idx_payouts_status ON resource_payouts(organization_id, status);
CREATE INDEX idx_payouts_paid ON resource_payouts(organization_id, paid_at);

SELECT fn_create_updated_at_trigger('resources');
SELECT fn_create_updated_at_trigger('resource_payouts');
