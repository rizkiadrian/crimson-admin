# Design: Unified Per-Role Notification Architecture

**Date:** 2026-05-09
**Status:** Draft
**Depends on:** Role-Based Access Control (must be implemented first)

---

## Overview

Refactor the notification system so every role has its own notification model, API endpoint, and broadcast job. Frontend removes all role-checking logic (`BUSINESSFLOW`, `isSales`, `isBackoffice`) and uses a single generic notification mechanism configured by role.

---

## Current State

| Role       | Model                           | API Endpoint                         | Job                            |
| ---------- | ------------------------------- | ------------------------------------ | ------------------------------ |
| Admin      | BackofficeNotification (shared) | `/backoffice/notifications` (shared) | NotifyBackofficeUsers (shared) |
| Backoffice | BackofficeNotification (shared) | `/backoffice/notifications` (shared) | NotifyBackofficeUsers (shared) |
| Finance    | ❌                              | ❌                                   | ❌                             |
| Marketing  | ❌                              | ❌                                   | ❌                             |
| Sales      | SalesNotification               | `/sales/notifications`               | NotifySalesUser                |
| Client     | ClientNotification              | ❌ (no API)                          | NotifyClientUser               |
| Mitra      | ❌                              | ❌                                   | ❌                             |

---

## Target State

| Role       | Model                  | API Endpoint                | Job                      |
| ---------- | ---------------------- | --------------------------- | ------------------------ |
| Admin      | AdminNotification      | `/admin/notifications`      | NotifyAllAdminUsers      |
| Backoffice | BackofficeNotification | `/backoffice/notifications` | NotifyAllBackofficeUsers |
| Finance    | FinanceNotification    | `/finance/notifications`    | NotifyAllFinanceUsers    |
| Marketing  | MarketingNotification  | `/marketing/notifications`  | NotifyAllMarketingUsers  |
| Sales      | SalesNotification      | `/sales/notifications`      | NotifySalesUser          |
| Client     | ClientNotification     | `/client/notifications`     | NotifyClientUser         |
| Mitra      | MitraNotification      | `/mitra/notifications`      | NotifyMitraUser          |

---

## Backend Changes

### Models & Migrations

New models (same schema as BackofficeNotification):

- `AdminNotification` + `create_admin_notifications_table`
- `FinanceNotification` + `create_finance_notifications_table`
- `MarketingNotification` + `create_marketing_notifications_table`
- `MitraNotification` + `create_mitra_notifications_table`

Schema (all tables identical):

```
id, user_id (FK→users), type (string), title (string), message (text nullable),
link (string nullable), reference_type (string nullable), reference_id (int nullable),
read_at (timestamp nullable), created_at, updated_at
```

### Jobs

| Job                                                            | Action                           | Model                  |
| -------------------------------------------------------------- | -------------------------------- | ---------------------- |
| `NotifyAllAdminUsers` (NEW)                                    | Broadcast to all Admin users     | AdminNotification      |
| `NotifyAllBackofficeUsers` (RENAME from NotifyBackofficeUsers) | Broadcast to Backoffice only     | BackofficeNotification |
| `NotifyAllFinanceUsers` (NEW)                                  | Broadcast to all Finance users   | FinanceNotification    |
| `NotifyAllMarketingUsers` (NEW)                                | Broadcast to all Marketing users | MarketingNotification  |
| `NotifyMitraUser` (NEW)                                        | Targeted to 1 mitra user         | MitraNotification      |
| `NotifySalesUser` (existing, no change)                        | Targeted to 1 sales user         | SalesNotification      |
| `NotifyClientUser` (existing, no change)                       | Targeted to 1 client user        | ClientNotification     |

### Services (NEW)

All follow the same pattern (list paginated, unreadCount, markAsRead, markAllAsRead):

- `Admin/AdminNotificationService` → queries `AdminNotification`
- `Finance/FinanceNotificationService` → queries `FinanceNotification`
- `Marketing/MarketingNotificationService` → queries `MarketingNotification`
- `Client/ClientNotificationService` → queries `ClientNotification`
- `Mitra/MitraNotificationService` → queries `MitraNotification`

