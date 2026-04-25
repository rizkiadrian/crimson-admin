# Design System — Lingkar CRM

All UI components live in `src/app/components/` and are organized into three layers. A live interactive preview is available at `/design-system`.

---

## UI Components (`components/ui/`)

Reusable, domain-agnostic primitives. Import from `@app/components/ui/<Component>`.

### Button

Polymorphic button that renders as `<button>` or Next.js `<Link>` when `href` is provided.

```tsx
import { Button } from "@app/components/ui/Button";

<Button variant="primary">Save</Button>
<Button variant="ghost" size="icon"><Icon /></Button>
<Button variant="primary" href="/create">Create</Button>
<Button isLoading>Submitting...</Button>
```

| Prop        | Type                                                                                                                                  | Default     | Description                         |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ----------------------------------- |
| `variant`   | `"primary"` \| `"secondary"` \| `"inverted"` \| `"outlined"` \| `"ghost"` \| `"iconPrimary"` \| `"iconSecondary"` \| `"iconTertiary"` | `"primary"` | Visual style                        |
| `size`      | `"default"` \| `"sm"` \| `"lg"` \| `"icon"`                                                                                           | `"default"` | Size preset                         |
| `href`      | `string`                                                                                                                              | —           | Renders as `<Link>` when set        |
| `isLoading` | `boolean`                                                                                                                             | `false`     | Shows spinner, disables interaction |

### Text

Typography component with semantic variant presets.

```tsx
import { Text } from "@app/components/ui/Text";

<Text variant="headline" as="h1">Dashboard</Text>
<Text variant="body">Description paragraph.</Text>
<Text variant="label">FIELD LABEL</Text>
```

| Prop      | Type                                  | Default  | Description        |
| --------- | ------------------------------------- | -------- | ------------------ |
| `variant` | `"headline"` \| `"body"` \| `"label"` | `"body"` | Typography preset  |
| `as`      | `React.ElementType`                   | `"p"`    | HTML tag to render |

### FormInput

Form input with label, icons, password toggle, phone number formatting, calendar date picker, and error state.

```tsx
import { FormInput } from "@app/components/ui/FormInput";

<FormInput label="Email" id="email" type="email" />
<FormInput label="Password" id="password" type="password" />
<FormInput label="Phone" id="phone" format="phone" />
<FormInput label="Date of Birth" id="dob" format="date" />
<FormInput label="Name" id="name" error="Required field" />
```

| Prop                | Type                                 | Default          | Description                                                                              |
| ------------------- | ------------------------------------ | ---------------- | ---------------------------------------------------------------------------------------- |
| `label`             | `string`                             | —                | Input label (required)                                                                   |
| `id`                | `string`                             | —                | HTML id (required)                                                                       |
| `leftIcon`          | `ReactNode`                          | —                | Icon inside input (left). Overridden by calendar icon when `format="date"`               |
| `rightIcon`         | `ReactNode`                          | —                | Icon inside input (right)                                                                |
| `format`            | `"phone"` \| `"date"` \| `"default"` | `"default"`      | `phone`: auto-formats as `+62 XXX-XXXX-XXXX`. `date`: calendar popover, emits ISO string |
| `error`             | `string`                             | —                | Error message, triggers error styling                                                    |
| `dateDisplayFormat` | `string`                             | `"MMM dd, yyyy"` | Display format for date values (date-fns tokens)                                         |
| `hideLabel`         | `boolean`                            | `false`          | Hide the label. Useful inside compact layouts                                            |
| `inputSize`         | `"default"` \| `"sm"`                | `"default"`      | Size variant. `"sm"` reduces padding for compact contexts                                |

### Table System

A composable table system split into low-level primitives and high-level card components.

**Low-level primitives:**

| Component         | Description                                                                                                |
| ----------------- | ---------------------------------------------------------------------------------------------------------- |
| `Table`           | Wrapper `<table>` with `isRefetching` progress bar                                                         |
| `TableHead`       | `<thead>` wrapper                                                                                          |
| `TableBody`       | `<tbody>` with built-in `loading` skeleton and `error` state                                               |
| `TableRow`        | `<tr>` with hover styling                                                                                  |
| `TableHeaderCell` | `<th>` with uppercase label styling                                                                        |
| `TableCell`       | `<td>` with consistent padding                                                                             |
| `Badge`           | Status badge with dot indicator. Variants: `primary`, `tertiary`, `success`, `warning`, `error`, `neutral` |
| `TablePagination` | Page navigation with "Showing X of Y" text                                                                 |

**High-level card components:**

