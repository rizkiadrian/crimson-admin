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
| `hideLabel`         | `boolean`                            | `false`          | Hide the label. Useful inside compact layouts                                            |
| `inputSize`         | `"default"` \| `"sm"`                | `"default"`      | Size variant. `"sm"` reduces padding for compact contexts                                |

### FormSelect

Custom dropdown UI fully styled to match `FormInput` — supports click-outside, Escape key closing, smooth entry/exit animations (`.animate-dropdown`), optional left icons, and serves as a drop-in replacement by emitting synthetic `ChangeEvent<HTMLSelectElement>`.

**Standard usage:**

```tsx
import { FormSelect } from "@app/components/ui/FormSelect";
import { Tag } from "lucide-react";

<FormSelect
  id="priority"
  label="Priority"
  value={formData.priority}
  onChange={handleChange}
  options={[
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" },
  ]}
  placeholder="Select priority"
  error={formErrors.priority}
  leftIcon={<Tag size={16} />}
/>;
```

**Searchable (Async API) usage:**

```tsx
import { FormSelect } from "@app/components/ui/FormSelect";

<FormSelect
  id="lead_id"
  label="Lead"
  value={formData.lead_id}
  onChange={handleChange}
  options={apiOptions}
  placeholder="Select a lead"
  onSearch={(query) => fetchLeads(query)}
  isLoading={isFetchingLeads}
  searchPlaceholder="Search by name or ID..."
/>;
```

| Prop                | Type                      | Default       | Description                                      |
| ------------------- | ------------------------- | ------------- | ------------------------------------------------ |
| `label`             | `string`                  | —             | Label text (required)                            |
| `id`                | `string`                  | —             | HTML id (required)                               |
| `value`             | `string`                  | —             | Controlled value                                 |
| `onChange`          | `ChangeEventHandler`      | —             | Synthetic select change handler                  |
| `options`           | `{ label, value }[]`      | —             | Options to render                                |
| `placeholder`       | `string`                  | —             | Renders as default empty state                   |
| `error`             | `string`                  | —             | Error message, triggers error border & message   |
| `leftIcon`          | `ReactNode`               | —             | Optional icon rendered inside the trigger (left) |
| `inputSize`         | `"default"` \| `"sm"`     | `"default"`   | Size variant matching FormInput                  |
| `onSearch`          | `(query: string) => void` | —             | Enables search input box inside dropdown         |
| `isLoading`         | `boolean`                 | `false`       | Shows a spinner inside dropdown when searching   |
| `searchPlaceholder` | `string`                  | `"Search..."` | Placeholder text for the search input            |

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

| Component             | Description                                                                   |
| --------------------- | ----------------------------------------------------------------------------- |
| `TableCard`           | Card wrapper with rounded corners, shadow, and border                         |
| `TableCardHeader`     | Title + action buttons header bar                                             |
| `TableCardContent`    | Declarative table: pass `columns` + `data`, get skeleton/error/empty for free |
| `TableCardPagination` | Conditional pagination, auto-hides when not needed                            |

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

### SearchInput

Debounced search input with clear button, designed for table toolbar use.

```tsx
import { SearchInput } from "@app/components/ui/SearchInput";

<SearchInput
  value={searchQuery}
  onSearch={(q) => setParams({ search: q })}
  placeholder="Search members..."
/>;
```

| Prop          | Type                      | Default       | Description                                  |
| ------------- | ------------------------- | ------------- | -------------------------------------------- |
| `value`       | `string`                  | —             | Current search value (controlled)            |
| `onSearch`    | `(value: string) => void` | —             | Called after debounce or Enter key           |
| `placeholder` | `string`                  | `"Search..."` | Placeholder text                             |
| `debounceMs`  | `number`                  | `400`         | Debounce delay in ms. Set to 0 to disable    |
| `className`   | `string`                  | —             | Additional className for the outer container |

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

### SearchInput

Debounced search input with clear button. Designed for table header integration.

```tsx
import { SearchInput } from "@app/components/ui/SearchInput";

<SearchInput
  value={searchQuery}
  onSearch={handleSearch}
  placeholder="Search members..."
/>;
```

