# ASAP Platform - Development Roadmap

Multi-tenant, industry-agnostic quote/business management platform.
Tech stack: Spring Boot 3.5.7 + Next.js 15 + PostgreSQL + shared OpenAPI spec.

Reference schema: `schema.sql` (37 tables, 4 views)

**Architecture conventions (established in Phase 1):**
- OpenAPI-first: define paths/schemas in `openapi.yml` -> codegen generates `api` interfaces + `dto` classes
- Backend package: `com.kfdlabs.asap` (api, dto, entity, repository, service, mapper, controller, config, security)
- MapStruct for entity<->DTO mapping; Lombok `@Data` on entities
- Liquibase migrations in `backend/src/main/resources/db/changelog/` with `splitStatements: false`
- All business tables carry `organization_id` FK; security context provides current org via JWT
- Frontend: Next.js 15, TypeScript, Tailwind CSS, Zustand auth store
- Org roles: OWNER, ADMIN, MEMBER, VIEWER, ACCOUNTANT (from `organization_members.role`)
- Platform role: PLATFORM_ADMIN (also in `organization_members.role`, granted in a "dev" org, gives global access to all admin endpoints + all other endpoints)

---

## Phase 1: Foundation (COMPLETE)

Renamed VaporSafe QMS to ASAP. Established core entities and auth.

**Tables:** `organizations`, `users`, `organization_members` + auth tables (`user_details`, `login_links`, `password_reset_tokens`, `one_time_passwords`, `user_auth_methods`, `user_email_preferences`) + `bucket` (rate limiting) + `shedlock` (distributed locks)

**Key changes:**
- Package rename `com.kfdlabs.vaporsafe` -> `com.kfdlabs.asap`
- Account -> Organization, accountId -> organizationId throughout backend + frontend
- Org roles: OWNER, ADMIN, MEMBER, VIEWER, ACCOUNTANT (replaced ACCOUNT_ADMIN, TECHNICIAN, USER)
- Platform role: PLATFORM_ADMIN (user-level role in "dev" org, replaces old PLATFORM_ADMIN concept; grants access to all admin endpoints across all orgs)
- User model: firstName, lastName, phone, avatarUrl (replaced single `name` field)
- JWT carries nullable organizationId claim (null when no org selected)
- Multi-org support with org switching via `organization_members` join table
- Liquibase migration `001-init.sql` with fn_set_updated_at trigger utility
- OpenAPI spec rewritten for Organization-based schemas (2,213 lines)
- Frontend cleaned of all VaporSafe domain code (data sources, alerts, monitors, etc.)
- SecurityUtils: `getCurrentOrganizationId()`, `isOwner()`, `isAdmin()`
- ApiKeyAuthenticationFilter simplified to pass-through (API keys disabled until needed)

**Migration:** `001-init.sql`

---

## Phase 2: Tags, Lookups, Custom Fields, Categories

**Tables:** `tag_groups`, `tags`, `entity_tags`, `lookup_lists`, `lookup_list_items`, `custom_field_definitions`, `entity_collection_entries`, `categories`

**Migration:** `002-tags-lookups-fields-categories.sql`

### Database

From `schema.sql` sections 2-5:

- `tag_groups`: id, organization_id, name (unique per org), color, description
- `tags`: id, organization_id, tag_group_id (nullable FK), name, color; unique (org, group, name)
- `entity_tags`: id, organization_id, tag_id, entity_type (CHECK: client/vendor/product/resource/project/quote/invoice/contract), entity_id; unique (tag, type, entity)
- `lookup_lists`: id, organization_id, name, slug (unique per org), description, is_system, is_active
- `lookup_list_items`: id, lookup_list_id, value (machine key), label (display), color, icon, metadata (JSONB), parent_id (self-ref for hierarchy), is_active, display_order; unique (list, value)
- `custom_field_definitions`: id, organization_id, entity_type, field_key, field_label, field_type (CHECK: text/number/boolean/date/datetime/url/email/phone/select/multi_select/collection/file_collection), options (JSONB), lookup_list_id (FK), collection_schema (JSONB), min/max_entries, is_required, default_value, is_filterable, display_order, section, show_on_form, show_on_card, depends_on_field_id/depends_on_value; unique (org, entity_type, field_key)
- `entity_collection_entries`: id, organization_id, field_definition_id, entity_type, entity_id, data (JSONB), lookup_item_id (denormalized FK for filtering), display_order
- `categories`: id, organization_id, parent_id (self-ref), name, code (accounting code), type (CHECK: income/expense/both), description, is_active, display_order; unique (org, parent, name)

Indexes: GIN on `entity_collection_entries.data`, composite on (entity_type, entity_id), (field_definition_id, lookup_item_id)

### Backend

**Entities:**
- `TagGroup.java`: id, organization (@ManyToOne), name, color, description, createdAt
- `Tag.java`: id, organization (@ManyToOne), tagGroup (@ManyToOne nullable), name, color, createdAt
- `EntityTag.java`: id, organization (@ManyToOne), tag (@ManyToOne), entityType (String), entityId (UUID), createdAt
- `LookupList.java`: id, organization (@ManyToOne), name, slug, description, isSystem, isActive, createdAt, updatedAt
- `LookupListItem.java`: id, lookupList (@ManyToOne), value, label, color, icon, metadata (Map JSONB), parent (@ManyToOne nullable), isActive, displayOrder, createdAt
- `CustomFieldDefinition.java`: id, organization (@ManyToOne), entityType, fieldKey, fieldLabel, fieldType, options (JSONB), lookupList (@ManyToOne nullable), collectionSchema (JSONB), minEntries, maxEntries, isRequired, defaultValue, isFilterable, displayOrder, section, showOnForm, showOnCard, dependsOnField (@ManyToOne nullable), dependsOnValue, createdAt, updatedAt
- `EntityCollectionEntry.java`: id, organization (@ManyToOne), fieldDefinition (@ManyToOne), entityType, entityId, data (Map JSONB), lookupItem (@ManyToOne nullable), displayOrder, createdAt, updatedAt
- `Category.java`: id, organization (@ManyToOne), parent (@ManyToOne nullable), name, code, type, description, isActive, displayOrder, createdAt

