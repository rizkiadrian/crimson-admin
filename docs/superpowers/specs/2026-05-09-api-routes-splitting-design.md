# Design: API Routes File Splitting

**Date:** 2026-05-09
**Status:** Draft
**Scope:** Backend only (no frontend changes)

---

## Overview

Refactor `routes/api.php` (250+ lines, 45 imports) into domain-specific route files. Zero URL changes — purely internal organization.

---

## Structure

```
routes/
├── api.php              # Entry point — loads sub-files, public routes (test, auth/login, auth/register, mitra/register, auth/refresh)
├── api/
│   ├── auth.php         # Authenticated auth routes (me, logout, verify, OTP, update-phone)
│   ├── admin.php        # Admin notifications, admin dashboard
│   ├── backoffice.php   # Status, notifications, dashboards, user mgmt, sales mgmt, master data
│   ├── finance.php      # Finance notifications, deposit requests, finance dashboard
│   ├── marketing.php    # Banners, vouchers, referrals, articles, analytics, notifications, marketing dashboard
│   ├── sales.php        # Sales dashboard, activity logs, notifications
│   ├── client.php       # Client dashboard, deposits, banners, events, vouchers, notifications
│   ├── mitra.php        # Mitra events, vouchers, notifications
│   └── shared.php       # Activity log comments (cross-role)
```

---

## Helper: Notification Routes

DRY the repeated notification pattern (used 7 times):

```php
// routes/api/helpers.php
function registerNotificationRoutes(string $controller): void
{
    Route::prefix('notifications')->group(function () use ($controller) {
        Route::get('/', [$controller, 'index']);
        Route::get('/unread-count', [$controller, 'unreadCount']);
        Route::patch('/{notification}/read', [$controller, 'markAsRead']);
        Route::patch('/read-all', [$controller, 'markAllAsRead']);
    });
}
```

---

## api.php (Entry Point)

```php
Route::prefix('v1')->group(function () {
    // Public routes
    Route::get('/test', ...);
    Route::post('/auth/login', ...)->middleware(['login.throttle']);
    Route::post('/auth/register', ...);
    Route::post('/mitra/register', ...);
    Route::post('/auth/refresh-token', ...);

    // Authenticated routes
    Route::middleware('auth:sanctum')->group(function () {
        require __DIR__.'/api/auth.php';
        require __DIR__.'/api/admin.php';
        require __DIR__.'/api/backoffice.php';
        require __DIR__.'/api/finance.php';
        require __DIR__.'/api/marketing.php';
        require __DIR__.'/api/sales.php';
        require __DIR__.'/api/client.php';
        require __DIR__.'/api/mitra.php';
        require __DIR__.'/api/shared.php';
    });
});
```

---

## File Responsibilities

| File             | Prefix        | Middleware                | Contents                                                                               |
| ---------------- | ------------- | ------------------------- | -------------------------------------------------------------------------------------- |
| `auth.php`       | `/auth`       | —                         | me, logout, verify, OTP, update-phone                                                  |
| `admin.php`      | `/admin`      | `role:admin`              | notifications, dashboard                                                               |
| `backoffice.php` | `/backoffice` | varies per sub-group      | status, notifications, dashboards, user mgmt, sales mgmt, master data                  |
| `finance.php`    | `/finance`    | `role:finance`            | notifications; deposit routes under `/backoffice` prefix with `role:admin,finance`     |
| `marketing.php`  | `/marketing`  | `role:marketing`          | notifications; marketing routes under `/backoffice` prefix with `role:admin,marketing` |
| `sales.php`      | `/sales`      | `role:sales`              | dashboard, active-leads, activity-logs, notifications                                  |
| `client.php`     | `/client`     | `role:client,is.verified` | dashboard, config, deposits, banners, events, vouchers, notifications                  |
| `mitra.php`      | `/mitra`      | `role:mitra,is.verified`  | events, vouchers, notifications                                                        |
| `shared.php`     | —             | —                         | activity-log comments                                                                  |

**Note on backoffice sub-groups:** The finance and marketing _functional_ routes (deposit-requests, banners, vouchers, etc.) live under the `/backoffice` prefix. Two options:

- **Option A:** Keep them in `backoffice.php` (current structure, just split from the monolith)
- **Option B:** Move them to `finance.php` / `marketing.php` respectively (each file owns all routes for that role)

**Recommendation: Option A** — keep `/backoffice/*` routes in `backoffice.php`. The file is organized by sub-groups with clear comments. Finance/marketing files only contain their own-prefix routes (notifications). This matches the URL structure.

---

## Verification

- `sail artisan route:list` output must be identical before and after
- All existing tests must pass unchanged
- No frontend changes needed

---

## What Does NOT Change

- All API URLs remain identical
- All middleware assignments remain identical
- Controller files unchanged
- Frontend unchanged
