# Tasks: API Routes Restructure by Role

## Task 1: Capture baseline

- [ ] 1.1 Run `sail artisan route:list` and save route count (172)
- [ ] 1.2 Run `sail artisan test --filter=RoleBasedAccessTest` — save passing count

## Task 2: Backend — Create route files

- [ ] 2.1 Create `routes/api/helpers.php` — `registerNotificationRoutes()` with `function_exists` guard
- [ ] 2.2 Create `routes/api/auth.php` — authenticated auth routes (/auth/me, logout, verify, OTP, update-phone)
- [ ] 2.3 Create `routes/api/admin.php` — `/admin` prefix, `role:admin`
  - GET /admin/dashboard (moved from /backoffice/dashboard)
  - Notifications via helper
- [ ] 2.4 Create `routes/api/backoffice.php` — `/backoffice` prefix
  - SHARED: status (role:admin,backoffice,finance,marketing)
  - Notifications (role:backoffice)
  - Dashboard: /backoffice/backoffice-dashboard (role:admin,backoffice)
  - User Management (role:admin,backoffice): backoffice-members, client-members, mitra-members, sales-members
  - Sales Management (role:admin,backoffice): leads, activity-logs
  - Master Data (role:admin,backoffice): service-categories
- [ ] 2.5 Create `routes/api/finance.php` — `/finance` prefix, `role:admin,finance`
  - GET /finance/dashboard (moved from /backoffice/finance-dashboard)
  - deposit-requests CRUD (moved from /backoffice/deposit-requests)
  - Notifications (role:finance) via helper
- [ ] 2.6 Create `routes/api/marketing.php` — `/marketing` prefix, `role:admin,marketing`
  - GET /marketing/dashboard (moved from /backoffice/marketing-dashboard)
  - banners (7 routes, moved from /backoffice/banners)
  - vouchers (7 routes, moved from /backoffice/vouchers)
  - referral-campaigns (14 routes, moved from /backoffice/referral-campaigns)
  - referrals (3 routes, moved from /backoffice/referrals)
  - referral-rewards (1 route)
  - referral-analytics (3 routes)
  - authors (5 routes)
  - article-categories (5 routes)
  - article-tags (5 routes)
  - articles (10 routes)
  - analytics (6 routes, moved from /backoffice/analytics)
  - Notifications (role:marketing) via helper
- [ ] 2.7 Create `routes/api/sales.php` — `/sales` prefix, `role:sales`
  - dashboard, active-leads, activity-logs, notifications
- [ ] 2.8 Create `routes/api/client.php` — `/client` prefix, `role:client,is.verified`
  - dashboard, config, deposit, banners, events, vouchers, notifications
- [ ] 2.9 Create `routes/api/mitra.php` — `/mitra` prefix, `role:mitra,is.verified`
  - events, vouchers, notifications
- [ ] 2.10 Create `routes/api/shared.php` — activity-log comments
- [ ] 2.11 Rewrite `routes/api.php` as entry point (public routes + requires)

## Task 3: Backend — Verify routes

- [ ] 3.1 Run `php -l` on all route files
- [ ] 3.2 Run `sail artisan route:list` — verify route count matches (172)
- [ ] 3.3 Spot-check key routes exist at new paths:
  - `/finance/deposit-requests`
  - `/marketing/banners`
  - `/marketing/analytics/funnel`
  - `/admin/dashboard`

## Task 4: Backend — Update tests

- [ ] 4.1 Update `RoleBasedAccessTest.php` — change endpoint paths to new prefixes
  - `/backoffice/deposit-requests` → `/finance/deposit-requests`
  - `/backoffice/banners` → `/marketing/banners`
  - `/backoffice/analytics/funnel` → `/marketing/analytics/funnel`
  - `/backoffice/dashboard` → `/admin/dashboard`
  - `/backoffice/finance-dashboard` → `/finance/dashboard`
  - `/backoffice/marketing-dashboard` → `/marketing/dashboard`
- [ ] 4.2 Update `BackofficeDepositRequestTest.php` — `/backoffice/deposit-requests` → `/finance/deposit-requests`
- [ ] 4.3 Update `BackofficeBannerTest.php` — `/backoffice/banners` → `/marketing/banners`
- [ ] 4.4 Update `BackofficeVoucherTest.php` — `/backoffice/vouchers` → `/marketing/vouchers`
- [ ] 4.5 Update `BackofficeReferralCampaignTest.php` — `/backoffice/referral-campaigns` → `/marketing/referral-campaigns`
- [ ] 4.6 Update `BackofficeReferralTest.php` — `/backoffice/referrals` → `/marketing/referrals`
- [ ] 4.7 Update `BackofficeArticleTest.php` — `/backoffice/articles` → `/marketing/articles`, authors, categories, tags
- [ ] 4.8 Update `AnalyticsApiTest.php` — `/backoffice/analytics` → `/marketing/analytics`
- [ ] 4.9 Run `sail artisan test` — all role-related tests pass

