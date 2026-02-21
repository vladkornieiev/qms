-- ============================================================================
-- ASAP Platform -- Phase 1 Initial Schema
-- PostgreSQL 15+
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Extensions
-- ----------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- Utility functions (updated_at triggers)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_create_updated_at_trigger(table_name TEXT)
RETURNS VOID AS $$
BEGIN
    EXECUTE format(
        'CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON %I
         FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at()',
        table_name, table_name
    );
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- Sequences for human-readable IDs
-- ----------------------------------------------------------------------------

CREATE SEQUENCE seq_project_number START 1;
CREATE SEQUENCE seq_quote_number   START 1;
CREATE SEQUENCE seq_invoice_number START 1;

-- ============================================================================
-- Organizations
-- ============================================================================

CREATE TABLE organizations (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name         VARCHAR(255) NOT NULL,
    slug         VARCHAR(100) NOT NULL UNIQUE,
    logo_url     TEXT,
    settings     JSONB NOT NULL DEFAULT '{}',
    billing_info JSONB NOT NULL DEFAULT '{}',
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- Users
-- ============================================================================

CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email         VARCHAR(320) NOT NULL UNIQUE,
    password_hash TEXT,
    first_name    VARCHAR(100),
    last_name     VARCHAR(100),
    phone         VARCHAR(50),
    avatar_url    TEXT,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- Organization Members
-- ============================================================================

CREATE TABLE organization_members (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role            VARCHAR(50) NOT NULL DEFAULT 'member'
                    CHECK (role IN ('platform_admin','owner','admin','member','viewer','accountant')),
    invited_at      TIMESTAMPTZ,
    joined_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (organization_id, user_id)
);

CREATE INDEX idx_org_members_org  ON organization_members(organization_id);
CREATE INDEX idx_org_members_user ON organization_members(user_id);

-- ============================================================================
-- Auth: user_details
-- ============================================================================

CREATE TABLE user_details (
    id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email                    VARCHAR(320) NOT NULL,
    password                 TEXT,
    two_factor_auth_secret   TEXT,
    two_factor_auth_enabled  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at               TIMESTAMPTZ,
    updated_at               TIMESTAMPTZ
);

-- ============================================================================
-- Auth: login_links
-- ============================================================================

CREATE TABLE login_links (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email      VARCHAR(320) NOT NULL,
    token      VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);

-- ============================================================================
-- Auth: password_reset_tokens
-- ============================================================================

CREATE TABLE password_reset_tokens (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email      VARCHAR(320) NOT NULL,
    token      VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);

-- ============================================================================
-- Auth: one_time_passwords
-- ============================================================================

CREATE TABLE one_time_passwords (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email      VARCHAR(320) NOT NULL,
    code       VARCHAR(10) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);

-- ============================================================================
-- Auth: user_auth_methods
-- ============================================================================

CREATE TABLE user_auth_methods (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email              VARCHAR(320) NOT NULL UNIQUE,
    password_enabled   BOOLEAN NOT NULL DEFAULT TRUE,
    login_link_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    google_enabled     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at         TIMESTAMPTZ,
    updated_at         TIMESTAMPTZ
);

-- ============================================================================
-- Auth: user_email_preferences
-- ============================================================================

CREATE TABLE user_email_preferences (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       VARCHAR(320) NOT NULL,
    preferences JSONB NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ,
    updated_at  TIMESTAMPTZ
);

-- ============================================================================
-- Rate limiting (bucket4j)
-- ============================================================================

CREATE TABLE bucket (
    id    BIGINT PRIMARY KEY,
    state BYTEA NOT NULL
);

-- ============================================================================
-- ShedLock (distributed scheduling locks)
-- ============================================================================

CREATE TABLE shedlock (
    name       VARCHAR(64)  NOT NULL PRIMARY KEY,
    lock_until TIMESTAMPTZ  NOT NULL,
    locked_at  TIMESTAMPTZ  NOT NULL,
    locked_by  VARCHAR(255) NOT NULL
);

-- ============================================================================
-- Triggers
-- ============================================================================

SELECT fn_create_updated_at_trigger('organizations');
SELECT fn_create_updated_at_trigger('users');
