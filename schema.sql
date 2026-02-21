-- ============================================================================
-- ASAP Platform — Generic Service / Gig-Economy Database Schema
-- PostgreSQL 15+
-- ============================================================================
--
-- DESIGN PRINCIPLES:
--   1. Multi-tenant — organization_id on EVERY business table, RLS enforced
--   2. Industry-agnostic — works for audio rental, landscaping, plumbing, etc.
--   3. Recursive products — rig → sub-components of any depth
--   4. Generic collections — no hardcoded sub-tables; org defines own fields
--   5. Full lifecycle — inbound request → project → quote → invoice → payment
--   6. Two-sided financials — track client billing AND resource/vendor payouts
--   7. Dual inventory — serialized (per-unit tracking) + consumable (quantity tracking)
--
-- TABLE COUNT: 37 tables, 3 views
--
-- DOMAIN MAP:
--   §1  Core           organizations, users, organization_members
--   §2  Tags           tag_groups, tags, entity_tags
--   §3  Lookups        lookup_lists, lookup_list_items
--   §4  Custom fields  custom_field_definitions, entity_collection_entries
--   §5  Categories     categories
--   §6  CRM            clients, client_contacts
--   §7  Vendors        vendors, vendor_contacts
--   §8  Products       products, inventory_items, stock_levels, inventory_transactions
--   §9  Resources      resources, resource_availability, resource_payouts
--   §10 Projects       projects, project_date_ranges, project_resources, project_products
--   §11 Pipeline       inbound_requests
--   §12 Quotes         quotes, quote_line_items
--   §13 Invoices       invoices, invoice_line_items, payments
--   §14 Contracts      contracts
--   §15 Files          file_attachments
--   §16 Templates      templates, template_items
--   §17 Comms          communication_log
--   §18 Activity       activity_log, notifications
--   §19 Automation     workflow_rules
--   §20 Integrations   integrations, integration_sync_log
--
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- §0. UTILITY: updated_at trigger + sequences
-- ============================================================================

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

-- Sequences for human-readable IDs (app formats: "GIG-2025-0042")
CREATE SEQUENCE seq_project_number START 1;
CREATE SEQUENCE seq_quote_number START 1;
CREATE SEQUENCE seq_invoice_number START 1;


-- ============================================================================
-- §1. ORGANIZATIONS & USERS
-- ============================================================================

CREATE TABLE organizations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(100) NOT NULL UNIQUE,         -- "asap-sound", "greenscape-llc"
    logo_url        TEXT,
    -- Example: {"timezone":"America/Los_Angeles","currency":"USD","locale":"en-US",
    --           "fiscal_year_start":"01","date_format":"MM/DD/YYYY"}
    settings        JSONB NOT NULL DEFAULT '{}',
    -- Example: {"legal_name":"ASAP Sound LLC","tax_id":"XX-XXXXXXX",
    --           "address":{"street":"123 Main","city":"LA","state":"CA","zip":"90001","country":"US"}}
    billing_info    JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(320) NOT NULL UNIQUE,
    password_hash   TEXT,                                 -- NULL for SSO-only users
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),
    phone           VARCHAR(50),
    avatar_url      TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_org_members_user ON organization_members(user_id);

SELECT fn_create_updated_at_trigger('organizations');
SELECT fn_create_updated_at_trigger('users');


-- ============================================================================
-- §2. TAGS (Polymorphic, Org-Scoped)
-- ============================================================================
-- tag_groups organize tags into categories for structured filtering.
-- A tag can exist without a group (ungrouped / general-purpose).
--
-- Example groups + tags:
--   "Genre"         → Rock, Pop, Hip-Hop, Electronic, Country
--   "Region"        → West Coast, East Coast, Europe, Asia
--   "Priority"      → VIP, Standard, New Client
--   "Project Type"  → Tour, Festival, Corporate, Recording Session
--
-- Example: client "Charlie Puth" tagged with Pop (Genre) + West Coast (Region) + VIP (Priority)

CREATE TABLE tag_groups (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,                -- "Genre", "Region"
    color           VARCHAR(7),                           -- "#FF5733"
    description     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (organization_id, name)
);

CREATE TABLE tags (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    tag_group_id    UUID REFERENCES tag_groups(id) ON DELETE SET NULL,
    name            VARCHAR(100) NOT NULL,
    color           VARCHAR(7),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (organization_id, tag_group_id, name)
);

CREATE INDEX idx_tags_org ON tags(organization_id);

CREATE TABLE entity_tags (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    tag_id          UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    entity_type     VARCHAR(50) NOT NULL
                    CHECK (entity_type IN ('client','vendor','product','resource','project','quote','invoice','contract')),
    entity_id       UUID NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (tag_id, entity_type, entity_id)
);

CREATE INDEX idx_entity_tags_lookup ON entity_tags(entity_type, entity_id);
CREATE INDEX idx_entity_tags_org ON entity_tags(organization_id);


-- ============================================================================
-- §3. LOOKUP LISTS — Org-Managed Dictionaries
-- ============================================================================
-- Example (ASAP Sound): list "skills" → "ProTools","Ableton","Monitors","FOH"
-- Example (GreenScape): list "equipment-licenses" → "Excavator","Bulldozer","Crane"
-- Items support hierarchy via parent_id: "Audio" → "ProTools", "Ableton"

CREATE TABLE lookup_lists (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(100) NOT NULL,
    description     TEXT,
    is_system       BOOLEAN NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (organization_id, slug)
);

CREATE INDEX idx_lookup_lists_org ON lookup_lists(organization_id);

