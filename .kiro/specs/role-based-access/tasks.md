# Implementation Plan: Role-Based Access Control & Per-Role Dashboards

## Overview

Expand the role system from 3 backoffice-type roles (Admin, Backoffice, Sales) to 5 by adding Finance and Marketing. Split backend routes into domain-specific sub-groups with per-role middleware. Create dedicated dashboard pages and APIs for Backoffice, Finance, and Marketing roles. Update frontend middleware, sidebar, and routing to enforce role-based access.

Changes span both repositories:

- **Backend:** `/Users/rizkiadrian/works/personal/lingkar-id-backend`
- **Frontend:** `/Users/rizkiadrian/works/personal/lingkar-crm`

## Tasks

### Task 1: Backend — Add New Roles

- [ ] 1.1 Add role constants to `app/Models/Role.php`
  - Add `public const FINANCE = 'Finance';`
  - Add `public const MARKETING = 'Marketing';`

- [ ] 1.2 Update `database/seeders/RoleSeeder.php` to insert Finance and Marketing roles
  - Add entries for `Finance` and `Marketing` in the seeder array
  - Run `docker exec lingkarid.local php artisan db:seed --class=RoleSeeder` to verify

- [ ] 1.3 Update `config/businessflow.php` to include new roles in backoffice group
  - Add `financeRoles` array: `['Finance']`
  - Add `marketingRoles` array: `['Marketing']`
  - Update `backofficeRoles` if needed (keep as `['Admin', 'Backoffice']`)

### Task 2: Backend — Split Route Groups in `routes/api.php`

- [ ] 2.1 Refactor the single `backoffice` route group into domain-specific sub-groups
  - **SHARED** (`role:admin,backoffice,finance,marketing`): status, notifications
  - **USER MANAGEMENT** (`role:admin,backoffice`): backoffice-members, client-members, mitra-members, sales-members (CRUD + verify + verification-status)
  - **SALES MANAGEMENT** (`role:admin,backoffice`): leads (CRUD + status + convert), sales-members-list, activity-logs review
  - **MASTER DATA** (`role:admin,backoffice`): service-categories
  - **FINANCE** (`role:admin,finance`): deposit-requests (list, detail, status update)
  - **MARKETING** (`role:admin,marketing`): banners, vouchers, referral-campaigns, referrals, referral-rewards, referral-analytics, articles, authors, article-categories, article-tags
  - **ANALYTICS** (`role:admin,marketing`): analytics/\* (funnel, trends, segments, events)
  - **DASHBOARDS**: see Task 2.2

- [ ] 2.2 Add dashboard route sub-groups
  - `Route::middleware(['role:admin'])->group(...)` → `GET /dashboard` (existing DashboardController)
  - `Route::middleware(['role:admin,backoffice'])->group(...)` → `GET /backoffice-dashboard` (new)
  - `Route::middleware(['role:admin,finance'])->group(...)` → `GET /finance-dashboard` (new)
  - `Route::middleware(['role:admin,marketing'])->group(...)` → `GET /marketing-dashboard` (new)

- [ ] 2.3 Verify Sales routes remain unchanged: `Route::prefix('sales')->middleware(['role:sales'])->group(...)`

- [ ] 2.4 Verify shared activity-log comments route remains accessible by all authenticated users

### Task 3: Checkpoint — Backend Route Verification

- [ ] 3.1 Run `php -l` on `routes/api.php` to verify syntax
- [ ] 3.2 Run `docker exec lingkarid.local php artisan route:list --path=backoffice` to verify route registration
- [ ] 3.3 Verify no existing tests break: `docker exec lingkarid.local php artisan test --filter=Backoffice`

### Task 4: Backend — Backoffice Dashboard API

- [ ] 4.1 Create `app/Services/Backoffice/BackofficeDashboardService.php`
  - Method `getSummary()` returns:
    - `clients`: total, verified, unverified counts (from User with Client role)
    - `mitra`: total, pending_verification count (from User with Mitra role + mitra.verification_status = 'pending')
    - `leads`: total active, by_status breakdown (from Lead model grouped by status)
    - `pending_activity_logs`: latest 5 with status='pending' (from ActivityLog, include type, sales user name, created_at)
    - `pending_verifications`: latest 5 pending mitra/client verifications (include name, type, created_at)

