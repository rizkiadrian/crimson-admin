# Error Handling Patterns

This project has two distinct error categories: **form validation errors** (field-level, from backend 422) and **general errors** (toast notifications, fetch failures). Use the right tool for each.

---

## Form Validation Errors — `handleFormError`

`handleFormError` from `@lib/utils` extracts backend validation errors (Laravel 422 format) and maps them to per-field state in your form.

**When to use:** In the `catch` block of a create/edit form submit handler.

```tsx
import { handleFormError } from "@lib/utils";

// State setup
const [formErrors, setFormErrors] = useState<Record<string, string>>({});

// In submit handler
const handleSubmit = async (e: React.FormEvent) => {
  try {
    e.preventDefault();
    setSubmitting(true);
    const resp = await clientMembersService.clientMembersCreate(formData);
    showNotification(resp.message, "success");
    router.push(PATHS.clientMembers);
  } catch (err: unknown) {
    handleFormError(err, setFormErrors); // ← maps backend errors to field state
  } finally {
    setSubmitting(false);
  }
};

// Pass error to the input for per-field display
<FormInput
  id="email"
  label="Email Address"
  value={formData.email}
  onChange={handleChange}
  error={formErrors.email} // ← shows error below the field
/>;
```

**What it does internally:**

1. Resets `formErrors` to `{}`
2. If the backend returned 422 with `errors: { email: ["Invalid format"] }`, extracts the first string per field
3. Calls `setFormErrors({ email: "Invalid format" })`
4. If backend returned a top-level `message` with no field errors, logs the message (optionally add a toast here)

> **Reference implementation:** `src/app/(dashboard)/dashboard/client-members/create/page.tsx`

---

## General / Toast Errors — `showNotification`

For non-field errors (delete failures, network errors, success confirmations), use toast notifications.

```tsx
import { useNotificationStore } from "@store/useNotificationStore";

const showNotification = useNotificationStore(
  (state) => state.showNotification
);

// Success
showNotification(resp.message, "success");

// Error
showNotification("Failed to delete member", "error");

// Info
showNotification("No changes were made", "info");
```

**When to use:**

- After a successful create/update/delete operation
- When a non-form error occurs (e.g., delete API fails)
- For user feedback on any non-inline action

---

## Fetch Errors — `useTableData` / `useDetailData`

Fetch errors from hooks are returned as `error: string | null`. Display them using built-in component states:

```tsx
// List pages — TableCardContent handles error display automatically
<TableCardContent
  columns={columns}
  data={data}
  error={error}          // ← shows error state inside the table
  isLoading={isInitialLoad}
  ...
/>

// Detail/Edit pages — FormCardError for full-card error state
if (error) return (
  <FormCard>
    <FormCardError message={error} backHref={PATHS.clientMembers} />
  </FormCard>
);
```

---

## Delete Flow — `showConfirm` + `showNotification`

```tsx
import { useConfirmStore } from "@store/useConfirmStore";
import { useNotificationStore } from "@store/useNotificationStore";

const { showConfirm } = useConfirmStore();
const { showNotification } = useNotificationStore();

const handleDelete = (id: number) => {
  showConfirm({
    title: "Delete Member",
    message:
      "This action cannot be undone. The member will be permanently removed.",
    onConfirm: async () => {
      try {
        const resp = await clientMembersService.clientMembersDelete(id);
        showNotification(resp.message, "success");
        refetch();
      } catch {
        showNotification("Failed to delete member. Please try again.", "error");
      }
    },
  });
};
```

---

## Error Pattern Summary

| Scenario                        | Tool                               | Import From                   |
| ------------------------------- | ---------------------------------- | ----------------------------- |
| Form submit (422 field errors)  | `handleFormError(err, setErrors)`  | `@lib/utils`                  |
| Success / action feedback       | `showNotification(msg, "success")` | `@store/useNotificationStore` |
| Non-form runtime error          | `showNotification(msg, "error")`   | `@store/useNotificationStore` |
| Destructive action confirmation | `showConfirm({ ... })`             | `@store/useConfirmStore`      |
| List fetch error                | Pass `error` to `TableCardContent` | built-in component state      |
| Detail/edit fetch error         | Render `<FormCardError />`         | `@app/components/ui/FormCard` |

---

## Common Mistakes to Avoid

| ❌ Wrong                                        | ✅ Correct                                    |
| ----------------------------------------------- | --------------------------------------------- |
| `alert(err.message)`                            | `showNotification(err.message, "error")`      |
| `console.error(err)` only, no user feedback     | Always show a toast for user-facing failures  |
| Showing a generic toast for 422 field errors    | Use `handleFormError` to map errors to fields |
| Calling `handleFormError` outside a catch block | Only call in `catch (err: unknown)` blocks    |
| Mounting a custom modal for delete confirmation | Use `showConfirm()` from `useConfirmStore`    |