**Repositories:** Standard JpaRepository for each entity, with org-scoped queries:
- `TagGroupRepository`: findByOrganizationId, findByOrganizationIdAndName
- `TagRepository`: findByOrganizationId, findByOrganizationIdAndTagGroupId, findByOrganizationIdAndNameContaining
- `EntityTagRepository`: findByEntityTypeAndEntityId, findByOrganizationIdAndEntityTypeAndEntityId, deleteByTagIdAndEntityTypeAndEntityId
- `LookupListRepository`: findByOrganizationId, findByOrganizationIdAndSlug, findByOrganizationIdAndIsActiveTrue
- `LookupListItemRepository`: findByLookupListId, findByLookupListIdAndIsActiveTrue (ordered by displayOrder)
- `CustomFieldDefinitionRepository`: findByOrganizationIdAndEntityType (ordered by displayOrder)
- `EntityCollectionEntryRepository`: findByEntityTypeAndEntityId, findByFieldDefinitionIdAndEntityTypeAndEntityId
- `CategoryRepository`: findByOrganizationId, findByOrganizationIdAndParentId (for tree building), findByOrganizationIdAndType

**Services:** CRUD for each domain. Key logic:
- TagService: apply/remove tags from entities, get tags for entity, bulk tag operations
- LookupListService: CRUD lists + items, reorder items, validate system lists can't be deleted
- CustomFieldService: CRUD definitions, validate field types, manage collection entries with schema validation
- CategoryService: CRUD with tree hierarchy, prevent circular parent references

**Mappers:** MapStruct for each entity -> DTO

**Controllers:** Implement generated API interfaces:
- `TagGroupsApi`, `TagsApi`: CRUD + apply/remove from entities
- `LookupListsApi`: CRUD lists + nested items
- `CustomFieldsApi`: CRUD definitions + collection entry management
- `CategoriesApi`: CRUD with hierarchical response

### OpenAPI additions

Paths:
- `/api/tag-groups` (GET list, POST create)
- `/api/tag-groups/{id}` (GET, PATCH, DELETE)
- `/api/tags` (GET list, POST create)
- `/api/tags/{id}` (GET, PATCH, DELETE)
- `/api/tags/entity/{entityType}/{entityId}` (GET tags for entity, POST apply, DELETE remove)
- `/api/lookup-lists` (GET list, POST create)
- `/api/lookup-lists/{id}` (GET with items, PATCH, DELETE)
- `/api/lookup-lists/{id}/items` (GET, POST, reorder)
- `/api/lookup-lists/{id}/items/{itemId}` (PATCH, DELETE)
- `/api/custom-fields/{entityType}` (GET definitions, POST create)
- `/api/custom-fields/{entityType}/{id}` (PATCH, DELETE)
- `/api/custom-fields/{entityType}/{entityId}/entries` (GET, POST, PUT bulk)
- `/api/categories` (GET tree, POST create)
- `/api/categories/{id}` (GET, PATCH, DELETE)

Schemas: TagGroup, Tag, EntityTag, LookupList, LookupListItem, CustomFieldDefinition, EntityCollectionEntry, Category + Create/Update/Paginated variants

### Frontend

Pages:
- `/admin/tags` - Tag group and tag management (create groups, add tags to groups, color picker)
- `/admin/lookup-lists` - List management with inline item editing, drag-and-drop reorder
- `/admin/custom-fields` - Field definitions per entity type, preview form layout
- `/admin/categories` - Hierarchical tree editor (income/expense), drag to reorder/reparent

Components:
- `TagPicker` - Reusable tag selector (used on client/vendor/project detail pages in later phases)
- `CustomFieldRenderer` - Dynamic form fields based on field definitions
- `CollectionFieldEditor` - Inline repeatable entries (skills, documents)
- `CategoryTreeView` - Recursive tree with expand/collapse

API clients: `tags-client.ts`, `lookup-lists-client.ts`, `custom-fields-client.ts`, `categories-client.ts`

---

## Phase 3: CRM (Clients & Vendors)

**Tables:** `clients`, `client_contacts`, `vendors`, `vendor_contacts`

**Migration:** `003-crm.sql`

### Database

From `schema.sql` sections 6-7:

- `clients`: id, organization_id, name, type (CHECK: company/individual), email, phone, website, billing_address (JSONB), shipping_address (JSONB), notes, external_accounting_id, pricing_tier, custom_fields (JSONB), is_active
- `client_contacts`: id, organization_id, client_id, first_name, last_name, email, phone, role, is_primary, notes
- `vendors`: id, organization_id, name, type (CHECK: company/individual), email, phone, website, billing_address (JSONB), notes, external_accounting_id, payment_info (JSONB: payment_terms, preferred_method, tax_id), custom_fields (JSONB), is_active
- `vendor_contacts`: id, organization_id, vendor_id, first_name, last_name, email, phone, role, is_primary, notes

Indexes: GIN on `clients.custom_fields` and `vendors.custom_fields`, composite on (organization_id, name)

### Backend

**Entities:**
- `Client.java`: id, organization, name, type, email, phone, website, billingAddress (Map JSONB), shippingAddress (Map JSONB), notes, externalAccountingId, pricingTier, customFields (Map JSONB), isActive, createdAt, updatedAt
- `ClientContact.java`: id, organization, client (@ManyToOne), firstName, lastName, email, phone, role, isPrimary, notes, createdAt
- `Vendor.java`: id, organization, name, type, email, phone, website, billingAddress (Map JSONB), notes, externalAccountingId, paymentInfo (Map JSONB), customFields (Map JSONB), isActive, createdAt, updatedAt
- `VendorContact.java`: id, organization, vendor (@ManyToOne), firstName, lastName, email, phone, role, isPrimary, notes, createdAt

**Repositories:** JpaRepository with org-scoped queries:
- `ClientRepository`: findByOrganizationId (paginated), search by name/email (JPQL LIKE), findByOrganizationIdAndIsActiveTrue
- `ClientContactRepository`: findByClientId, findByClientIdAndIsPrimaryTrue
- `VendorRepository`: same pattern as Client
- `VendorContactRepository`: same pattern as ClientContact

**Services:**
- `ClientService`: CRUD clients + contacts, search/filter, validate custom fields against definitions (Phase 2), apply tags, manage collection entries
- `VendorService`: same pattern

**Controllers:**
- `ClientsApi`: CRUD clients + nested contacts
- `VendorsApi`: CRUD vendors + nested contacts

### OpenAPI additions