- [ ] 4.2 Create `app/Http/Controllers/Api/v1/Backoffice/BackofficeDashboardController.php`
  - Method `index()`: calls service, returns via `ApiResponse::success()`

- [ ] 4.3 Verify with `php -l` on new files

### Task 5: Backend — Finance Dashboard API

- [ ] 5.1 Create `app/Services/Backoffice/FinanceDashboardService.php`
  - Method `getSummary()` returns:
    - `deposits.pending`: count of DepositRequest with status='pending'
    - `deposits.approved_today`: count approved today
    - `deposits.rejected_today`: count rejected today
    - `deposits.volume_this_month`: sum of approved deposit amounts this month
    - `volume_trend`: daily approved amounts for last 30 days (date + amount)
    - `recent_pending`: latest 5 pending deposits (id, user_name, amount, created_at)

- [ ] 5.2 Create `app/Http/Controllers/Api/v1/Backoffice/FinanceDashboardController.php`
  - Method `index()`: calls service, returns via `ApiResponse::success()`

- [ ] 5.3 Verify with `php -l` on new files

### Task 6: Backend — Marketing Dashboard API

- [ ] 6.1 Create `app/Services/Backoffice/MarketingDashboardService.php`
  - Method `getSummary()` returns:
    - `campaigns.active`: count of ReferralCampaign with status='active'
    - `campaigns.total_referrals`: count of Referral records
    - `vouchers.active`: count of Voucher with is_active=true
    - `vouchers.redeemed_this_month`: count of VoucherUser records created this month
    - `articles.published`: count of Article with status='published'
    - `articles.draft`: count of Article with status='draft'
    - `funnel_summary`: registered, verified, first_order counts (from UserEvent aggregation)
    - `top_referrers`: top 5 referrers by referral count (name + count)

- [ ] 6.2 Create `app/Http/Controllers/Api/v1/Backoffice/MarketingDashboardController.php`
  - Method `index()`: calls service, returns via `ApiResponse::success()`

- [ ] 6.3 Verify with `php -l` on new files

### Task 7: Checkpoint — Backend API Verification

- [ ] 7.1 Run full syntax check: `find app/ -name "*.php" | xargs -I {} php -l {}`
- [ ] 7.2 Run `docker exec lingkarid.local php artisan route:list --path=backoffice` to confirm all new dashboard routes registered
- [ ] 7.3 Update Postman collection with new dashboard endpoints
  - Add folder "Backoffice Dashboard" under Backoffice group with `GET {{APP_URL}}/api/v1/backoffice/backoffice-dashboard`
  - Add folder "Finance Dashboard" under Backoffice group with `GET {{APP_URL}}/api/v1/backoffice/finance-dashboard`
  - Add folder "Marketing Dashboard" under Backoffice group with `GET {{APP_URL}}/api/v1/backoffice/marketing-dashboard`
  - Update existing endpoint descriptions to note new role restrictions per sub-group
  - Add example responses for each new dashboard endpoint
- [ ] 7.4 Validate Postman JSON: `python3 -c "import json; json.load(open('postman/Lingkar_ID_API.postman_collection.json')); print('Valid JSON')"`

### Task 8: Frontend — Config & Routing Updates

- [ ] 8.1 Update `src/config/env.ts`
  - Expand `BUSINESSFLOW`:
    ```ts
    export const BUSINESSFLOW = {
      backofficeRoles: ["Admin", "Backoffice"],
      financeRoles: ["Finance"],
      marketingRoles: ["Marketing"],
      salesRoles: ["Sales"],
    };
    ```
  - Add `ROLE_DASHBOARD_MAP`:
    ```ts
    export const ROLE_DASHBOARD_MAP: Record<string, string> = {
      Admin: "/dashboard",
      Backoffice: "/backoffice-dashboard",
      Finance: "/finance-dashboard",
      Marketing: "/marketing-dashboard",
      Sales: "/sales-dashboard",
    };
    ```

- [ ] 8.2 Update `src/config/routing.ts`
  - Add new path groups:
    ```ts
    const BACKOFFICE_DASHBOARD_SERVICES = {
      backofficeDashboard: "/backoffice-dashboard",
    };
    const FINANCE_DASHBOARD_SERVICES = {
      financeDashboard: "/finance-dashboard",
    };
    const MARKETING_DASHBOARD_SERVICES = {
      marketingDashboard: "/marketing-dashboard",
    };
    ```
  - Spread into `PATHS` export