| Component             | Description                                                             |
| --------------------- | ----------------------------------------------------------------------- |
| `TableCard`           | Card wrapper with rounded corners, shadow, and border                   |
| `TableCardHeader`     | Title + action buttons header bar                                       |
| `TableCardContent`    | Declarative table: pass `columns` + `data`, get skeleton/error for free |
| `TableCardPagination` | Conditional pagination, auto-hides when not needed                      |

### FormCard System

A composable card system for form/create/edit pages.

| Component         | Description                                      |
| ----------------- | ------------------------------------------------ |
| `FormCard`        | Card wrapper matching TableCard visual treatment |
| `FormCardHeader`  | Title + description + optional badge or actions  |
| `FormCardBody`    | Padded content area with vertical spacing        |
| `FormCardFooter`  | Right-aligned action bar with top border         |
| `FormCardLoading` | Centered spinner for loading state               |
| `FormCardError`   | Error message with optional back button          |

**FormCardHeader props:**

| Prop          | Type        | Default | Description                                 |
| ------------- | ----------- | ------- | ------------------------------------------- |
| `title`       | `string`    | —       | Main heading (required)                     |
| `description` | `string`    | —       | Subtitle below the title                    |
| `badge`       | `string`    | —       | Badge label on the right                    |
| `actions`     | `ReactNode` | —       | Custom right-side content (overrides badge) |

**FormCardError props:**

| Prop        | Type     | Default                 | Description                               |
| ----------- | -------- | ----------------------- | ----------------------------------------- |
| `message`   | `string` | —                       | Error message                             |
| `title`     | `string` | `"Failed to load data"` | Title above the message                   |
| `backHref`  | `string` | —                       | URL for back button (hidden when not set) |
| `backLabel` | `string` | `"Go Back"`             | Back button label                         |

### FilterPopup System

Composable modal popup for table filters.

| Component           | Description                                                  |
| ------------------- | ------------------------------------------------------------ |
| `FilterPopup`       | Modal overlay with header, body, footer (Apply/Reset)        |
| `FilterSection`     | Labeled section with optional right-side content             |
| `FilterChipGroup`   | Selectable chip/pill buttons (single or multi-select)        |
| `FilterRangeSlider` | Dual-thumb range slider for numeric filtering                |
| `FilterDateRange`   | Two side-by-side date inputs using FormInput `format="date"` |

### TableHeader

Standalone header bar with title, optional badge, and action slot.

### GlobalNotification

Toast notification anchored to top-center. Driven by `useNotificationStore`.

```tsx
const { showNotification } = useNotificationStore();
showNotification("Saved", "success"); // "success" | "error" | "info"
```

### ConfirmDialog

Global confirmation dialog. Driven by `useConfirmStore`.

```tsx
const { showConfirm } = useConfirmStore();
showConfirm({
  title: "Delete?",
  description: "This cannot be undone.",
  onConfirm: async () => {
    await service.delete(id);
  },
});
```

| Option         | Type                          | Default   | Description                         |
| -------------- | ----------------------------- | --------- | ----------------------------------- |
| `title`        | `string`                      | —         | Dialog title                        |
| `description`  | `string`                      | —         | Description text                    |
| `confirmLabel` | `string`                      | `"Hapus"` | Confirm button label                |
| `cancelLabel`  | `string`                      | `"Batal"` | Cancel button label                 |
| `onConfirm`    | `() => void \| Promise<void>` | —         | Async callback with loading spinner |

### DetailCard System

A composable card system for detail/show pages with clear visual separation between sections.

```tsx
import {
  DetailCard,
  DetailCardHeader,
  DetailCardBody,
  DetailSection,
  DetailField,
  DetailFieldGrid,
  DetailImageGrid,
} from "@app/components/ui/DetailCard";
```

| Component          | Description                                               |
| ------------------ | --------------------------------------------------------- |
| `DetailCard`       | Card wrapper matching FormCard/TableCard visual treatment |
| `DetailCardHeader` | Title + description + colored badge + action slot         |
| `DetailCardBody`   | Body with `divide-y` borders between child sections       |
| `DetailSection`    | Labeled section with horizontal line separator            |
| `DetailFieldGrid`  | Grid container for DetailField items (2/3/4 columns)      |
| `DetailField`      | Label-value pair with subtle background card and border   |
| `DetailImageGrid`  | Grid of labeled images with click-to-open and placeholder |

**DetailCardHeader props:**

