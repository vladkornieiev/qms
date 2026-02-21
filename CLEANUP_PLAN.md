# ASAP Platform - Production Readiness & Cleanup Plan

Comprehensive analysis of the entire codebase across all 12 implemented phases.
Organized by priority: Critical > High > Medium > Low.

---

## Phase A: Critical Security & Business Logic Fixes

### A1. Fix TwoFactorService - 2FA Completely Bypassed
**File:** `service/TwoFactorService.java` (~line 216-225)
**Issue:** `verifyCode()` always returns `true` - no actual TOTP verification.
The entire 2FA implementation is commented out / stubbed.
**Fix:**
- Implement actual TOTP verification using a library (e.g., `com.warrenstrange:googleauth`)
- Verify the code against the user's stored secret
- Implement backup code verification
- Rate-limit verification attempts (already has `attempts` field in OTP entity)

### A2. Fix CORS - Wildcard Origin with Credentials
**File:** `config/SecurityConfig.java` (line 78-81)
**Issue:** `setAllowedOriginPatterns(Arrays.asList("*"))` with `setAllowCredentials(true)` allows any origin to send credentialed requests - enables cross-origin token theft.
**Fix:**
- Replace wildcard with environment-variable-based origin list:
  ```java
  configuration.setAllowedOriginPatterns(List.of(
      appBaseUiUrl  // e.g., "http://localhost:3000" or "https://app.example.com"
  ));
  ```
- Inject `app.base-ui-url` from config

### A3. Fix OAuth2 Token Leakage in URL
**File:** `security/OAuth2AuthenticationSuccessHandler.java` (lines 68-69)
**Issue:** Access and refresh tokens passed as URL query parameters. Tokens appear in browser history, server logs, and referrer headers.
**Fix:**
- Use a short-lived authorization code pattern:
  1. Generate a single-use, short-lived (30s) code stored in DB/cache
  2. Redirect to frontend with only the code in URL
  3. Frontend exchanges code for tokens via POST `/api/auth/exchange-oauth-code`
- OR set tokens in secure HttpOnly cookies

### A4. Auto-Recalculate Invoice/Quote Totals on Line Item Changes
**Files:** `service/InvoiceService.java`, `service/QuoteService.java`
**Issue:** Line item create/update/delete do NOT trigger recalculation. Users must manually call `recalculate()`. Leads to stale totals.
**Fix:**
- Call `recalculate(entityId)` at the end of `createLineItem()`, `updateLineItem()`, `deleteLineItem()` in both InvoiceService and QuoteService
- Remove or deprecate the standalone recalculate endpoint (or keep for manual correction)

### A5. Validate Invoice Status Before Recording Payment
**File:** `service/InvoiceService.java` (~line 355-384)
**Issue:** `recordPayment()` doesn't check if invoice is in a payable status. Can record payment on "void" or "draft" invoices.
**Fix:**
- Add status check: only allow payment on `sent`, `viewed`, `partially_paid`, or `overdue` invoices
- Use `StatusTransitionValidator` for consistency

### A6. Remove Hardcoded Credentials from Version Control
**Files:** `application-local.yml`, `docker-compose.yml`
**Issue:** Real SMTP password (`hockiv-kujkA3-bennoj`), weak JWT secrets, and AWS credentials committed to git.
**Fix:**
- Replace all secrets in `docker-compose.yml` with `${ENV_VAR}` references
- Create `.env.example` with placeholder values
- Add `.env` to `.gitignore`
- Remove real credentials from `application-local.yml`
- Rotate all exposed credentials immediately

---

## Phase B: High Priority Business Logic & Security

### B1. Add Pessimistic Locking for Inventory Operations
**Files:** `service/InventoryService.java`, `repository/StockLevelRepository.java`
**Issue:** Concurrent check-out/consume/transfer operations can cause race conditions leading to negative stock or double-checkout.
**Fix:**
- Add `@Lock(LockModeType.PESSIMISTIC_WRITE)` on StockLevel queries used in consume/transfer
- Add `@Lock` on InventoryItem queries used in check-out/check-in
- Alternative: Use `@Version` (optimistic locking) on StockLevel entity with retry logic