### Task 9: Frontend — Middleware Rewrite

- [ ] 9.1 Rewrite `src/middleware.ts` role-based routing logic
  - Replace binary backoffice/sales routing with `ROLE_DASHBOARD_MAP` lookup
  - Define `ROLE_ALLOWED_PATHS` config:
    - `Admin`: all `/dashboard/*` pages + `/backoffice-dashboard` + `/finance-dashboard` + `/marketing-dashboard`
    - `Backoffice`: `/backoffice-dashboard` + `/dashboard/backoffice-members`, `/dashboard/client-members`, `/dashboard/mitra-members`, `/dashboard/sales-members`, `/dashboard/leads`, `/dashboard/activity-logs`, `/dashboard/service-categories`, `/dashboard/notifications`
    - `Finance`: `/finance-dashboard` + `/dashboard/deposit-requests`, `/dashboard/notifications`
    - `Marketing`: `/marketing-dashboard` + `/dashboard/banners`, `/dashboard/vouchers`, `/dashboard/referral-campaigns`, `/dashboard/referrals`, `/dashboard/articles`, `/dashboard/authors`, `/dashboard/article-categories`, `/dashboard/article-tags`, `/dashboard/analytics/*`, `/dashboard/notifications`
    - `Sales`: `/sales-dashboard` + `/sales-activities`
  - If user accesses a page not in their allowed paths → redirect to their default dashboard
  - Admin CANNOT access `/sales-dashboard`
  - Keep existing auth check (no token → redirect to login)
  - Keep existing API proxy logic unchanged

### Task 10: Frontend — Sidebar Navigation Update

- [ ] 10.1 Update `src/app/components/layout/Sidebar/Sidebar.tsx`
  - Add dashboard nav items for new roles:
    ```ts
    const BACKOFFICE_DASHBOARD_NAV: NavItem = {
      label: "Dashboard",
      href: PATHS.backofficeDashboard,
      icon: LayoutDashboard,
    };
    const FINANCE_DASHBOARD_NAV: NavItem = {
      label: "Dashboard",
      href: PATHS.financeDashboard,
      icon: LayoutDashboard,
    };
    const MARKETING_DASHBOARD_NAV: NavItem = {
      label: "Dashboard",
      href: PATHS.marketingDashboard,
      icon: LayoutDashboard,
    };
    ```
  - Replace the `useMemo` navs logic with a `ROLE_NAV_CONFIG` map:
    ```ts
    const ROLE_NAV_CONFIG: Record<string, NavEntry[]> = {
      Admin: [
        NAV_ENTRIES[0],
        USER_MANAGEMENT_NAV,
        SALES_MANAGEMENT_NAV,
        FINANCE_NAV,
        MARKETING_NAV,
        ANALYTICS_NAV,
        MASTER_DATA_NAV,
        ...OTHER_NAVS,
      ],
      Backoffice: [
        BACKOFFICE_DASHBOARD_NAV,
        USER_MANAGEMENT_NAV,
        SALES_MANAGEMENT_NAV,
        MASTER_DATA_NAV,
        ...OTHER_NAVS,
      ],
      Finance: [FINANCE_DASHBOARD_NAV, FINANCE_NAV, ...OTHER_NAVS],
      Marketing: [
        MARKETING_DASHBOARD_NAV,
        MARKETING_NAV,
        ANALYTICS_NAV,
        ...OTHER_NAVS,
      ],
      Sales: [...SALES_NAVS],
    };
    ```
  - Update `useMemo` to use `ROLE_NAV_CONFIG[roleName] ?? NAV_ENTRIES`

### Task 11: Checkpoint — Frontend Config Verification

- [ ] 11.1 Run `npx tsc --noEmit` to verify no type errors
- [ ] 11.2 Verify middleware logic by checking route matching for each role scenario

### Task 12: Frontend — Backoffice Dashboard Service & Page

- [ ] 12.1 Create `src/services/backoffice/backoffice-dashboard/backoffice-dashboard.types.ts`
  - Interface `IBackofficeDashboardData` matching API response (clients, mitra, leads, pending_activity_logs, pending_verifications)

