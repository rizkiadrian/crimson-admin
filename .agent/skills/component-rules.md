# Component Usage Rules

This project has a strict component system. **NEVER use native HTML elements** when a design system component exists.

## Forbidden → Required Mapping

| Forbidden          | Use Instead           | Import From                                              |
| ------------------ | --------------------- | -------------------------------------------------------- |
| `<button>`         | `<Button>`            | `@app/components/ui/Button`                              |
| `<input>`          | `<FormInput>`         | `@app/components/ui/FormInput`                           |
| `<select>`         | `<FormSelect>`        | `@app/components/ui/FormSelect`                          |
| `<a>`              | `<Button href="...">` | `@app/components/ui/Button` (renders as Next.js Link)    |
| `<img>`            | `<Image>`             | `next/image` (with `remotePatterns` in `next.config.ts`) |
| `window.alert()`   | `showNotification()`  | `@store/useNotificationStore`                            |
| `window.confirm()` | `showConfirm()`       | `@store/useConfirmStore`                                 |

---

## Button Variants Quick Reference

```tsx
// Standard button
<Button variant="primary">Save</Button>
<Button variant="ghost">Cancel</Button>
<Button variant="outlined">Export</Button>

// Icon button
<Button variant="ghost" size="icon" aria-label="Edit"><Pencil size={16} /></Button>

// Link button (renders as Next.js Link)
<Button variant="primary" href="/create">Create New</Button>

// Loading state
<Button variant="primary" isLoading>Saving...</Button>

// Button as clickable list item (notification rows, dropdown items)
<Button
  variant="ghost"
  className="w-full h-auto justify-start items-start text-left rounded-none border-none hover:border-none hover:bg-neutral-50"
>
  {/* Complex content here */}
</Button>

// Small action button (e.g., "Mark all as read")
<Button
  variant="ghost"
  size="sm"
  className="gap-1.5 text-tertiary-600 hover:text-tertiary-700 border-none hover:border-none hover:bg-tertiary-50"
>
  <CheckCheck size={16} />
  Action text
</Button>
```

---

## FormCard — Create & Edit Pages

Use `FormCard` as the wrapper for all create and edit form pages.

```tsx
import {
  FormCard,
  FormCardHeader,
  FormCardBody,
  FormCardFooter,
  FormCardLoading,
  FormCardError,
} from "@app/components/ui/FormCard";

// Full structure
<FormCard>
  <FormCardHeader
    title="Create Member"
    description="Fill in the details below"
    badge="Authorized only"    // OR use `actions` for custom JSX
  />
  <FormCardBody>
    <FormInput label="Name" name="name" value={form.name} onChange={...} />
    <FormSelect label="Role" name="role" value={form.role} onChange={...} options={...} />
  </FormCardBody>
  <FormCardFooter>
    <Button variant="ghost" href="/list">Cancel</Button>
    <Button variant="primary" isLoading={isSubmitting}>Save</Button>
  </FormCardFooter>
</FormCard>

// Loading state (edit page fetching existing data)
if (isLoading) return <FormCard><FormCardLoading /></FormCard>;

// Error state (fetch failed)
if (error) return <FormCard><FormCardError message={error} backHref="/members" /></FormCard>;
```

---

## TableCard + useTableData — List Pages

Use `TableCard` + `useTableData` for all paginated list pages.