### B2. Validate Payout Approval Requires Admin/Owner Role
**File:** `service/ResourcePayoutService.java` (~line 100-107)
**Issue:** `approvePayout()` doesn't check that the approving user has an admin/owner role. Any org member can approve.
**Fix:**
- Add `SecurityUtils.isAdmin()` check in `approvePayout()`
- Throw 403 if user lacks OWNER/ADMIN role

### B3. Fix TemplateService NPE on Quote Number Generation
**File:** `service/TemplateService.java` (~line 159)
**Issue:** `quoteRepository.findMaxQuoteNumber(org.getId()) + 1` throws NPE when no quotes exist (returns null).
**Fix:**
- Use `Optional` or null-check: `Integer max = ...; int next = (max != null ? max : 0) + 1;`
- Apply same fix in `InvoiceService` and `ProjectService` number generation

### B4. Validate Project Date Ranges (dateEnd >= dateStart)
**File:** `service/ProjectService.java` (~line 177-188)
**Issue:** No validation that `dateEnd >= dateStart` when creating/updating date ranges.
**Fix:**
- Add validation in `createDateRange()` and `updateDateRange()`:
  ```java
  if (request.getDateEnd().isBefore(request.getDateStart())) {
      throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "error.date.end.before.start");
  }
  ```

### B5. Fix InboundRequest Conversion - Project Number Collision
**File:** `service/InboundRequestService.java` (~line 107-127)
**Issue:** Uses `projectRepository.count() + 1` for project number - not safe under concurrency and conflicts with `ProjectService` number generation.
**Fix:**
- Use the same sequential number generation as `ProjectService` (database sequence `seq_project_number`)
- Extract shared method: `ProjectService.generateNextProjectNumber(orgId)`

### B6. Add RLS Backend Integration
**Files:** Need new filter/interceptor
**Issue:** RLS policies exist in PostgreSQL (migration 012) but backend never sets `app.current_org_id` session variable. RLS is effectively not enforced.
**Fix:**
- Create a request-scoped filter or Hibernate connection customizer:
  ```java
  @Component
  public class OrganizationContextFilter implements Filter {
      @Override
      public void doFilter(...) {
          UUID orgId = SecurityUtils.getCurrentOrganizationId();
          if (orgId != null) {
              entityManager.createNativeQuery("SET app.current_org_id = :orgId")
                  .setParameter("orgId", orgId.toString())
                  .executeUpdate();
          }
          chain.doFilter(request, response);
      }
  }
  ```
- Add `WITH CHECK` clause to all RLS policies (prevents INSERT/UPDATE to wrong org)

### B7. Add Security Headers
**File:** `config/SecurityConfig.java`
**Issue:** No HSTS, X-Frame-Options, X-Content-Type-Options, or CSP headers.
**Fix:**
- Add to security filter chain:
  ```java
  .headers(headers -> headers
      .frameOptions(f -> f.deny())
      .contentTypeOptions(c -> {})
      .httpStrictTransportSecurity(h -> h.maxAgeInSeconds(31536000).includeSubDomains(true))
  )
  ```

### B8. Handle Bulk Operations Partial Failures
**File:** `service/BulkOperationsService.java`
**Issue:** `@Transactional` at class level means if bulk operation fails halfway, all changes are rolled back. But no partial-success reporting.
**Fix:**
- Option A: Process items individually with try/catch, collect successes/failures, return summary
- Option B: Keep all-or-nothing but wrap in explicit transaction with clear error messaging
- Add `BulkOperationResult` DTO with `succeeded`, `failed`, `errors` fields

