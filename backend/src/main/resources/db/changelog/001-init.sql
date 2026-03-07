-- ============================================================================
-- ASAP Platform — Generic Service / Gig-Economy Database Schema
-- PostgreSQL 15+   |   v5 (production-ready, v1-scoped)
-- ============================================================================
--
-- DESIGN PRINCIPLES:
--   1. Multi-tenant — organization_id on EVERY business table, RLS enforced
--   2. Industry-agnostic — audio rental, landscaping, party rental, staffing…
--   3. Recursive products — rig → sub-components of any depth
--   4. Generic collections — no hardcoded sub-tables; org defines own fields
--   5. Full lifecycle — inbound request → project → quote → invoice → payment
--   6. Two-sided financials — client billing IN + resource/vendor payouts OUT
--   7. Dual inventory — serialized (per-unit) + consumable (quantity per location)
--
-- DOMAIN MAP:
--   §1  Core           organizations, users, organization_members
--   §2  Tags           tag_groups, tags, entity_tags
--   §3  Custom fields  custom_field_definitions, custom_field_groups, custom_field_values
--   §5  Categories     categories
--   §6  CRM            clients, contacts, jobsites
--   §7  Vendors        vendors
--   §8  Products       products, inventory_items, stock_levels, inventory_transactions
--   §9  People         people, people_availability, people_payouts
--   §10 Projects       projects, jobs, job_people, job_products
--   §11 Pipeline       inbound_requests
--   §12 Quotes         quotes, quote_line_items
--   §13 Invoices       invoices, invoice_line_items, payments
--   §14 Contracts      contracts
--   §15 Files          file_attachments
--   §16 Templates      templates, template_items
--   §17 Comms          communication_log
--   §18 Activity       activity_log, notifications
--   §19 Integrations   integrations, integration_sync_log
--
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- §0. UTILITY: updated_at trigger + sequences
-- ============================================================================

CREATE OR REPLACE FUNCTION fn_set_updated_at()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_create_updated_at_trigger(table_name TEXT)
    RETURNS VOID AS
$$
BEGIN
    EXECUTE FORMAT(
            'CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at()',
            table_name, table_name
            );
END;
$$ LANGUAGE plpgsql;

-- Sequences for human-readable IDs (app formats: "GIG-2025-0042")
CREATE SEQUENCE seq_project_number START 1;
CREATE SEQUENCE seq_quote_number START 1;
CREATE SEQUENCE seq_invoice_number START 1;


-- ============================================================================
-- §1. ORGANIZATIONS & USERS & SECURITY
-- ============================================================================

