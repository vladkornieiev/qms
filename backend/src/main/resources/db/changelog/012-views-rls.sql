-- Phase 12: Views and Row Level Security

-- §22. ROW LEVEL SECURITY (RLS)
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


-- §23. VIEWS

-- Project financial summary — full P&L per project
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
