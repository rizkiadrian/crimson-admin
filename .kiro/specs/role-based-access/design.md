# Design: Role-Based Access Control & Per-Role Dashboards

## Approach

Hybrid — Backend Route Groups + Frontend Config. Backend routes are split into domain-specific sub-groups with per-role middleware enforcement. Frontend uses a config-driven approach for sidebar filtering and middleware routing.

## Architecture

### Backend Route Structure

```
Route::prefix('backoffice')->group(function() {
    // SHARED (admin, backoffice, finance, marketing)
    //   → status, notifications

    // USER MANAGEMENT (admin, backoffice)
    //   → backoffice-members, client-members, mitra-members, sales-members

    // SALES MANAGEMENT (admin, backoffice)
    //   → leads, activity-logs review

    // MASTER DATA (admin, backoffice)
    //   → service-categories

    // FINANCE (admin, finance)
    //   → deposit-requests

    // MARKETING (admin, marketing)
    //   → banners, vouchers, referral-campaigns, referrals, referral-analytics, articles, authors, article-categories, article-tags

    // ANALYTICS (admin, marketing)
    //   → analytics/*

    // DASHBOARDS
    //   → /dashboard (role:admin only)
    //   → /backoffice-dashboard (role:admin,backoffice)
    //   → /finance-dashboard (role:admin,finance)
    //   → /marketing-dashboard (role:admin,marketing)
});

// SALES (role:sales only — fully isolated)
Route::prefix('sales')->middleware(['role:sales'])->group(...)
```

### Frontend Config

```ts
BUSINESSFLOW = {
  backofficeRoles: ["Admin", "Backoffice"],
  financeRoles: ["Finance"],
  marketingRoles: ["Marketing"],
  salesRoles: ["Sales"],
};

ROLE_DASHBOARD_MAP = {
  Admin: "/dashboard",
  Backoffice: "/backoffice-dashboard",
  Finance: "/finance-dashboard",
  Marketing: "/marketing-dashboard",
  Sales: "/sales-dashboard",
};
```

### Routing Matrix

| Role       | Default Dashboard       | Can Also Access                                                       | Blocked From                                                                      |
| ---------- | ----------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Admin      | `/dashboard`            | `/backoffice-dashboard`, `/finance-dashboard`, `/marketing-dashboard` | `/sales-dashboard`                                                                |
| Backoffice | `/backoffice-dashboard` | —                                                                     | `/dashboard`, `/finance-dashboard`, `/marketing-dashboard`, `/sales-dashboard`    |
| Finance    | `/finance-dashboard`    | —                                                                     | `/dashboard`, `/backoffice-dashboard`, `/marketing-dashboard`, `/sales-dashboard` |
| Marketing  | `/marketing-dashboard`  | —                                                                     | `/dashboard`, `/backoffice-dashboard`, `/finance-dashboard`, `/sales-dashboard`   |
| Sales      | `/sales-dashboard`      | —                                                                     | All others                                                                        |

### Dashboard Content

**Backoffice Dashboard** — operational focus:

- Stats: Total Clients, Total Mitra, Active Leads, Pending Verifications
- Charts: Client Verification (donut), Lead Pipeline (bar)
- Widgets: Pending activity logs, Mitra verification queue

**Finance Dashboard** — deposit focus:

- Stats: Pending Deposits, Approved Today, Volume This Month, Rejected
- Charts: Deposit Volume Trend (bar)
- Widget: Recent pending deposits

**Marketing Dashboard** — campaign focus:

- Stats: Active Campaigns, Vouchers Redeemed, Total Referrals, Published Articles
- Charts: Funnel Conversion Overview
- Widget: Referral Leaderboard (top 5)

## Error Handling

- Backend: 403 response via existing CheckRole middleware
- Frontend: Seamless redirect to default dashboard (no error page)
