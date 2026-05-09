# Role-Based Access Control & Per-Role Dashboards

**Date:** 2026-05-09
**Status:** Approved
**Approach:** Hybrid — Backend Route Groups + Frontend Config

---

## Overview

Expand the Lingkar CRM role system from 3 backoffice-type roles (Admin, Backoffice, Sales) to 5 by adding Finance and Marketing. Each role gets a dedicated dashboard URL, filtered sidebar navigation, and backend API protection at the route-group level.

---

## Roles & Module Mapping

| Role       | Modules                                                       | Dashboard URL           |
| ---------- | ------------------------------------------------------------- | ----------------------- |
| Admin      | All (full access)                                             | `/dashboard`            |
| Backoffice | User Management, Sales Management, Master Data                | `/backoffice-dashboard` |
| Finance    | Finance (Deposit Requests)                                    | `/finance-dashboard`    |
| Marketing  | Marketing (Banners, Vouchers, Referrals, Articles), Analytics | `/marketing-dashboard`  |
| Sales      | Sales Dashboard, Activity Reports                             | `/sales-dashboard`      |

---

## Backend Changes (lingkar-id-backend)

### 1. Role Model & Seeder

Add constants to `app/Models/Role.php`:

```php
public const FINANCE = 'Finance';
public const MARKETING = 'Marketing';
```

Update `database/seeders/RoleSeeder.php` to insert Finance and Marketing roles.

### 2. Route Groups (api.php)

Split the current single `backoffice` group into domain-specific sub-groups:

```
Route::prefix('backoffice')->group(function() {

    // SHARED — admin, backoffice, finance, marketing
    // Endpoints: status, notifications
    Route::middleware(['role:admin,backoffice,finance,marketing'])->group(...)

    // USER MANAGEMENT — admin, backoffice
    // Endpoints: backoffice-members, client-members, mitra-members, sales-members
    Route::middleware(['role:admin,backoffice'])->group(...)

    // SALES MANAGEMENT — admin, backoffice
    // Endpoints: leads, activity-logs review
    Route::middleware(['role:admin,backoffice'])->group(...)

    // MASTER DATA — admin, backoffice
    // Endpoints: service-categories
    Route::middleware(['role:admin,backoffice'])->group(...)

    // FINANCE — admin, finance
    // Endpoints: deposit-requests
    Route::middleware(['role:admin,finance'])->group(...)

    // MARKETING — admin, marketing
    // Endpoints: banners, vouchers, referral-campaigns, referrals,
    //            referral-analytics, articles, authors, article-categories, article-tags
    Route::middleware(['role:admin,marketing'])->group(...)

    // ANALYTICS — admin, marketing
    // Endpoints: analytics/funnel, analytics/segments, analytics/events
    Route::middleware(['role:admin,marketing'])->group(...)

    // DASHBOARDS — each role's dashboard endpoint
    // Note: existing GET /backoffice/dashboard (DashboardController) remains as Admin's dashboard.
    // New endpoints are added for other roles.
    Route::middleware(['role:admin'])->group(function() {
        Route::get('/dashboard', [DashboardController::class, 'index']);           // Admin only (existing)
    });
    Route::middleware(['role:admin,backoffice'])->group(function() {
        Route::get('/backoffice-dashboard', [BackofficeDashboardController::class, 'index']);
    });
    Route::middleware(['role:admin,finance'])->group(function() {
        Route::get('/finance-dashboard', [FinanceDashboardController::class, 'index']);
    });
    Route::middleware(['role:admin,marketing'])->group(function() {
        Route::get('/marketing-dashboard', [MarketingDashboardController::class, 'index']);
    });
});

// SALES — sales only (fully isolated, admin cannot access)
Route::prefix('sales')->middleware(['role:sales'])->group(...)
```

### 3. New Dashboard API Endpoints

**`GET /backoffice/backoffice-dashboard`** — BackofficeDashboardController