### B9. Fix Empty URL Placeholders in Email/Bulk Services
**Files:** `service/EmailService.java`, `service/BulkOperationsService.java`
**Issue:** Email methods pass empty string `""` for entity URLs - links in emails go nowhere.
**Fix:**
- Generate proper URLs using `app.base-ui-url` config:
  ```java
  String quoteUrl = baseUiUrl + "/quotes/" + quote.getId();
  ```

---

## Phase C: Medium Priority - Validation & Robustness

### C1. Add Missing Input Validations
**Files:** Multiple services
**Issues & Fixes:**
- `InvoiceService`: Validate line item `unitPrice >= 0`, `quantity > 0`
- `QuoteService`: Validate discount doesn't exceed gross amount
- `ResourcePayoutService`: Validate `amount > 0` (DB has CHECK but service should validate)
- `InventoryService.transferStock()`: Validate `toLocation` is not empty
- `ProductService`: Validate parent hierarchy chain (not just self-reference) to prevent circular loops
- `CustomFieldService`: Validate `fieldKey` uniqueness per entity type per org
- `CustomFieldService`: Validate `lookupListId` matches when `fieldType = "lookup"`

### C2. Fix RequestLoggingFilter Timing Bug
**File:** `config/RequestLoggingFilter.java` (lines 32-33)
**Issue:** `long after = System.currentTimeMillis();` is set before `doFilter()`, so duration is always ~0ms.
**Fix:**
- Remove `long after` initialization before doFilter
- Only set `after` in the `try` block after `filterChain.doFilter()` completes
- In `finally`, use `System.currentTimeMillis() - before` for duration

### C3. Improve Exception Handling - Replace HttpClientErrorException
**Files:** All services
**Issue:** Services throw `HttpClientErrorException` for business logic errors. This is an HTTP client library class being misused as a server-side exception.
**Fix:**
- Create custom exception hierarchy:
  ```java
  public abstract class AsapException extends RuntimeException { ... }
  public class EntityNotFoundException extends AsapException { ... }
  public class BusinessRuleViolationException extends AsapException { ... }
  public class AuthorizationException extends AsapException { ... }
  ```
- Update `GlobalExceptionHandler` to handle custom exceptions
- Migrate services incrementally (can be done per-module)

### C4. Fix Email Service Silent Failures
**File:** `service/EmailService.java` (lines 169, 200, 230, 286, 315)
**Issue:** Catches all `Exception` types and only logs - emails silently fail with no retry or alerting.
**Fix:**
- Distinguish transient vs permanent failures
- Add retry for transient failures (connection timeouts)
- Log permanent failures at ERROR level
- Record failed sends in `communication_log` with status = 'failed'
- Consider async email queue with retry (Spring `@Async` + `@Retryable`)

### C5. Fix S3Service @SneakyThrows
**File:** `service/S3Service.java` (lines 33-52)
**Issue:** `@SneakyThrows` hides checked exceptions - callers can't handle them properly.
**Fix:**
- Replace with proper try/catch and wrap in `RuntimeException` or custom `StorageException`
- Log the original exception with context (bucket, key)

### C6. Sanitize Error Responses
**File:** `exception/GlobalExceptionHandler.java`
**Issue:** Generic exception handler (line 50) includes `ex.getMessage()` which may expose internal details (SQL errors, class names).
**Fix:**
- For production, return generic "An internal error occurred" message
- Log full exception details at ERROR level internally
- Only pass through message for known business exceptions

### C7. Fix Login Attempt Tracking
**File:** `service/AuthService.java`
**Issue:** Login attempt tracking uses in-memory `ConcurrentHashMap` - resets on restart, not distributed across instances.
**Fix:**
- Move to database-backed tracking (new `login_attempts` table) or Redis
- Include: email, attempt_count, locked_until, last_attempt_at

