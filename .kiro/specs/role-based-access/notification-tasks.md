# Tasks: Unified Per-Role Notification Architecture

## Task 1: Backend — New Models & Migrations

- [ ] 1.1 Create migration `create_admin_notifications_table`
  - Schema: id, user_id (FK→users), type (varchar), title (varchar), message (text nullable), link (varchar nullable), reference_type (varchar nullable), reference_id (bigint nullable), read_at (timestamp nullable), timestamps
  - Index on `[user_id, read_at]`

- [ ] 1.2 Create model `AdminNotification` at `app/Models/AdminNotification.php`
  - Same pattern as BackofficeNotification: $fillable, scopeUnread, type constants

- [ ] 1.3 Create migration `create_finance_notifications_table`
  - Same schema as admin_notifications

- [ ] 1.4 Create model `FinanceNotification` at `app/Models/FinanceNotification.php`

- [ ] 1.5 Create migration `create_marketing_notifications_table`
  - Same schema as admin_notifications

- [ ] 1.6 Create model `MarketingNotification` at `app/Models/MarketingNotification.php`

- [ ] 1.7 Create migration `create_mitra_notifications_table`
  - Same schema as admin_notifications

- [ ] 1.8 Create model `MitraNotification` at `app/Models/MitraNotification.php`

- [ ] 1.9 Run migrations: `sail artisan migrate`

## Task 2: Backend — Jobs

- [ ] 2.1 Rename `NotifyBackofficeUsers` → `NotifyAllBackofficeUsers`
  - Update class name, file name
  - Refactor query: only `Role::BACKOFFICE` (remove Admin from whereIn)
  - Model stays `BackofficeNotification`

- [ ] 2.2 Create `NotifyAllAdminUsers` job
  - Broadcast to all users with `Role::ADMIN`
  - Create records in `AdminNotification`
  - Same constructor signature as NotifyAllBackofficeUsers

- [ ] 2.3 Create `NotifyAllFinanceUsers` job
  - Broadcast to all users with `Role::FINANCE`
  - Create records in `FinanceNotification`

- [ ] 2.4 Create `NotifyAllMarketingUsers` job
  - Broadcast to all users with `Role::MARKETING`
  - Create records in `MarketingNotification`

- [ ] 2.5 Create `NotifyMitraUser` job
  - Targeted to 1 mitra user (same pattern as NotifyClientUser)
  - Create record in `MitraNotification`

- [ ] 2.6 Update `ActivityLogService` dispatch
  - Replace `NotifyBackofficeUsers::dispatch(...)` with:
    ```php
    NotifyAllAdminUsers::dispatch(...);
    NotifyAllBackofficeUsers::dispatch(...);
    ```
  - Update import

- [ ] 2.7 Update any other references to old `NotifyBackofficeUsers` class name

## Task 3: Backend — Services

- [ ] 3.1 Create `app/Services/Admin/AdminNotificationService.php`
  - Methods: getMyNotifications(), getUnreadCount(), markAsRead(), markAllAsRead()
  - Queries `AdminNotification` where user_id = Auth::id()

- [ ] 3.2 Create `app/Services/Finance/FinanceNotificationService.php`
  - Same pattern, queries `FinanceNotification`

- [ ] 3.3 Create `app/Services/Marketing/MarketingNotificationService.php`
  - Same pattern, queries `MarketingNotification`

- [ ] 3.4 Create `app/Services/Client/ClientNotificationService.php`
  - Same pattern, queries `ClientNotification`

- [ ] 3.5 Create `app/Services/Mitra/MitraNotificationService.php`
  - Same pattern, queries `MitraNotification`

## Task 4: Backend — Controllers

- [ ] 4.1 Create `app/Http/Controllers/Api/v1/Admin/NotificationController.php`
  - Methods: index, unreadCount, markAsRead, markAllAsRead
  - Injects AdminNotificationService

- [ ] 4.2 Create `app/Http/Controllers/Api/v1/Finance/NotificationController.php`
  - Injects FinanceNotificationService

- [ ] 4.3 Create `app/Http/Controllers/Api/v1/Marketing/NotificationController.php`
  - Injects MarketingNotificationService

- [ ] 4.4 Create `app/Http/Controllers/Api/v1/Client/NotificationController.php`
  - Injects ClientNotificationService

- [ ] 4.5 Create `app/Http/Controllers/Api/v1/Mitra/NotificationController.php`
  - Injects MitraNotificationService

## Task 5: Backend — Routes

- [ ] 5.1 Add admin notification routes
  - `Route::prefix('admin')->middleware(['role:admin'])->group(...)` with notification CRUD

- [ ] 5.2 Update backoffice notification routes
  - Change middleware from shared group to `role:backoffice` only
  - Move out of SHARED group into its own group