- [ ] 12.2 Create `src/services/backoffice/backoffice-dashboard/backoffice-dashboard.service.ts`
  - `backofficeDashboardService.getDashboard()` → `api.get('/backoffice/backoffice-dashboard')`

- [ ] 12.3 Create `src/services/backoffice/backoffice-dashboard/index.ts`
  - Barrel export types + service

- [ ] 12.4 Create `src/app/(dashboard)/backoffice-dashboard/page.tsx`
  - Use `useDetailData` to fetch dashboard data
  - Stat cards: Total Clients, Total Mitra, Active Leads, Pending Verifications
  - Charts: Client Verification donut (`DonutChart`), Lead Pipeline bar (`BarChartComponent`)
  - Widgets: Recent pending activity logs list, Mitra verification queue list
  - Use `StatCard`, `ChartCard`, `FormCard`/`FormCardLoading`/`FormCardError` components
  - Use `CHART_SETS` for chart colors

### Task 13: Frontend — Finance Dashboard Service & Page

- [ ] 13.1 Create `src/services/backoffice/finance-dashboard/finance-dashboard.types.ts`
  - Interface `IFinanceDashboardData` matching API response (deposits, volume_trend, recent_pending)

- [ ] 13.2 Create `src/services/backoffice/finance-dashboard/finance-dashboard.service.ts`
  - `financeDashboardService.getDashboard()` → `api.get('/backoffice/finance-dashboard')`

- [ ] 13.3 Create `src/services/backoffice/finance-dashboard/index.ts`
  - Barrel export types + service

- [ ] 13.4 Create `src/app/(dashboard)/finance-dashboard/page.tsx`
  - Use `useDetailData` to fetch dashboard data
  - Stat cards: Pending Deposits, Approved Today, Volume This Month, Rejected
  - Charts: Deposit Volume Trend (`BarChartComponent`)
  - Widget: Recent pending deposits quick list
  - Use `StatCard`, `ChartCard`, `FormCard`/`FormCardLoading`/`FormCardError` components

### Task 14: Frontend — Marketing Dashboard Service & Page

- [ ] 14.1 Create `src/services/backoffice/marketing-dashboard/marketing-dashboard.types.ts`
  - Interface `IMarketingDashboardData` matching API response (campaigns, vouchers, articles, funnel_summary, top_referrers)

- [ ] 14.2 Create `src/services/backoffice/marketing-dashboard/marketing-dashboard.service.ts`
  - `marketingDashboardService.getDashboard()` → `api.get('/backoffice/marketing-dashboard')`

- [ ] 14.3 Create `src/services/backoffice/marketing-dashboard/index.ts`
  - Barrel export types + service

- [ ] 14.4 Create `src/app/(dashboard)/marketing-dashboard/page.tsx`
  - Use `useDetailData` to fetch dashboard data
  - Stat cards: Active Campaigns, Vouchers Redeemed, Total Referrals, Published Articles
  - Charts: Funnel Conversion Overview (`BarChartComponent`)
  - Widget: Referral Leaderboard top 5 list
  - Use `StatCard`, `ChartCard`, `FormCard`/`FormCardLoading`/`FormCardError` components

### Task 15: Checkpoint — Frontend Pages Verification

- [ ] 15.1 Run `npx tsc --noEmit` to verify no type errors across all new files
- [ ] 15.2 Run `npm run dev` and verify:
  - `/backoffice-dashboard` renders without errors
  - `/finance-dashboard` renders without errors
  - `/marketing-dashboard` renders without errors
  - Sidebar shows correct nav items per role

### Task 16: Backend — Property-Based Tests

- [ ] 16.1 Write property test untuk role-based route access control
  - **Property 1: Each role can only access its permitted route groups**
  - Create users with each role (Admin, Backoffice, Finance, Marketing, Sales), attempt to access endpoints in each sub-group, verify correct 200/403 responses per role matrix
  - Buat test file di `tests/Feature/Backoffice/RoleBasedAccessTest.php`
  - Gunakan PHPUnit data providers untuk semua role × endpoint combinations
  - **Validates: Requirements 1.2**

- [ ] 16.2 Write property test untuk Admin full access (except Sales)
  - **Property 2: Admin can access all backoffice sub-groups but not Sales API**
  - Create Admin user, hit endpoints in each sub-group (user mgmt, sales mgmt, finance, marketing, analytics, master data), verify all return 200. Hit Sales endpoints, verify 403.
  - **Validates: Requirements 1.2**