Existing (no change):

- `Backoffice/NotificationService` → queries `BackofficeNotification`
- `Sales/SalesNotificationService` → queries `SalesNotification`

### Controllers (NEW)

All follow the same pattern (index, unreadCount, markAsRead, markAllAsRead):

- `Admin/NotificationController`
- `Finance/NotificationController`
- `Marketing/NotificationController`
- `Client/NotificationController`
- `Mitra/NotificationController`

### Routes

```
// Admin notifications
Route::prefix('admin')->middleware(['role:admin'])->group(function() {
    Route::get('notifications', ...);
    Route::get('notifications/unread-count', ...);
    Route::patch('notifications/{notification}/read', ...);
    Route::patch('notifications/read-all', ...);
});

// Backoffice notifications (existing, middleware narrowed)
Route::prefix('backoffice')->middleware(['role:backoffice'])->group(function() {
    // notifications endpoints (existing)
});

// Finance notifications
Route::prefix('finance')->middleware(['role:finance'])->group(function() {
    Route::get('notifications', ...);
    ...
});

// Marketing notifications
Route::prefix('marketing')->middleware(['role:marketing'])->group(function() {
    Route::get('notifications', ...);
    ...
});

// Client notifications (under existing client prefix)
Route::prefix('client')->middleware(['role:client', 'is.verified'])->group(function() {
    Route::get('notifications', ...);
    ...
});

// Mitra notifications (under existing mitra prefix)
Route::prefix('mitra')->middleware(['role:mitra', 'is.verified'])->group(function() {
    Route::get('notifications', ...);
    ...
});
```

### Existing Flow Update

`ActivityLogService` currently dispatches `NotifyBackofficeUsers`. Change to:

```php
NotifyAllAdminUsers::dispatch(...);
NotifyAllBackofficeUsers::dispatch(...);
```

### Data Migration

Seeder to copy existing `backoffice_notifications` records where user has Admin role → `admin_notifications` table. This ensures Admin users don't lose their existing notifications.

---

## Frontend Changes

### Remove

- `BUSINESSFLOW` constant from `env.ts`
- `useBackofficeNotificationStore` (store)
- `useSalesNotificationStore` (store)
- `services/backoffice/notifications/` (service)
- `services/sales/notifications/` (service)

### Add

**`src/config/env.ts`:**

```ts
export const ROLE_NOTIFICATION_ENDPOINT: Record<string, string> = {
  Admin: "/admin/notifications",
  Backoffice: "/backoffice/notifications",
  Finance: "/finance/notifications",
  Marketing: "/marketing/notifications",
  Sales: "/sales/notifications",
};
```

**`src/services/notifications/` (generic):**

```ts
// notifications.service.ts — takes endpoint prefix as parameter
export function createNotificationService(baseEndpoint: string) {
  return {
    list: (params) => api.get(baseEndpoint, { params }),
    unreadCount: () => api.get(`${baseEndpoint}/unread-count`),
    markAsRead: (id) => api.patch(`${baseEndpoint}/${id}/read`),
    markAllAsRead: () => api.patch(`${baseEndpoint}/read-all`),
  };
}
```

**`src/store/useNotificationStore.ts` (generic):**
Single store that accepts a service instance. Initialized based on role.

### Update

**`NotificationBell.tsx`:**

```tsx
const endpoint = roleName ? ROLE_NOTIFICATION_ENDPOINT[roleName] : null;
// Use generic store/service with this endpoint
// No isSales, no isBackoffice
```

**`BackofficeStatus.tsx`:**

- Remove role check entirely — all roles call status, or remove the component if not needed for non-backoffice roles

---

## What Does NOT Change

- SalesNotification model and table
- ClientNotification model and table
- BackofficeNotification model and table
- NotifySalesUser job
- NotifyClientUser job
- Sales notification controller and routes (just endpoint stays same)
- Notification full page (`/dashboard/notifications`)