- [ ] 5.3 Add finance notification routes
  - `Route::prefix('finance')->middleware(['role:finance'])->group(...)` with notification CRUD

- [ ] 5.4 Add marketing notification routes
  - `Route::prefix('marketing')->middleware(['role:marketing'])->group(...)` with notification CRUD

- [ ] 5.5 Add client notification routes
  - Under existing `/client` prefix, add notification endpoints

- [ ] 5.6 Add mitra notification routes
  - Under existing `/mitra` prefix, add notification endpoints

## Task 6: Backend — Data Migration

- [ ] 6.1 Create seeder `AdminNotificationSeeder`
  - Copy existing `backoffice_notifications` records where user has Admin role → `admin_notifications`
  - Preserve all fields (type, title, message, link, reference_type, reference_id, read_at, timestamps)

- [ ] 6.2 Run seeder: `sail artisan db:seed --class=AdminNotificationSeeder`

## Task 7: Checkpoint — Backend Verification

- [ ] 7.1 Run `php -l` on all new files
- [ ] 7.2 Run `sail artisan migrate` — no errors
- [ ] 7.3 Run `sail artisan route:list` — verify all notification routes registered
- [ ] 7.4 Run `sail artisan test` — no regressions

## Task 8: Frontend — Generic Notification Service

- [ ] 8.1 Create `src/services/notifications/notifications.types.ts`
  - Generic `INotification` interface (id, type, title, message, link, reference_type, reference_id, read_at, created_at)
  - `INotificationParams`, `IUnreadCount`, `IMarkAllReadResult`

- [ ] 8.2 Create `src/services/notifications/notifications.service.ts`
  - Factory function `createNotificationService(baseEndpoint: string)` returning typed service object
  - Methods: list, unreadCount, markAsRead, markAllAsRead

- [ ] 8.3 Create `src/services/notifications/index.ts`

## Task 9: Frontend — Generic Notification Store

- [ ] 9.1 Create `src/store/useNotificationStore.ts`
  - Single Zustand store that accepts a notification service instance
  - Same interface as current stores: unreadCount, recentNotifications, isDropdownOpen, isLoading, fetchUnreadCount, fetchRecent, markAsRead, markAllAsRead, toggleDropdown, closeDropdown
  - Factory pattern: `createNotificationStore(service)`

## Task 10: Frontend — Config Updates

- [ ] 10.1 Update `src/config/env.ts`
  - Remove `BUSINESSFLOW`
  - Add `ROLE_NOTIFICATION_ENDPOINT`:
    ```ts
    export const ROLE_NOTIFICATION_ENDPOINT: Record<string, string> = {
      Admin: "/admin/notifications",
      Backoffice: "/backoffice/notifications",
      Finance: "/finance/notifications",
      Marketing: "/marketing/notifications",
      Sales: "/sales/notifications",
    };
    ```

## Task 11: Frontend — Update NotificationBell

- [ ] 11.1 Refactor `NotificationBell.tsx`
  - Remove imports: `BUSINESSFLOW`, `useBackofficeNotificationStore`, `useSalesNotificationStore`
  - Import: `ROLE_NOTIFICATION_ENDPOINT`, generic store/service
  - Lookup endpoint from `ROLE_NOTIFICATION_ENDPOINT[roleName]`
  - Use generic notification store — no `isSales`/`isBackoffice` checks
  - `viewAllHref` derived from role (e.g., `/dashboard/notifications` for all backoffice-type, `/sales-activities` for sales)

## Task 12: Frontend — Update BackofficeStatus

- [ ] 12.1 Refactor `BackofficeStatus.tsx`
  - Remove `BUSINESSFLOW` import
  - All roles with a notification endpoint call status (or remove role check entirely)

## Task 13: Frontend — Cleanup

- [ ] 13.1 Delete `src/store/useBackofficeNotificationStore.ts`
- [ ] 13.2 Delete `src/store/useSalesNotificationStore.ts`
- [ ] 13.3 Delete `src/services/backoffice/notifications/` directory
- [ ] 13.4 Delete `src/services/sales/notifications/` directory
- [ ] 13.5 Update any imports that referenced deleted files

## Task 14: Checkpoint — Frontend Verification

- [ ] 14.1 Run `npx tsc --noEmit` — no errors
- [ ] 14.2 Run `npm run dev` — no runtime errors
- [ ] 14.3 Browser test: verify notification bell works for each role

## Task 15: Update Documentation

- [ ] 15.1 Update `lingkar-id-backend/CLAUDE.md` — notification patterns section
- [ ] 15.2 Update `lingkar-id-backend/README.md` — new models, services, controllers
- [ ] 15.3 Update `lingkar-crm/docs/ARCHITECTURE.md` — notification architecture
- [ ] 15.4 Update `lingkar-crm/README.md` — project structure
- [ ] 15.5 Update Postman collection — add new notification endpoints per role
