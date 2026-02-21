-- ============================================================================
-- ASAP Platform -- Phase 2: Tags, Lookups, Custom Fields, Categories
-- ============================================================================

-- §2. TAGS
CREATE TABLE tag_groups (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    color           VARCHAR(7),
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

-- §3. LOOKUP LISTS
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
    value           VARCHAR(255) NOT NULL,
    label           VARCHAR(255) NOT NULL,
    color           VARCHAR(7),
    icon            VARCHAR(50),
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

-- §4. CUSTOM FIELD DEFINITIONS
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
    options         JSONB,
    lookup_list_id  UUID REFERENCES lookup_lists(id) ON DELETE SET NULL,
    collection_schema JSONB,
    min_entries     INT,
    max_entries     INT,
    is_required     BOOLEAN NOT NULL DEFAULT FALSE,
    default_value   TEXT,
    is_filterable   BOOLEAN NOT NULL DEFAULT FALSE,
    display_order   INT NOT NULL DEFAULT 0,
    section         VARCHAR(100),
    show_on_form    BOOLEAN NOT NULL DEFAULT TRUE,
    show_on_card    BOOLEAN NOT NULL DEFAULT FALSE,
    depends_on_field_id UUID REFERENCES custom_field_definitions(id) ON DELETE SET NULL,
    depends_on_value    TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (organization_id, entity_type, field_key)
);

CREATE INDEX idx_cfd_org_entity ON custom_field_definitions(organization_id, entity_type);

CREATE TABLE entity_collection_entries (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    field_definition_id UUID NOT NULL REFERENCES custom_field_definitions(id) ON DELETE CASCADE,
    entity_type         VARCHAR(50) NOT NULL,
    entity_id           UUID NOT NULL,
    data                JSONB NOT NULL DEFAULT '{}',
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

-- §5. CATEGORIES
CREATE TABLE categories (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    parent_id       UUID REFERENCES categories(id) ON DELETE SET NULL,
    name            VARCHAR(255) NOT NULL,
    code            VARCHAR(50),
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