```tsx
import {
  TableCard,
  TableCardContent,
  TableCardPagination,
  TableColumn,
} from "@app/components/ui/Table";
import { useTableData } from "@lib/hooks/use-table-data";
import { clientMembersService } from "@services/backoffice/client-members";
import { IClientUser } from "@services/backoffice/client-members";

// 1. Define columns
const columns: TableColumn<IClientUser>[] = [
  {
    key: "name",
    header: "Name",
    render: (item) => <TableCell>{item.name}</TableCell>,
  },
  {
    key: "actions",
    header: "",
    headerClassName: "w-24",
    render: (item) => (
      <TableCell>
        <Button
          variant="ghost"
          size="icon"
          href={PATHS.clientMembersEdit(item.id)}
        >
          <Pencil size={16} />
        </Button>
      </TableCell>
    ),
  },
];

// 2. Use the hook
const {
  data,
  isInitialLoad,
  isRefetching,
  error,
  pagination,
  handlePageChange,
  handleSearch,
  searchQuery,
} = useTableData<IClientUser>({
  fetcher: (params) => clientMembersService.clientMembers(params),
  perPage: 10,
  syncUrl: true, // syncs ?page=N and ?search=keyword to URL
});

// 3. Render
return (
  <TableCard>
    <TableCardHeader
      title="Client Members"
      badge={`${pagination.total} members`}
      actions={
        <Button variant="primary" href={PATHS.clientMembersCreate}>
          Add Member
        </Button>
      }
    />
    <TableCardContent
      columns={columns}
      data={data}
      keyExtractor={(item) => item.id}
      isLoading={isInitialLoad}
      isRefetching={isRefetching}
      error={error}
    />
    <TableCardPagination
      pagination={pagination}
      isInitialLoad={isInitialLoad}
      error={error}
      onPageChange={handlePageChange}
    />
  </TableCard>
);
```

> **Reference implementation:** `src/services/backoffice/client-members/` + the corresponding page in `src/app/(dashboard)/dashboard/client-members/`

---

## useDetailData — Single Resource (Edit/Detail Page)

Use `useDetailData` when fetching a single item by ID (edit/detail pages).

```tsx
import { useDetailData } from "@lib/hooks/use-detail-data";
import { clientMembersService } from "@services/backoffice/client-members";

// In the OUTER page component (not the form)
const { data, isLoading, error } = useDetailData<IClientUser>({
  fetcher: () => clientMembersService.clientMembersDetail(id),
});

if (isLoading)
  return (
    <FormCard>
      <FormCardLoading />
    </FormCard>
  );
if (error || !data)
  return (
    <FormCard>
      <FormCardError
        message={error ?? "Not found"}
        backHref={PATHS.clientMembers}
      />
    </FormCard>
  );

// Pass data as props to the inner form (React 19 "Page + Inner Form" pattern)
return <EditMemberForm initialData={data} />;
```

---

## Zustand Store Naming

- `useXxxStore` — Global UI state (toasts, confirm dialog, sidebar)
- `useBackofficeXxxStore` — Domain-specific state (notifications bell)
- Page-level state — Use component `useState`, never Zustand

---

## Common Mistakes to Avoid

| ❌ Wrong                                      | ✅ Correct                                                |
| --------------------------------------------- | --------------------------------------------------------- |
| `<button onClick={...}>`                      | `<Button variant="primary" onClick={...}>`                |
| `<a href="/path">`                            | `<Button href="/path">`                                   |
| `<img src={url} />`                           | `<Image src={url} alt="..." width={} height={} />`        |
| `window.alert("Done")`                        | `showNotification({ type: "success", message: "" })`      |
| `window.confirm("Delete?")`                   | `showConfirm({ message: "Delete?", onConfirm: fn })`      |
| `api.get(...)` inside a component             | Call a service function from `src/services/`              |
| Zustand store for local form/page state       | `useState` in the component                               |
| `setState(value)` directly inside `useEffect` | Use `useReducer` + `queueMicrotask` (see `useDetailData`) |
| `<textarea>` directly                         | `<FormInput as="textarea" ...>`                           |
| Bare content without card wrapper             | Wrap in `TableCard`, `FormCard`, or white card container  |

---

## Page Container Rule

**ALL list/content pages MUST use a white card container** for visual consistency. Use the appropriate wrapper:

- **Table pages** → `TableCard` from `@app/components/ui/Table`
- **Form pages** → `FormCard` from `@app/components/ui/FormCard`
- **Non-table list pages** (timeline, etc.) → Use the same card styling as TableCard:

```tsx
<div className="bg-bg-card rounded-4xl shadow-[0_2px_20px_-10px_rgba(0,0,0,0.05)] border border-border-subtle overflow-hidden relative">
  <div className="p-6">{/* Content here */}</div>
</div>
```

> **Reference:** See `/sales-activities/page.tsx` for a non-table page using the card container pattern.