CREATE TABLE lookup_list_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lookup_list_id  UUID NOT NULL REFERENCES lookup_lists(id) ON DELETE CASCADE,
    value           VARCHAR(255) NOT NULL,                -- "protools" (machine key)
    label           VARCHAR(255) NOT NULL,                -- "ProTools" (display)
    color           VARCHAR(7),
    icon            VARCHAR(50),
    -- Example skill: {"category":"Software"}
    -- Example language: {"code":"es","region":"Latin America"}
    metadata        JSONB NOT NULL DEFAULT '{}',
    parent_id       UUID REFERENCES lookup_list_items(id) ON DELETE SET NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    display_order   INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (lookup_list_id, value)
);

CREATE INDEX idx_lli_list ON lookup_list_items(lookup_list_id);
CREATE INDEX idx_lli_parent ON lookup_list_items(parent_id);

SELECT fn_create_updated_at_trigger('lookup_lists');


-- ============================================================================
-- §4. CUSTOM FIELD DEFINITIONS + ENTITY COLLECTIONS
-- ============================================================================
-- SIMPLE fields (stored in entity's custom_fields JSONB):
--   text | number | boolean | date | datetime | url | email | phone | select | multi_select
--
-- COLLECTION fields (stored as rows in entity_collection_entries):
--   collection       — repeatable structured entries (skills, certs, licenses)
--   file_collection  — repeatable file uploads with metadata (W9, passport)
--
-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ EXAMPLE: ASAP Sound defines for entity_type = 'resource':             │
-- │  field_key="skills"       type=collection      → skill + proficiency  │
-- │  field_key="languages"    type=collection      → language + level     │
-- │  field_key="documents"    type=file_collection → W9, passport, resume │
-- │  field_key="years_exp"    type=number          → stored in JSONB      │
-- │  field_key="has_passport" type=boolean         → stored in JSONB      │
-- ├─────────────────────────────────────────────────────────────────────────┤
-- │ EXAMPLE: GreenScape defines for entity_type = 'resource':             │
-- │  field_key="equipment_licenses" type=collection  → license + expiry   │
-- │  field_key="vehicle_class"      type=multi_select→ from lookup list   │
-- │  field_key="safety_certs"       type=file_collection → cert + expiry  │
-- └─────────────────────────────────────────────────────────────────────────┘

CREATE TABLE custom_field_definitions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    entity_type     VARCHAR(50) NOT NULL
                    CHECK (entity_type IN ('client','vendor','product','resource','project',
                                           'quote','invoice','inventory_item')),
    field_key       VARCHAR(100) NOT NULL,
    field_label     VARCHAR(255) NOT NULL,
    field_type      VARCHAR(30) NOT NULL
                    CHECK (field_type IN ('text','number','boolean','date','datetime',
                                          'url','email','phone',
                                          'select','multi_select',
                                          'collection','file_collection')),
    -- For select/multi_select with inline options
    -- Example: ["beginner","intermediate","expert"]
    options         JSONB,
    -- For select/multi_select/collection referencing a managed dictionary
    lookup_list_id  UUID REFERENCES lookup_lists(id) ON DELETE SET NULL,
    -- For collection/file_collection: JSON schema of each entry
    -- Example (skills):
    --   [{"key":"skill","label":"Skill","type":"lookup","required":true},
    --    {"key":"proficiency","label":"Level","type":"select","options":["beginner","intermediate","expert"]}]
    -- Example (documents):
    --   [{"key":"doc_type","label":"Type","type":"select","options":["w9","passport","cert","resume"],"required":true},
    --    {"key":"name","label":"Name","type":"text","required":true},
    --    {"key":"file_url","label":"File","type":"file","required":true},
    --    {"key":"expires_at","label":"Expiry","type":"date"}]
    collection_schema JSONB,
    min_entries     INT,
    max_entries     INT,
    is_required     BOOLEAN NOT NULL DEFAULT FALSE,
    default_value   TEXT,
    is_filterable   BOOLEAN NOT NULL DEFAULT FALSE,
    display_order   INT NOT NULL DEFAULT 0,
    section         VARCHAR(100),                         -- "Professional Info", "Compliance", "Rates"
    show_on_form    BOOLEAN NOT NULL DEFAULT TRUE,
    show_on_card    BOOLEAN NOT NULL DEFAULT FALSE,
    -- Conditional visibility: show only when another field has specific value
    -- Example: show "autotune_channels" only when "service_type" = "autotune"
    depends_on_field_id UUID REFERENCES custom_field_definitions(id) ON DELETE SET NULL,
    depends_on_value    TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (organization_id, entity_type, field_key)
);

CREATE INDEX idx_cfd_org_entity ON custom_field_definitions(organization_id, entity_type);

-- Storage for collection entries. One row per entry per entity per field.
--
-- Example: Resource "Jesse" — 2 skills, 1 language, 1 document:
--   (field=skills, entity=jesse, data={"skill":"<protools-id>","proficiency":"expert"}, lookup_item_id=<protools>)
--   (field=skills, entity=jesse, data={"skill":"<monitors-id>","proficiency":"expert"}, lookup_item_id=<monitors>)
--   (field=languages, entity=jesse, data={"language":"<es-id>","proficiency":"fluent"}, lookup_item_id=<es>)
--   (field=documents, entity=jesse, data={"doc_type":"w9","name":"W9 2025","file_url":"https://…","expires_at":"2025-12-31"})
--
-- Query: "Find Spanish-speaking monitor engineer in LA"
--   SELECT DISTINCT r.first_name, r.last_name
--   FROM resources r
--   JOIN entity_collection_entries lang ON lang.entity_id = r.id AND lang.entity_type = 'resource'
--   JOIN lookup_list_items lli_lang ON lli_lang.id = lang.lookup_item_id AND lli_lang.value = 'es'
--   JOIN entity_collection_entries skill ON skill.entity_id = r.id AND skill.entity_type = 'resource'
--   JOIN lookup_list_items lli_skill ON lli_skill.id = skill.lookup_item_id AND lli_skill.value = 'monitors'
--   WHERE r.organization_id = '<org>' AND r.location_city ILIKE '%los angeles%' AND r.is_active = TRUE;