CREATE TABLE organizations
(
    id           UUID PRIMARY KEY      DEFAULT uuid_generate_v4(),
    name         VARCHAR(255) NOT NULL,
    slug         VARCHAR(100) NOT NULL UNIQUE, -- "asap-sound", "greenscape-llc"
    logo_url     TEXT,
    -- Example: {"timezone":"America/Los_Angeles","currency":"USD","locale":"en-US",
    --           "fiscal_year_start":"01","date_format":"MM/DD/YYYY"}
    settings     JSONB        NOT NULL DEFAULT '{}',
    -- Example: {"legal_name":"ASAP Sound LLC","tax_id":"XX-XXXXXXX",
    --           "address":{"street":"123 Main","city":"LA","state":"CA","zip":"90001","country":"US"}}
    is_active    BOOLEAN               DEFAULT TRUE,
    billing_info JSONB        NOT NULL DEFAULT '{}',
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE users
(
    id                      UUID PRIMARY KEY      DEFAULT uuid_generate_v4(),
    email                   VARCHAR(320) NOT NULL UNIQUE,
    password_hash           TEXT, -- NULL for SSO-only users
    first_name              VARCHAR(100),
    last_name               VARCHAR(100),
    phone                   VARCHAR(50),
    avatar_url              TEXT,
    two_factor_auth_secret  VARCHAR(255),
    two_factor_auth_enabled BOOLEAN      NOT NULL DEFAULT FALSE,
    is_active               BOOLEAN      NOT NULL DEFAULT TRUE,
    last_login_at           TIMESTAMP,
    created_at              TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE organization_members
(
    id              UUID PRIMARY KEY     DEFAULT uuid_generate_v4(),
    organization_id UUID        NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    user_id         UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    role            VARCHAR(50) NOT NULL DEFAULT 'MEMBER'
        CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER', 'ACCOUNTANT')),
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    UNIQUE (organization_id, user_id)
);

CREATE INDEX idx_org_members_org ON organization_members (organization_id);
CREATE INDEX idx_org_members_user ON organization_members (user_id);


CREATE TABLE IF NOT EXISTS shedlock
(
    name       VARCHAR(64),
    lock_until TIMESTAMP(3) NULL,
    locked_at  TIMESTAMP(3) NULL,
    locked_by  VARCHAR(255),
    PRIMARY KEY (name)
);

CREATE TABLE IF NOT EXISTS bucket
(
    id    BIGINT PRIMARY KEY,
    state BYTEA
);

CREATE TABLE login_links
(
    id         UUID PRIMARY KEY NOT NULL,
    email      TEXT             NOT NULL,
    token      VARCHAR(255)     NOT NULL UNIQUE,
    expires_at TIMESTAMP        NOT NULL,
    created_at TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_login_links_email ON login_links (email);

CREATE TABLE one_time_passwords
(
    id         UUID PRIMARY KEY NOT NULL,
    email      TEXT             NOT NULL,
    code       VARCHAR(255)     NOT NULL UNIQUE,
    expires_at TIMESTAMP        NOT NULL,
    created_at TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_one_time_passwords_email ON one_time_passwords (email);

CREATE TABLE password_reset_tokens
(
    id         UUID PRIMARY KEY NOT NULL,
    token      VARCHAR(255)     NOT NULL UNIQUE,
    email      TEXT             NOT NULL,
    expires_at TIMESTAMP        NOT NULL,
    used       BOOLEAN          NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_password_reset_tokens_token ON password_reset_tokens (token);
CREATE INDEX idx_password_reset_tokens_email ON password_reset_tokens (email);


CREATE TABLE user_auth_methods
(
    id                 UUID PRIMARY KEY NOT NULL,
    email              TEXT             NOT NULL UNIQUE,
    password_enabled   BOOLEAN          NOT NULL DEFAULT TRUE,
    login_link_enabled BOOLEAN          NOT NULL DEFAULT TRUE,
    google_enabled     BOOLEAN          NOT NULL DEFAULT TRUE,
    created_at         TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_at_least_one_auth_method
        CHECK (
            (CASE WHEN password_enabled THEN 1 ELSE 0 END)
                + (CASE WHEN login_link_enabled THEN 1 ELSE 0 END)
                + (CASE WHEN google_enabled THEN 1 ELSE 0 END) >= 1
            )
);

CREATE INDEX idx_user_auth_methods_user_id ON user_auth_methods (email);

CREATE TABLE user_email_preferences
(
    id          UUID PRIMARY KEY NOT NULL,
    email       TEXT             NOT NULL UNIQUE,
    preferences jsonb            NOT NULL,
    created_at  TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_user_email_preferences_email ON user_email_preferences (email);

SELECT fn_create_updated_at_trigger('organizations');
SELECT fn_create_updated_at_trigger('users');
SELECT fn_create_updated_at_trigger('one_time_passwords');
SELECT fn_create_updated_at_trigger('login_links');
SELECT fn_create_updated_at_trigger('user_email_preferences');
SELECT fn_create_updated_at_trigger('user_auth_methods');

-- ============================================================================
-- §2. TAGS (Polymorphic, Org-Scoped)
-- ============================================================================
-- tag_groups organize tags into categories for structured filtering.
-- A tag can exist without a group (ungrouped / general-purpose).
--
-- Example groups + tags:
--   "Genre"    → Rock, Pop, Hip-Hop, Electronic, Country
--   "Region"   → West Coast, East Coast, Europe, Asia
--   "Priority" → VIP, Standard, New Client
--
-- Example: client "Charlie Puth" tagged with Pop (Genre) + West Coast (Region) + VIP (Priority)

CREATE TABLE tag_groups
(
    id              UUID PRIMARY KEY      DEFAULT uuid_generate_v4(),
    organization_id UUID         NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    color           VARCHAR(7),
    description     TEXT,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    UNIQUE (organization_id, name)
);

CREATE TABLE tags
(
    id              UUID PRIMARY KEY      DEFAULT uuid_generate_v4(),
    organization_id UUID         NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    color           VARCHAR(7),
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    UNIQUE (organization_id, name)
);

CREATE INDEX idx_tags_org ON tags (organization_id);

-- Which tags belong to which group (mirrors custom_field_group_members)
CREATE TABLE tag_group_members
(
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    tag_group_id    UUID NOT NULL REFERENCES tag_groups (id) ON DELETE CASCADE,
    tag_id          UUID NOT NULL REFERENCES tags (id) ON DELETE CASCADE,
    display_order   INT  NOT NULL DEFAULT 0,
    UNIQUE (tag_group_id, tag_id)
);

CREATE INDEX idx_tgm_group ON tag_group_members (tag_group_id);
CREATE INDEX idx_tgm_org ON tag_group_members (organization_id);

CREATE TABLE entity_tags
(
    id              UUID PRIMARY KEY     DEFAULT uuid_generate_v4(),
    organization_id UUID        NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    tag_id          UUID        NOT NULL REFERENCES tags (id) ON DELETE CASCADE,
    entity_type     VARCHAR(50) NOT NULL
        CHECK (entity_type IN ('CLIENT', 'VENDOR', 'PRODUCT', 'RESOURCE', 'PROJECT', 'QUOTE', 'INVOICE', 'CONTRACT')),
    entity_id       UUID        NOT NULL,
    created_at      TIMESTAMP   NOT NULL DEFAULT NOW(),
    UNIQUE (tag_id, entity_type, entity_id)
);

CREATE INDEX idx_entity_tags_lookup ON entity_tags (entity_type, entity_id);
CREATE INDEX idx_entity_tags_org ON entity_tags (organization_id);


-- ============================================================================
-- §4. CUSTOM FIELDS (Definitions, Groups, Values)
-- ============================================================================
-- Generic custom field system for any entity type.
--
-- GROUPS assign sets of fields to specific entity instances.
-- A group can be shared across entities (e.g., "Color" group on both cables and laptops).
-- One-off fields: create a single-field group.
--
-- FLOW:
--   1. Define fields:  RAM (select), CPU (text), Length (number), Color (select)
--   2. Create groups:  "Laptop Specs" → [RAM, CPU, Storage], "Cable Props" → [Length, Color]
--   3. Assign groups:  Product "MacBook Pro" → group "Laptop Specs"
--                      Product "XLR Cable"   → group "Cable Props"
--   4. Store values:   MacBook Pro / RAM → "16GB"
--
-- QUERY: "What fields does this product have?"
--   SELECT cfd.* FROM custom_field_definitions cfd
--   JOIN custom_field_group_members gm ON gm.custom_field_id = cfd.id
--   JOIN entity_custom_field_groups ecfg ON ecfg.custom_field_group_id = gm.custom_field_group_id
--   WHERE ecfg.entity_type = 'product' AND ecfg.entity_id = <product_id>;

CREATE TABLE custom_field_definitions
(
    id              UUID PRIMARY KEY      DEFAULT uuid_generate_v4(),
    organization_id UUID         NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    field_key       VARCHAR(100) NOT NULL,
    field_label     VARCHAR(255) NOT NULL,
    field_type      VARCHAR(30)  NOT NULL
        CHECK (field_type IN ('TEXT', 'NUMBER', 'BOOLEAN', 'DATE', 'URL',
                              'EMAIL', 'PHONE', 'SELECT', 'MULTI_SELECT', 'FILE')),
    is_required     BOOLEAN      NOT NULL DEFAULT FALSE,
    -- For select/multi_select: ["8GB","16GB","32GB"] or ["beginner","intermediate","expert"]
    options         JSONB,
    display_order   INT          NOT NULL DEFAULT 0,
    -- UI presentation hints
    -- Example: {"show_on_form":true,"show_on_card":false,"is_filterable":true}
    ui_config       JSONB        NOT NULL DEFAULT '{}',
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    UNIQUE (organization_id, field_key)
);

CREATE INDEX idx_cfd_org ON custom_field_definitions (organization_id);

-- Named groups of fields: "Laptop Specs", "Cable Props", "Audio Skills"
CREATE TABLE custom_field_groups
(
    id              UUID PRIMARY KEY      DEFAULT uuid_generate_v4(),
    organization_id UUID         NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    entity_type     VARCHAR(50)  NOT NULL
        CHECK (entity_type IN ('CLIENT', 'VENDOR', 'PRODUCT', 'RESOURCE', 'PROJECT',
                               'QUOTE', 'INVOICE', 'INVENTORY_ITEM')),
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    UNIQUE (organization_id, name)
);

CREATE INDEX idx_cfg_org ON custom_field_groups (organization_id);
CREATE INDEX idx_cfg_entity_type ON custom_field_groups (organization_id, entity_type);

-- Which fields belong to which group
CREATE TABLE custom_field_group_members
(
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    custom_field_group_id UUID NOT NULL REFERENCES custom_field_groups (id) ON DELETE CASCADE,
    custom_field_id       UUID NOT NULL REFERENCES custom_field_definitions (id) ON DELETE CASCADE,
    display_order   INT     NOT NULL DEFAULT 0,
    UNIQUE (custom_field_group_id, custom_field_id)
);

CREATE INDEX idx_cfgm_group ON custom_field_group_members (custom_field_group_id);
CREATE INDEX idx_cfgm_org ON custom_field_group_members (organization_id);

-- Which groups are assigned to which entity instances
-- Example: Product "MacBook Pro" uses group "Laptop Specs"
CREATE TABLE entity_custom_field_groups
(
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID        NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    custom_field_group_id UUID  NOT NULL REFERENCES custom_field_groups (id) ON DELETE CASCADE,
    entity_type     VARCHAR(50) NOT NULL
        CHECK (entity_type IN ('CLIENT', 'VENDOR', 'PRODUCT', 'RESOURCE', 'PROJECT',
                               'QUOTE', 'INVOICE', 'INVENTORY_ITEM')),
    entity_id       UUID        NOT NULL,
    created_at      TIMESTAMP   NOT NULL DEFAULT NOW(),
    UNIQUE (custom_field_group_id, entity_type, entity_id)
);

CREATE INDEX idx_ecfg_entity ON entity_custom_field_groups (entity_type, entity_id);
CREATE INDEX idx_ecfg_org ON entity_custom_field_groups (organization_id);

-- One row per field per entity (EAV pattern)
-- value examples: "16GB", 42, true, ["red","blue"], {"url":"...","name":"w9.pdf"}
CREATE TABLE custom_field_values
(
    id              UUID PRIMARY KEY   DEFAULT uuid_generate_v4(),
    organization_id UUID      NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    custom_field_id UUID      NOT NULL REFERENCES custom_field_definitions (id) ON DELETE CASCADE,
    entity_id       UUID      NOT NULL,
    value           JSONB     NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (custom_field_id, entity_id)
);

CREATE INDEX idx_cfv_org ON custom_field_values (organization_id);
CREATE INDEX idx_cfv_entity ON custom_field_values (entity_id);
CREATE INDEX idx_cfv_value ON custom_field_values USING GIN (value);

SELECT fn_create_updated_at_trigger('custom_field_definitions');
SELECT fn_create_updated_at_trigger('custom_field_groups');
SELECT fn_create_updated_at_trigger('custom_field_values');


-- ============================================================================
-- §5. CATEGORIES (P&L / Revenue Classification)
-- ============================================================================
-- Example tree (ASAP Sound):
--   Income ─┬─ Rental Income ─┬─ Audio Rental
--           │                 └─ Video Rental
--           ├─ Staffing Income
--           └─ Cartage & Freight
--   Expense ─┬─ Contractor Payments
--            ├─ Sub-Rental Costs
--            └─ Consumables

CREATE TABLE categories
(
    id              UUID PRIMARY KEY      DEFAULT uuid_generate_v4(),
    organization_id UUID         NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    parent_id       UUID         REFERENCES categories (id) ON DELETE SET NULL,
    name            VARCHAR(255) NOT NULL,
    code            VARCHAR(50), -- "4010" (accounting code)
    type            VARCHAR(30)  NOT NULL DEFAULT 'INCOME'
        CHECK (type IN ('INCOME', 'EXPENSE', 'BOTH')),
    description     TEXT,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    display_order   INT          NOT NULL DEFAULT 0,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    UNIQUE (organization_id, parent_id, name)
);

CREATE INDEX idx_categories_org ON categories (organization_id);
CREATE INDEX idx_categories_parent ON categories (parent_id);


-- ============================================================================
-- §6. CLIENTS + CONTACTS (CRM)
-- ============================================================================
-- Who pays us. Can be a company ("Live Nation") or individual ("Charlie Puth").
-- Example custom_fields (music): {"preferred_payment":"net_30","vip":true}
-- Example custom_fields (landscaping): {"property_sqft":45000,"gate_code":"1234"}

CREATE TABLE clients
(
    id                     UUID PRIMARY KEY      DEFAULT uuid_generate_v4(),
    organization_id        UUID         NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    name                   VARCHAR(255) NOT NULL,
    type                   VARCHAR(30)  NOT NULL DEFAULT 'COMPANY'
        CHECK (type IN ('COMPANY', 'INDIVIDUAL')),
    email                  VARCHAR(320),
    phone                  VARCHAR(50),
    website                TEXT,
    -- Example: {"street":"123 Vine St","city":"LA","state":"CA","zip":"90028","country":"US"}
    billing_address        JSONB,
    shipping_address       JSONB,
    notes                  TEXT,
    external_accounting_id VARCHAR(100),
    pricing_tier           VARCHAR(50),
    is_active              BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at             TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clients_org ON clients (organization_id);
CREATE INDEX idx_clients_name ON clients (organization_id, name);

-- Unified contacts for clients AND vendors (identical structure, polymorphic).
-- Example: Charlie Puth → Tour Manager, Production Manager, Business Manager
-- Example: Firehouse Productions → Account Rep, Warehouse Manager
CREATE TABLE contacts
(
    id              UUID PRIMARY KEY      DEFAULT uuid_generate_v4(),
    organization_id UUID         NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    entity_type     VARCHAR(30)  NOT NULL
        CHECK (entity_type IN ('CLIENT', 'VENDOR')),
    entity_id       UUID         NOT NULL, -- FK to clients.id or vendors.id
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100),
    email           VARCHAR(320),
    phone           VARCHAR(50),
    role            VARCHAR(100),          -- "Tour Manager", "Account Rep"
    is_primary      BOOLEAN      NOT NULL DEFAULT FALSE,
    notes           TEXT,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contacts_entity ON contacts (entity_type, entity_id);
CREATE INDEX idx_contacts_org ON contacts (organization_id);

SELECT fn_create_updated_at_trigger('clients');

-- Reusable physical locations tied to a client.
-- Every project requires a jobsite — single source of truth for "where."
--
-- Example (ASAP Sound):
--   Client "Live Nation" → "Madison Square Garden", "Staples Center", "Red Rocks"
-- Example (GreenScape):
--   Client "Marriott Hotels" → "Downtown Location", "Airport Location"
-- Example (Party Rental):
--   Client "Smith Family" → "123 Oak St (residence)", "St. Mary's Church"
CREATE TABLE jobsites
(
    id                   UUID PRIMARY KEY      DEFAULT uuid_generate_v4(),
    organization_id      UUID         NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    client_id            UUID         REFERENCES clients (id) ON DELETE SET NULL,
    name                 VARCHAR(255) NOT NULL, -- "Madison Square Garden", "Johnson Main House"
    -- Example: {"street":"4 Pennsylvania Plaza","city":"New York","state":"NY","zip":"10001","country":"US","lat":40.750,"lng":-73.993}
    address              JSONB        NOT NULL DEFAULT '{}',
    onsite_contact_id    UUID         REFERENCES contacts (id) ON DELETE SET NULL,
    access_instructions  TEXT,         -- "Load-in via 33rd St loading dock, badge required"
    notes                TEXT,
    is_active            BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_jobsites_org ON jobsites (organization_id);
CREATE INDEX idx_jobsites_client ON jobsites (client_id);

SELECT fn_create_updated_at_trigger('jobsites');


-- ============================================================================
-- §7. VENDORS (Suppliers / Sub-Rental Sources)
-- ============================================================================
-- Who we pay for sub-rented gear, outsourced services, consumable supplies.
--
-- Example (ASAP Sound):
--   "Firehouse Productions" — sub-rental of lighting rigs
--   "Guitar Center Pro"     — backup gear + consumable supplies
--
-- Example (GreenScape):
--   "Bobcat Rentals LA"     — excavator sub-rental
--   "SiteOne Landscape"     — bulk materials (soil, mulch, fertilizer)

CREATE TABLE vendors
(
    id                     UUID PRIMARY KEY      DEFAULT uuid_generate_v4(),
    organization_id        UUID         NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    name                   VARCHAR(255) NOT NULL,
    type                   VARCHAR(30)  NOT NULL DEFAULT 'COMPANY'
        CHECK (type IN ('COMPANY', 'INDIVIDUAL')),
    email                  VARCHAR(320),
    phone                  VARCHAR(50),
    website                TEXT,
    billing_address        JSONB,
    notes                  TEXT,
    external_accounting_id VARCHAR(100),
    -- Example: {"payment_terms":"net_30","preferred_method":"bank_transfer","tax_id":"XX-XXXXXXX"}
    payment_info           JSONB        NOT NULL DEFAULT '{}',
    is_active              BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at             TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vendors_org ON vendors (organization_id);
CREATE INDEX idx_vendors_name ON vendors (organization_id, name);

SELECT fn_create_updated_at_trigger('vendors');


-- ============================================================================
-- §8. PRODUCTS & INVENTORY
-- ============================================================================
--
-- TRACKING TYPES:
--   serialized  — each unit tracked individually via inventory_items
--                 Example: MacBook Pro SN-001, SN-002, SN-003
--   consumable  — bulk quantity tracked per location via stock_levels
--                 Example: Gaffer Tape — 50 rolls in Warehouse A, 12 in Van #2
--   non_tracked — services, fees, packages — no physical inventory
--                 Example: "Playback Engineer day rate", "Rush Fee"
--
-- RECURSIVE HIERARCHY via parent_id:
--   📦 Matty 16 Rig (package)
--   ├── 💻 MacBook Pro 16" (serialized)
--   ├── 🔌 Matty Face USB ×2 (serialized)
--   └── 📦 Cable Kit (package)
--       ├── 🔌 XLR Cable ×4 (consumable)
--       └── 🔌 USB-C Cable ×2 (consumable)


CREATE TABLE products
(
    id                  UUID PRIMARY KEY      DEFAULT uuid_generate_v4(),
    organization_id     UUID         NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    parent_id           UUID         REFERENCES products (id) ON DELETE SET NULL,
    category_id         UUID         REFERENCES categories (id) ON DELETE SET NULL,
    name                VARCHAR(255) NOT NULL,
    sku                 VARCHAR(100),
    product_type        VARCHAR(30)  NOT NULL DEFAULT 'PHYSICAL'
        CHECK (product_type IN ('PHYSICAL', 'SERVICE', 'PACKAGE', 'FEE')),
    description         TEXT,
    -- Pricing defaults (overridable per quote/invoice line)
    unit_price          NUMERIC(12, 2), -- NULL = negotiated per deal
    price_unit          VARCHAR(30)           DEFAULT 'EACH'
        CHECK (price_unit IN ('EACH', 'DAY', 'HOUR', 'WEEK', 'MONTH', 'FLAT')),
    cost_price          NUMERIC(12, 2), -- internal cost / vendor rate
    -- Inventory tracking strategy
    tracking_type       VARCHAR(20)  NOT NULL DEFAULT 'NON_TRACKED'
        CHECK (tracking_type IN ('SERIALIZED', 'CONSUMABLE', 'NON_TRACKED')),
    -- Consumable-specific (NULL for serialized / non_tracked)
    unit_of_measure     VARCHAR(30),    -- "rolls", "meters", "boxes", "liters"
    reorder_point       INT,            -- alert when total stock ≤ this
    is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
    display_order       INT          NOT NULL DEFAULT 0,
    created_at          TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_org ON products (organization_id);
CREATE INDEX idx_products_parent ON products (parent_id);
CREATE INDEX idx_products_category ON products (category_id);
CREATE INDEX idx_products_type ON products (organization_id, product_type);
CREATE INDEX idx_products_sku ON products (organization_id, sku);
CREATE INDEX idx_products_tracking ON products (organization_id, tracking_type);

-- ── SERIALIZED INVENTORY ────────────────────────────────────────────────
-- Individual serial-numbered units. Only for tracking_type = 'serialized'.
-- Product = catalog entry, inventory_item = physical instance.
--
-- Example: Product "MacBook Pro 16" → items SN-001, SN-002, SN-003

-- Cable A, 10m, SN 001
-- Cable A, 10m, SN 002
-- Cable B, 20m, SN 003
CREATE TABLE inventory_items
(
    id              UUID PRIMARY KEY     DEFAULT uuid_generate_v4(),
    organization_id UUID        NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    product_id      UUID        NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    vendor_id       UUID        REFERENCES vendors (id) ON DELETE SET NULL,
    serial_number   VARCHAR(255),
    barcode         VARCHAR(255),
    status          VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE'
        CHECK (status IN ('AVAILABLE', 'RESERVED', 'CHECKED_OUT', 'MAINTENANCE', 'RETIRED')),
    condition       VARCHAR(30)          DEFAULT 'GOOD'
        CHECK (condition IN ('NEW', 'GOOD', 'FAIR', 'DAMAGED')),
    ownership       VARCHAR(20) NOT NULL DEFAULT 'OWNED'
        CHECK (ownership IN ('OWNED', 'RENTED', 'LOANED')),
    location        VARCHAR(255), -- "Warehouse A, Shelf 3"
    notes           TEXT,
    purchase_price  NUMERIC(12, 2),
    purchase_date   DATE,
    created_at      TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inv_items_org ON inventory_items (organization_id);
CREATE INDEX idx_inv_items_product ON inventory_items (product_id);
CREATE INDEX idx_inv_items_vendor ON inventory_items (vendor_id);
CREATE INDEX idx_inv_items_status ON inventory_items (organization_id, status);
CREATE INDEX idx_inv_items_barcode ON inventory_items (organization_id, barcode);
CREATE INDEX idx_inv_items_serial ON inventory_items (organization_id, serial_number);

-- ── CONSUMABLE INVENTORY ────────────────────────────────────────────────
-- Quantity-based stock per product per location.
-- Only for tracking_type = 'consumable'.
-- Multi-location from day one — every business eventually needs it.
--
-- Example (ASAP Sound):
--   "Gaffer Tape":  Warehouse A → 50 rolls,  Van #2 → 12 rolls
--
-- Example (GreenScape):
--   "Mulch":  Main Yard → 200 cu yd,  Truck #5 → 8 cu yd
--
-- Query: "What needs reordering?"
--   SELECT p.name, SUM(sl.quantity_on_hand) AS total
--   FROM stock_levels sl JOIN products p ON p.id = sl.product_id
--   WHERE p.organization_id = '<org>' AND p.tracking_type = 'consumable'
--   GROUP BY p.id HAVING SUM(sl.quantity_on_hand) <= p.reorder_point;

-- Cable A - 10m, stock level 50
-- Cable B - 20m, stock level 30
-- Cable C - 25m, stock level 10
CREATE TABLE stock_levels
(
    id                UUID PRIMARY KEY        DEFAULT uuid_generate_v4(),
    organization_id   UUID           NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    product_id        UUID           NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    location          VARCHAR(255)   NOT NULL,
    quantity_on_hand  NUMERIC(12, 2) NOT NULL DEFAULT 0,
    quantity_reserved NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at        TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP      NOT NULL DEFAULT NOW(),
    UNIQUE (product_id, location),
    CHECK (quantity_on_hand >= 0),
    CHECK (quantity_reserved >= 0),
    CHECK (quantity_reserved <= quantity_on_hand)
);

CREATE INDEX idx_stock_levels_org ON stock_levels (organization_id);
CREATE INDEX idx_stock_levels_product ON stock_levels (product_id);

-- ── INVENTORY TRANSACTIONS (unified audit log) ──────────────────────────
-- Covers BOTH serialized and consumable operations.
--
-- For serialized: inventory_item_id (specific unit)
-- For consumable: product_id + stock_level_id + quantity
-- CHECK constraint ensures exactly one path is filled.
--
-- Consumable examples:
--   consume 12 rolls from Warehouse A → (product, stock=warehouse-a, qty=12, type=consume)
--   restock 50 rolls to Warehouse A   → (product, stock=warehouse-a, qty=50, type=restock)
--   transfer Warehouse A → Van #2     → two rows: transfer_out + transfer_in

CREATE TABLE inventory_transactions
(
    id                UUID PRIMARY KEY     DEFAULT uuid_generate_v4(),
    organization_id   UUID        NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    -- Serialized path
    inventory_item_id UUID REFERENCES inventory_items (id) ON DELETE CASCADE,
    -- Consumable path
    product_id        UUID REFERENCES products (id) ON DELETE CASCADE,
    stock_level_id    UUID REFERENCES stock_levels (id) ON DELETE CASCADE,
    quantity          NUMERIC(12, 2),
    -- Shared
    project_id        UUID, -- FK deferred (§20)
    transaction_type  VARCHAR(30) NOT NULL
        CHECK (transaction_type IN (
                                    'CHECK_OUT', 'CHECK_IN', 'TRANSFER', 'MAINTENANCE', 'RETIRE',
                                    'CONSUME', 'RESTOCK', 'ADJUST', 'TRANSFER_IN', 'TRANSFER_OUT'
            )),
    performed_by      UUID        REFERENCES users (id) ON DELETE SET NULL,
    notes             TEXT,
    created_at        TIMESTAMP   NOT NULL DEFAULT NOW(),
    CHECK (
        (inventory_item_id IS NOT NULL AND product_id IS NULL AND stock_level_id IS NULL AND quantity IS NULL)
            OR
        (inventory_item_id IS NULL AND product_id IS NOT NULL AND stock_level_id IS NOT NULL AND quantity IS NOT NULL)
        )
);

CREATE INDEX idx_inv_tx_item ON inventory_transactions (inventory_item_id);
CREATE INDEX idx_inv_tx_product ON inventory_transactions (product_id);
CREATE INDEX idx_inv_tx_stock ON inventory_transactions (stock_level_id);
CREATE INDEX idx_inv_tx_project ON inventory_transactions (project_id);
CREATE INDEX idx_inv_tx_org ON inventory_transactions (organization_id);
CREATE INDEX idx_inv_tx_type ON inventory_transactions (organization_id, transaction_type);

SELECT fn_create_updated_at_trigger('products');
SELECT fn_create_updated_at_trigger('inventory_items');
SELECT fn_create_updated_at_trigger('stock_levels');


-- ============================================================================
-- §9. PEOPLE (Contractors + Employees) — Slim Core
-- ============================================================================
-- Only universal fields. Industry-specific (skills, languages, certs…)
-- are org-defined via §4 custom fields + collections.

CREATE TABLE people
(
    id                UUID PRIMARY KEY      DEFAULT uuid_generate_v4(),
    organization_id   UUID         NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    user_id           UUID         REFERENCES users (id) ON DELETE SET NULL,
    type              VARCHAR(30)  NOT NULL DEFAULT 'CONTRACTOR'
        CHECK (type IN ('CONTRACTOR', 'EMPLOYEE')),
    first_name        VARCHAR(100) NOT NULL,
    last_name         VARCHAR(100) NOT NULL,
    email             VARCHAR(320),
    phone             VARCHAR(50),
    avatar_url        TEXT,
    location_city     VARCHAR(100),
    location_state    VARCHAR(100),
    location_country  VARCHAR(100),
    default_day_rate  NUMERIC(10, 2),
    default_hour_rate NUMERIC(10, 2),
    currency          VARCHAR(3)            DEFAULT 'USD',
    is_active         BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_people_org ON people (organization_id);
CREATE INDEX idx_people_type ON people (organization_id, type);
CREATE INDEX idx_people_location ON people (organization_id, location_country, location_state, location_city);

-- Availability calendar blocks
-- Example: Jesse unavailable Dec 20-Jan 5 (vacation); booked Jan 10-17 (Moby Tour)
CREATE TABLE people_availability
(
    id              UUID PRIMARY KEY     DEFAULT uuid_generate_v4(),
    organization_id UUID        NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    resource_id     UUID        NOT NULL REFERENCES people (id) ON DELETE CASCADE,
    date_start      DATE        NOT NULL,
    date_end        DATE        NOT NULL,
    status          VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE'
        CHECK (status IN ('AVAILABLE', 'UNAVAILABLE', 'TENTATIVE', 'BOOKED')),
    reason          TEXT,
    project_id      UUID, -- FK deferred (§20)
    created_at      TIMESTAMP   NOT NULL DEFAULT NOW(),
    CHECK (date_end >= date_start)
);

CREATE INDEX idx_resource_avail_resource ON people_availability (resource_id);
CREATE INDEX idx_resource_avail_dates ON people_availability (date_start, date_end);
CREATE INDEX idx_resource_avail_org ON people_availability (organization_id);

-- Payments TO people (contractor invoices / payroll).
-- Example: Jesse worked Moby Tour (7d × $650 = $4,550) — paid via bank transfer
-- Example: Jesse worked Charlie Puth (3d × $700 = $2,100) — pending
--
-- Query: "Total owed to all contractors"
--   SELECT r.first_name, r.last_name, SUM(rp.amount) AS owed
--   FROM people_payouts rp JOIN people r ON r.id = rp.resource_id
--   WHERE rp.organization_id = '<org>' AND rp.status = 'pending'
--   GROUP BY r.id, r.first_name, r.last_name;

CREATE TABLE people_payouts
(
    id                     UUID PRIMARY KEY        DEFAULT uuid_generate_v4(),
    organization_id        UUID           NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    resource_id            UUID           NOT NULL REFERENCES people (id) ON DELETE CASCADE,
    project_id             UUID, -- FK deferred (§20)
    description            VARCHAR(500),
    amount                 NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    currency               VARCHAR(3)     NOT NULL DEFAULT 'USD',
    status                 VARCHAR(30)    NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'APPROVED', 'PAID', 'CANCELLED')),
    approved_at            TIMESTAMP,
    approved_by            UUID           REFERENCES users (id) ON DELETE SET NULL,
    payment_method         VARCHAR(50)
        CHECK (payment_method IS NULL OR
               payment_method IN ('BANK_TRANSFER', 'CHECK', 'CASH', 'PAYPAL', 'PAYROLL', 'OTHER')),
    payment_reference      VARCHAR(255),
    paid_at                TIMESTAMP,
    period_start           DATE,
    period_end             DATE,
    external_accounting_id VARCHAR(100),
    notes                  TEXT,
    created_at             TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payouts_org ON people_payouts (organization_id);
CREATE INDEX idx_payouts_resource ON people_payouts (resource_id);
CREATE INDEX idx_payouts_project ON people_payouts (project_id);
CREATE INDEX idx_payouts_status ON people_payouts (organization_id, status);
CREATE INDEX idx_payouts_paid ON people_payouts (organization_id, paid_at);

SELECT fn_create_updated_at_trigger('people');
SELECT fn_create_updated_at_trigger('people_payouts');


-- ============================================================================
-- §10. PROJECTS & JOBS
-- ============================================================================
-- Project = deal/contract container (client, billing, financials).
-- Job = specific work assignment (where, when, who, what equipment).
--
-- Lifecycle: pending → approved → in_progress → completed | cancelled
-- Financial totals computed via v_project_financials view (no denormalized columns).
--
-- Example: Project "Charlie Puth Summer Tour"
--   ├── Job "MSG Show"      → jobsite: MSG,     Jan 15-16, multiplier 1.0
--   ├── Job "Off/Travel"    → jobsite: null,     Jan 17-19, multiplier 0.5
--   └── Job "Staples Show"  → jobsite: Staples,  Jan 20-21, multiplier 1.0
--
-- Simple case: 1 project = 1 job (app auto-creates).

CREATE TABLE projects
(
    id                     UUID PRIMARY KEY      DEFAULT uuid_generate_v4(),
    organization_id        UUID         NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    client_id              UUID         REFERENCES clients (id) ON DELETE SET NULL,
    project_number         VARCHAR(50)  NOT NULL, -- "GIG-2025-0042"
    title                  VARCHAR(255) NOT NULL,
    description            TEXT,
    status                 VARCHAR(30)  NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    priority               VARCHAR(20)           DEFAULT 'NORMAL'
        CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
    external_accounting_id VARCHAR(100),
    source                 VARCHAR(50)
        CHECK (source IS NULL OR source IN ('WEBSITE_FORM', 'REFERRAL', 'REPEAT_CLIENT', 'MANUAL', 'API')),
    inbound_request_id     UUID,                  -- FK deferred (§20)
    created_by             UUID         REFERENCES users (id) ON DELETE SET NULL,
    created_at             TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_org ON projects (organization_id);
CREATE INDEX idx_projects_client ON projects (client_id);
CREATE INDEX idx_projects_status ON projects (organization_id, status);
CREATE INDEX idx_projects_number ON projects (organization_id, project_number);

-- Jobs: the operational unit — where, when, who, what
CREATE TABLE jobs
(
    id              UUID PRIMARY KEY       DEFAULT uuid_generate_v4(),
    organization_id UUID          NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    project_id      UUID          NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    jobsite_id      UUID          REFERENCES jobsites (id) ON DELETE SET NULL, -- null for travel/off days
    title           VARCHAR(255)  NOT NULL, -- "MSG Show", "Load-in Day", "Off/Travel"
    date_start      DATE          NOT NULL,
    date_end        DATE          NOT NULL,
    rate_multiplier NUMERIC(5, 2) NOT NULL DEFAULT 1.00, -- billing adjustment (0.5 for off days, etc.)
    status          VARCHAR(30)   NOT NULL DEFAULT 'SCHEDULED'
        CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    display_order   INT           NOT NULL DEFAULT 0,
    notes           TEXT,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
    CHECK (date_end >= date_start),
    CHECK (rate_multiplier >= 0)
);

CREATE INDEX idx_jobs_project ON jobs (project_id);
CREATE INDEX idx_jobs_jobsite ON jobs (jobsite_id);
CREATE INDEX idx_jobs_dates ON jobs (date_start, date_end);
CREATE INDEX idx_jobs_org ON jobs (organization_id);

-- People assigned to a job
-- Example: Jesse as "Playback Engineer" on MSG Show, bill $800/day, pay $650/day
CREATE TABLE job_people
(
    id              UUID PRIMARY KEY     DEFAULT uuid_generate_v4(),
    organization_id UUID        NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    job_id          UUID        NOT NULL REFERENCES jobs (id) ON DELETE CASCADE,
    resource_id     UUID        NOT NULL REFERENCES people (id) ON DELETE CASCADE,
    role            VARCHAR(100),
    bill_rate       NUMERIC(10, 2),
    pay_rate        NUMERIC(10, 2),
    rate_unit       VARCHAR(20)          DEFAULT 'DAY'
        CHECK (rate_unit IN ('DAY', 'HOUR', 'FLAT', 'WEEK')),
    per_diem        NUMERIC(10, 2),
    status          VARCHAR(30) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'CONFIRMED', 'DECLINED', 'CANCELLED')),
    confirmed_at    TIMESTAMP,
    notes           TEXT,
    created_at      TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_job_people_job ON job_people (job_id);
CREATE INDEX idx_job_people_resource ON job_people (resource_id);
CREATE INDEX idx_job_people_org ON job_people (organization_id);

-- Equipment / consumables assigned to a job
-- Serialized: product_id + inventory_item_id → checked_out / returned
-- Consumable: product_id only → consumed (qty used)
-- vendor_id: sub-rented from this vendor for this specific job
CREATE TABLE job_products
(
    id                UUID PRIMARY KEY        DEFAULT uuid_generate_v4(),
    organization_id   UUID           NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    job_id            UUID           NOT NULL REFERENCES jobs (id) ON DELETE CASCADE,
    product_id        UUID           NOT NULL REFERENCES products (id) ON DELETE CASCADE,
    inventory_item_id UUID           REFERENCES inventory_items (id) ON DELETE SET NULL,
    vendor_id         UUID           REFERENCES vendors (id) ON DELETE SET NULL,
    quantity          NUMERIC(10, 2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
    billing_type      VARCHAR(20)    NOT NULL DEFAULT 'RENTAL'
        CHECK (billing_type IN ('RENTAL', 'SALE', 'INTERNAL', 'SUB_RENTAL')),
    bill_rate         NUMERIC(10, 2),
    cost_rate         NUMERIC(10, 2),
    rate_unit         VARCHAR(20)             DEFAULT 'DAY'
        CHECK (rate_unit IN ('DAY', 'EACH', 'FLAT', 'WEEK')),
    status            VARCHAR(30)    NOT NULL DEFAULT 'REQUESTED'
        CHECK (status IN ('REQUESTED', 'RESERVED', 'CHECKED_OUT', 'RETURNED', 'LOST', 'CONSUMED', 'SOLD')),
    checked_out_at    TIMESTAMP,
    returned_at       TIMESTAMP,
    notes             TEXT,
    created_at        TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_job_products_job ON job_products (job_id);
CREATE INDEX idx_job_products_product ON job_products (product_id);
CREATE INDEX idx_job_products_vendor ON job_products (vendor_id);
CREATE INDEX idx_job_products_item ON job_products (inventory_item_id);
CREATE INDEX idx_job_products_org ON job_products (organization_id);

SELECT fn_create_updated_at_trigger('projects');
SELECT fn_create_updated_at_trigger('jobs');
SELECT fn_create_updated_at_trigger('job_people');
SELECT fn_create_updated_at_trigger('job_products');


-- ============================================================================
-- §11. INBOUND REQUESTS (Website Forms → Pipeline)
-- ============================================================================
-- Example form_data:
--   {"service_type":"staffing_and_rental","artist":"Chainsmokers",
--    "start_date":"2025-03-14","end_date":"2025-03-19","num_shows":6,
--    "needs_autotune":true,"autotune_channels":4,"software":"ableton"}

CREATE TABLE inbound_requests
(
    id                UUID PRIMARY KEY     DEFAULT uuid_generate_v4(),
    organization_id   UUID        NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    submitter_name    VARCHAR(255),
    submitter_email   VARCHAR(320),
    submitter_phone   VARCHAR(50),
    submitter_company VARCHAR(255),
    client_id         UUID        REFERENCES clients (id) ON DELETE SET NULL,
    template_id       UUID, -- FK deferred (§20)
    form_data         JSONB       NOT NULL DEFAULT '{}',
    status            VARCHAR(30) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'REVIEWING', 'APPROVED', 'DENIED')),
    reviewed_by       UUID        REFERENCES users (id) ON DELETE SET NULL,
    reviewed_at       TIMESTAMP,
    denial_reason     TEXT,
    project_id        UUID        REFERENCES projects (id) ON DELETE SET NULL,
    created_at        TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inbound_org ON inbound_requests (organization_id);
CREATE INDEX idx_inbound_status ON inbound_requests (organization_id, status);

SELECT fn_create_updated_at_trigger('inbound_requests');


-- ============================================================================
-- §12. QUOTES
-- ============================================================================
-- Lifecycle: draft → sent → viewed → approved → converted (to invoice)
--                                  ↘ declined / expired
-- version tracks revisions: (org, quote_number, version) is unique.

CREATE TABLE quotes
(
    id                     UUID PRIMARY KEY        DEFAULT uuid_generate_v4(),
    organization_id        UUID           NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    project_id             UUID           REFERENCES projects (id) ON DELETE SET NULL,
    client_id              UUID           NOT NULL REFERENCES clients (id) ON DELETE SET NULL,
    quote_number           VARCHAR(50)    NOT NULL,
    version                INT            NOT NULL DEFAULT 1,
    title                  VARCHAR(255),
    status                 VARCHAR(30)    NOT NULL DEFAULT 'DRAFT'
        CHECK (status IN ('DRAFT', 'SENT', 'VIEWED', 'APPROVED', 'DECLINED', 'EXPIRED', 'CONVERTED')),
    issued_date            DATE,
    valid_until            DATE,
    approved_at            TIMESTAMP,
    subtotal               NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discount_amount        NUMERIC(12, 2) NOT NULL DEFAULT 0,
    tax_amount             NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total                  NUMERIC(12, 2) NOT NULL DEFAULT 0,
    currency               VARCHAR(3)     NOT NULL DEFAULT 'USD',
    notes                  TEXT,
    internal_notes         TEXT,
    terms                  TEXT,
    external_accounting_id VARCHAR(100),
    created_by             UUID           REFERENCES users (id) ON DELETE SET NULL,
    created_at             TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quotes_org ON quotes (organization_id);
CREATE INDEX idx_quotes_project ON quotes (project_id);
CREATE INDEX idx_quotes_client ON quotes (client_id);
CREATE INDEX idx_quotes_status ON quotes (organization_id, status);
CREATE UNIQUE INDEX idx_quotes_number_version ON quotes (organization_id, quote_number, version);

CREATE TABLE quote_line_items
(
    id               UUID PRIMARY KEY        DEFAULT uuid_generate_v4(),
    organization_id  UUID           NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    quote_id         UUID           NOT NULL REFERENCES quotes (id) ON DELETE CASCADE,
    product_id       UUID           REFERENCES products (id) ON DELETE SET NULL,
    people_id        UUID           REFERENCES people (id) ON DELETE SET NULL,
    category_id      UUID           REFERENCES categories (id) ON DELETE SET NULL,
    description      VARCHAR(500)   NOT NULL,
    date_start       DATE,
    date_end         DATE,
    quantity         NUMERIC(10, 2) NOT NULL DEFAULT 1,
    unit_price       NUMERIC(12, 2) NOT NULL DEFAULT 0,
    unit             VARCHAR(30)             DEFAULT 'EACH'
        CHECK (unit IN ('EACH', 'DAY', 'HOUR', 'WEEK', 'MONTH', 'FLAT')),
    discount_percent NUMERIC(5, 2)  NOT NULL DEFAULT 0 CHECK (discount_percent BETWEEN 0 AND 100),
    discount_amount  NUMERIC(12, 2) NOT NULL DEFAULT 0,
    tax_rate         NUMERIC(5, 2)  NOT NULL DEFAULT 0 CHECK (tax_rate >= 0),
    line_total       NUMERIC(12, 2) NOT NULL DEFAULT 0,
    cost_per_unit    NUMERIC(12, 2), -- internal, not visible to client
    cost_total       NUMERIC(12, 2),
    section          VARCHAR(100),   -- "Staffing", "Rentals", "Travel"
    display_order    INT            NOT NULL DEFAULT 0,
    is_visible       BOOLEAN        NOT NULL DEFAULT TRUE,
    notes            TEXT,
    created_at       TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_qli_quote ON quote_line_items (quote_id);
CREATE INDEX idx_qli_org ON quote_line_items (organization_id);
CREATE INDEX idx_qli_category ON quote_line_items (category_id);

SELECT fn_create_updated_at_trigger('quotes');


-- ============================================================================
-- §13. INVOICES & PAYMENTS
-- ============================================================================
-- Lifecycle: draft → sent → viewed → partially_paid → paid | overdue → void

CREATE TABLE invoices
(
    id                     UUID PRIMARY KEY        DEFAULT uuid_generate_v4(),
    organization_id        UUID           NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    quote_id               UUID           REFERENCES quotes (id) ON DELETE SET NULL,
    project_id             UUID           REFERENCES projects (id) ON DELETE SET NULL,
    client_id              UUID           NOT NULL REFERENCES clients (id) ON DELETE SET NULL,
    invoice_number         VARCHAR(50)    NOT NULL,
    status                 VARCHAR(30)    NOT NULL DEFAULT 'DRAFT'
        CHECK (status IN ('DRAFT', 'SENT', 'VIEWED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'VOID')),
    issued_date            DATE,
    due_date               DATE,
    paid_at                TIMESTAMP,
    subtotal               NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discount_amount        NUMERIC(12, 2) NOT NULL DEFAULT 0,
    tax_amount             NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total                  NUMERIC(12, 2) NOT NULL DEFAULT 0,
    amount_paid            NUMERIC(12, 2) NOT NULL DEFAULT 0,
    balance_due            NUMERIC(12, 2) NOT NULL DEFAULT 0,
    currency               VARCHAR(3)     NOT NULL DEFAULT 'USD',
    external_accounting_id VARCHAR(100),
    notes                  TEXT,
    internal_notes         TEXT,
    terms                  TEXT,
    created_by             UUID           REFERENCES users (id) ON DELETE SET NULL,
    created_at             TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoices_org ON invoices (organization_id);
CREATE INDEX idx_invoices_project ON invoices (project_id);
CREATE INDEX idx_invoices_client ON invoices (client_id);
CREATE INDEX idx_invoices_status ON invoices (organization_id, status);
CREATE UNIQUE INDEX idx_invoices_number ON invoices (organization_id, invoice_number);

CREATE TABLE invoice_line_items
(
    id                 UUID PRIMARY KEY        DEFAULT uuid_generate_v4(),
    organization_id    UUID           NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    invoice_id         UUID           NOT NULL REFERENCES invoices (id) ON DELETE CASCADE,
    quote_line_item_id UUID           REFERENCES quote_line_items (id) ON DELETE SET NULL,
    product_id         UUID           REFERENCES products (id) ON DELETE SET NULL,
    category_id        UUID           REFERENCES categories (id) ON DELETE SET NULL,
    description        VARCHAR(500)   NOT NULL,
    date_start         DATE,
    date_end           DATE,
    quantity           NUMERIC(10, 2) NOT NULL DEFAULT 1,
    unit_price         NUMERIC(12, 2) NOT NULL DEFAULT 0,
    unit               VARCHAR(30)             DEFAULT 'EACH'
        CHECK (unit IN ('EACH', 'DAY', 'HOUR', 'WEEK', 'MONTH', 'FLAT')),
    discount_percent   NUMERIC(5, 2)  NOT NULL DEFAULT 0,
    discount_amount    NUMERIC(12, 2) NOT NULL DEFAULT 0,
    tax_rate           NUMERIC(5, 2)  NOT NULL DEFAULT 0,
    line_total         NUMERIC(12, 2) NOT NULL DEFAULT 0,
    section            VARCHAR(100),
    display_order      INT            NOT NULL DEFAULT 0,
    notes              TEXT,
    created_at         TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ili_invoice ON invoice_line_items (invoice_id);
CREATE INDEX idx_ili_org ON invoice_line_items (organization_id);

-- Payments FROM clients TO us
CREATE TABLE payments
(
    id                  UUID PRIMARY KEY        DEFAULT uuid_generate_v4(),
    organization_id     UUID           NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    invoice_id          UUID           NOT NULL REFERENCES invoices (id) ON DELETE CASCADE,
    amount              NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    currency            VARCHAR(3)     NOT NULL DEFAULT 'USD',
    payment_method      VARCHAR(50)
        CHECK (payment_method IS NULL OR
               payment_method IN ('CREDIT_CARD', 'BANK_TRANSFER', 'CHECK', 'CASH', 'PAYPAL', 'OTHER')),
    payment_reference   VARCHAR(255),
    payment_date        DATE           NOT NULL,
    notes               TEXT,
    external_payment_id VARCHAR(100),
    created_at          TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_invoice ON payments (invoice_id);
CREATE INDEX idx_payments_org ON payments (organization_id);

SELECT fn_create_updated_at_trigger('invoices');


-- ============================================================================
-- §14. CONTRACTS
-- ============================================================================

CREATE TABLE contracts
(
    id                  UUID PRIMARY KEY      DEFAULT uuid_generate_v4(),
    organization_id     UUID         NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    project_id          UUID         REFERENCES projects (id) ON DELETE SET NULL,
    client_id           UUID         REFERENCES clients (id) ON DELETE SET NULL,
    people_id           UUID         REFERENCES people (id) ON DELETE SET NULL,
    vendor_id           UUID         REFERENCES vendors (id) ON DELETE SET NULL,
    contract_type       VARCHAR(50)  NOT NULL
        CHECK (contract_type IN ('SERVICE_AGREEMENT', 'RENTAL_AGREEMENT', 'SUBCONTRACTOR', 'NDA', 'OTHER')),
    title               VARCHAR(255) NOT NULL,
    template_content    TEXT,
    generated_file_url  TEXT,
    status              VARCHAR(30)  NOT NULL DEFAULT 'DRAFT'
        CHECK (status IN ('DRAFT', 'SENT', 'VIEWED', 'SIGNED', 'EXPIRED', 'CANCELLED')),
    sent_at             TIMESTAMP,
    signed_at           TIMESTAMP,
    signed_file_url     TEXT,
    signing_provider    VARCHAR(50),
    external_signing_id VARCHAR(255),
    expires_at          DATE,
    notes               TEXT,
    created_at          TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contracts_org ON contracts (organization_id);
CREATE INDEX idx_contracts_project ON contracts (project_id);
CREATE INDEX idx_contracts_status ON contracts (organization_id, status);
CREATE INDEX idx_contracts_vendor ON contracts (vendor_id);

SELECT fn_create_updated_at_trigger('contracts');


-- ============================================================================
-- §15. FILE ATTACHMENTS (Generic, Polymorphic)
-- ============================================================================
-- Any entity can have files attached.
-- Example: project → stage_plot.pdf, shipping_manifest.xlsx

CREATE TABLE file_attachments
(
    id              UUID PRIMARY KEY      DEFAULT uuid_generate_v4(),
    organization_id UUID         NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    entity_type     VARCHAR(50)  NOT NULL,
    entity_id       UUID         NOT NULL,
    file_name       VARCHAR(500) NOT NULL,
    file_url        TEXT         NOT NULL,
    file_size_bytes BIGINT,
    mime_type       VARCHAR(100),
    category        VARCHAR(100),
    uploaded_by     UUID         REFERENCES users (id) ON DELETE SET NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_files_entity ON file_attachments (entity_type, entity_id);
CREATE INDEX idx_files_org ON file_attachments (organization_id);


-- ============================================================================
-- §16. TEMPLATES
-- ============================================================================
-- Types: inbound_form | quote | project | contract
--
-- Example (quote template "Standard Playback Package"):
--   item: product "Matty 16 Rig", qty 1, $250/day, section "Rentals"
--   item: resource_role "Playback Engineer", $800/day, section "Staffing"
--   item: fee "Cartage", $500 flat, section "Travel"

CREATE TABLE templates
(
    id               UUID PRIMARY KEY      DEFAULT uuid_generate_v4(),
    organization_id  UUID         NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    name             VARCHAR(255) NOT NULL,
    description      TEXT,
    template_type    VARCHAR(30)  NOT NULL
        CHECK (template_type IN ('INBOUND_FORM', 'QUOTE', 'PROJECT', 'CONTRACT')),
    is_client_facing BOOLEAN      NOT NULL DEFAULT FALSE,
    is_active        BOOLEAN      NOT NULL DEFAULT TRUE,
    settings         JSONB        NOT NULL DEFAULT '{}',
    created_by       UUID         REFERENCES users (id) ON DELETE SET NULL,
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_templates_org ON templates (organization_id);
CREATE INDEX idx_templates_type ON templates (organization_id, template_type);

CREATE TABLE template_items
(
    id                 UUID PRIMARY KEY      DEFAULT uuid_generate_v4(),
    organization_id    UUID         NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    template_id        UUID         NOT NULL REFERENCES templates (id) ON DELETE CASCADE,
    item_type          VARCHAR(30)  NOT NULL
        CHECK (item_type IN ('PRODUCT', 'RESOURCE_ROLE', 'LINE_ITEM', 'FORM_FIELD', 'DATE_RANGE', 'FEE')),
    product_id         UUID         REFERENCES products (id) ON DELETE SET NULL,
    category_id        UUID         REFERENCES categories (id) ON DELETE SET NULL,
    label              VARCHAR(255) NOT NULL,
    description        TEXT,
    default_quantity   NUMERIC(10, 2),
    default_unit_price NUMERIC(12, 2),
    default_unit       VARCHAR(30),
    field_type         VARCHAR(30),
    field_options      JSONB,
    is_required        BOOLEAN      NOT NULL DEFAULT FALSE,
    depends_on_item_id UUID         REFERENCES template_items (id) ON DELETE SET NULL,
    depends_on_value   TEXT,
    section            VARCHAR(100),
    display_order      INT          NOT NULL DEFAULT 0,
    created_at         TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_template_items_template ON template_items (template_id);
CREATE INDEX idx_template_items_org ON template_items (organization_id);

SELECT fn_create_updated_at_trigger('templates');


-- ============================================================================
-- §17. COMMUNICATION LOG
-- ============================================================================
-- Tracks all outbound/inbound comms.
-- Answers: "did we email the quote to Moby's team?"

CREATE TABLE communication_log
(
    id                  UUID PRIMARY KEY     DEFAULT uuid_generate_v4(),
    organization_id     UUID        NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    entity_type         VARCHAR(50),
    entity_id           UUID,
    channel             VARCHAR(30) NOT NULL
        CHECK (channel IN ('EMAIL', 'SMS', 'PUSH', 'IN_APP', 'WEBHOOK')),
    direction           VARCHAR(10) NOT NULL DEFAULT 'OUTBOUND'
        CHECK (direction IN ('OUTBOUND', 'INBOUND')),
    recipient_name      VARCHAR(255),
    recipient_email     VARCHAR(320),
    recipient_phone     VARCHAR(50),
    subject             VARCHAR(500),
    body_preview        TEXT,
    status              VARCHAR(30) NOT NULL DEFAULT 'SENT'
        CHECK (status IN ('QUEUED', 'SENT', 'DELIVERED', 'OPENED', 'BOUNCED', 'FAILED')),
    external_message_id VARCHAR(255),
    sent_by             UUID        REFERENCES users (id) ON DELETE SET NULL,
    sent_at             TIMESTAMP   NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comms_org ON communication_log (organization_id);
CREATE INDEX idx_comms_entity ON communication_log (entity_type, entity_id);
CREATE INDEX idx_comms_sent ON communication_log (organization_id, sent_at DESC);


-- ============================================================================
-- §18. ACTIVITY LOG & NOTIFICATIONS
-- ============================================================================

-- Immutable audit trail
CREATE TABLE activity_log
(
    id              UUID PRIMARY KEY     DEFAULT uuid_generate_v4(),
    organization_id UUID        NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    user_id         UUID        REFERENCES users (id) ON DELETE SET NULL,
    entity_type     VARCHAR(50) NOT NULL,
    entity_id       UUID        NOT NULL,
    action          VARCHAR(50) NOT NULL,
    changes         JSONB,
    metadata        JSONB,
    created_at      TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_org ON activity_log (organization_id);
CREATE INDEX idx_activity_entity ON activity_log (entity_type, entity_id);
CREATE INDEX idx_activity_created ON activity_log (organization_id, created_at DESC);

CREATE TABLE notifications
(
    id              UUID PRIMARY KEY      DEFAULT uuid_generate_v4(),
    organization_id UUID         NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    user_id         UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    title           VARCHAR(255) NOT NULL,
    body            TEXT,
    entity_type     VARCHAR(50),
    entity_id       UUID,
    is_read         BOOLEAN      NOT NULL DEFAULT FALSE,
    read_at         TIMESTAMP,
    channel         VARCHAR(30)  NOT NULL DEFAULT 'IN_APP'
        CHECK (channel IN ('IN_APP', 'EMAIL', 'SMS', 'PUSH')),
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread ON notifications (user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_org ON notifications (organization_id);


-- ============================================================================
-- §19. INTEGRATIONS (Xero, QuickBooks, Stripe, DocuSign…)
-- ============================================================================

CREATE TABLE integrations
(
    id              UUID PRIMARY KEY     DEFAULT uuid_generate_v4(),
    organization_id UUID        NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    provider        VARCHAR(50) NOT NULL,
    status          VARCHAR(30) NOT NULL DEFAULT 'CONNECTED'
        CHECK (status IN ('CONNECTED', 'DISCONNECTED', 'ERROR')),
    credentials     JSONB       NOT NULL DEFAULT '{}',
    settings        JSONB       NOT NULL DEFAULT '{}',
    last_synced_at  TIMESTAMP,
    created_at      TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP   NOT NULL DEFAULT NOW(),
    UNIQUE (organization_id, provider)
);

CREATE TABLE integration_sync_log
(
    id              UUID PRIMARY KEY     DEFAULT uuid_generate_v4(),
    organization_id UUID        NOT NULL REFERENCES organizations (id) ON DELETE CASCADE,
    integration_id  UUID        NOT NULL REFERENCES integrations (id) ON DELETE CASCADE,
    direction       VARCHAR(10) NOT NULL CHECK (direction IN ('PUSH', 'PULL')),
    entity_type     VARCHAR(50) NOT NULL,
    entity_id       UUID,
    external_id     VARCHAR(255),
    status          VARCHAR(30) NOT NULL
        CHECK (status IN ('SUCCESS', 'ERROR', 'SKIPPED')),
    error_message   TEXT,
    payload         JSONB,
    created_at      TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sync_log_integration ON integration_sync_log (integration_id);
CREATE INDEX idx_sync_log_org ON integration_sync_log (organization_id);

SELECT fn_create_updated_at_trigger('integrations');


-- ============================================================================
-- §20. DEFERRED FOREIGN KEYS (circular references)
-- ============================================================================

ALTER TABLE inventory_transactions
    ADD CONSTRAINT fk_inv_tx_project
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE SET NULL;

ALTER TABLE people_availability
    ADD CONSTRAINT fk_resource_avail_project
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE SET NULL;

ALTER TABLE people_payouts
    ADD CONSTRAINT fk_payouts_project
        FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE SET NULL;

ALTER TABLE inbound_requests
    ADD CONSTRAINT fk_inbound_template
        FOREIGN KEY (template_id) REFERENCES templates (id) ON DELETE SET NULL;

ALTER TABLE projects
    ADD CONSTRAINT fk_projects_inbound_request
        FOREIGN KEY (inbound_request_id) REFERENCES inbound_requests (id) ON DELETE SET NULL;


-- ============================================================================
-- §21. ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- App sets: SET app.current_org_id = '<uuid>'; before each request.

DO
$$
    DECLARE
        t TEXT;
    BEGIN
        FOR t IN
            SELECT UNNEST(ARRAY [
                'tag_groups','tags','tag_group_members','entity_tags',
                'custom_field_definitions','custom_field_groups','custom_field_group_members',
                'entity_custom_field_groups','custom_field_values',
                'categories',
                'clients','contacts','jobsites',
                'vendors',
                'products','inventory_items','stock_levels','inventory_transactions',
                'people','people_availability','people_payouts',
                'projects','jobs','job_people','job_products',
                'inbound_requests',
                'quotes','quote_line_items',
                'invoices','invoice_line_items','payments',
                'contracts',
                'file_attachments',
                'templates','template_items',
                'communication_log',
                'activity_log','notifications',
                'integrations','integration_sync_log'
                ])
            LOOP
                EXECUTE FORMAT('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
                EXECUTE FORMAT(
                        'CREATE POLICY %I_org_isolation ON %I
                         USING (organization_id = current_setting(''app.current_org_id'')::UUID)',
                        t, t
                        );
            END LOOP;
    END;
$$;
