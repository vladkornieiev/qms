-- Phase 4: Products & Inventory
-- Tables: products, inventory_items, stock_levels, inventory_transactions

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
    unit_price      NUMERIC(12,2),
    price_unit      VARCHAR(30) DEFAULT 'each'
                    CHECK (price_unit IN ('each','day','hour','week','month','flat')),
    cost_price      NUMERIC(12,2),
    tracking_type   VARCHAR(20) NOT NULL DEFAULT 'non_tracked'
                    CHECK (tracking_type IN ('serialized','consumable','non_tracked')),
    unit_of_measure VARCHAR(30),
    reorder_point   INT,
    is_rentable     BOOLEAN NOT NULL DEFAULT FALSE,
    is_sellable     BOOLEAN NOT NULL DEFAULT TRUE,
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

CREATE TABLE inventory_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    vendor_id       UUID REFERENCES vendors(id) ON DELETE SET NULL,
    serial_number   VARCHAR(255),
    barcode         VARCHAR(255),
    status          VARCHAR(30) NOT NULL DEFAULT 'available'
                    CHECK (status IN ('available','reserved','checked_out','maintenance','retired')),
    condition       VARCHAR(30) DEFAULT 'good'
                    CHECK (condition IN ('new','good','fair','damaged')),
    ownership       VARCHAR(20) NOT NULL DEFAULT 'owned'
                    CHECK (ownership IN ('owned','rented','loaned')),
    location        VARCHAR(255),
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

CREATE TABLE stock_levels (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    location        VARCHAR(255) NOT NULL,
    quantity_on_hand  NUMERIC(12,2) NOT NULL DEFAULT 0,
    quantity_reserved NUMERIC(12,2) NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (product_id, location),
    CHECK (quantity_on_hand >= 0),
    CHECK (quantity_reserved >= 0),
    CHECK (quantity_reserved <= quantity_on_hand)
);

CREATE INDEX idx_stock_levels_org ON stock_levels(organization_id);
CREATE INDEX idx_stock_levels_product ON stock_levels(product_id);

CREATE TABLE inventory_transactions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
    product_id      UUID REFERENCES products(id) ON DELETE CASCADE,
    stock_level_id  UUID REFERENCES stock_levels(id) ON DELETE CASCADE,
    quantity        NUMERIC(12,2),
    project_id      UUID,
    transaction_type VARCHAR(30) NOT NULL
                    CHECK (transaction_type IN (
                        'check_out','check_in','transfer','maintenance','retire',
                        'consume','restock','adjust','transfer_in','transfer_out'
                    )),
    performed_by    UUID REFERENCES users(id) ON DELETE SET NULL,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (
        (inventory_item_id IS NOT NULL AND product_id IS NULL AND stock_level_id IS NULL AND quantity IS NULL)
        OR
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
