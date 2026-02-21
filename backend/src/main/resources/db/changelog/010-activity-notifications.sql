--liquibase formatted sql
--changeset asap:010-activity-notifications

-- § Communication Log
CREATE TABLE communication_log (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    entity_type     VARCHAR(50),
    entity_id       UUID,
    channel         VARCHAR(30) NOT NULL
                    CHECK (channel IN ('email','sms','push','in_app','webhook')),
    direction       VARCHAR(10) NOT NULL DEFAULT 'outbound'
                    CHECK (direction IN ('outbound','inbound')),
    recipient_name  VARCHAR(255),
    recipient_email VARCHAR(320),
    recipient_phone VARCHAR(50),
    subject         VARCHAR(500),
    body_preview    TEXT,
    status          VARCHAR(30) NOT NULL DEFAULT 'sent'
                    CHECK (status IN ('queued','sent','delivered','opened','bounced','failed')),
    external_message_id VARCHAR(255),
    sent_by         UUID REFERENCES users(id) ON DELETE SET NULL,
    sent_at         TIMESTAMPTZ DEFAULT now(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_comms_org ON communication_log(organization_id);
CREATE INDEX idx_comms_entity ON communication_log(entity_type, entity_id);
CREATE INDEX idx_comms_sent ON communication_log(organization_id, sent_at DESC);

-- § Activity Log
CREATE TABLE activity_log (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    entity_type     VARCHAR(50) NOT NULL,
    entity_id       UUID NOT NULL,
    action          VARCHAR(50) NOT NULL,
    changes         JSONB,
    metadata        JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_org ON activity_log(organization_id);
CREATE INDEX idx_activity_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_created ON activity_log(organization_id, created_at DESC);

-- § Notifications
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    body            TEXT,
    entity_type     VARCHAR(50),
    entity_id       UUID,
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    read_at         TIMESTAMPTZ,
    channel         VARCHAR(30) NOT NULL DEFAULT 'in_app'
                    CHECK (channel IN ('in_app','email','sms','push')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_org ON notifications(organization_id);