CREATE TABLE entity_collection_entries (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    field_definition_id UUID NOT NULL REFERENCES custom_field_definitions(id) ON DELETE CASCADE,
    entity_type         VARCHAR(50) NOT NULL,
    entity_id           UUID NOT NULL,
    data                JSONB NOT NULL DEFAULT '{}',
    -- Denormalized lookup FK for fast filtering without JSONB parsing
    lookup_item_id      UUID REFERENCES lookup_list_items(id) ON DELETE SET NULL,
    display_order       INT NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ece_org ON entity_collection_entries(organization_id);
CREATE INDEX idx_ece_field ON entity_collection_entries(field_definition_id);
CREATE INDEX idx_ece_entity ON entity_collection_entries(entity_type, entity_id);
CREATE INDEX idx_ece_lookup ON entity_collection_entries(lookup_item_id);
CREATE INDEX idx_ece_data ON entity_collection_entries USING GIN (data);
CREATE INDEX idx_ece_field_lookup ON entity_collection_entries(field_definition_id, lookup_item_id);

SELECT fn_create_updated_at_trigger('custom_field_definitions');
SELECT fn_create_updated_at_trigger('entity_collection_entries');


-- ============================================================================
-- §5. CATEGORIES (P&L / Revenue Classification)
-- ============================================================================
-- Example tree (ASAP Sound):
--   Income ─┬─ Rental Income ─┬─ Audio Rental
--           │                 └─ Video Rental
--           ├─ Staffing Income
--           ├─ Previs Income
--           └─ Cartage & Freight
--   Expense ─┬─ Contractor Payments
--            ├─ Equipment Purchases
--            ├─ Sub-Rental Costs
--            ├─ Consumables
--            └─ Travel & Accommodation

CREATE TABLE categories (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    parent_id       UUID REFERENCES categories(id) ON DELETE SET NULL,
    name            VARCHAR(255) NOT NULL,
    code            VARCHAR(50),                          -- "4010" (accounting code)
    type            VARCHAR(30) NOT NULL DEFAULT 'income'
                    CHECK (type IN ('income','expense','both')),
    description     TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    display_order   INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (organization_id, parent_id, name)
);

CREATE INDEX idx_categories_org ON categories(organization_id);
CREATE INDEX idx_categories_parent ON categories(parent_id);


-- ============================================================================
-- §6. CLIENTS (CRM)
-- ============================================================================
-- Who pays us. Can be a company ("Live Nation") or individual ("Charlie Puth").
-- Example custom_fields (music): {"preferred_payment":"net_30","vip":true}
-- Example custom_fields (landscaping): {"property_sqft":45000,"gate_code":"1234"}

CREATE TABLE clients (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    type            VARCHAR(30) NOT NULL DEFAULT 'company'
                    CHECK (type IN ('company','individual')),
    email           VARCHAR(320),
    phone           VARCHAR(50),
    website         TEXT,
    -- Example: {"street":"123 Vine St","city":"LA","state":"CA","zip":"90028","country":"US"}
    billing_address JSONB,
    shipping_address JSONB,
    notes           TEXT,
    external_accounting_id VARCHAR(100),
    pricing_tier    VARCHAR(50),
    custom_fields   JSONB NOT NULL DEFAULT '{}',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_clients_org ON clients(organization_id);
CREATE INDEX idx_clients_name ON clients(organization_id, name);
CREATE INDEX idx_clients_custom ON clients USING GIN (custom_fields);

-- Example: Charlie Puth's team → Tour Manager, Production Manager, Business Manager
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


-- ============================================================================
-- §7. VENDORS (Suppliers / Sub-Rental Sources)
-- ============================================================================
-- Who we pay for sub-rented gear, outsourced services, consumable supplies.
--
-- Example (ASAP Sound):
--   Vendor "Firehouse Productions"   — sub-rental of lighting rigs
--   Vendor "Guitar Center Pro"       — backup gear + consumable supplies
--   Vendor "SoundGrid Rentals"       — Waves SoundGrid servers
--
-- Example (GreenScape):
--   Vendor "Bobcat Rentals LA"       — excavator sub-rental
--   Vendor "SiteOne Landscape"       — bulk materials (soil, mulch, fertilizer)

CREATE TABLE vendors (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    type            VARCHAR(30) NOT NULL DEFAULT 'company'
                    CHECK (type IN ('company','individual')),
    email           VARCHAR(320),
    phone           VARCHAR(50),
    website         TEXT,
    -- Example: {"street":"456 Stage Blvd","city":"Burbank","state":"CA","zip":"91502","country":"US"}
    billing_address JSONB,
    notes           TEXT,
    external_accounting_id VARCHAR(100),
    -- Example: {"payment_terms":"net_30","preferred_method":"bank_transfer","tax_id":"XX-XXXXXXX"}
    payment_info    JSONB NOT NULL DEFAULT '{}',
    custom_fields   JSONB NOT NULL DEFAULT '{}',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vendors_org ON vendors(organization_id);
CREATE INDEX idx_vendors_name ON vendors(organization_id, name);
CREATE INDEX idx_vendors_custom ON vendors USING GIN (custom_fields);

-- Example: Firehouse Productions contacts → Account Rep, Warehouse Manager
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


-- ============================================================================
-- §8. PRODUCTS & INVENTORY
-- ============================================================================
--
-- TRACKING TYPES (how inventory is managed):
--   serialized  — each unit tracked individually with serial number / barcode
--                 Storage: inventory_items (one row per physical unit)
--                 Example: MacBook Pro SN-001, SN-002, SN-003
--   consumable  — bulk quantity tracked per location, consumed not returned
--                 Storage: stock_levels (quantity per product per location)
--                 Example: Gaffer Tape — 50 rolls in Warehouse A, 12 in Van #2
--   non_tracked — services, fees, packages — no physical inventory
--                 Example: "Playback Engineer day rate", "Rush Fee"
--
-- RECURSIVE HIERARCHY via parent_id:
--   📦 Matty 16 Rig (package, non_tracked)
--   ├── 💻 MacBook Pro 16" (physical, serialized)
--   ├── 🔌 Matty Face USB ×2 (physical, serialized)
--   ├── 🎛️ MIDI Controller (physical, serialized)
--   └── 📦 Cable Kit (package, non_tracked)
--       ├── 🔌 XLR Cable ×4 (physical, consumable)
--       └── 🔌 USB-C Cable ×2 (physical, consumable)

CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    parent_id       UUID REFERENCES products(id) ON DELETE SET NULL,
    category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
    name            VARCHAR(255) NOT NULL,
    sku             VARCHAR(100),
    product_type    VARCHAR(30) NOT NULL DEFAULT 'physical'
                    CHECK (product_type IN ('physical','service','package','fee')),
    description     TEXT,
    -- Pricing defaults (overridable per quote line)
    unit_price      NUMERIC(12,2),                        -- NULL = sliding scale / negotiated
    price_unit      VARCHAR(30) DEFAULT 'each'
                    CHECK (price_unit IN ('each','day','hour','week','month','flat')),
    cost_price      NUMERIC(12,2),
    -- Inventory tracking strategy
    -- Example: MacBook = serialized, Gaffer Tape = consumable, Consulting = non_tracked
    tracking_type   VARCHAR(20) NOT NULL DEFAULT 'non_tracked'
                    CHECK (tracking_type IN ('serialized','consumable','non_tracked')),
    -- Consumable-specific fields (NULL for serialized / non_tracked)
    unit_of_measure VARCHAR(30),                          -- "rolls", "meters", "boxes", "liters", "units"
    reorder_point   INT,                                  -- alert when total stock falls to this level
    -- Rental / sale flags
    is_rentable     BOOLEAN NOT NULL DEFAULT FALSE,
    is_sellable     BOOLEAN NOT NULL DEFAULT TRUE,
    -- Asset tracking
    purchase_price  NUMERIC(12,2),
    purchase_date   DATE,
    depreciation_method VARCHAR(30)
                    CHECK (depreciation_method IS NULL OR
                           depreciation_method IN ('straight_line','declining_balance','none')),
    useful_life_months INT,
    custom_fields   JSONB NOT NULL DEFAULT '{}',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    display_order   INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_org ON products(organization_id);
CREATE INDEX idx_products_parent ON products(parent_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_type ON products(organization_id, product_type);
CREATE INDEX idx_products_sku ON products(organization_id, sku);
CREATE INDEX idx_products_tracking ON products(organization_id, tracking_type);
CREATE INDEX idx_products_custom ON products USING GIN (custom_fields);

-- ── SERIALIZED INVENTORY ────────────────────────────────────────────────
-- Individual serial-numbered units. Only for tracking_type = 'serialized'.
-- Product = type, inventory_item = physical instance.
--
-- Example: Product "MacBook Pro 16" → items SN-001, SN-002, SN-003

CREATE TABLE inventory_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    vendor_id       UUID REFERENCES vendors(id) ON DELETE SET NULL,  -- sub-rented from this vendor
    serial_number   VARCHAR(255),
    barcode         VARCHAR(255),
    status          VARCHAR(30) NOT NULL DEFAULT 'available'
                    CHECK (status IN ('available','reserved','checked_out','maintenance','retired')),
    condition       VARCHAR(30) DEFAULT 'good'
                    CHECK (condition IN ('new','good','fair','damaged')),
    ownership       VARCHAR(20) NOT NULL DEFAULT 'owned'
                    CHECK (ownership IN ('owned','rented','loaned')),
    location        VARCHAR(255),                         -- "Warehouse A, Shelf 3"
    notes           TEXT,
    purchase_price  NUMERIC(12,2),
    purchase_date   DATE,
    custom_fields   JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_inv_items_org ON inventory_items(organization_id);
CREATE INDEX idx_inv_items_product ON inventory_items(product_id);
CREATE INDEX idx_inv_items_vendor ON inventory_items(vendor_id);
CREATE INDEX idx_inv_items_status ON inventory_items(organization_id, status);
CREATE INDEX idx_inv_items_barcode ON inventory_items(organization_id, barcode);
CREATE INDEX idx_inv_items_serial ON inventory_items(organization_id, serial_number);

-- ── CONSUMABLE INVENTORY ────────────────────────────────────────────────
-- Quantity-based stock per product per location.
-- Only for tracking_type = 'consumable'.
-- Multi-location from day one — every business eventually needs it.
--
-- Example (ASAP Sound):
--   product "Gaffer Tape" → stock_levels:
--     {location: "Warehouse A",   quantity_on_hand: 50, quantity_reserved: 8}
--     {location: "Van #2",        quantity_on_hand: 12, quantity_reserved: 0}
--
-- Example (GreenScape):
--   product "Mulch" → stock_levels:
--     {location: "Main Yard",     quantity_on_hand: 200, quantity_reserved: 40}  -- in cubic yards
--     {location: "Truck #5",      quantity_on_hand: 8,   quantity_reserved: 8}
--
-- Query: "What needs reordering?"
--   SELECT p.name, p.unit_of_measure, p.reorder_point,
--          SUM(sl.quantity_on_hand) AS total_on_hand
--   FROM stock_levels sl
--   JOIN products p ON p.id = sl.product_id
--   WHERE p.organization_id = '<org>' AND p.tracking_type = 'consumable'
--   GROUP BY p.id
--   HAVING SUM(sl.quantity_on_hand) <= p.reorder_point;

CREATE TABLE stock_levels (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    location        VARCHAR(255) NOT NULL,                -- "Warehouse A", "Van #2", "Job Site"
    quantity_on_hand  NUMERIC(12,2) NOT NULL DEFAULT 0,   -- physically present
    quantity_reserved NUMERIC(12,2) NOT NULL DEFAULT 0,   -- allocated to upcoming projects
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (product_id, location),
    CHECK (quantity_on_hand >= 0),
    CHECK (quantity_reserved >= 0),
    CHECK (quantity_reserved <= quantity_on_hand)
);

CREATE INDEX idx_stock_levels_org ON stock_levels(organization_id);
CREATE INDEX idx_stock_levels_product ON stock_levels(product_id);

-- ── INVENTORY TRANSACTIONS (unified audit log) ──────────────────────────
-- Covers BOTH serialized and consumable operations.
--
-- For serialized products: references inventory_item_id (specific unit)
--   Example: check_out MacBook SN-001 to project Moby Tour
--
-- For consumable products: references product_id + stock_level_id + quantity
--   Example: consume 12 rolls of gaffer tape from Warehouse A for project Moby
--
-- CHECK constraint ensures correct fields are filled per tracking type.
--
-- Consumable flow example:
--   -- Consume 12 rolls from Warehouse A for Moby Tour
--   INSERT INTO inventory_transactions
--     (product_id, stock_level_id, quantity, transaction_type, project_id)
--   VALUES ('<gaffer>', '<warehouse-a>', 12, 'consume', '<moby>');
--   UPDATE stock_levels SET quantity_on_hand = quantity_on_hand - 12 WHERE id = '<warehouse-a>';
--
--   -- Restock 50 rolls to Warehouse A (PO from Guitar Center)
--   INSERT INTO inventory_transactions
--     (product_id, stock_level_id, quantity, transaction_type, notes)
--   VALUES ('<gaffer>', '<warehouse-a>', 50, 'restock', 'PO #1234 from Guitar Center');
--   UPDATE stock_levels SET quantity_on_hand = quantity_on_hand + 50 WHERE id = '<warehouse-a>';
--
--   -- Transfer 20 rolls from Warehouse A → Van #2
--   INSERT INTO inventory_transactions
--     (product_id, stock_level_id, quantity, transaction_type)
--   VALUES ('<gaffer>', '<warehouse-a>', 20, 'transfer_out');
--   INSERT INTO inventory_transactions
--     (product_id, stock_level_id, quantity, transaction_type)
--   VALUES ('<gaffer>', '<van-2>', 20, 'transfer_in');

CREATE TABLE inventory_transactions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    -- Serialized: which specific unit
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    -- Consumable: which product + which stock location + how many
    product_id      UUID REFERENCES products(id) ON DELETE CASCADE,
    stock_level_id  UUID REFERENCES stock_levels(id) ON DELETE CASCADE,
    quantity        NUMERIC(12,2),                        -- positive = in, used as absolute for consume
    -- Shared fields
    project_id      UUID,                                 -- FK deferred (§21)
    transaction_type VARCHAR(30) NOT NULL
                    CHECK (transaction_type IN (
                        -- Serialized operations
                        'check_out','check_in','transfer','maintenance','retire',
                        -- Consumable operations
                        'consume','restock','adjust','transfer_in','transfer_out'
                    )),
    performed_by    UUID REFERENCES users(id) ON DELETE SET NULL,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Ensure correct fields per tracking type
    CHECK (
        -- Serialized: must have item, must NOT have stock/quantity
        (inventory_item_id IS NOT NULL AND product_id IS NULL AND stock_level_id IS NULL AND quantity IS NULL)
        OR
        -- Consumable: must have product + stock + quantity, must NOT have item
        (inventory_item_id IS NULL AND product_id IS NOT NULL AND stock_level_id IS NOT NULL AND quantity IS NOT NULL)
    )
);

CREATE INDEX idx_inv_tx_item ON inventory_transactions(inventory_item_id);
CREATE INDEX idx_inv_tx_product ON inventory_transactions(product_id);
CREATE INDEX idx_inv_tx_stock ON inventory_transactions(stock_level_id);
CREATE INDEX idx_inv_tx_project ON inventory_transactions(project_id);
CREATE INDEX idx_inv_tx_org ON inventory_transactions(organization_id);
CREATE INDEX idx_inv_tx_type ON inventory_transactions(organization_id, transaction_type);

SELECT fn_create_updated_at_trigger('products');
SELECT fn_create_updated_at_trigger('inventory_items');
SELECT fn_create_updated_at_trigger('stock_levels');


-- ============================================================================
-- §9. RESOURCES (Contractors + Employees) — Slim Core
-- ============================================================================
-- Only universal fields here. Industry-specific fields (skills, languages,
-- documents, certs…) are org-defined via §4 custom fields + collections.

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
    -- Example: {"years_experience":8,"has_passport":true,"per_diem_rate":50.00,"bio":"Senior engineer…"}
    custom_fields       JSONB NOT NULL DEFAULT '{}',
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_resources_org ON resources(organization_id);
CREATE INDEX idx_resources_type ON resources(organization_id, type);
CREATE INDEX idx_resources_location ON resources(organization_id, location_country, location_state, location_city);
CREATE INDEX idx_resources_custom ON resources USING GIN (custom_fields);

-- Example: Jesse unavailable Dec 20-Jan 5 (vacation); booked Jan 10-17 (Moby Tour)
CREATE TABLE resource_availability (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    resource_id     UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    date_start      DATE NOT NULL,
    date_end        DATE NOT NULL,
    status          VARCHAR(30) NOT NULL DEFAULT 'available'
                    CHECK (status IN ('available','unavailable','tentative','booked')),
    reason          TEXT,
    project_id      UUID,                                 -- FK deferred (§21)
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (date_end >= date_start)
);

CREATE INDEX idx_resource_avail_resource ON resource_availability(resource_id);
CREATE INDEX idx_resource_avail_dates ON resource_availability(date_start, date_end);
CREATE INDEX idx_resource_avail_org ON resource_availability(organization_id);

-- Tracks actual payments TO resources (contractors/employees).
-- Answers: "How much do we owe Jesse this month?" / "Total contractor costs for January?"
--
-- Example: Jesse worked Moby Tour (7 days × $650/day = $4,550) — paid
--   {resource_id: jesse, project_id: moby, amount: 4550.00, status: 'paid',
--    payment_method: 'bank_transfer', paid_at: '2025-02-01',
--    period_start: '2025-01-10', period_end: '2025-01-17'}
--
-- Example: Jesse worked Charlie Puth (3d × $700 = $2,100) — still pending
--   {resource_id: jesse, project_id: puth, amount: 2100.00, status: 'pending'}
--
-- Query: "Total owed to all contractors this month"
--   SELECT r.first_name, r.last_name, SUM(rp.amount) AS total_owed
--   FROM resource_payouts rp
--   JOIN resources r ON r.id = rp.resource_id
--   WHERE rp.organization_id = '<org>' AND rp.status = 'pending'
--   GROUP BY r.id, r.first_name, r.last_name;

CREATE TABLE resource_payouts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    resource_id     UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    project_id      UUID,                                 -- FK deferred (§21)
    description     VARCHAR(500),                          -- "Moby Tour — Jan 10-17 (7 days)"
    amount          NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    currency        VARCHAR(3) NOT NULL DEFAULT 'USD',
    -- Lifecycle: pending → approved → paid | cancelled
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


-- ============================================================================
-- §10. PROJECTS (Gigs / Jobs / Engagements)
-- ============================================================================
-- Lifecycle: pending → approved → in_progress → completed | cancelled

CREATE TABLE projects (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_id       UUID REFERENCES clients(id) ON DELETE SET NULL,
    project_number  VARCHAR(50) NOT NULL,                  -- "GIG-2025-0042"
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    status          VARCHAR(30) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','in_progress','completed','cancelled')),
    priority        VARCHAR(20) DEFAULT 'normal'
                    CHECK (priority IN ('low','normal','high','urgent')),
    venue_name      VARCHAR(255),
    -- Example: {"address":"1111 S Figueroa","city":"LA","state":"CA","country":"US","lat":34.043,"lng":-118.267}
    location        JSONB,
    -- Example: {"name":"Mike R","email":"mike@tour.com","phone":"+1555123","role":"Tour Manager"}
    onsite_contact  JSONB,
    -- Denormalized totals (recomputed by app on changes)
    total_billable      NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_cost          NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_profit        NUMERIC(12,2) NOT NULL DEFAULT 0,
    external_accounting_id VARCHAR(100),
    source          VARCHAR(50)
                    CHECK (source IS NULL OR source IN ('website_form','referral','repeat_client','manual','api')),
    inbound_request_id UUID,                              -- FK deferred (§21)
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

-- Multiple date ranges per project — solves "Charlie Puth problem"
-- Example: 1 project, 3 ranges:
--   {label:"Tour Leg 1",  "2025-01-05"→"2025-01-15", multiplier:1.0}
--   {label:"Off Days",    "2025-01-16"→"2025-01-20", multiplier:0.5}
--   {label:"Tour Leg 2",  "2025-02-01"→"2025-02-10", multiplier:1.0}
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

-- Example: Jesse as "Playback Engineer", bill $800/day, pay $650/day
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
    date_range_ids  UUID[],                               -- which project_date_ranges apply
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

-- Equipment / consumables assigned to a project.
--
-- For serialized gear:
--   product_id + inventory_item_id, status = checked_out / returned
--   Example: Matty 16 Rig (owned) → vendor_id = NULL
--   Example: 20× PAR lights (sub-rented from Firehouse) → vendor_id = firehouse
--
-- For consumables:
--   product_id only (no inventory_item_id), status = consumed
--   Example: 12 rolls Gaffer Tape consumed on Moby Tour
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


-- ============================================================================
-- §11. INBOUND REQUESTS (Website Forms → Pipeline)
-- ============================================================================
-- Example form_data:
--   {"service_type":"staffing_and_rental","artist":"Chainsmokers",
--    "start_date":"2025-03-14","end_date":"2025-03-19","num_shows":6,
--    "needs_autotune":true,"autotune_channels":4,"software":"ableton"}

CREATE TABLE inbound_requests (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    submitter_name  VARCHAR(255),
    submitter_email VARCHAR(320),
    submitter_phone VARCHAR(50),
    submitter_company VARCHAR(255),
    client_id       UUID REFERENCES clients(id) ON DELETE SET NULL,
    template_id     UUID,                                 -- FK deferred (§21)
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

CREATE INDEX idx_inbound_org ON inbound_requests(organization_id);
CREATE INDEX idx_inbound_status ON inbound_requests(organization_id, status);

SELECT fn_create_updated_at_trigger('inbound_requests');


-- ============================================================================
-- §12. QUOTES
-- ============================================================================
-- Lifecycle: draft → sent → viewed → approved → converted (to invoice)
--                                  ↘ declined / expired
-- version tracks revisions of the same quote_number.
--
-- Example line items for Moby:
--   Section "Staffing":  "Playback Engineer (Jesse) — 7d × $800"  [Staffing Income]
--   Section "Rentals":   "Matty 16 Rig — 7d × $250"              [Rental > Audio]
--   Section "Rentals":   "20× PAR lights (sub-rented) — 7d × $30" [Rental > Lighting]
--   Section "Consumables": "Gaffer Tape — 12 rolls × $8"          [Consumables]
--   Section "Travel":    "Cartage to venue — flat $500"           [Cartage & Freight]

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

CREATE INDEX idx_quotes_org ON quotes(organization_id);
CREATE INDEX idx_quotes_project ON quotes(project_id);
CREATE INDEX idx_quotes_client ON quotes(client_id);
CREATE INDEX idx_quotes_status ON quotes(organization_id, status);
CREATE UNIQUE INDEX idx_quotes_number_version ON quotes(organization_id, quote_number, version);

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

CREATE INDEX idx_qli_quote ON quote_line_items(quote_id);
CREATE INDEX idx_qli_org ON quote_line_items(organization_id);
CREATE INDEX idx_qli_category ON quote_line_items(category_id);

SELECT fn_create_updated_at_trigger('quotes');


-- ============================================================================
-- §13. INVOICES & PAYMENTS
-- ============================================================================
-- Lifecycle: draft → sent → viewed → partially_paid → paid | overdue → void

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
CREATE INDEX idx_invoices_project ON invoices(project_id);
CREATE INDEX idx_invoices_client ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(organization_id, status);
CREATE UNIQUE INDEX idx_invoices_number ON invoices(organization_id, invoice_number);

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

CREATE INDEX idx_ili_invoice ON invoice_line_items(invoice_id);
CREATE INDEX idx_ili_org ON invoice_line_items(organization_id);

-- Payments FROM clients TO us
-- Example: $5,000 via credit card on Feb 15; $2,350 via wire on Mar 1
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

SELECT fn_create_updated_at_trigger('invoices');


-- ============================================================================
-- §14. CONTRACTS
-- ============================================================================
-- Types: service_agreement, rental_agreement, subcontractor, nda, other
-- Can link to client, resource, or vendor (or any combination).

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

SELECT fn_create_updated_at_trigger('contracts');


-- ============================================================================
-- §15. FILE ATTACHMENTS (Generic, Polymorphic)
-- ============================================================================
-- Any entity can have files. Separate from entity_collection_entries (structured data).
-- Example: project has stage_plot.pdf, shipping_manifest.xlsx

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


-- ============================================================================
-- §16. TEMPLATES
-- ============================================================================
-- Types: inbound_form | quote | project | contract
--
-- Example (quote template "Standard Playback Package"):
--   item: product "Matty 16 Rig", qty 1, $250/day, section "Rentals"
--   item: resource_role "Playback Engineer", $800/day, section "Staffing"
--   item: fee "Cartage", $500 flat, section "Travel"

CREATE TABLE templates (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    template_type   VARCHAR(30) NOT NULL
                    CHECK (template_type IN ('inbound_form','quote','project','contract')),
    is_client_facing BOOLEAN NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    -- Example: {"auto_approve":false,"default_currency":"USD","default_terms":"Net 30"}
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

SELECT fn_create_updated_at_trigger('templates');


-- ============================================================================
-- §17. COMMUNICATION LOG
-- ============================================================================
-- Tracks all outbound/inbound comms. Answers: "did we email the quote to Moby?"

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
    sent_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_comms_org ON communication_log(organization_id);
CREATE INDEX idx_comms_entity ON communication_log(entity_type, entity_id);
CREATE INDEX idx_comms_sent ON communication_log(organization_id, sent_at DESC);


-- ============================================================================
-- §18. ACTIVITY LOG & NOTIFICATIONS
-- ============================================================================

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


-- ============================================================================
-- §19. WORKFLOW AUTOMATION RULES
-- ============================================================================
-- Example: "When project approved → email client + create draft quote"
-- Example: "When stock falls below reorder_point → notify owner"

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


-- ============================================================================
-- §20. INTEGRATIONS (Xero, QuickBooks, Stripe, DocuSign…)
-- ============================================================================

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

SELECT fn_create_updated_at_trigger('integrations');


-- ============================================================================
-- §21. DEFERRED FOREIGN KEYS (circular references)
-- ============================================================================

ALTER TABLE inventory_transactions
    ADD CONSTRAINT fk_inv_tx_project
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;

ALTER TABLE resource_availability
    ADD CONSTRAINT fk_resource_avail_project
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;

ALTER TABLE resource_payouts
    ADD CONSTRAINT fk_payouts_project
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;

ALTER TABLE inbound_requests
    ADD CONSTRAINT fk_inbound_template
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE SET NULL;

ALTER TABLE projects
    ADD CONSTRAINT fk_projects_inbound_request
    FOREIGN KEY (inbound_request_id) REFERENCES inbound_requests(id) ON DELETE SET NULL;


-- ============================================================================
-- §22. ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- App sets: SET app.current_org_id = '<uuid>'; before each request.

DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN
        SELECT unnest(ARRAY[
            'tag_groups','tags','entity_tags',
            'lookup_lists',
            'custom_field_definitions','entity_collection_entries',
            'categories',
            'clients','client_contacts',
            'vendors','vendor_contacts',
            'products','inventory_items','stock_levels','inventory_transactions',
            'resources','resource_availability','resource_payouts',
            'projects','project_date_ranges','project_resources','project_products',
            'inbound_requests',
            'quotes','quote_line_items',
            'invoices','invoice_line_items','payments',
            'contracts',
            'file_attachments',
            'templates','template_items',
            'communication_log',
            'activity_log','notifications',
            'workflow_rules',
            'integrations','integration_sync_log'
        ])
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format(
            'CREATE POLICY %I_org_isolation ON %I
             USING (organization_id = current_setting(''app.current_org_id'')::UUID)',
            t, t
        );
    END LOOP;
END;
$$;


-- ============================================================================
-- §23. VIEWS
-- ============================================================================

-- Project financial summary — full P&L per project
-- Example: SELECT * FROM v_project_financials WHERE organization_id = '<org>' AND status = 'completed';
CREATE OR REPLACE VIEW v_project_financials AS
SELECT
    p.id AS project_id,
    p.organization_id,
    p.project_number,
    p.title,
    p.status,
    p.client_id,
    c.name AS client_name,
    COALESCE((SELECT SUM(pdr.date_end - pdr.date_start + 1)
              FROM project_date_ranges pdr WHERE pdr.project_id = p.id), 0) AS total_days,
    COALESCE((SELECT SUM(pr.bill_rate)
              FROM project_resources pr WHERE pr.project_id = p.id), 0) AS sum_resource_bill_rates,
    COALESCE((SELECT SUM(pr.pay_rate)
              FROM project_resources pr WHERE pr.project_id = p.id), 0) AS sum_resource_pay_rates,
    COALESCE((SELECT SUM(pp.bill_rate * pp.quantity)
              FROM project_products pp WHERE pp.project_id = p.id), 0) AS total_product_billing,
    COALESCE((SELECT SUM(pp.cost_rate * pp.quantity)
              FROM project_products pp WHERE pp.project_id = p.id), 0) AS total_product_cost,
    COALESCE((SELECT SUM(rp.amount)
              FROM resource_payouts rp WHERE rp.project_id = p.id AND rp.status != 'cancelled'), 0) AS total_payouts,
    p.total_billable,
    p.total_cost,
    p.total_profit,
    p.created_at
FROM projects p
LEFT JOIN clients c ON c.id = p.client_id;

-- Client analytics dashboard
-- Example: SELECT * FROM v_client_analytics WHERE organization_id = '<org>' AND client_name ILIKE '%puth%';
CREATE OR REPLACE VIEW v_client_analytics AS
SELECT
    c.id AS client_id,
    c.organization_id,
    c.name AS client_name,
    c.type AS client_type,
    c.pricing_tier,
    COUNT(DISTINCT p.id) AS total_projects,
    COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'completed') AS completed_projects,
    COUNT(DISTINCT p.id) FILTER (WHERE p.status IN ('approved','in_progress')) AS active_projects,
    COALESCE(SUM(i.total) FILTER (WHERE i.status NOT IN ('void','draft')), 0) AS total_invoiced,
    COALESCE(SUM(i.amount_paid) FILTER (WHERE i.status NOT IN ('void','draft')), 0) AS total_paid,
    COALESCE(SUM(i.balance_due) FILTER (WHERE i.status NOT IN ('void','draft')), 0) AS total_outstanding,
    MIN(p.created_at) AS first_project_date,
    MAX(p.created_at) AS last_project_date
FROM clients c
LEFT JOIN projects p ON p.client_id = c.id
LEFT JOIN invoices i ON i.client_id = c.id
GROUP BY c.id, c.organization_id, c.name, c.type, c.pricing_tier;

-- Inventory status — where is each piece of serialized gear right now?
-- Example: SELECT * FROM v_inventory_status WHERE organization_id = '<org>' AND status = 'checked_out';
CREATE OR REPLACE VIEW v_inventory_status AS
SELECT
    ii.id AS inventory_item_id,
    ii.organization_id,
    pr.name AS product_name,
    pr.product_type,
    pr.sku,
    ii.serial_number,
    ii.barcode,
    ii.status,
    ii.condition,
    ii.ownership,
    ii.location,
    v.name AS vendor_name,
    pp.project_id AS current_project_id,
    proj.title AS current_project_title,
    pp.checked_out_at
FROM inventory_items ii
JOIN products pr ON pr.id = ii.product_id
LEFT JOIN vendors v ON v.id = ii.vendor_id
LEFT JOIN project_products pp ON pp.inventory_item_id = ii.id AND pp.status = 'checked_out'
LEFT JOIN projects proj ON proj.id = pp.project_id;

-- Consumable stock overview — current levels across all locations
-- Example: SELECT * FROM v_stock_overview WHERE organization_id = '<org>' AND needs_reorder = TRUE;
CREATE OR REPLACE VIEW v_stock_overview AS
SELECT
    p.id AS product_id,
    p.organization_id,
    p.name AS product_name,
    p.sku,
    p.unit_of_measure,
    p.reorder_point,
    sl.id AS stock_level_id,
    sl.location,
    sl.quantity_on_hand,
    sl.quantity_reserved,
    (sl.quantity_on_hand - sl.quantity_reserved) AS quantity_available,
    (sl.quantity_on_hand <= COALESCE(p.reorder_point, 0)) AS needs_reorder
FROM products p
JOIN stock_levels sl ON sl.product_id = p.id
WHERE p.tracking_type = 'consumable';