| Prop          | Type                      | Default       | Description                               |
| ------------- | ------------------------- | ------------- | ----------------------------------------- |
| `value`       | `string`                  | —             | Current search value (controlled)         |
| `onSearch`    | `(value: string) => void` | —             | Called after debounce or Enter key        |
| `placeholder` | `string`                  | `"Search..."` | Placeholder text                          |
| `debounceMs`  | `number`                  | `400`         | Debounce delay in ms. Set to 0 to disable |

Features: 400ms debounce, instant on Enter, clear button (X), search icon, URL sync via `useTableData.handleSearch`.

### StatCard

Summary stat card for dashboards. Displays a title, large value, optional description, and an icon.

```tsx
import { StatCard } from "@app/components/ui/StatCard";

<StatCard
  title="Total Clients"
  value={128}
  description="12 verified"
  icon={Users}
  iconVariant="primary"
/>;
```

| Prop          | Type                                                                                  | Default     | Description                 |
| ------------- | ------------------------------------------------------------------------------------- | ----------- | --------------------------- |
| `title`       | `string`                                                                              | —           | Card title label            |
| `value`       | `number \| string`                                                                    | —           | Main numeric value          |
| `description` | `string`                                                                              | —           | Description below the value |
| `icon`        | `LucideIcon`                                                                          | —           | Icon component              |
| `iconVariant` | `"primary"` \| `"success"` \| `"warning"` \| `"error"` \| `"tertiary"` \| `"neutral"` | `"primary"` | Icon background color       |

### Chart System

Reusable chart components built on Recharts with design-system-mapped colors.

```tsx
import {
  ChartCard,
  DonutChart,
  BarChartComponent,
  CHART_COLORS,
  CHART_SETS,
} from "@app/components/ui/Chart";
```

| Component           | Description                                                                           |
| ------------------- | ------------------------------------------------------------------------------------- |
| `ChartCard`         | Card wrapper with title, description, and padding for charts                          |
| `DonutChart`        | Donut/pie chart with configurable inner/outer radius                                  |
| `BarChartComponent` | Vertical bar chart with per-bar colors and rounded tops                               |
| `CHART_COLORS`      | Color constants mapped to design system CSS variables                                 |
| `CHART_SETS`        | Semantic color arrays for common chart types (verification, mitraStatus, categorical) |

**CHART_COLORS** (mapped to globals.css):

| Key        | Hex       | CSS Variable           |
| ---------- | --------- | ---------------------- |
| `primary`  | `#d32f2f` | `--color-primary-500`  |
| `tertiary` | `#00799c` | `--color-tertiary-600` |
| `success`  | `#10b981` | `--color-success-500`  |
| `warning`  | `#f59e0b` | `--color-warning-500`  |
| `error`    | `#d32f2f` | `--color-primary-500`  |
| `neutral`  | `#adb5bd` | `--color-neutral-500`  |

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

### StatCard

Summary stat card for dashboards. Displays a title, large numeric value, optional description, and an icon.

```tsx
import { StatCard } from "@app/components/ui/StatCard";
import { Users } from "lucide-react";

<StatCard title="Total Users" value={1234} icon={Users} iconVariant="primary" />
<StatCard title="Revenue" value="Rp 12.5M" description="+8% from last month" icon={TrendingUp} iconVariant="success" />
```

| Prop          | Type                                                                                  | Default     | Description                   |
| ------------- | ------------------------------------------------------------------------------------- | ----------- | ----------------------------- |
| `title`       | `string`                                                                              | —           | Card title label (required)   |
| `value`       | `number \| string`                                                                    | —           | Main numeric value (required) |
| `description` | `string`                                                                              | —           | Optional text below value     |
| `icon`        | `LucideIcon`                                                                          | —           | Icon component from lucide    |
| `iconVariant` | `"primary"` \| `"success"` \| `"warning"` \| `"error"` \| `"tertiary"` \| `"neutral"` | `"primary"` | Icon background color         |
| `className`   | `string`                                                                              | —           | Additional className          |

### Chart System

Composable chart components built on Recharts with design-system-aligned colors.

```tsx
import {
  ChartCard,
  DonutChart,
  BarChartComponent,
  CHART_COLORS,
  CHART_SETS,
} from "@app/components/ui/Chart";

<ChartCard title="User Verification" description="Verified vs unverified">
  <DonutChart
    data={[
      { name: "Verified", value: 80, color: CHART_COLORS.success },
      { name: "Unverified", value: 20, color: CHART_COLORS.warning },
    ]}
  />
</ChartCard>;
```