- [ ] 16.3 Write property test untuk Finance role isolation
  - **Property 3: Finance role can only access finance and shared endpoints**
  - Create Finance user, hit deposit-requests endpoints → 200. Hit user-management, marketing, analytics, leads endpoints → 403. Hit notifications → 200 (shared).
  - **Validates: Requirements 1.2**

- [ ] 16.4 Write property test untuk Marketing role isolation
  - **Property 4: Marketing role can only access marketing, analytics, and shared endpoints**
  - Create Marketing user, hit banners, vouchers, referral-campaigns, analytics endpoints → 200. Hit user-management, finance, leads endpoints → 403. Hit notifications → 200 (shared).
  - **Validates: Requirements 1.2**

- [ ] 16.5 Write property test untuk dashboard API access control
  - **Property 5: Dashboard endpoints respect role middleware**
  - Admin → can access /dashboard, /backoffice-dashboard, /finance-dashboard, /marketing-dashboard (all 200)
  - Backoffice → can access /backoffice-dashboard (200), cannot access /dashboard, /finance-dashboard, /marketing-dashboard (403)
  - Finance → can access /finance-dashboard (200), cannot access others (403)
  - Marketing → can access /marketing-dashboard (200), cannot access others (403)
  - **Validates: Requirements 1.3**

- [ ] 16.6 Write property test untuk backoffice dashboard data correctness
  - **Property 6: Backoffice dashboard returns correct aggregated counts**
  - Create known set of clients (verified/unverified), mitra (pending/approved), leads (various statuses), activity logs (pending). Call backoffice-dashboard endpoint, verify counts match.
  - **Validates: Requirements 1.3**

- [ ] 16.7 Write property test untuk finance dashboard data correctness
  - **Property 7: Finance dashboard returns correct deposit aggregations**
  - Create deposit requests with various statuses and dates. Call finance-dashboard endpoint, verify pending count, approved_today, rejected_today, volume_this_month match expected values.
  - **Validates: Requirements 1.3**

- [ ] 16.8 Write property test untuk marketing dashboard data correctness
  - **Property 8: Marketing dashboard returns correct campaign/voucher/article aggregations**
  - Create campaigns (active/inactive), vouchers (active/redeemed), articles (published/draft). Call marketing-dashboard endpoint, verify counts match.
  - **Validates: Requirements 1.3**

### Task 17: Frontend — Unit Tests (Service Layer)

- [ ] 17.1 Write unit tests untuk backoffice-dashboard service
  - Buat test file di `src/services/backoffice/backoffice-dashboard/__tests__/backoffice-dashboard.service.test.ts`
  - Test `getDashboard()` calls correct endpoint `/backoffice/backoffice-dashboard`
  - Test response is correctly typed as `IBackofficeDashboardData`
  - Mock `api.get` and verify call signature

- [ ] 17.2 Write unit tests untuk finance-dashboard service
  - Buat test file di `src/services/backoffice/finance-dashboard/__tests__/finance-dashboard.service.test.ts`
  - Test `getDashboard()` calls correct endpoint `/backoffice/finance-dashboard`
  - Test response is correctly typed as `IFinanceDashboardData`
  - Mock `api.get` and verify call signature

- [ ] 17.3 Write unit tests untuk marketing-dashboard service
  - Buat test file di `src/services/backoffice/marketing-dashboard/__tests__/marketing-dashboard.service.test.ts`
  - Test `getDashboard()` calls correct endpoint `/backoffice/marketing-dashboard`
  - Test response is correctly typed as `IMarketingDashboardData`
  - Mock `api.get` and verify call signature

### Task 18: Frontend — Unit Tests (Pages)

- [ ] 18.1 Write unit tests untuk backoffice-dashboard page
  - Buat test file di `src/app/(dashboard)/backoffice-dashboard/__tests__/page.test.tsx`
  - Test renders stat cards with correct labels (Total Clients, Total Mitra, Active Leads, Pending Verifications)
  - Test renders loading state (`FormCardLoading`)
  - Test renders error state (`FormCardError`)
  - Test renders charts (Client Verification donut, Lead Pipeline bar)