Paths:
- `/api/clients` (GET paginated+search, POST)
- `/api/clients/{id}` (GET detail with contacts+tags, PATCH, DELETE soft)
- `/api/clients/{id}/contacts` (GET, POST)
- `/api/clients/{id}/contacts/{contactId}` (PATCH, DELETE)
- `/api/vendors` (GET paginated+search, POST)
- `/api/vendors/{id}` (GET detail with contacts+tags, PATCH, DELETE soft)
- `/api/vendors/{id}/contacts` (GET, POST)
- `/api/vendors/{id}/contacts/{contactId}` (PATCH, DELETE)

Schemas: Client, ClientContact, Vendor, VendorContact + Create/Update/Paginated variants. Address JSONB schemas (street, city, state, zip, country). PaymentInfo schema.

### Frontend

Pages:
- `/clients` - Client list with search, filter by type/tag/active, pagination
- `/clients/[id]` - Client detail: info, contacts, tags, custom fields, activity (future)
- `/clients/new` - Create client form with address autocomplete, custom fields
- `/vendors` - Vendor list with search, filter, pagination
- `/vendors/[id]` - Vendor detail: info, contacts, tags, custom fields
- `/vendors/new` - Create vendor form

Components:
- `ClientForm` / `VendorForm` - Shared form layout with address fields
- `ContactList` - Inline contact management (add/edit/remove, set primary)
- `AddressEditor` - Structured address input (street, city, state, zip, country)
- `EntityTagSection` - Tag management section using TagPicker from Phase 2
- `CustomFieldSection` - Dynamic fields using CustomFieldRenderer from Phase 2

API clients: `clients-client.ts`, `vendors-client.ts`
API types: `client.types.ts`, `vendor.types.ts`

Sidebar nav: Add "Clients" and "Vendors" under CRM section

---

## Phase 4: Products & Inventory

**Tables:** `products`, `inventory_items`, `stock_levels`, `inventory_transactions`

**Migration:** `004-products-inventory.sql`

### Database

From `schema.sql` section 8:

- `products`: id, organization_id, parent_id (self-ref for recursive hierarchy), category_id (FK categories), name, sku, product_type (CHECK: physical/service/package/fee), description, unit_price, price_unit (CHECK: each/day/hour/week/month/flat), cost_price, tracking_type (CHECK: serialized/consumable/non_tracked), unit_of_measure, reorder_point, is_rentable, is_sellable, purchase_price, purchase_date, depreciation_method, useful_life_months, custom_fields (JSONB), is_active, display_order
- `inventory_items`: id, organization_id, product_id, vendor_id (nullable, for sub-rented), serial_number, barcode, status (CHECK: available/reserved/checked_out/maintenance/retired), condition (CHECK: new/good/fair/damaged), ownership (CHECK: owned/rented/loaned), location, notes, purchase_price, purchase_date, custom_fields (JSONB)
- `stock_levels`: id, organization_id, product_id, location, quantity_on_hand, quantity_reserved; unique (product, location); CHECK constraints for non-negative and reserved <= on_hand
- `inventory_transactions`: id, organization_id, inventory_item_id (for serialized), product_id + stock_level_id + quantity (for consumable), project_id (deferred FK), transaction_type (CHECK: check_out/check_in/transfer/maintenance/retire/consume/restock/adjust/transfer_in/transfer_out), performed_by, notes; CHECK constraint ensures correct fields per tracking type

Indexes: GIN on custom_fields, composite on (org, tracking_type), (org, status), (org, serial_number), (org, barcode)

### Backend

**Entities:**
- `Product.java`: All fields above. `@ManyToOne` for organization, parent (self-ref), category. JSONB for customFields.
- `InventoryItem.java`: `@ManyToOne` for organization, product, vendor. All status/condition/ownership as Strings.
- `StockLevel.java`: `@ManyToOne` for organization, product. BigDecimal for quantities.
- `InventoryTransaction.java`: `@ManyToOne` for organization, inventoryItem (nullable), product (nullable), stockLevel (nullable), performedBy (User). BigDecimal quantity.

**Repositories:**
- `ProductRepository`: findByOrganizationId (paginated), findByOrganizationIdAndParentId (for tree), findByOrganizationIdAndTrackingType, findByOrganizationIdAndProductType, searchByName
- `InventoryItemRepository`: findByOrganizationIdAndProductId, findByOrganizationIdAndStatus, findByOrganizationIdAndSerialNumber, findByOrganizationIdAndBarcode
- `StockLevelRepository`: findByOrganizationIdAndProductId, findByProductIdAndLocation
- `InventoryTransactionRepository`: findByInventoryItemId, findByProductId, findByOrganizationId (paginated, ordered by createdAt desc)

