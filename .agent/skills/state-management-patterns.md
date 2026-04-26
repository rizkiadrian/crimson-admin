# State Management Patterns

This project uses three layers of state. Use the **most local layer possible**.

## Decision Table

| State Type                        | Solution                          | Example                             |
| --------------------------------- | --------------------------------- | ----------------------------------- |
| Single page/component state       | `useState`                        | form field values, modal open/close |
| Async data fetching (list)        | `useTableData`                    | paginated table data                |
| Async data fetching (single item) | `useDetailData`                   | edit page pre-fill, detail page     |
| Cross-page global UI state        | Zustand (`useXxxStore`)           | toast notifications, confirm dialog |
| Domain-specific global state      | Zustand (`useBackofficeXxxStore`) | notification bell unread count      |

**Rule:** Never reach for Zustand when `useState` is sufficient.

---

## useState — Local Page/Component State

```tsx
// ✅ Correct — form values are local to the page
const [form, setForm] = useState({ name: "", email: "" });

// ✅ Correct — modal visibility is local to the component
const [isOpen, setIsOpen] = useState(false);

// ❌ Wrong — don't put page-local state in Zustand
const { formValues, setFormValues } = useFormStore(); // don't do this
```

---

## useTableData — Paginated List Pages

Handles: URL sync (`?page=N`, `?search=keyword`), loading states, pagination, refetch.

```tsx
import { useTableData } from "@lib/hooks/use-table-data";

const {
  data, // TData[] — current page items
  isInitialLoad, // true on first load (show skeleton)
  isRefetching, // true on subsequent loads (show progress bar overlay)
  error, // string | null
  pagination, // IPagination { total, per_page, current_page, last_page, ... }
  handlePageChange, // (page: number) => void
  handleSearch, // (query: string) => void — resets to page 1
  searchQuery, // current search string
  setParams, // merge arbitrary params + reset to page 1
  refetch, // force re-fetch with current params
  isMounted, // safe to render client-only content after hydration
} = useTableData<IClientUser>({
  fetcher: (params) => clientMembersService.clientMembers(params),
  perPage: 10,
  syncUrl: true, // default true — syncs page/search to URL query params
});
```

**Common pattern — filter params:**

```tsx
// To apply extra filters (e.g. status dropdown), use setParams:
setParams({ status: "active" }); // resets to page 1 automatically
```

---

## useDetailData — Single Resource (Edit/Detail)

Uses `useReducer` + `queueMicrotask` to be React 19 compliant (no synchronous `setState` in effect bodies).

```tsx
import { useDetailData } from "@lib/hooks/use-detail-data";

const { data, isLoading, error, refetch } = useDetailData<IClientUser>({
  fetcher: () => clientMembersService.clientMembersDetail(id),
  enabled: true, // default — set false to defer fetching
});
```

**Edit page "Page + Inner Form" pattern (MANDATORY for React 19 compliance):**

```tsx
// ✅ Correct — outer page fetches, inner form gets data as initial prop
function EditMemberPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const { data, isLoading, error } = useDetailData<IClientUser>({
    fetcher: () => clientMembersService.clientMembersDetail(id),
  });

  if (isLoading) return <FormCard><FormCardLoading /></FormCard>;
  if (error || !data) return <FormCard><FormCardError message={error ?? "Not found"} backHref={PATHS.clientMembers} /></FormCard>;

  return <EditMemberForm initialData={data} />;
}

// Inner form uses useState initialized from props — no async inside
function EditMemberForm({ initialData }: { initialData: IClientUser }) {
  const [form, setForm] = useState({
    name: initialData.name,
    email: initialData.email,
  });
  // ... submit logic
}

// ❌ Wrong — do not fetch AND manage form state in the same component
function EditMemberPage({ params }) {
  const { data } = useDetailData(...);
  const [form, setForm] = useState({ name: data?.name ?? "" }); // ← React 19 violation
}
```

---

## Zustand — Global UI State

Only for state that must be accessed from multiple unrelated components.

```tsx
// Toast notifications — from anywhere
import { useNotificationStore } from "@store/useNotificationStore";
const { showNotification } = useNotificationStore();
showNotification({ type: "success", message: "Saved!" });
showNotification({ type: "error", message: "Something went wrong." });

// Confirm dialog — from anywhere
import { useConfirmStore } from "@store/useConfirmStore";
const { showConfirm } = useConfirmStore();
showConfirm({
  title: "Delete Member",
  message: "This action cannot be undone.",
  onConfirm: () => handleDelete(id),
});
```

**Naming convention:**

```ts
useXxxStore; // Global UI state: useNotificationStore, useConfirmStore, useSidebarStore
useBackofficeXxxStore; // Domain-specific: useBackofficeNotificationStore
```

---

## React 19 Compliance Rules

1. **No synchronous `setState` inside `useEffect` bodies.**
   Use `useReducer` + `queueMicrotask` instead (pattern used in `useDetailData`).

2. **Edit pages must use the "Page + Inner Form" split.**
   The outer page handles loading/error. The inner form receives `initialData` as a prop and uses `useState`.

3. **Two-effect pattern for animations** (e.g., `FilterPopup`):
   - Effect 1: set `mounted = true`
   - Effect 2: set `visible = true` after mounted

> These rules exist because React 19 strict mode throws errors on synchronous state updates during renders caused by effects.