- [ ] 18.2 Write unit tests untuk finance-dashboard page
  - Buat test file di `src/app/(dashboard)/finance-dashboard/__tests__/page.test.tsx`
  - Test renders stat cards with correct labels (Pending Deposits, Approved Today, Volume This Month, Rejected)
  - Test renders loading state
  - Test renders error state
  - Test renders Deposit Volume Trend chart

- [ ] 18.3 Write unit tests untuk marketing-dashboard page
  - Buat test file di `src/app/(dashboard)/marketing-dashboard/__tests__/page.test.tsx`
  - Test renders stat cards with correct labels (Active Campaigns, Vouchers Redeemed, Total Referrals, Published Articles)
  - Test renders loading state
  - Test renders error state
  - Test renders Funnel chart and Referral Leaderboard widget

### Task 19: Frontend — Property-Based Tests (Middleware & Config)

- [ ] 19.1 Write property test untuk ROLE_DASHBOARD_MAP completeness
  - **Property 1: Every role in BUSINESSFLOW has a corresponding dashboard entry**
  - Buat test file di `src/config/__tests__/env.properties.test.ts`
  - Gunakan `fast-check` library
  - Generate random role from all BUSINESSFLOW arrays, verify it exists in ROLE_DASHBOARD_MAP
  - Verify all ROLE_DASHBOARD_MAP values are valid path strings starting with "/"
  - **Validates: Requirements 1.3**

- [ ] 19.2 Write property test untuk sidebar nav config completeness
  - **Property 2: Every role in ROLE_NAV_CONFIG produces a non-empty nav array**
  - Buat test file di `src/app/components/layout/Sidebar/__tests__/sidebar.properties.test.ts`
  - For each role key in ROLE_NAV_CONFIG, verify the nav array is non-empty
  - Verify every nav item has a valid `href` that starts with "/"
  - Verify every nav group has at least one item
  - **Validates: Requirements 1.4**

- [ ] 19.3 Write property test untuk middleware role routing correctness
  - **Property 3: Middleware redirects unauthorized access to correct default dashboard**
  - Buat test file di `src/__tests__/middleware.properties.test.ts`
  - For each role, generate random paths outside their allowed set, verify redirect target matches ROLE_DASHBOARD_MAP[role]
  - For each role, generate paths inside their allowed set, verify no redirect
  - **Validates: Requirements 1.5**

### Task 20: Checkpoint — All Tests Pass

- [ ] 20.1 Backend: `docker exec lingkarid.local php artisan test --filter=RoleBasedAccess` — all property tests pass
- [ ] 20.2 Frontend: `npx jest --testPathPattern="(backoffice-dashboard|finance-dashboard|marketing-dashboard|env.properties|sidebar.properties|middleware.properties)"` — all tests pass
- [ ] 20.3 Ensure no regressions: `npx tsc --noEmit`

### Task 21: Update Documentation

- [ ] 16.1 Update `lingkar-crm/docs/PRD.md`
  - Update "Target Users" table to include Finance and Marketing roles
  - Add role-based access section documenting module permissions

- [ ] 16.2 Update `lingkar-crm/docs/ARCHITECTURE.md`
  - Document the role-based middleware routing logic
  - Document `ROLE_DASHBOARD_MAP` and `ROLE_ALLOWED_PATHS` configs
  - Update project structure to include new dashboard pages

- [ ] 16.3 Update `lingkar-crm/README.md`
  - Update Authentication section to mention 5 roles and per-role routing
  - Add Finance Dashboard and Marketing Dashboard to Feature Status table
  - Update Project Structure to include new paths

- [ ] 16.4 Update `lingkar-id-backend/README.md`
  - Add Finance and Marketing to Role model constants
  - Add new dashboard controllers/services to Project Structure
  - Add new API endpoints to the API Modules section
  - Document the split route groups

- [ ] 16.5 Update `lingkar-id-backend/CLAUDE.md`
  - Add BackofficeDashboard, FinanceDashboard, MarketingDashboard to API Modules table
  - Update route group documentation to reflect per-domain middleware

### Task 22: Final Verification

- [ ] 22.1 Backend: `docker exec lingkarid.local php artisan test` — all tests pass
- [ ] 22.2 Frontend: `npx tsc --noEmit` — no type errors
- [ ] 22.3 Frontend: `npm run dev` — dev server starts without errors
- [ ] 22.4 Browser test: login as each role and verify correct dashboard redirect + sidebar
