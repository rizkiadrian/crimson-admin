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

| Prop                | Type                                 | Default          | Description                                                                                                |
| ------------------- | ------------------------------------ | ---------------- | ---------------------------------------------------------------------------------------------------------- |
| `label`             | `string`                             | —                | Input label (required)                                                                                     |
| `id`                | `string`                             | —                | HTML id (required)                                                                                         |
| `leftIcon`          | `ReactNode`                          | —                | Icon inside input (left). Overridden by calendar icon when `format="date"`                                 |
| `rightIcon`         | `ReactNode`                          | —                | Icon inside input (right)                                                                                  |
| `format`            | `"phone"` \| `"date"` \| `"default"` | `"default"`      | `phone`: auto-formats as `+62 XXX-XXXX-XXXX`. `date`: calendar popover, emits ISO string                   |
| `error`             | `string`                             | —                | Error message, triggers error styling                                                                      |
| `dateDisplayFormat` | `string`                             | `"MMM dd, yyyy"` | Display format for date values (date-fns tokens)                                                           |
| `hideLabel`         | `boolean`                            | `false`          | Hide the label. Useful inside compact layouts                                                              |
| `hideLabel`         | `boolean`                            | `false`          | Hide the label. Useful inside compact layouts                                                              |
| `inputSize`         | `"default"` \| `"sm"`                | `"default"`      | Size variant. `"sm"` reduces padding for compact contexts                                                  |
| `readOnly`          | `boolean`                            | `false`          | Makes the input read-only. Pair with `className="bg-neutral-100 cursor-not-allowed"` for visual indication |

**Read-only pattern:**

Use `readOnly` with muted styling for auto-populated fields that the user should not edit (e.g., system-generated IDs):

```tsx
<FormInput
  id="sales_id"
  name="sales_id"
  label="Sales Member ID"
  value={profile?.sales_id ?? ""}
  placeholder={!profile?.sales_id ? "Sales ID tidak tersedia" : undefined}
  onChange={handleChange}
  readOnly
  className="bg-neutral-100 cursor-not-allowed"
/>
```

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

### CommentThread

Self-contained comment thread component for activity log detail pages. Handles fetching, displaying, and creating comments with access control, role badges, and auto-scroll.

```tsx
import { CommentThread } from "@app/components/ui/CommentThread";

<CommentThread activityLogId={42} currentUserId={1} hasAccess={true} />;
```

| Prop            | Type      | Default | Description                                     |
| --------------- | --------- | ------- | ----------------------------------------------- |
| `activityLogId` | `number`  | —       | Activity log ID to fetch/create comments for    |
| `currentUserId` | `number`  | —       | Current user ID (highlights own comments)       |
| `hasAccess`     | `boolean` | —       | If false, renders nothing (access control gate) |

**Features:**

- Uses `useReducer` + `queueMicrotask` for React 19 compliance
- Auto-scrolls to bottom when new comments arrive
- Skeleton loading state (2 placeholder items)
- Empty state: "Belum ada komentar."
- Each comment shows: avatar initial, user name, role badge (admin=primary, backoffice=tertiary, other=neutral), body, relative timestamp (Indonesian locale via date-fns)
- Textarea input with Send button (disabled when empty or submitting)
- Error display for fetch and submit failures

### BannerEditor System

A composable banner editor system for creating text-placement banners with a Canva-style drag-and-drop interface. Moved from page-level `_partials` to `components/ui/BannerEditor/` for reusability.

```tsx
import {
  CanvasEditor,
  TextPropertiesPanel,
  CtaPropertiesPanel,
  BackgroundSelector,
  TemplateSelector,
  BannerPreviewModal,
} from "@app/components/ui/BannerEditor";
import type { CanvasEditorHandle } from "@app/components/ui/BannerEditor";
```

| Component             | Description                                                                                                                   |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `CanvasEditor`        | DOM-based editor with 2:1 aspect ratio, drag-and-drop text + CTA, double-click inline edit, `captureImage()` via `forwardRef` |
| `TextPropertiesPanel` | Properties panel for selected text element (content, font size, font color, font weight, delete)                              |
| `CtaPropertiesPanel`  | CTA button editor (toggle enable/disable, text, colors, border radius, font size, padding)                                    |
| `BackgroundSelector`  | Background preset selector (8 solid + 8 gradient presets, custom color input, gradient direction)                             |
| `TemplateSelector`    | Template selector (4 mobile-matching templates with thumbnail previews, applies text + CTA + background)                      |
| `BannerPreviewModal`  | Preview modal (~375px mobile viewport, renders both image and text_placement banners with CTA)                                |

**CanvasEditor props:**