| Component           | Description                                                         |
| ------------------- | ------------------------------------------------------------------- |
| `ChartCard`         | Card wrapper with title, optional description, and chart content    |
| `DonutChart`        | Donut/pie chart with legend and tooltip                             |
| `BarChartComponent` | Vertical bar chart with per-bar colors, grid, and tooltip           |
| `CHART_COLORS`      | Color constants mapped to design system CSS variables               |
| `CHART_SETS`        | Semantic color arrays for common chart types (verification, status) |

**ChartCard props:**

| Prop          | Type        | Default | Description                          |
| ------------- | ----------- | ------- | ------------------------------------ |
| `title`       | `string`    | —       | Chart title (required)               |
| `description` | `string`    | —       | Optional description below the title |
| `children`    | `ReactNode` | —       | Chart content (Recharts components)  |
| `className`   | `string`    | —       | Additional className                 |

**DonutChart props:**

| Prop          | Type               | Default | Description                    |
| ------------- | ------------------ | ------- | ------------------------------ |
| `data`        | `DonutChartItem[]` | —       | `{ name, value, color }` items |
| `height`      | `number`           | `260`   | Chart height in px             |
| `innerRadius` | `number`           | `60`    | Inner radius of the donut      |
| `outerRadius` | `number`           | `100`   | Outer radius of the donut      |

**BarChartComponent props:**

| Prop     | Type             | Default | Description                    |
| -------- | ---------------- | ------- | ------------------------------ |
| `data`   | `BarChartItem[]` | —       | `{ name, value, color }` items |
| `height` | `number`         | `260`   | Chart height in px             |

---

## Layout Components (`components/layout/`)

| Component          | Description                                                                  |
| ------------------ | ---------------------------------------------------------------------------- |
| `Sidebar`          | Fixed left sidebar with accordion navigation groups                          |
| `Navbar`           | Top bar with search, navigation tabs, NotificationBell dropdown, and profile |
| `NotificationBell` | Bell icon with unread badge + dropdown panel (Zustand-driven)                |

### NotificationBell

Real-time notification bell component in the Navbar. Shows unread count badge, opens a dropdown with recent notifications, and supports mark-as-read actions.

**Architecture:**

- `useBackofficeNotificationStore` (Zustand) manages unread count, recent notifications, dropdown state
- Polls unread count every 30 seconds via `setInterval`
- Outside-click dismiss uses `mouseup` event (React 19 compliant)
- Dropdown shows latest 5 notifications with type badges, timestamps, read/unread state

```tsx
// Automatically included in Navbar — no manual usage needed.
// The store is available for programmatic access:
import { useBackofficeNotificationStore } from "@store/useBackofficeNotificationStore";

const { unreadCount, fetchUnreadCount, markAllAsRead } =
  useBackofficeNotificationStore();
```

**Store API:**

| Method                | Type                            | Description                             |
| --------------------- | ------------------------------- | --------------------------------------- |
| `unreadCount`         | `number`                        | Current unread notification count       |
| `recentNotifications` | `INotification[]`               | Latest 5 notifications for dropdown     |
| `isDropdownOpen`      | `boolean`                       | Whether dropdown is visible             |
| `fetchUnreadCount`    | `() => Promise<void>`           | Fetch unread count from API             |
| `fetchRecent`         | `() => Promise<void>`           | Fetch recent notifications for dropdown |
| `markAsRead`          | `(id: number) => Promise<void>` | Mark single notification as read        |
| `markAllAsRead`       | `() => Promise<void>`           | Mark all notifications as read          |
| `toggleDropdown`      | `() => void`                    | Toggle dropdown visibility              |
| `closeDropdown`       | `() => void`                    | Close dropdown                          |

**Notification Type Badges:**

| Type                  | Badge Color                         | Description                 |
| --------------------- | ----------------------------------- | --------------------------- |
| `activity_log`        | `bg-tertiary-100 text-tertiary-700` | Sales activity log updates  |
| `lead_assign_request` | `bg-warning-100 text-warning-700`   | Lead assignment requests    |
| `lead_status_request` | `bg-success-100 text-success-700`   | Lead status change requests |

**Full Page:** `/dashboard/notifications` — paginated list using `useTableData` + `TableCard`.

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
| `handleSearch`     | `(query) => void`  | Set search query (resets to page 1)  |
| `searchQuery`      | `string`           | Current search query value           |
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