Response:

```json
{
  "clients": { "total": 1234, "verified": 1100, "unverified": 134 },
  "mitra": { "total": 456, "pending_verification": 7 },
  "leads": {
    "total": 89,
    "by_status": {
      "new": 20,
      "contacted": 30,
      "qualified": 25,
      "won": 10,
      "lost": 4
    }
  },
  "pending_activity_logs": [
    {
      "id": 1,
      "type": "request_lead_assign",
      "sales_name": "...",
      "created_at": "..."
    }
  ],
  "pending_verifications": [
    { "id": 1, "name": "...", "type": "mitra", "created_at": "..." }
  ]
}
```

**`GET /backoffice/finance-dashboard`** — FinanceDashboardController

Response:

```json
{
  "deposits": {
    "pending": 12,
    "approved_today": 8,
    "rejected_today": 3,
    "volume_this_month": 5200000
  },
  "volume_trend": [ { "date": "2026-05-01", "amount": 1200000 }, ... ],
  "recent_pending": [ { "id": "uuid", "user_name": "...", "amount": 500000, "created_at": "..." } ]
}
```

**`GET /backoffice/marketing-dashboard`** — MarketingDashboardController

Response:

```json
{
  "campaigns": { "active": 5, "total_referrals": 89 },
  "vouchers": { "active": 12, "redeemed_this_month": 234 },
  "articles": { "published": 42, "draft": 8 },
  "funnel_summary": { "registered": 500, "verified": 350, "first_order": 120 },
  "top_referrers": [ { "name": "...", "referral_count": 15 }, ... ]
}
```

### 4. New Services

- `app/Services/Backoffice/BackofficeDashboardService.php` — aggregates user, lead, verification stats
- `app/Services/Backoffice/FinanceDashboardService.php` — aggregates deposit stats and trends
- `app/Services/Backoffice/MarketingDashboardService.php` — aggregates campaign, voucher, article, funnel stats

---

## Frontend Changes (lingkar-crm)

### 1. Config (`src/config/env.ts`)

```ts
export const BUSINESSFLOW = {
  backofficeRoles: ["Admin", "Backoffice"],
  financeRoles: ["Finance"],
  marketingRoles: ["Marketing"],
  salesRoles: ["Sales"],
};

export const ROLE_DASHBOARD_MAP: Record<string, string> = {
  Admin: "/dashboard",
  Backoffice: "/backoffice-dashboard",
  Finance: "/finance-dashboard",
  Marketing: "/marketing-dashboard",
  Sales: "/sales-dashboard",
};
```

### 2. Routing (`src/config/routing.ts`)

Add new paths:

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

### 3. Middleware (`src/middleware.ts`)

Replace binary routing logic with role-aware routing:

- Map each role to its default dashboard via `ROLE_DASHBOARD_MAP`
- Admin can access: `/dashboard`, `/backoffice-dashboard`, `/finance-dashboard`, `/marketing-dashboard`
- Admin CANNOT access: `/sales-dashboard`
- All other roles can ONLY access their own dashboard and module pages
- If a role accesses a page outside their allowed paths → redirect to their default dashboard

Allowed page paths per role:

| Role       | Allowed Paths (besides own dashboard)                                                                                                                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Admin      | All `/dashboard/*` pages                                                                                                                                                                                                                                            |
| Backoffice | `/dashboard/backoffice-members`, `/dashboard/client-members`, `/dashboard/mitra-members`, `/dashboard/sales-members`, `/dashboard/leads`, `/dashboard/activity-logs`, `/dashboard/service-categories`, `/dashboard/notifications`                                   |
| Finance    | `/dashboard/deposit-requests`, `/dashboard/notifications`                                                                                                                                                                                                           |
| Marketing  | `/dashboard/banners`, `/dashboard/vouchers`, `/dashboard/referral-campaigns`, `/dashboard/referrals`, `/dashboard/articles`, `/dashboard/authors`, `/dashboard/article-categories`, `/dashboard/article-tags`, `/dashboard/analytics/*`, `/dashboard/notifications` |
| Sales      | `/sales-activities`                                                                                                                                                                                                                                                 |