| Prop           | Type                                                   | Default     | Description                     |
| -------------- | ------------------------------------------------------ | ----------- | ------------------------------- |
| `title`        | `string`                                               | —           | Main heading                    |
| `description`  | `string`                                               | —           | Subtitle below the title        |
| `badge`        | `string`                                               | —           | Colored badge next to the title |
| `badgeVariant` | `"neutral"` \| `"success"` \| `"warning"` \| `"error"` | `"neutral"` | Badge color                     |
| `actions`      | `ReactNode`                                            | —           | Action buttons on the right     |

**DetailField props:**

| Prop    | Type        | Default | Description                       |
| ------- | ----------- | ------- | --------------------------------- |
| `label` | `string`    | —       | Uppercase label text              |
| `value` | `ReactNode` | —       | Value content (text, badge, etc.) |

**DetailImageGrid props:**

| Prop      | Type                | Default | Description               |
| --------- | ------------------- | ------- | ------------------------- |
| `images`  | `DetailImageItem[]` | —       | Array of `{ label, src }` |
| `columns` | `2 \| 3 \| 4`       | `2`     | Grid columns              |

---

## Layout Components (`components/layout/`)

| Component | Description                                              |
| --------- | -------------------------------------------------------- |
| `Sidebar` | Fixed left sidebar with accordion navigation groups      |
| `Navbar`  | Top bar with search, navigation tabs, notification icons |

---

## Hooks (`lib/hooks/`)

### useTableData

Paginated list fetching with URL sync, loading states, and pagination management.

| Option          | Type                                    | Description                                |
| --------------- | --------------------------------------- | ------------------------------------------ |
| `fetcher`       | `(params) => Promise<IApiListResponse>` | Service function                           |
| `initialParams` | `Partial<TParams>`                      | Extra params beyond page/per_page          |
| `perPage`       | `number`                                | Items per page (default: 10)               |
| `syncUrl`       | `boolean`                               | Sync page to `?page=N` URL (default: true) |

| Return             | Type               | Description                          |
| ------------------ | ------------------ | ------------------------------------ |
| `data`             | `TData[]`          | Fetched items                        |
| `isInitialLoad`    | `boolean`          | First load (skeleton)                |
| `isRefetching`     | `boolean`          | Loading with existing data (overlay) |
| `error`            | `string \| null`   | Error message                        |
| `pagination`       | `IPagination`      | Pagination metadata                  |
| `handlePageChange` | `(page) => void`   | Navigate to page                     |
| `setParams`        | `(params) => void` | Update filters (resets to page 1)    |
| `refetch`          | `() => void`       | Re-fetch current params              |
| `isMounted`        | `boolean`          | Hydration-safe flag                  |

### useDetailData

Single resource fetching for edit/detail pages.

| Option    | Type                             | Description                    |
| --------- | -------------------------------- | ------------------------------ |
| `fetcher` | `() => Promise<IApiResponse<T>>` | Service function               |
| `enabled` | `boolean`                        | Fetch on mount (default: true) |

| Return      | Type             | Description      |
| ----------- | ---------------- | ---------------- |
| `data`      | `TData \| null`  | Fetched item     |
| `isLoading` | `boolean`        | Loading state    |
| `error`     | `string \| null` | Error message    |
| `refetch`   | `() => void`     | Re-trigger fetch |

---

## Code Templates

### New Table Page

See [ARCHITECTURE.md](./ARCHITECTURE.md) → Data Flow → Table Page for the full pattern.

### New Form Page (Create)

```tsx
<FormCard>
  <FormCardHeader title="Create X" description="..." badge="..." />
  <form onSubmit={handleSubmit}>
    <FormCardBody>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <FormInput id="name" label="Name" ... />
      </div>
    </FormCardBody>
    <FormCardFooter>
      <Button variant="ghost" href="/list">Cancel</Button>
      <Button type="submit" variant="primary" isLoading={submitting}>Save</Button>
    </FormCardFooter>
  </form>
</FormCard>
```

### New Edit Page

Split into page component (loading/error) + inner form (state from props):

```tsx
// Page: handles loading/error
const { data, isLoading, error } = useDetailData({ fetcher });
if (isLoading)
  return (
    <FormCard>
      <FormCardLoading />
    </FormCard>
  );
if (error)
  return (
    <FormCard>
      <FormCardError message={error} backHref={backUrl} />
    </FormCard>
  );
return <EditForm data={data} backUrl={backUrl} />;

// Inner form: initializes state directly from props (React 19 compliant)
function EditForm({ data, backUrl }) {
  const [formData, setFormData] = useState(() => transform(data));
  // ... submit, redirect to backUrl
}
```