**Services:**
- `ProductService`: CRUD products, build product tree, validate parent/child hierarchy (prevent circular), manage sub-products
- `InventoryService`: Serialized item CRUD, consumable stock management, check-out/check-in serialized items, consume/restock consumables, transfer between locations, record all transactions. Enforce CHECK constraints (e.g., can't check out already checked-out item).
- Business rules: When consumable quantity changes, update stock_levels and insert inventory_transaction atomically (within same @Transactional)

**Controllers:**
- `ProductsApi`: CRUD products + tree view + sub-products
- `InventoryApi`: Item CRUD, stock levels, transactions, check-out/check-in/transfer operations

### OpenAPI additions

Paths:
- `/api/products` (GET paginated+search, POST)
- `/api/products/{id}` (GET with children+stock, PATCH, DELETE soft)
- `/api/products/{id}/children` (GET sub-products)
- `/api/products/{id}/inventory` (GET serialized items for product)
- `/api/products/{id}/stock` (GET stock levels for consumable product)
- `/api/inventory-items` (GET paginated, POST)
- `/api/inventory-items/{id}` (GET, PATCH, DELETE)
- `/api/inventory-items/{id}/check-out` (POST)
- `/api/inventory-items/{id}/check-in` (POST)
- `/api/inventory-items/{id}/transfer` (POST)
- `/api/stock-levels/{id}/consume` (POST: quantity, projectId)
- `/api/stock-levels/{id}/restock` (POST: quantity, notes)
- `/api/stock-levels/{id}/transfer` (POST: toLocation, quantity)
- `/api/inventory-transactions` (GET paginated, filtered by item/product/project)

Schemas: Product, InventoryItem, StockLevel, InventoryTransaction + Create/Update/Paginated. CheckOutRequest, TransferRequest, ConsumeRequest, RestockRequest.

### Frontend

Pages:
- `/products` - Product catalog with tree view (expandable hierarchy), filter by type/tracking/category
- `/products/[id]` - Product detail: info, sub-products, inventory items (serialized) or stock levels (consumable), transaction history
- `/products/new` - Create product form (type selector changes visible fields)
- `/inventory` - Inventory dashboard: serialized items grid, consumable stock overview, low-stock alerts
- `/inventory/[id]` - Item detail: serial/barcode, condition, location, transaction history
- `/inventory/check-out` - Bulk check-out wizard (scan barcode or select items)
- `/inventory/check-in` - Bulk check-in wizard

Components:
- `ProductTree` - Recursive product hierarchy with drag-and-drop reordering
- `InventoryItemCard` - Status badge (available/checked_out/etc), condition, location
- `StockLevelBar` - Visual quantity indicator with reorder threshold
- `TransactionHistory` - Timeline of check-in/out/transfer operations
- `BarcodeScanner` - Barcode input field (manual entry + camera scan if available)

Sidebar nav: Add "Products" and "Inventory" section

---

## Phase 5: Resources

**Tables:** `resources`, `resource_availability`, `resource_payouts`

**Migration:** `005-resources.sql`

### Database

From `schema.sql` section 9:

- `resources`: id, organization_id, user_id (nullable FK users, links resource to platform user), type (CHECK: contractor/employee), first_name, last_name, email, phone, avatar_url, location_city, location_state, location_country, default_day_rate, default_hour_rate, currency (default 'USD'), custom_fields (JSONB), is_active
- `resource_availability`: id, organization_id, resource_id, date_start, date_end, status (CHECK: available/unavailable/tentative/booked), reason, project_id (deferred FK); CHECK date_end >= date_start
- `resource_payouts`: id, organization_id, resource_id, project_id (deferred FK), description, amount (CHECK > 0), currency, status (CHECK: pending/approved/paid/cancelled), approved_at, approved_by (FK users), payment_method (CHECK: bank_transfer/check/cash/paypal/payroll/other), payment_reference, paid_at, period_start, period_end, external_accounting_id, notes

Indexes: GIN on custom_fields, composite on (org, type), (org, location_country/state/city), availability date ranges

### Backend

**Entities:**
- `Resource.java`: All fields. `@ManyToOne` for organization, user (nullable). JSONB for customFields.
- `ResourceAvailability.java`: `@ManyToOne` for organization, resource. LocalDate for date range.
- `ResourcePayout.java`: `@ManyToOne` for organization, resource, approvedBy (User). BigDecimal for amount.

**Repositories:**
- `ResourceRepository`: findByOrganizationId (paginated), searchByName, findByOrganizationIdAndType, findByOrganizationIdAndIsActiveTrue
- `ResourceAvailabilityRepository`: findByResourceId, findByOrganizationIdAndDateStartBetween (calendar queries), findConflicting (overlapping date ranges)
- `ResourcePayoutRepository`: findByResourceId, findByOrganizationIdAndStatus, findByProjectId, sum amounts by status

**Services:**
- `ResourceService`: CRUD resources, link to user accounts, search/filter by location/type/custom fields, manage custom fields + collection entries (skills, languages, documents via Phase 2 system)
- `ResourceAvailabilityService`: CRUD availability blocks, conflict detection (overlapping dates), calendar view queries (date range -> available resources)
- `ResourcePayoutService`: CRUD payouts, approval workflow (pending -> approved -> paid), payment recording, reporting queries (total owed, total paid per resource/project/period)

**Controllers:**
- `ResourcesApi`: CRUD resources + availability + payouts
- Calendar/availability endpoints for scheduling views

### OpenAPI additions

Paths:
- `/api/resources` (GET paginated+search, POST)
- `/api/resources/{id}` (GET detail with availability+payouts, PATCH, DELETE soft)
- `/api/resources/{id}/availability` (GET, POST, bulk update)
- `/api/resources/{id}/availability/{availId}` (PATCH, DELETE)
- `/api/resources/{id}/payouts` (GET paginated)
- `/api/resources/available` (GET: dateStart, dateEnd -> available resources for date range)
- `/api/resource-payouts` (GET paginated+filter by status, POST)
- `/api/resource-payouts/{id}` (GET, PATCH status, DELETE)
- `/api/resource-payouts/{id}/approve` (POST)
- `/api/resource-payouts/{id}/mark-paid` (POST)

Schemas: Resource, ResourceAvailability, ResourcePayout + Create/Update/Paginated. AvailableResourceQuery (date range filter).

### Frontend

Pages:
- `/resources` - Resource list with search, filter by type/location/availability, grid and list views
- `/resources/[id]` - Resource detail: info, custom fields (skills/languages/documents from Phase 2), availability calendar, payout history
- `/resources/new` - Create resource form with custom field sections
- `/resources/calendar` - Availability calendar view (all resources, Gantt-style)
- `/payouts` - Payout management: pending approvals, payment recording, export

Components:
- `ResourceCard` - Avatar, name, type badge, location, rate info
- `AvailabilityCalendar` - Date range blocks (color-coded: available/unavailable/booked/tentative)
- `PayoutTable` - Sortable table with status filters, bulk approve/pay actions
- `ResourceSearch` - Advanced search with location, skill, availability filters

Sidebar nav: Add "Resources" and "Payouts" section

---

## Phase 6: Projects

**Tables:** `projects`, `project_date_ranges`, `project_resources`, `project_products`

**Migration:** `006-projects.sql`

### Database

From `schema.sql` section 10:

- `projects`: id, organization_id, client_id (FK clients), project_number (sequential, e.g. "GIG-2025-0042"), title, description, status (CHECK: pending/approved/in_progress/completed/cancelled), priority (CHECK: low/normal/high/urgent), venue_name, location (JSONB: address, city, state, country, lat, lng), onsite_contact (JSONB: name, email, phone, role), total_billable, total_cost, total_profit (denormalized), external_accounting_id, source (CHECK: website_form/referral/repeat_client/manual/api), inbound_request_id (deferred FK), custom_fields (JSONB), created_by
- `project_date_ranges`: id, organization_id, project_id, date_start, date_end, label (e.g. "Tour Leg 1", "Off Days"), rate_multiplier (default 1.00, e.g. 0.5 for off days), notes, display_order
- `project_resources`: id, organization_id, project_id, resource_id, role (e.g. "Playback Engineer"), bill_rate, pay_rate, rate_unit (CHECK: day/hour/flat/week), per_diem, date_range_ids (UUID[] - which project_date_ranges apply), status (CHECK: pending/confirmed/declined/cancelled), confirmed_at, notes
- `project_products`: id, organization_id, project_id, product_id, inventory_item_id (nullable, for serialized), vendor_id (nullable, for sub-rented), quantity, bill_rate, cost_rate, rate_unit (CHECK: day/each/flat/week), status (CHECK: requested/reserved/checked_out/returned/lost/consumed), checked_out_at, returned_at, notes

Indexes: GIN on custom_fields, composite on (org, status), (org, project_number)

### Backend

**Entities:**
- `Project.java`: All fields. `@ManyToOne` for organization, client, createdBy. JSONB for location, onsiteContact, customFields. Sequential number via `seq_project_number`.
- `ProjectDateRange.java`: `@ManyToOne` for organization, project. LocalDate for range. BigDecimal for rateMultiplier.
- `ProjectResource.java`: `@ManyToOne` for organization, project, resource. BigDecimal for rates. UUID[] for dateRangeIds.
- `ProjectProduct.java`: `@ManyToOne` for organization, project, product, inventoryItem (nullable), vendor (nullable). BigDecimal for rates/quantity.

**Repositories:**
- `ProjectRepository`: findByOrganizationId (paginated), findByOrganizationIdAndStatus, findByClientId, searchByTitle, generateNextProjectNumber (using seq_project_number)
- `ProjectDateRangeRepository`: findByProjectId (ordered by displayOrder)
- `ProjectResourceRepository`: findByProjectId, findByResourceId (for resource utilization), findByProjectIdAndStatus
- `ProjectProductRepository`: findByProjectId, findByProductId, findByInventoryItemId

**Services:**
- `ProjectService`: CRUD projects, auto-generate project numbers (format configurable per org), status transitions with validation (e.g., can't complete with pending resources), recalculate totals (sum of resource bill rates * days + product bill rates * quantity)
- `ProjectDateRangeService`: CRUD date ranges, reorder, validate no overlaps within same project
- `ProjectResourceService`: Assign resources, update status (confirm/decline), auto-create resource_availability records with status='booked', calculate billing (bill_rate * days from applicable date ranges * rate_multiplier)
- `ProjectProductService`: Assign products (serialized or consumable), check-out/return serialized items (updates inventory_items.status), consume consumables (updates stock_levels), track vendor sub-rentals

**Controllers:**
- `ProjectsApi`: Full project CRUD + nested date ranges, resources, products
- Status transition endpoints, total recalculation

### OpenAPI additions

Paths:
- `/api/projects` (GET paginated+search+filter by status/client/date, POST)
- `/api/projects/{id}` (GET full detail with date ranges+resources+products, PATCH, DELETE soft)
- `/api/projects/{id}/status` (PATCH: transition status)
- `/api/projects/{id}/date-ranges` (GET, POST, PUT bulk)
- `/api/projects/{id}/date-ranges/{rangeId}` (PATCH, DELETE)
- `/api/projects/{id}/resources` (GET, POST assign)
- `/api/projects/{id}/resources/{prId}` (PATCH, DELETE remove)
- `/api/projects/{id}/resources/{prId}/confirm` (POST)
- `/api/projects/{id}/products` (GET, POST assign)
- `/api/projects/{id}/products/{ppId}` (PATCH, DELETE)
- `/api/projects/{id}/products/{ppId}/check-out` (POST)
- `/api/projects/{id}/products/{ppId}/return` (POST)
- `/api/projects/{id}/recalculate` (POST: recompute totals)
- `/api/projects/calendar` (GET: date range -> projects in range)

Schemas: Project, ProjectDateRange, ProjectResource, ProjectProduct + Create/Update/Paginated. ProjectStatusTransition. ProjectCalendarEntry.

### Frontend

Pages:
- `/projects` - Project list with search, filter by status/client/priority, grid and table views
- `/projects/[id]` - Project detail: info, date ranges, assigned resources, assigned products, financials summary, tags
- `/projects/[id]/edit` - Edit project with inline date range editor
- `/projects/new` - Create project (select client, add date ranges, title, venue)
- `/projects/calendar` - Calendar view (date range blocks per project, Gantt-style)

Components:
- `ProjectStatusBadge` - Color-coded status chip
- `DateRangeEditor` - Multi-row date range input with labels and rate multipliers
- `ResourceAssignment` - Assign resources with role, rates, date range selection
- `ProductAssignment` - Assign products with quantity, rates, vendor (sub-rental) option
- `ProjectFinancials` - Summary card: total billable, total cost, profit, margin %
- `ProjectCalendar` - Full calendar with project date range visualization

Sidebar nav: Add "Projects" section with calendar sub-nav

---

## Phase 7: Pipeline & Quotes

**Tables:** `inbound_requests`, `quotes`, `quote_line_items`

**Migration:** `007-pipeline-quotes.sql`

### Database

From `schema.sql` sections 11-12:

- `inbound_requests`: id, organization_id, submitter_name/email/phone/company, client_id (nullable FK), template_id (deferred FK), form_data (JSONB), status (CHECK: pending/reviewing/approved/denied), reviewed_by (FK users), reviewed_at, denial_reason, project_id (nullable FK projects)
- `quotes`: id, organization_id, project_id (nullable FK), client_id (FK clients), quote_number (sequential), version (default 1), title, status (CHECK: draft/sent/viewed/approved/declined/expired/converted), issued_date, valid_until, approved_at, subtotal, discount_amount, tax_amount, total, currency, notes, internal_notes, terms, external_accounting_id, approved_by_name/email, approval_signature_url, custom_fields (JSONB), created_by; unique index (org, quote_number, version)
- `quote_line_items`: id, organization_id, quote_id, product_id (nullable), resource_id (nullable), category_id (nullable), description, date_start, date_end, quantity, unit_price, unit (CHECK: each/day/hour/week/month/flat), discount_percent, discount_amount, tax_rate, line_total, cost_per_unit, cost_total, section, display_order, is_visible, notes

### Backend

**Entities:**
- `InboundRequest.java`: All fields. JSONB for formData.
- `Quote.java`: All fields. `@ManyToOne` for organization, project, client, createdBy. Sequential number via `seq_quote_number`.
- `QuoteLineItem.java`: `@ManyToOne` for organization, quote, product (nullable), resource (nullable), category (nullable). BigDecimal for all money/quantity fields.

**Services:**
- `InboundRequestService`: CRUD requests, review workflow (pending -> reviewing -> approved/denied), convert to project (creates Project from form data), link to existing client or create new
- `QuoteService`: CRUD quotes, versioning (clone quote with incremented version), line item management, recalculate totals (sum line totals with discounts and tax), status workflow, PDF generation (using template system from Phase 9 or simple HTML->PDF), convert to project (if not already linked)
- `QuoteLineItemService`: CRUD line items, reorder, calculate line_total (quantity * unit_price - discount + tax), auto-populate from product/resource rates, section grouping
- Business flow: InboundRequest -> approve -> create Project -> create Quote with line items -> send -> client approves -> convert to Invoice (Phase 8)

**Controllers:**
- `InboundRequestsApi`: CRUD + review + convert-to-project
- `QuotesApi`: CRUD + versioning + line items + status transitions + send + PDF

### OpenAPI additions

Paths:
- `/api/inbound-requests` (GET paginated+filter by status, POST)
- `/api/inbound-requests/{id}` (GET, PATCH, DELETE)
- `/api/inbound-requests/{id}/review` (POST: approve/deny)
- `/api/inbound-requests/{id}/convert` (POST: create project from request)
- `/api/quotes` (GET paginated+filter by status/client/project, POST)
- `/api/quotes/{id}` (GET with line items, PATCH, DELETE)
- `/api/quotes/{id}/line-items` (GET, POST, PUT bulk reorder)
- `/api/quotes/{id}/line-items/{lineId}` (PATCH, DELETE)
- `/api/quotes/{id}/send` (POST: email to client)
- `/api/quotes/{id}/new-version` (POST: clone as new version)
- `/api/quotes/{id}/recalculate` (POST)
- `/api/quotes/{id}/pdf` (GET: download PDF)
- `/api/quotes/{id}/approve` (POST: client approval via public link)

Schemas: InboundRequest, Quote, QuoteLineItem + Create/Update/Paginated. ReviewRequest, QuoteSendRequest. Public approval schemas.

### Frontend

Pages:
- `/pipeline` - Inbound requests list with status filters, kanban view (pending/reviewing/approved/denied)
- `/pipeline/[id]` - Request detail with form data, review actions, convert button
- `/quotes` - Quote list with search, filter by status/client
- `/quotes/[id]` - Quote detail: header info, line items table (grouped by section), totals, approval status, send/PDF actions
- `/quotes/[id]/edit` - Quote editor: inline line item editing, drag-and-drop reorder, section management
- `/quotes/new` - Create quote (select client/project, add line items from products/resources)

Components:
- `InboundRequestCard` - Status badge, submitter info, quick actions
- `QuoteLineItemTable` - Editable table with section headers, quantity/price/discount/tax columns, running totals
- `QuotePreview` - Print-friendly quote layout (matches PDF output)
- `QuoteSendDialog` - Email preview, recipient selection
- `PipelineKanban` - Drag-and-drop kanban board for request status

Sidebar nav: Add "Pipeline" and "Quotes" section

---

## Phase 8: Invoicing & Payments

**Tables:** `invoices`, `invoice_line_items`, `payments`

**Migration:** `008-invoices-payments.sql`

### Database

From `schema.sql` section 13:

- `invoices`: id, organization_id, quote_id (nullable FK), project_id (nullable FK), client_id (FK), invoice_number (sequential), status (CHECK: draft/sent/viewed/partially_paid/paid/overdue/void), issued_date, due_date, paid_at, subtotal, discount_amount, tax_amount, total, amount_paid, balance_due, currency, external_accounting_id, notes, internal_notes, terms, custom_fields (JSONB), created_by
- `invoice_line_items`: id, organization_id, invoice_id, quote_line_item_id (nullable FK for traceability), product_id (nullable), category_id (nullable), description, date_start, date_end, quantity, unit_price, unit, discount_percent, discount_amount, tax_rate, line_total, section, display_order, notes
- `payments`: id, organization_id, invoice_id, amount (CHECK > 0), currency, payment_method (CHECK: credit_card/bank_transfer/check/cash/paypal/other), payment_reference, payment_date, notes, external_payment_id

### Backend

**Entities:**
- `Invoice.java`: All fields. `@ManyToOne` for organization, quote, project, client, createdBy. Sequential number via `seq_invoice_number`.
- `InvoiceLineItem.java`: `@ManyToOne` for organization, invoice, quoteLineItem (nullable), product (nullable), category (nullable).
- `Payment.java`: `@ManyToOne` for organization, invoice. BigDecimal for amount.

**Services:**
- `InvoiceService`: CRUD invoices, generate from quote (copy line items, link quote_line_item_id), recalculate totals, status workflow with payment-aware transitions (partially_paid when amount_paid < total, paid when amount_paid >= total), overdue detection (scheduled job: if due_date < now and status = 'sent'/'viewed'), void invoice
- `InvoiceLineItemService`: CRUD line items, generate from quote line items
- `PaymentService`: Record payments against invoice, update invoice.amount_paid and balance_due, handle overpayments (credit), payment methods tracking
- Scheduled job (ShedLock): Check for overdue invoices daily, update status, optionally send reminder emails

**Controllers:**
- `InvoicesApi`: CRUD + line items + payments + status + send + PDF
- `PaymentsApi`: Record + list payments

### OpenAPI additions

Paths:
- `/api/invoices` (GET paginated+filter by status/client/project/overdue, POST)
- `/api/invoices/{id}` (GET with line items+payments, PATCH, DELETE)
- `/api/invoices/{id}/line-items` (GET, POST, PUT bulk)
- `/api/invoices/{id}/line-items/{lineId}` (PATCH, DELETE)
- `/api/invoices/{id}/payments` (GET, POST record payment)
- `/api/invoices/{id}/send` (POST)
- `/api/invoices/{id}/void` (POST)
- `/api/invoices/{id}/pdf` (GET)
- `/api/invoices/{id}/recalculate` (POST)
- `/api/invoices/from-quote/{quoteId}` (POST: generate invoice from quote)
- `/api/payments` (GET paginated)
- `/api/payments/{id}` (GET, DELETE)

Schemas: Invoice, InvoiceLineItem, Payment + Create/Update/Paginated.

### Frontend

Pages:
- `/invoices` - Invoice list with status filters, overdue highlight, quick send
- `/invoices/[id]` - Invoice detail: line items, payment history, balance due, send/PDF
- `/invoices/[id]/edit` - Invoice editor (similar to quote editor)
- `/invoices/new` - Create invoice (from scratch or from quote)
- `/payments` - Payment log: all payments across invoices, filter by date/method

Components:
- `InvoiceStatusBadge` - Color-coded (draft=gray, sent=blue, overdue=red, paid=green, void=strikethrough)
- `PaymentRecorder` - Record payment: amount, method, date, reference
- `InvoicePreview` - Print-friendly layout
- `BalanceSummary` - Visual: total, paid, remaining with progress bar
- `OverdueAlert` - Banner for overdue invoices with days overdue

Sidebar nav: Add "Invoices" and "Payments" section

---

## Phase 9: Contracts, Templates, Files

**Tables:** `contracts`, `templates`, `template_items`, `file_attachments`

**Migration:** `009-contracts-templates-files.sql`

### Database

From `schema.sql` sections 14-16:

- `contracts`: id, organization_id, project_id (nullable), client_id (nullable), resource_id (nullable), vendor_id (nullable), contract_type (CHECK: service_agreement/rental_agreement/subcontractor/nda/other), title, template_content (TEXT), generated_file_url, status (CHECK: draft/sent/viewed/signed/expired/cancelled), sent_at, signed_at, signed_file_url, signing_provider, external_signing_id, expires_at, notes
- `templates`: id, organization_id, name, description, template_type (CHECK: inbound_form/quote/project/contract), is_client_facing, is_active, settings (JSONB), created_by
- `template_items`: id, organization_id, template_id, item_type (CHECK: product/resource_role/line_item/form_field/date_range/fee), product_id (nullable), category_id (nullable), label, description, default_quantity, default_unit_price, default_unit, field_type, field_options (JSONB), is_required, depends_on_item_id/depends_on_value, section, display_order
- `file_attachments`: id, organization_id, entity_type, entity_id, file_name, file_url, file_size_bytes, mime_type, category, uploaded_by

### Backend

**Entities + Repositories + Services + Controllers** for each.

**Key services:**
- `ContractService`: CRUD contracts, generate from template (fill template_content with entity data), track signing status, link to projects/clients/resources/vendors
- `TemplateService`: CRUD templates + items, clone templates, apply template to create quotes/projects/contracts (auto-populate line items/date ranges from template items)
- `FileAttachmentService`: Upload to S3/R2 (using existing S3Service), attach to any entity, download, delete. Validate file types/sizes.

**Template application flow:** Select template -> create entity (quote/project/contract) -> auto-populate items -> user edits as needed

### OpenAPI additions

Paths:
- `/api/contracts` (GET, POST)
- `/api/contracts/{id}` (GET, PATCH, DELETE)
- `/api/contracts/{id}/send` (POST)
- `/api/contracts/{id}/sign` (POST: record signature)
- `/api/templates` (GET, POST)
- `/api/templates/{id}` (GET with items, PATCH, DELETE)
- `/api/templates/{id}/items` (GET, POST, PUT bulk reorder)
- `/api/templates/{id}/items/{itemId}` (PATCH, DELETE)
- `/api/templates/{id}/apply` (POST: create entity from template)
- `/api/files/{entityType}/{entityId}` (GET list, POST upload)
- `/api/files/{id}` (GET download, DELETE)

### Frontend

Pages:
- `/contracts` - Contract list with status filters
- `/contracts/[id]` - Contract detail: content preview, signing status, linked entities
- `/templates` - Template library: filter by type, preview
- `/templates/[id]` - Template editor: items, settings, preview

Components:
- `FileUploader` - Drag-and-drop file upload with progress
- `FileList` - Attached files with download/delete, grouped by category
- `TemplateItemEditor` - Build template items with conditions
- `ContractViewer` - Rendered contract content with signing status

Sidebar nav: Add "Contracts" and "Templates" to admin section

---

## Phase 10: Activity & Notifications

**Tables:** `communication_log`, `activity_log`, `notifications`

**Migration:** `010-activity-notifications.sql`

### Database

From `schema.sql` sections 17-18:

- `communication_log`: id, organization_id, entity_type, entity_id, channel (CHECK: email/sms/push/in_app/webhook), direction (CHECK: outbound/inbound), recipient_name/email/phone, subject, body_preview, status (CHECK: queued/sent/delivered/opened/bounced/failed), external_message_id, sent_by, sent_at
- `activity_log`: id, organization_id, user_id, entity_type, entity_id, action, changes (JSONB: before/after diff), metadata (JSONB), created_at
- `notifications`: id, organization_id, user_id, title, body, entity_type, entity_id, is_read, read_at, channel (CHECK: in_app/email/sms/push)

Indexes: Partial index on notifications (user_id, is_read) WHERE is_read = FALSE for fast unread queries

### Backend

**Services:**
- `ActivityLogService`: Record entity changes (called from other services after create/update/delete), compute JSONB diff (before/after), query activity for entity or user
- `NotificationService`: Create notifications for users (e.g., quote approved, invoice overdue, resource confirmed), mark as read, get unread count, batch mark-all-read
- `CommunicationLogService`: Log all outbound emails/comms, track delivery status

**Integration points:** Add `@AfterReturning` AOP aspect or explicit calls in existing services (ProjectService, QuoteService, InvoiceService, etc.) to log activity on CRUD operations.

**Scheduled job:** Clean up old activity log entries (configurable retention period)

### OpenAPI additions

Paths:
- `/api/activity/{entityType}/{entityId}` (GET activity for entity)
- `/api/activity/user/{userId}` (GET activity by user)
- `/api/notifications` (GET for current user, with unread count)
- `/api/notifications/{id}/read` (POST)
- `/api/notifications/read-all` (POST)
- `/api/communications/{entityType}/{entityId}` (GET comms for entity)

### Frontend

Components:
- `ActivityFeed` - Timeline of changes for an entity (used on detail pages)
- `NotificationBell` - Header icon with unread count badge, dropdown with recent notifications
- `NotificationList` - Full notification list page with mark-as-read
- `CommunicationTimeline` - Email/SMS history for an entity

Add activity feed section to all entity detail pages (projects, quotes, invoices, clients, etc.)

---

## Phase 11: Automation & Integrations

**Tables:** `workflow_rules`, `integrations`, `integration_sync_log`

**Migration:** `011-automation-integrations.sql`

### Database

From `schema.sql` sections 19-20:

- `workflow_rules`: id, organization_id, name, description, is_active, trigger_entity, trigger_event, trigger_conditions (JSONB), actions (JSONB array), execution_order, created_by
- `integrations`: id, organization_id, provider, status (CHECK: connected/disconnected/error), credentials (JSONB encrypted), settings (JSONB), last_synced_at; unique (org, provider)
- `integration_sync_log`: id, organization_id, integration_id, direction (CHECK: push/pull), entity_type, entity_id, external_id, status (CHECK: success/error/skipped), error_message, payload (JSONB)

### Backend

**Services:**
- `WorkflowRuleService`: CRUD rules, evaluate triggers on entity events (called from activity logging), execute actions (send email, create notification, update status, create entity). Rule engine: check trigger_conditions JSONB against entity state, execute actions array in order.
- `IntegrationService`: CRUD integrations, store encrypted credentials, manage connection status, sync operations
- `IntegrationSyncService`: Log sync operations, retry failed syncs

**Integration providers** (implement as needed):
- Xero/QuickBooks: Sync invoices, payments, clients
- Stripe: Payment processing
- DocuSign: Contract e-signatures
- Google Calendar: Resource availability sync

**Workflow trigger examples:**
- `trigger_entity: "project", trigger_event: "status_changed", trigger_conditions: {"new_status": "approved"}` -> actions: `[{"type": "send_email", "to": "client"}, {"type": "create_quote"}]`
- `trigger_entity: "invoice", trigger_event: "overdue"` -> actions: `[{"type": "send_reminder"}, {"type": "notify_user", "role": "accountant"}]`

### OpenAPI additions

Paths:
- `/api/workflow-rules` (GET, POST)
- `/api/workflow-rules/{id}` (GET, PATCH, DELETE, POST toggle active)
- `/api/integrations` (GET, POST connect)
- `/api/integrations/{id}` (GET, PATCH settings, DELETE disconnect)
- `/api/integrations/{id}/sync` (POST: trigger manual sync)
- `/api/integrations/{id}/sync-log` (GET paginated)

### Frontend

Pages:
- `/admin/automations` - Rule builder with trigger/condition/action visual editor
- `/admin/integrations` - Available integrations, connection status, sync logs

---

## Phase 12: Dashboard, Reports, RLS

**DB views + RLS policies + dashboard aggregations**

**Migration:** `012-views-rls.sql`

### Database

From `schema.sql` sections 22-23:

**RLS policies:** Enable RLS on ALL business tables (34 tables). Each policy checks `organization_id = current_setting('app.current_org_id')::UUID`. Applied via DO block iterating over table array.

**Views:**
- `v_project_financials`: Project P&L - total_days, sum_resource_bill/pay_rates, total_product_billing/cost, total_payouts, profit
- `v_client_analytics`: Client metrics - total_projects, completed/active projects, total_invoiced, total_paid, total_outstanding, first/last project dates
- `v_inventory_status`: Serialized inventory - product info, serial/barcode, status, condition, ownership, current project
- `v_stock_overview`: Consumable stock - product, location, quantities (on_hand, reserved, available), needs_reorder flag

### Backend

**RLS integration:** Set `app.current_org_id` PostgreSQL session variable before each query. Options:
- Hibernate `@Filter` + `@FilterDef` on entities
- Custom `ConnectionCustomizer` that runs `SET app.current_org_id = ?` on connection checkout
- Or handle in a request-scoped `@Component` that sets the variable via `EntityManager.createNativeQuery`

**Dashboard endpoints:**
- Revenue summary (total invoiced, paid, outstanding, by period)
- Pipeline summary (inbound requests by status, quotes by status)
- Resource utilization (booked vs available days, by resource)
- Inventory alerts (low stock, checked-out items)
- Top clients (by revenue, by project count)
- Profit margins (by project, by client, by category)

**Report exports:** CSV and PDF generation for:
- Project list with financials
- Invoice aging report
- Resource utilization report
- Client revenue report
- Inventory status report

### OpenAPI additions

Paths:
- `/api/dashboard/revenue` (GET: period, summary)
- `/api/dashboard/pipeline` (GET: request/quote counts by status)
- `/api/dashboard/utilization` (GET: resource utilization metrics)
- `/api/dashboard/inventory-alerts` (GET: low stock + overdue check-outs)
- `/api/dashboard/top-clients` (GET: top N clients by revenue)
- `/api/reports/projects` (GET: CSV/PDF export)
- `/api/reports/invoices` (GET: aging report)
- `/api/reports/resources` (GET: utilization report)
- `/api/reports/clients` (GET: revenue report)

### Frontend

Pages:
- `/dashboard` - Main dashboard with widget grid (revenue chart, pipeline funnel, utilization gauge, alerts, recent activity)
- `/reports` - Report builder: select report type, date range, filters, export

Components:
- `RevenueChart` - Line/bar chart (monthly/quarterly revenue, paid vs outstanding)
- `PipelineFunnel` - Funnel visualization (requests -> quotes -> projects -> invoices -> paid)
- `UtilizationGauge` - Resource utilization % with drill-down
- `InventoryAlerts` - Low stock warnings, overdue check-outs
- `TopClientsTable` - Ranked client list with revenue metrics
- `ReportExporter` - Download as CSV or PDF with progress

Sidebar nav: Replace placeholder dashboard with real dashboard; add Reports section

---

## Cross-Phase Conventions

### Each phase follows this pattern:
1. Write Liquibase migration SQL in `backend/src/main/resources/db/changelog/NNN-name.sql`
2. Add changeset to `db.changelog-master.yaml`
3. Create JPA entities in `backend/src/main/java/com/kfdlabs/asap/entity/`
4. Create repositories in `backend/src/main/java/com/kfdlabs/asap/repository/`
5. Add paths + schemas to `openapi.yml`, run codegen (`./gradlew openApiGenerate`)
6. Create MapStruct mappers in `backend/src/main/java/com/kfdlabs/asap/mapper/`
7. Create services in `backend/src/main/java/com/kfdlabs/asap/service/`
8. Create controllers implementing generated API interfaces in `backend/src/main/java/com/kfdlabs/asap/controller/`
9. Create frontend API types, clients, pages, components
10. Verify: `./gradlew clean build`, `bootRun`, frontend `pnpm dev`

### Organization scoping:
- Every query MUST filter by `organization_id` from `SecurityUtils.getCurrentOrganizationId()`
- Controllers should validate that accessed entities belong to the current org
- Use `@PreAuthorize` for role-based access (OWNER/ADMIN for admin operations, MEMBER+ for read)

### Pagination:
- All list endpoints support: `page`, `size`, `sortBy`, `order` query params
- Use `PaginationUtils.getPageable()` for consistent pagination
- Response format: `{ content: [], totalElements, totalPages, page, size }`