### 4. Sidebar (`src/app/components/layout/Sidebar/Sidebar.tsx`)

Replace the current binary `useMemo` logic with a role-to-nav-groups config:

```ts
const ROLE_NAV_CONFIG: Record<string, NavEntry[]> = {
  Admin: [
    Dashboard,
    USER_MANAGEMENT_NAV,
    SALES_MANAGEMENT_NAV,
    FINANCE_NAV,
    MARKETING_NAV,
    ANALYTICS_NAV,
    MASTER_DATA_NAV,
    ...OTHER_NAVS,
  ],
  Backoffice: [
    BackofficeDashboard,
    USER_MANAGEMENT_NAV,
    SALES_MANAGEMENT_NAV,
    MASTER_DATA_NAV,
    ...OTHER_NAVS,
  ],
  Finance: [FinanceDashboard, FINANCE_NAV, ...OTHER_NAVS],
  Marketing: [MarketingDashboard, MARKETING_NAV, ANALYTICS_NAV, ...OTHER_NAVS],
  Sales: [...SALES_NAVS],
};
```

### 5. New Pages

**`/backoffice-dashboard/page.tsx`**

- Stat cards: Total Clients, Total Mitra, Active Leads, Pending Verifications
- Charts: Client Verification (donut), Lead Pipeline (bar)
- Widgets: Recent pending activity logs, Mitra verification queue

**`/finance-dashboard/page.tsx`**

- Stat cards: Pending Deposits, Approved Today, Volume This Month, Rejected
- Charts: Deposit Volume Trend (bar)
- Widget: Recent pending deposits (quick list)

**`/marketing-dashboard/page.tsx`**

- Stat cards: Active Campaigns, Vouchers Redeemed, Total Referrals, Published Articles
- Charts: Funnel Conversion Overview
- Widget: Referral Leaderboard (top 5)

### 6. New Services

- `src/services/backoffice/backoffice-dashboard/` — types + service for backoffice dashboard API
- `src/services/backoffice/finance-dashboard/` — types + service for finance dashboard API
- `src/services/backoffice/marketing-dashboard/` — types + service for marketing dashboard API

---

## Routing Matrix

| Role       | Default Dashboard       | Can Also Access                                                       | Blocked From                                                                      |
| ---------- | ----------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Admin      | `/dashboard`            | `/backoffice-dashboard`, `/finance-dashboard`, `/marketing-dashboard` | `/sales-dashboard`                                                                |
| Backoffice | `/backoffice-dashboard` | —                                                                     | `/dashboard`, `/finance-dashboard`, `/marketing-dashboard`, `/sales-dashboard`    |
| Finance    | `/finance-dashboard`    | —                                                                     | `/dashboard`, `/backoffice-dashboard`, `/marketing-dashboard`, `/sales-dashboard` |
| Marketing  | `/marketing-dashboard`  | —                                                                     | `/dashboard`, `/backoffice-dashboard`, `/finance-dashboard`, `/sales-dashboard`   |
| Sales      | `/sales-dashboard`      | —                                                                     | All others                                                                        |

---

## What Does NOT Change

- Admin dashboard (`/dashboard`) — existing, as-is
- Sales dashboard (`/sales-dashboard`) — existing, as-is
- All existing feature pages — only access restrictions change
- Sales API routes — remain `role:sales` only, fully isolated
- Client/Mitra API routes — unchanged

---

## Error Handling

- Backend returns `403` with message "This feature is disabled for this role" when a role accesses a restricted endpoint (existing `CheckRole` middleware behavior)
- Frontend middleware redirects unauthorized page access to the user's default dashboard (no error page, seamless redirect)
