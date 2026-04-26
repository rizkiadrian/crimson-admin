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

## Zustand Store Naming

- `useXxxStore` — Global UI state (toasts, confirm dialog, sidebar)
- `useBackofficeXxxStore` — Domain-specific state (notifications bell)
- Page-level state — Use component `useState`, never Zustand
