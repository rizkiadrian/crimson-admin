# Design: API Routes Restructure by Role

**Date:** 2026-05-09
**Status:** Draft
**Scope:** Backend routes + Frontend service endpoints

---

## Overview

Restructure API routes so each role's functional endpoints live under that role's prefix. Currently everything is under `/backoffice/*` — after this, each role owns its domain:

```
/admin/*       → Admin-only endpoints
/backoffice/*  → Backoffice-only endpoints (user mgmt, sales mgmt, master data)
/finance/*     → Finance endpoints (deposits)
/marketing/*   → Marketing endpoints (banners, vouchers, referrals, articles, analytics)
/sales/*       → Sales endpoints (unchanged)
/client/*      → Client endpoints (unchanged)
/mitra/*       → Mitra endpoints (unchanged)
```

---

## Route Migration Map

### Moves to `/admin/*`

| Current                 | New                | Middleware   |
| ----------------------- | ------------------ | ------------ |
| `/backoffice/dashboard` | `/admin/dashboard` | `role:admin` |

### Stays at `/backoffice/*`

| Endpoint                           | Middleware                                |
| ---------------------------------- | ----------------------------------------- |
| `/backoffice/status`               | `role:admin,backoffice,finance,marketing` |
| `/backoffice/backoffice-dashboard` | `role:admin,backoffice`                   |
| `/backoffice/notifications/*`      | `role:backoffice`                         |
| `/backoffice/backoffice-members/*` | `role:admin,backoffice`                   |
| `/backoffice/client-members/*`     | `role:admin,backoffice`                   |
| `/backoffice/mitra-members/*`      | `role:admin,backoffice`                   |
| `/backoffice/sales-members/*`      | `role:admin,backoffice`                   |
| `/backoffice/sales-members-list`   | `role:admin,backoffice`                   |
| `/backoffice/leads/*`              | `role:admin,backoffice`                   |
| `/backoffice/activity-logs/*`      | `role:admin,backoffice`                   |
| `/backoffice/service-categories/*` | `role:admin,backoffice`                   |

### Moves to `/finance/*`

| Current                                    | New                                     | Middleware           |
| ------------------------------------------ | --------------------------------------- | -------------------- |
| `/backoffice/deposit-requests`             | `/finance/deposit-requests`             | `role:admin,finance` |
| `/backoffice/deposit-requests/{id}`        | `/finance/deposit-requests/{id}`        | `role:admin,finance` |
| `/backoffice/deposit-requests/{id}/status` | `/finance/deposit-requests/{id}/status` | `role:admin,finance` |
| `/backoffice/finance-dashboard`            | `/finance/dashboard`                    | `role:admin,finance` |
| (already) `/finance/notifications/*`       | (unchanged)                             | `role:finance`       |

### Moves to `/marketing/*`

| Current                                        | New                                      | Middleware             |
| ---------------------------------------------- | ---------------------------------------- | ---------------------- |
| `/backoffice/banners/*` (7 routes)             | `/marketing/banners/*`                   | `role:admin,marketing` |
| `/backoffice/vouchers/*` (7 routes)            | `/marketing/vouchers/*`                  | `role:admin,marketing` |
| `/backoffice/referral-campaigns/*` (14 routes) | `/marketing/referral-campaigns/*`        | `role:admin,marketing` |
| `/backoffice/referrals/*` (3 routes)           | `/marketing/referrals/*`                 | `role:admin,marketing` |
| `/backoffice/referral-rewards/{id}/retry`      | `/marketing/referral-rewards/{id}/retry` | `role:admin,marketing` |
| `/backoffice/referral-analytics/*` (3 routes)  | `/marketing/referral-analytics/*`        | `role:admin,marketing` |
| `/backoffice/authors/*` (5 routes)             | `/marketing/authors/*`                   | `role:admin,marketing` |
| `/backoffice/article-categories/*` (5 routes)  | `/marketing/article-categories/*`        | `role:admin,marketing` |
| `/backoffice/article-tags/*` (5 routes)        | `/marketing/article-tags/*`              | `role:admin,marketing` |
| `/backoffice/articles/*` (10 routes)           | `/marketing/articles/*`                  | `role:admin,marketing` |
| `/backoffice/analytics/*` (6 routes)           | `/marketing/analytics/*`                 | `role:admin,marketing` |
| `/backoffice/marketing-dashboard`              | `/marketing/dashboard`                   | `role:admin,marketing` |
| (already) `/marketing/notifications/*`         | (unchanged)                              | `role:marketing`       |

