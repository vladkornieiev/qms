-- Phase 11: Automation & Integrations
-- Tables: workflow_rules, integrations, integration_sync_log

-- §19. WORKFLOW / AUTOMATION RULES
CREATE TABLE workflow_rules (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    trigger_entity  VARCHAR(50) NOT NULL,
    trigger_event   VARCHAR(50) NOT NULL,
    trigger_conditions JSONB NOT NULL DEFAULT '{}',
    actions         JSONB NOT NULL DEFAULT '[]',
    execution_order INT NOT NULL DEFAULT 0,
    created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_workflow_rules_org ON workflow_rules(organization_id);
CREATE INDEX idx_workflow_rules_trigger ON workflow_rules(trigger_entity, trigger_event);

SELECT fn_create_updated_at_trigger('workflow_rules');

-- §20. INTEGRATIONS (Xero, QuickBooks, Stripe, DocuSign…)
CREATE TABLE integrations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    provider        VARCHAR(50) NOT NULL,
    status          VARCHAR(30) NOT NULL DEFAULT 'connected'
                    CHECK (status IN ('connected','disconnected','error')),
    credentials     JSONB NOT NULL DEFAULT '{}',
    settings        JSONB NOT NULL DEFAULT '{}',
    last_synced_at  TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (organization_id, provider)
);

SELECT fn_create_updated_at_trigger('integrations');

CREATE TABLE integration_sync_log (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    integration_id  UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
    direction       VARCHAR(10) NOT NULL CHECK (direction IN ('push','pull')),
    entity_type     VARCHAR(50) NOT NULL,
    entity_id       UUID,
    external_id     VARCHAR(255),
    status          VARCHAR(30) NOT NULL
                    CHECK (status IN ('success','error','skipped')),
    error_message   TEXT,
    payload         JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sync_log_integration ON integration_sync_log(integration_id);
CREATE INDEX idx_sync_log_org ON integration_sync_log(organization_id);