## Task 5: Frontend — Update service endpoints

- [ ] 5.1 Update `services/backoffice/deposit-requests/` — `/backoffice/deposit-requests` → `/finance/deposit-requests`
- [ ] 5.2 Update `services/backoffice/finance-dashboard/` — `/backoffice/finance-dashboard` → `/finance/dashboard`
- [ ] 5.3 Update `services/backoffice/banners/` — `/backoffice/banners` → `/marketing/banners`
- [ ] 5.4 Update `services/backoffice/vouchers/` — `/backoffice/vouchers` → `/marketing/vouchers`
- [ ] 5.5 Update `services/backoffice/referral-campaigns/` — `/backoffice/referral-campaigns` → `/marketing/referral-campaigns`
- [ ] 5.6 Update `services/backoffice/referrals/` — `/backoffice/referrals` + `/backoffice/referral-analytics` + `/backoffice/referral-rewards` → `/marketing/*`
- [ ] 5.7 Update `services/backoffice/analytics/` — `/backoffice/analytics` → `/marketing/analytics`
- [ ] 5.8 Update `services/backoffice/articles/` — `/backoffice/articles` → `/marketing/articles`
- [ ] 5.9 Update `services/backoffice/authors/` — `/backoffice/authors` → `/marketing/authors`
- [ ] 5.10 Update `services/backoffice/article-categories/` — `/backoffice/article-categories` → `/marketing/article-categories`
- [ ] 5.11 Update `services/backoffice/article-tags/` — `/backoffice/article-tags` → `/marketing/article-tags`
- [ ] 5.12 Update `services/backoffice/marketing-dashboard/` — `/backoffice/marketing-dashboard` → `/marketing/dashboard`
- [ ] 5.13 Update `services/backoffice/dashboard/` — `/backoffice/dashboard` → `/admin/dashboard`

## Task 6: Frontend — Reorganize service directories (optional but recommended)

- [ ] 6.1 Move `services/backoffice/deposit-requests/` → `services/finance/deposit-requests/`
- [ ] 6.2 Move `services/backoffice/finance-dashboard/` → `services/finance/dashboard/`
- [ ] 6.3 Move `services/backoffice/banners/` → `services/marketing/banners/`
- [ ] 6.4 Move `services/backoffice/vouchers/` → `services/marketing/vouchers/`
- [ ] 6.5 Move `services/backoffice/referral-campaigns/` → `services/marketing/referral-campaigns/`
- [ ] 6.6 Move `services/backoffice/referrals/` → `services/marketing/referrals/`
- [ ] 6.7 Move `services/backoffice/analytics/` → `services/marketing/analytics/`
- [ ] 6.8 Move `services/backoffice/articles/` → `services/marketing/articles/`
- [ ] 6.9 Move `services/backoffice/authors/` → `services/marketing/authors/`
- [ ] 6.10 Move `services/backoffice/article-categories/` → `services/marketing/article-categories/`
- [ ] 6.11 Move `services/backoffice/article-tags/` → `services/marketing/article-tags/`
- [ ] 6.12 Move `services/backoffice/marketing-dashboard/` → `services/marketing/dashboard/`
- [ ] 6.13 Move `services/backoffice/dashboard/` → `services/admin/dashboard/`
- [ ] 6.14 Update all import paths across pages that reference moved services

## Task 7: Frontend — Verify

- [ ] 7.1 Run `npx tsc --noEmit` — no errors
- [ ] 7.2 Run `npm run dev` — no runtime errors

## Task 8: Update documentation

- [ ] 8.1 Update `lingkar-id-backend/CLAUDE.md` — API Modules table with new endpoints
- [ ] 8.2 Update `lingkar-id-backend/README.md` — project structure, route info
- [ ] 8.3 Update `lingkar-crm/docs/ARCHITECTURE.md` — route groups table
- [ ] 8.4 Update `lingkar-crm/README.md` — services directory structure
- [ ] 8.5 Update Postman collection — all moved endpoints
