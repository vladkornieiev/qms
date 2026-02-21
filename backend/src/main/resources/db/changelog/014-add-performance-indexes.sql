-- Schema additions
ALTER TABLE file_attachments ADD COLUMN IF NOT EXISTS s3_key TEXT;

-- Performance indexes for frequently queried columns
-- These indexes improve query performance for organization-scoped lookups

-- Organization-scoped status queries
CREATE INDEX IF NOT EXISTS idx_invoices_org_status ON invoices(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_quotes_org_status ON quotes(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_projects_org_status ON projects(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_contracts_org_status ON contracts(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_inbound_requests_org_status ON inbound_requests(organization_id, status);

-- Foreign key indexes for common joins
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_project ON invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_quote ON invoices(quote_id);
CREATE INDEX IF NOT EXISTS idx_quotes_client ON quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_project ON quotes(project_id);
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_client ON contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_project ON contracts(project_id);

-- Line item lookups
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_invoice ON invoice_line_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_quote_line_items_quote ON quote_line_items(quote_id);

-- Project sub-entity lookups
CREATE INDEX IF NOT EXISTS idx_project_resources_project ON project_resources(project_id);
CREATE INDEX IF NOT EXISTS idx_project_products_project ON project_products(project_id);
CREATE INDEX IF NOT EXISTS idx_project_date_ranges_project ON project_date_ranges(project_id);

-- User-scoped queries
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);

-- Activity and communication log lookups
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON activity_log(organization_id, entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_communication_log_entity ON communication_log(organization_id, entity_type, entity_id);

-- File attachment lookups
CREATE INDEX IF NOT EXISTS idx_file_attachments_entity ON file_attachments(entity_type, entity_id);

-- Resource availability lookups
CREATE INDEX IF NOT EXISTS idx_resource_availability_resource ON resource_availability(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_availability_dates ON resource_availability(resource_id, date_start, date_end);

-- Inventory lookups
CREATE INDEX IF NOT EXISTS idx_inventory_items_product ON inventory_items(organization_id, product_id);
CREATE INDEX IF NOT EXISTS idx_stock_levels_product ON stock_levels(organization_id, product_id);

-- Tag lookups
CREATE INDEX IF NOT EXISTS idx_entity_tags_entity ON entity_tags(entity_type, entity_id);

-- Payment lookups
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);

-- Resource payout lookups
CREATE INDEX IF NOT EXISTS idx_resource_payouts_resource ON resource_payouts(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_payouts_org_status ON resource_payouts(organization_id, status);

-- Client/Vendor contact lookups
CREATE INDEX IF NOT EXISTS idx_client_contacts_client ON client_contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_vendor_contacts_vendor ON vendor_contacts(vendor_id);

-- Template item lookups
CREATE INDEX IF NOT EXISTS idx_template_items_template ON template_items(template_id);

-- Temporal cleanup queries
CREATE INDEX IF NOT EXISTS idx_login_links_expires ON login_links(expires_at);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON one_time_passwords(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON password_reset_tokens(expires_at);
