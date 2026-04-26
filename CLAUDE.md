<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Lingkar Project — Fullstack Reference

This document serves as the master reference for the Lingkar Fullstack project. The system consists of a Laravel 12 Backend API (`lingkar-id-backend`) and a Next.js 16 Backoffice Dashboard (`lingkar-crm`).

## 1. Project Topology

- **Backend API:** `/Users/rizkiadrian/works/personal/lingkar-id-backend`
- **Frontend CRM:** `/Users/rizkiadrian/works/personal/lingkar-crm`

---

## 2. Backend (Laravel 12 API)

### Tech Stack

- **Framework:** Laravel 12 (PHP 8.2+) running on Laravel Octane (via Sail or native).
- **Auth:** Laravel Sanctum (Access Token + Refresh Token flow).
- **Database:** PostgreSQL/MySQL.

### Core Architectural Patterns

1. **Service Layer Pattern:** Controllers must remain extremely thin. All business logic must reside in `app/Services/`. Controllers only validate input via FormRequests, call service methods, and return standardized JSON.
2. **API Response Standardization:** Use the `ApiResponse` support class traits. Responses must return exactly: `{ success: boolean, message: string, data: array|object, meta: { http_status, pagination? } }`.
3. **Database & Migrations:**
   - Core tables use `SoftDeletes`.
   - `UserObserver` handles automatic side effects (e.g., auto-creating wallets on user registration).
4. **Queue & Background Jobs:** All email sending and heavy data synchronizations (like `CreateUserProfile`) must be dispatched as asynchronous queued jobs (`ShouldQueue`).
5. **Commands:** Start with `./vendor/bin/sail up` or `composer dev`.
6. **Authentication:** Uses two tokens. `access_token` (short lived) and `refresh_token` (long lived).

---

## 3. Frontend (Next.js 16 CRM)

### Tech Stack

- **Framework:** Next.js 16 (App Router only).
- **Styling:** Tailwind CSS 4.
- **State Management:** Zustand (Global Notifications, Confirm Dialogs) + Local React state.
- **Data Fetching:** Axios + Custom Hooks (`useTableData`, `useDetailData`).

### Core Architectural Patterns

1. **React 19 Compliance:** No synchronous `setState` inside `useEffect` bodies. `useDetailData` uses `useReducer` + `queueMicrotask` to avoid cascading render warnings. Edit forms use a "Page + Inner Form" split to pass fetched data directly as initial state, avoiding effect-based synchronizations.
2. **URL-Synced State:** Pagination and Search are synchronized with URL Query Params (`?page=2&search=xyz`) via `useTableData`. Edit pages capture a `?returnPage=N` query to navigate the user back to the exact table page they left.
3. **API Service Layer:** No direct `axios.get` or `fetch` calls inside React components. All components call typed wrapper functions inside `src/services/` (e.g. `leadsService.leadsList()`).
4. **UI System:**
   - Build using custom components from `src/app/components/ui`.
   - Forms use `FormCard`, Lists use `TableCard` + `Table`, Details use `DetailCard`.
   - All `select` dropdowns must use `FormSelect`, a custom animated dropdown that emits a synthetic `ChangeEvent<HTMLSelectElement>`.
   - Do NOT use plain `<input>` or `<select>`; always use `FormInput` and `FormSelect`.
5. **Global Modals/Toasts:** Use `useNotificationStore().showNotification` for toasts and `useConfirmStore().showConfirm` for generic confirmation modals. Do not mount custom `<Modal>` components for simple Delete/Action confirmations.

---

## 4. API Contract Integration

**Standard Pagination Request:** `GET /endpoint?page=1&per_page=10&search=keyword`
**Standard Pagination Response:**

```json
{
  "success": true,
  "message": "Successfully retrieved list",
  "data": [ ... items ... ],
  "meta": {
    "http_status": 200,
    "pagination": {
      "total": 50,
      "per_page": 10,
      "current_page": 1,
      "last_page": 5,
      "next_page_url": "...?page=2",
      "prev_page_url": null
    }
  }
}
```

---

## 5. Development Guidelines for AI Agents

1. **Implementation Plans First:** Always provide an implementation plan artifact before writing code for any medium to large feature updates.
2. **Double Check Types:** Both projects are strictly typed (PHPStan for backend, TypeScript for frontend). Do not leave `any` or loose typings.
3. **Docs Update — UI Components:** If an update impacts UI components, you MUST update `docs/DESIGN_SYSTEM.md` and the frontend showcase page at `src/app/design-system/page.tsx`.
4. **Docs Update — Features & APIs:** If a new feature or API is added, you MUST update `README.md` in both backend and frontend, update the Postman collection (`postman/Lingkar_ID_API.postman_collection.json`), and update the Product Requirements in `docs/PRD.md` (frontend).
5. **Docs Update — Architecture:** If there is a change to the folder hierarchy or a new library is introduced to the frontend, you MUST update `docs/ARCHITECTURE.md`.
6. **No Hallucinations on External Libraries:** Stick strictly to Tailwind 4 utility classes for styling. Do NOT use Tailwind CSS v3 arbitrary value syntax if v4 handles it natively (e.g., v4 removes `@apply` complexities in many cases).