| Prop                   | Type                                 | Default | Description                                    |
| ---------------------- | ------------------------------------ | ------- | ---------------------------------------------- |
| `textElements`         | `ITextElement[]`                     | —       | Array of positioned text elements              |
| `backgroundConfig`     | `IBackgroundConfig`                  | —       | Background (solid or gradient)                 |
| `onTextElementsChange` | `(elements: ITextElement[]) => void` | —       | Callback when text elements change (drag/edit) |
| `selectedElementId`    | `string \| null`                     | —       | Currently selected text element ID             |
| `onSelectElement`      | `(id: string \| null) => void`       | —       | Callback when selection changes                |
| `ctaConfig`            | `ICtaConfig \| null`                 | —       | Optional CTA button config                     |
| `onCtaConfigChange`    | `(config: ICtaConfig) => void`       | —       | Callback when CTA is dragged                   |

**CanvasEditorHandle (via ref):**

| Method         | Return                | Description                                                     |
| -------------- | --------------------- | --------------------------------------------------------------- |
| `captureImage` | `Promise<Blob\|null>` | Renders the editor to a 1080×540 PNG Blob via hidden `<canvas>` |

**Key design decisions:**

- Uses DOM elements (not `<canvas>`) for the editor — enables native text editing, pointer events, and no clipping issues
- `ResizeObserver` tracks container width; all font sizes scale proportionally from a 1080px reference width
- `captureImage()` renders to a hidden `<canvas>` at export resolution (1080×540) for reliable server upload
- Pointer capture for drag ensures smooth movement even when cursor leaves the element
- Double-click enters inline edit mode with `contentEditable`; Enter commits, Escape cancels

**Data types (from `banners.types.ts`):**

| Type                | Key Fields                                                                                    |
| ------------------- | --------------------------------------------------------------------------------------------- |
| `ITextElement`      | `id`, `content`, `position_x/y` (0-100%), `font_size` (12-72), `font_color`, `font_weight`    |
| `IBackgroundConfig` | `type` (solid/gradient), `colors[]`, `direction?` (to-right/to-bottom/to-bottom-right)        |
| `ICtaConfig`        | `text`, `position_x/y`, `bg_color`, `text_color`, `border_radius`, `font_size`, `padding_x/y` |

**Template presets (4 built-in):**

| Template        | Background               | Description                        |
| --------------- | ------------------------ | ---------------------------------- |
| Cashback 20%    | Primary gradient (red)   | Matches mobile Cashback promo card |
| Gratis Transfer | Tertiary gradient (blue) | Matches mobile Transfer promo card |
| Referral Bonus  | Dark gradient (charcoal) | Matches mobile Referral promo card |
| Promo Spesial   | Purple gradient          | Generic centered promo layout      |

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

### useInfiniteScroll

Infinite scroll data fetching with append-based pagination, IntersectionObserver, and URL search sync. Uses `useReducer` + `queueMicrotask` for React 19 compliance.

```tsx
import { useInfiniteScroll } from "@lib/hooks/use-infinite-scroll";

const {
  data,
  isInitialLoad,
  isFetchingMore,
  hasMore,
  sentinelRef,
  handleSearch,
  searchQuery,
} = useInfiniteScroll<IActivityLog, IActivityLogParams>({
  fetcher: activityLogsService.getActivityLogs,
  perPage: 10,
});
```

| Option          | Type                                    | Default | Description                         |
| --------------- | --------------------------------------- | ------- | ----------------------------------- |
| `fetcher`       | `(params) => Promise<IApiListResponse>` | —       | Service function                    |
| `initialParams` | `Partial<TParams>`                      | —       | Extra params beyond page/per_page   |
| `perPage`       | `number`                                | `10`    | Items per page                      |
| `syncUrl`       | `boolean`                               | `true`  | Sync search param to URL `?search=` |

| Return           | Type                                | Description                                        |
| ---------------- | ----------------------------------- | -------------------------------------------------- |
| `data`           | `TData[]`                           | Accumulated data from all loaded pages             |
| `isInitialLoad`  | `boolean`                           | First load (skeleton)                              |
| `isFetchingMore` | `boolean`                           | Loading next page (bottom spinner)                 |
| `error`          | `string \| null`                    | Initial fetch error                                |
| `loadMoreError`  | `string \| null`                    | Load-more error                                    |
| `hasMore`        | `boolean`                           | More pages available                               |
| `loadMore`       | `() => void`                        | Trigger next page (called by IntersectionObserver) |
| `retryLoadMore`  | `() => void`                        | Retry after load-more error                        |
| `handleSearch`   | `(query: string) => void`           | Set search, reset data + page, sync URL            |
| `searchQuery`    | `string`                            | Current search query                               |
| `sentinelRef`    | `RefObject<HTMLDivElement \| null>` | Attach to scroll sentinel element                  |
| `isMounted`      | `boolean`                           | Hydration-safe flag                                |