### C8. Add Docker Health Checks
**Files:** `docker-compose.yml`, backend/frontend Dockerfiles
**Issue:** Backend and frontend containers have no health checks.
**Fix:**
- Backend: `healthcheck: test: ["CMD", "java", "-cp", "app.jar", ..."]` or use wget/curl to `/api/status`
- Frontend: `healthcheck: test: ["CMD", "wget", "-q", "--spider", "http://localhost:3001"]`
- Add `depends_on.condition: service_healthy` for frontend depending on backend

### C9. Reduce Refresh Token Validity
**File:** `application.yml` / `application-local.yml`
**Issue:** Refresh token validity is 30 days (`2592000000ms`) - excessive for security.
**Fix:**
- Reduce to 7 days (`604800000ms`)
- Implement token rotation: issue new refresh token on each refresh, invalidate old one

---

## Phase D: Low Priority - Code Quality & Polish

### D1. Remove/Implement Placeholder Code
- `IntegrationService.sync()`: Has placeholder comment "actual sync logic would be provider-specific" - either implement for at least one provider or mark endpoint as 501 Not Implemented
- `ApiKeyAuthenticationFilter`: Currently a pass-through - either implement or remove from filter chain entirely

### D2. Fix OrganizationService Inefficient Query
**File:** `service/OrganizationService.java` (line 110-114)
**Issue:** Uses `findAllById()` then Java streams to filter - should be a single SQL query.
**Fix:**
- Add repository method: `findByIdInAndIsActive(List<UUID> ids, boolean isActive)`

### D3. Add .env.example File
**Issue:** No documentation of required environment variables for deployment.
**Fix:**
- Create `.env.example` with all required vars and placeholder values
- Document which are required vs optional

### D4. Fix Mapper Ignored Fields
**File:** `mapper/UserMapper.java` (lines 14-15)
**Issue:** `roles` and `twoFactorAuthEnabled` are always ignored - never populated in DTO.
**Fix:**
- Populate `roles` from `OrganizationMember` data
- Populate `twoFactorAuthEnabled` from `UserAuthMethods`

### D5. Connection Pool Sizing
**File:** `application.yml`
**Issue:** Default `maximum-pool-size: 50` is excessive for most deployments.
**Fix:**
- Reduce default to `20`
- Add documentation for scaling guidelines

### D6. Add Actuator Security
**File:** `config/SecurityConfig.java`
**Issue:** `/actuator/**` is `permitAll()` - exposes metrics, health details, and potentially sensitive info.
**Fix:**
- Restrict to authenticated requests or internal network
- Or limit to specific endpoints: `/actuator/health`, `/actuator/prometheus`

---

## Phase E: Testing & Documentation (Post-Cleanup)

### E1. Add Integration Tests
- No test files exist in the project
- Priority test targets:
  1. Auth flow (login, token refresh, role enforcement)
  2. Invoice lifecycle (create -> add items -> send -> pay -> status transitions)
  3. Quote lifecycle (create -> version -> approve -> convert to invoice)
  4. Inventory operations (check-out/in, stock consume, concurrent operations)
  5. Multi-tenancy isolation (verify org A can't access org B data)
  6. RLS enforcement

### E2. Add API Contract Tests
- Validate controllers match OpenAPI spec
- Use Spring MockMvc or RestAssured with generated DTOs

### E3. Create Production Deployment Documentation
- Required environment variables
- Database setup & migration
- S3/MinIO setup
- SMTP configuration
- SSL/TLS setup
- Monitoring & alerting

---

## Implementation Order

| Priority | Phase | Estimated Items | Focus |
|----------|-------|----------------|-------|
| 1 | A (Critical) | 6 items | Security fixes, business logic correctness |
| 2 | B (High) | 9 items | Security hardening, data integrity |
| 3 | C (Medium) | 9 items | Validation, robustness, error handling |
| 4 | D (Low) | 6 items | Code quality, polish |
| 5 | E (Testing) | 3 items | Test coverage, documentation |

Total: ~33 actionable items across 5 priority phases.