### Unchanged

- `/sales/*` — no changes
- `/client/*` — no changes
- `/mitra/*` — no changes
- `/admin/notifications/*` — no changes
- `/auth/*` — no changes

---

## Backend File Structure

```
routes/
├── api.php              # Entry point (public routes + requires)
├── api/
│   ├── helpers.php      # registerNotificationRoutes()
│   ├── auth.php         # /auth/* (authenticated)
│   ├── admin.php        # /admin/* (dashboard, notifications)
│   ├── backoffice.php   # /backoffice/* (status, notifications, dashboard, user mgmt, sales mgmt, master data)
│   ├── finance.php      # /finance/* (dashboard, deposit-requests, notifications)
│   ├── marketing.php    # /marketing/* (dashboard, banners, vouchers, referrals, articles, analytics, notifications)
│   ├── sales.php        # /sales/* (dashboard, activity-logs, notifications)
│   ├── client.php       # /client/* (dashboard, deposits, banners, events, vouchers, notifications)
│   ├── mitra.php        # /mitra/* (events, vouchers, notifications)
│   └── shared.php       # cross-role (activity-log comments)
```

---

## Frontend Changes

### Service endpoint updates

| Service Directory                          | Current Endpoint                                                                            | New Endpoint                                                                             |
| ------------------------------------------ | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `services/backoffice/deposit-requests/`    | `/backoffice/deposit-requests`                                                              | `/finance/deposit-requests`                                                              |
| `services/backoffice/finance-dashboard/`   | `/backoffice/finance-dashboard`                                                             | `/finance/dashboard`                                                                     |
| `services/backoffice/banners/`             | `/backoffice/banners`                                                                       | `/marketing/banners`                                                                     |
| `services/backoffice/vouchers/`            | `/backoffice/vouchers`                                                                      | `/marketing/vouchers`                                                                    |
| `services/backoffice/referral-campaigns/`  | `/backoffice/referral-campaigns`                                                            | `/marketing/referral-campaigns`                                                          |
| `services/backoffice/referrals/`           | `/backoffice/referrals` + `/backoffice/referral-analytics` + `/backoffice/referral-rewards` | `/marketing/referrals` + `/marketing/referral-analytics` + `/marketing/referral-rewards` |
| `services/backoffice/analytics/`           | `/backoffice/analytics`                                                                     | `/marketing/analytics`                                                                   |
| `services/backoffice/articles/`            | `/backoffice/articles`                                                                      | `/marketing/articles`                                                                    |
| `services/backoffice/authors/`             | `/backoffice/authors`                                                                       | `/marketing/authors`                                                                     |
| `services/backoffice/article-categories/`  | `/backoffice/article-categories`                                                            | `/marketing/article-categories`                                                          |
| `services/backoffice/article-tags/`        | `/backoffice/article-tags`                                                                  | `/marketing/article-tags`                                                                |
| `services/backoffice/marketing-dashboard/` | `/backoffice/marketing-dashboard`                                                           | `/marketing/dashboard`                                                                   |
| `services/backoffice/dashboard/`           | `/backoffice/dashboard`                                                                     | `/admin/dashboard`                                                                       |

### Optional: Reorganize service directories

Move service files to match new prefixes:

- `services/backoffice/banners/` → `services/marketing/banners/`
- `services/backoffice/deposit-requests/` → `services/finance/deposit-requests/`
- etc.

Or keep directory structure as-is and only update endpoint strings. **Recommendation:** Move directories to match — keeps it consistent and easy to find.

---

## What Does NOT Change

- `/sales/*` routes and frontend services
- `/client/*` routes and frontend services
- `/mitra/*` routes and frontend services
- All page URLs in the browser (only API endpoints change)
- Mobile app (only uses `/client/*` and `/mitra/*`)