---

## Domain Components

### ActivityCard

Single activity item card for the sales activities timeline. Displays a type icon, title, status badge, optional lead name, truncated description, and relative timestamp.

> **Moved to UI layer.** ActivityCard, ActivityCardSkeleton, and helper functions (`formatRelativeTime`, `getActivityTypeConfig`, `getStatusBadgeConfig`) now live in `components/ui/ActivityCard/` as reusable UI components.

```tsx
import { ActivityCard } from "@app/components/ui/ActivityCard";

<ActivityCard activity={activityLog} />;
```

| Prop       | Type           | Description              |
| ---------- | -------------- | ------------------------ |
| `activity` | `IActivityLog` | Activity log data object |

**Visual structure:** Type icon (circle) → Title → Status Badge + Lead Name → Description (truncated) → Attachment preview (thumbnail or file icon badge) → Relative time

**Attachment preview variants:**

| Condition                                               | Rendering                                                                                                                                                     |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `attachment_type === 'image'` + `thumbnail_url` present | Clickable `<Image>` thumbnail (max 120px width, rounded-lg), opens full-size in new tab. Skeleton placeholder while loading, falls back to file icon on error |
| `attachment_type === 'file'` + `attachment_url` present | File icon badge with extension label (PDF/DOC/XLS/FILE), clickable link to download                                                                           |
| No attachment (`attachment_type === null`)              | Nothing rendered                                                                                                                                              |

**Type Icon mapping:**

| Activity Type                | Icon        | Background       | Icon Color          |
| ---------------------------- | ----------- | ---------------- | ------------------- |
| `general_note`               | `FileText`  | `bg-tertiary-50` | `text-tertiary-600` |
| `request_lead_assign`        | `UserPlus`  | `bg-primary-50`  | `text-primary-600`  |
| `request_update_lead_status` | `RefreshCw` | `bg-warning-50`  | `text-warning-600`  |

**Status Badge mapping:**

| Status     | Badge Variant | Label    |
| ---------- | ------------- | -------- |
| `pending`  | `warning`     | Pending  |
| `approved` | `success`     | Approved |
| `rejected` | `error`       | Rejected |

### ActivityCardSkeleton

Skeleton placeholder that mimics the shape of ActivityCard. Uses Tailwind `animate-pulse` with `bg-neutral-200` backgrounds.

```tsx
import { ActivityCardSkeleton } from "@app/components/ui/ActivityCard";

<ActivityCardSkeleton />;
```

### ActivityTimeline

Container component that renders a vertical list of ActivityCard items.

```tsx
import { ActivityTimeline } from "@app/(dashboard)/sales-activities/_partials/activity-timeline";

<ActivityTimeline items={activityLogs} />;
```

| Prop    | Type             | Description                   |
| ------- | ---------------- | ----------------------------- |
| `items` | `IActivityLog[]` | Array of activity log objects |

### Helper Functions (`components/ui/ActivityCard/utils.ts`)

| Function                | Signature                                          | Description                                               |
| ----------------------- | -------------------------------------------------- | --------------------------------------------------------- |
| `formatRelativeTime`    | `(isoString: string) => string`                    | Converts ISO timestamp to Indonesian relative time string |
| `getActivityTypeConfig` | `(type: ActivityLogType) => ActivityTypeConfig`    | Returns icon, label, bgColor, iconColor for activity type |
| `getStatusBadgeConfig`  | `(status: ActivityLogStatus) => StatusBadgeConfig` | Returns label and Badge variant for activity status       |

```tsx
import {
  formatRelativeTime,
  getActivityTypeConfig,
  getStatusBadgeConfig,
} from "@app/components/ui/ActivityCard";
```

### File Icon Mapping (`components/ui/ActivityCard/activity-card-file-icons.ts`)

Utility function that maps file extensions to icon configs for the attachment file icon badge.

```tsx
import { getFileIconConfig } from "@app/components/ui/ActivityCard/activity-card-file-icons";

const config = getFileIconConfig("https://example.com/report.pdf");
// → { icon: FileText, label: "PDF", bgColor: "bg-red-50", iconColor: "text-red-600" }
```

| Extension        | Icon              | Label | Colors               |
| ---------------- | ----------------- | ----- | -------------------- |
| `.pdf`           | `FileText`        | PDF   | red-50 / red-600     |
| `.doc` / `.docx` | `FileText`        | DOC   | blue-50 / blue-600   |
| `.xls` / `.xlsx` | `FileSpreadsheet` | XLS   | green-50 / green-600 |
| other / missing  | `File`            | FILE  | gray-50 / gray-600   |

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
