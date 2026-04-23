# Lingkar CRM

Internal CRM dashboard built with Next.js (App Router), Tailwind CSS, and a custom component library.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── ui/          # Reusable UI primitives
│   │   ├── layout/      # App shell (Sidebar, Navbar)
│   │   └── core/        # App-specific logic components
│   ├── (dashboard)/     # Dashboard route group
│   └── login/           # Auth pages
├── lib/
│   ├── hooks/           # Custom React hooks
│   ├── api.ts           # API client
│   └── utils.ts         # Shared utilities
├── services/            # API service layer (per-domain)
├── config/              # App config (env, routing)
└── store/               # Zustand stores
```

---

## Design System

All UI components live in `src/app/components/` and are organized into three layers:

### UI Components (`components/ui/`)

Reusable, domain-agnostic primitives. Import from `@app/components/ui/<Component>`.

#### Button

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

#### Text

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

#### FormInput

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

#### Table System

A composable table system split into low-level primitives and high-level card components.

**Low-level primitives** — for full control:

```tsx
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  Badge,
  TablePagination,
} from "@app/components/ui/Table";
```

| Component         | Description                                                                                                |
| ----------------- | ---------------------------------------------------------------------------------------------------------- |
| `Table`           | Wrapper `<table>` with `isRefetching` progress bar                                                         |
| `TableHead`       | `<thead>` wrapper                                                                                          |
| `TableBody`       | `<tbody>` with built-in `loading` skeleton and `error` state                                               |
| `TableRow`        | `<tr>` with hover styling                                                                                  |
| `TableHeaderCell` | `<th>` with uppercase label styling                                                                        |
| `TableCell`       | `<td>` with consistent padding                                                                             |
| `Badge`           | Status badge with dot indicator. Variants: `primary`, `tertiary`, `success`, `warning`, `error`, `neutral` |
| `TablePagination` | Page navigation with showing X of Y text                                                                   |

**High-level card components** — for building table pages fast:

```tsx
import {
  TableCard,
  TableCardHeader,
  TableCardContent,
  TableCardPagination,
} from "@app/components/ui/Table";
import type { TableColumn } from "@app/components/ui/Table";
```

| Component             | Description                                                             |
| --------------------- | ----------------------------------------------------------------------- |
| `TableCard`           | Card wrapper with rounded corners, shadow, and border                   |
| `TableCardHeader`     | Title + action buttons header bar                                       |
| `TableCardContent`    | Declarative table: pass `columns` + `data`, get skeleton/error for free |
| `TableCardPagination` | Conditional pagination, auto-hides when not needed                      |

#### FormCard System

A composable card system for form/create/edit pages. Mirrors the `TableCard` pattern to keep all dashboard pages visually consistent.

```tsx
import {
  FormCard,
  FormCardHeader,
  FormCardBody,
  FormCardFooter,
} from "@app/components/ui/FormCard";
```

| Component         | Description                                                                 |
| ----------------- | --------------------------------------------------------------------------- |
| `FormCard`        | Card wrapper with the same rounded corners, shadow, and border as TableCard |
| `FormCardHeader`  | Title + description + optional badge or custom actions on the right         |
| `FormCardBody`    | Padded content area with vertical spacing for form fields                   |
| `FormCardFooter`  | Right-aligned action bar with top border (Cancel + Submit buttons)          |
| `FormCardLoading` | Centered spinner for loading state inside a FormCard                        |
| `FormCardError`   | Error message with optional title and back button                           |

**FormCardHeader props:**

| Prop          | Type        | Default | Description                                              |
| ------------- | ----------- | ------- | -------------------------------------------------------- |
| `title`       | `string`    | —       | Main heading text (required)                             |
| `description` | `string`    | —       | Subtitle text below the title                            |
| `badge`       | `string`    | —       | Small badge label on the right (e.g. "Authorized only")  |
| `actions`     | `ReactNode` | —       | Custom right-side content. Takes precedence over `badge` |

**FormCardError props:**

| Prop        | Type     | Default                 | Description                                  |
| ----------- | -------- | ----------------------- | -------------------------------------------- |
| `message`   | `string` | —                       | Error message to display                     |
| `title`     | `string` | `"Failed to load data"` | Title text above the error message           |
| `backHref`  | `string` | —                       | URL for the back button. Hidden when not set |
| `backLabel` | `string` | `"Go Back"`             | Label for the back button                    |

#### FilterPopup System

A composable modal popup for table filters. Includes chip selectors, range sliders, and date range pickers.

```tsx
import {
  FilterPopup,
  FilterSection,
  FilterChipGroup,
  FilterRangeSlider,
  FilterDateRange,
} from "@app/components/ui/FilterPopup";
```

| Component           | Description                                                            |
| ------------------- | ---------------------------------------------------------------------- |
| `FilterPopup`       | Modal overlay with header, scrollable body, and footer (Apply / Reset) |
| `FilterSection`     | Labeled section inside the popup with optional right-side content      |
| `FilterChipGroup`   | Selectable chip/pill buttons, single or multi-select                   |
| `FilterRangeSlider` | Dual-thumb range slider for numeric filtering                          |
| `FilterDateRange`   | Two side-by-side date inputs for start/end date filtering              |

**FilterPopup props:**

| Prop      | Type         | Default | Description                                   |
| --------- | ------------ | ------- | --------------------------------------------- |
| `open`    | `boolean`    | —       | Whether the popup is visible                  |
| `onClose` | `() => void` | —       | Called on backdrop click, Escape, or X button |
| `title`   | `string`     | —       | Header title                                  |
| `onApply` | `() => void` | —       | Called when "Apply Filters" is clicked        |
| `onReset` | `() => void` | —       | Called when "Reset Filters" is clicked        |

**FilterChipGroup props:**

| Prop       | Type                           | Default | Description                   |
| ---------- | ------------------------------ | ------- | ----------------------------- |
| `options`  | `FilterChipOption[]`           | —       | `{ label, value }` pairs      |
| `selected` | `string[]`                     | —       | Currently selected values     |
| `onChange` | `(selected: string[]) => void` | —       | Called when selection changes |
| `multiple` | `boolean`                      | `true`  | Allow multiple selections     |

**FilterRangeSlider props:**

| Prop          | Type                                    | Default  | Description                            |
| ------------- | --------------------------------------- | -------- | -------------------------------------- |
| `min`         | `number`                                | —        | Minimum possible value                 |
| `max`         | `number`                                | —        | Maximum possible value                 |
| `step`        | `number`                                | `1`      | Step increment                         |
| `value`       | `[number, number]`                      | —        | Current range `[low, high]`            |
| `onChange`    | `(value: [number, number]) => void`     | —        | Called when the range changes          |
| `formatLabel` | `(value: number) => string`             | `String` | Format min/max labels below the slider |
| `formatRange` | `(low: number, high: number) => string` | —        | Format the selected range display      |

**FilterDateRange props:**

| Prop                | Type                     | Default        | Description                    |
| ------------------- | ------------------------ | -------------- | ------------------------------ |
| `startDate`         | `string`                 | —              | Start date (ISO or empty)      |
| `endDate`           | `string`                 | —              | End date (ISO or empty)        |
| `onStartDateChange` | `(date: string) => void` | —              | Called when start date changes |
| `onEndDateChange`   | `(date: string) => void` | —              | Called when end date changes   |
| `startPlaceholder`  | `string`                 | `"Start date"` | Placeholder for start input    |
| `endPlaceholder`    | `string`                 | `"End date"`   | Placeholder for end input      |

#### TableHeader

Standalone header bar with title, optional badge, and action slot.

```tsx
import { TableHeader } from "@app/components/ui/TableHeader";

<TableHeader title="Members" badge="12 total" actions={<Button>Add</Button>} />;
```

#### GlobalNotification

Toast notification anchored to top-center. Driven by Zustand store.

```tsx
import { useNotificationStore } from "@store/useNotificationStore";

const { showNotification } = useNotificationStore();
showNotification("Saved successfully", "success"); // "success" | "error" | "info"
```

---

### Layout Components (`components/layout/`)

| Component | Description                                                  |
| --------- | ------------------------------------------------------------ |
| `Sidebar` | Fixed left sidebar with navigation links and user profile    |
| `Navbar`  | Top bar with search, navigation tabs, and notification icons |

---

### Hooks (`lib/hooks/`)

#### useTableData

Eliminates boilerplate for table pages: data fetching, pagination state, loading/error handling, and hydration safety.

```tsx
import { useTableData } from "@lib/hooks/use-table-data";

const {
  data,
  isInitialLoad,
  isRefetching,
  error,
  pagination,
  handlePageChange,
  setParams,
  refetch,
  isMounted,
} = useTableData<IProduct, IProductParams>({
  fetcher: (params) => productService.list(params),
  perPage: 10,
});
```

| Option          | Type                                    | Description                                                                                       |
| --------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `fetcher`       | `(params) => Promise<IApiListResponse>` | Service function to call                                                                          |
| `initialParams` | `Partial<TParams>`                      | Extra params beyond page/per_page                                                                 |
| `perPage`       | `number`                                | Items per page (default: 10)                                                                      |
| `syncUrl`       | `boolean`                               | Sync current page to `?page=N` URL query param. Reads on init, pushes on change (default: `true`) |

| Return             | Type                     | Description                        |
| ------------------ | ------------------------ | ---------------------------------- |
| `data`             | `TData[]`                | Fetched items                      |
| `isInitialLoad`    | `boolean`                | First load (no data yet)           |
| `isRefetching`     | `boolean`                | Loading with existing data visible |
| `error`            | `string \| null`         | Error message                      |
| `pagination`       | `IPagination`            | Pagination metadata from API       |
| `handlePageChange` | `(page: number) => void` | Go to page                         |
| `setParams`        | `(params) => void`       | Update filters (resets to page 1)  |
| `refetch`          | `() => void`             | Re-fetch with current params       |
| `isMounted`        | `boolean`                | Hydration-safe mount flag          |

#### useDetailData

Generic hook for fetching a single resource (detail/show endpoint). Handles loading state, error capture, and refetch. Designed for edit pages, detail views, or any page that loads one item.

```tsx
import { useDetailData } from "@lib/hooks/use-detail-data";

const { data, isLoading, error, refetch } = useDetailData<IBackofficeUser>({
  fetcher: () => backofficeMembersService.backofficeMembersDetail(id),
});
```

| Option    | Type                             | Description                                 |
| --------- | -------------------------------- | ------------------------------------------- |
| `fetcher` | `() => Promise<IApiResponse<T>>` | Service function that returns a single item |
| `enabled` | `boolean`                        | Whether to fetch on mount (default: `true`) |

| Return      | Type             | Description                               |
| ----------- | ---------------- | ----------------------------------------- |
| `data`      | `TData \| null`  | Fetched item, or `null` if not yet loaded |
| `isLoading` | `boolean`        | True while the fetch is in progress       |
| `error`     | `string \| null` | Error message if fetch failed             |
| `refetch`   | `() => void`     | Re-trigger the fetch                      |

---

### Building a New Table Page

Combine `useTableData` + `TableCard` components for a consistent table page with minimal code:

```tsx
"use client";
import {
  TableCard,
  TableCardHeader,
  TableCardContent,
  TableCardPagination,
  TableCell,
  Badge,
} from "@app/components/ui/Table";
import type { TableColumn } from "@app/components/ui/Table";
import { Button } from "@app/components/ui/Button";
import { useTableData } from "@lib/hooks/use-table-data";
import { Plus } from "lucide-react";

const columns: TableColumn<IProduct>[] = [
  {
    key: "name",
    header: "Name",
    render: (item) => <TableCell>{item.name}</TableCell>,
  },
  {
    key: "status",
    header: "Status",
    render: (item) => (
      <TableCell>
        <Badge variant="success">{item.status}</Badge>
      </TableCell>
    ),
  },
];

export function ProductTable() {
  const {
    data,
    isInitialLoad,
    isRefetching,
    error,
    pagination,
    handlePageChange,
    isMounted,
  } = useTableData({ fetcher: productService.list, perPage: 10 });

  if (!isMounted) return null;

  return (
    <TableCard>
      <TableCardHeader
        title="Products"
        actions={
          <Button variant="primary" href="/products/create">
            <Plus size={16} /> Add New
          </Button>
        }
      />
      <TableCardContent
        columns={columns}
        data={data}
        keyExtractor={(p) => p.id}
        isRefetching={isRefetching}
        isLoading={isInitialLoad}
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
}
```

---

### Building a New Form Page

Combine `FormCard` components for a consistent create/edit page:

```tsx
"use client";
import {
  FormCard,
  FormCardHeader,
  FormCardBody,
  FormCardFooter,
} from "@app/components/ui/FormCard";
import { FormInput } from "@app/components/ui/FormInput";
import { Button } from "@app/components/ui/Button";
import { Check } from "lucide-react";

export default function CreateProductPage() {
  return (
    <FormCard>
      <FormCardHeader
        title="Create Product"
        description="Fill in the product details below."
        badge="Draft"
      />

      <form onSubmit={handleSubmit}>
        <FormCardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <FormInput id="name" label="Product Name" />
            <FormInput id="sku" label="SKU" />
          </div>
        </FormCardBody>

        <FormCardFooter>
          <Button variant="ghost" href="/products">
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            <Check size={16} className="mr-2" />
            Save Product
          </Button>
        </FormCardFooter>
      </form>
    </FormCard>
  );
}
```

---

### Building a New Edit Page

Combine `useDetailData` + `FormCard` + `FormCardLoading`/`FormCardError` for a consistent edit page with return-page support:

```tsx
"use client";
import { useCallback, useState } from "react";
import {
  FormCard,
  FormCardHeader,
  FormCardBody,
  FormCardFooter,
  FormCardLoading,
  FormCardError,
} from "@app/components/ui/FormCard";
import { FormInput } from "@app/components/ui/FormInput";
import { Button } from "@app/components/ui/Button";
import { useDetailData } from "@lib/hooks/use-detail-data";
import { handleFormError } from "@lib/utils";
import { useNotificationStore } from "@store/useNotificationStore";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";

export default function EditProductPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const returnPage = searchParams.get("returnPage");

  // Build back URL preserving the page the user came from
  const backUrl = returnPage ? `/products?page=${returnPage}` : "/products";

  const fetcher = useCallback(() => productService.detail(Number(id)), [id]);
  const { data, isLoading, error } = useDetailData<IProduct>({ fetcher });

  if (isLoading)
    return (
      <FormCard>
        <FormCardLoading />
      </FormCard>
    );
  if (error || !data)
    return (
      <FormCard>
        <FormCardError message={error || "Not found"} backHref={backUrl} />
      </FormCard>
    );

  return <ProductEditForm product={data} backUrl={backUrl} />;
}

// Inner form — only mounts after data is available.
// Initializes state directly from props (no useEffect needed — React 19 compliant).
function ProductEditForm({
  product,
  backUrl,
}: {
  product: IProduct;
  backUrl: string;
}) {
  const router = useRouter();
  const showNotification = useNotificationStore((s) => s.showNotification);
  const [formData, setFormData] = useState(() => ({
    name: product.name,
    sku: product.sku,
  }));
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const resp = await productService.update(product.id, formData);
      showNotification(resp.message, "success");
      router.push(backUrl); // Returns to the same page the user came from
    } catch (err) {
      handleFormError(err, setFormErrors);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormCard>
      <FormCardHeader
        title="Edit Product"
        description="Update product details."
      />
      <form onSubmit={handleSubmit}>
        <FormCardBody>
          <FormInput
            id="name"
            label="Name"
            value={formData.name}
            onChange={handleChange}
            error={formErrors.name}
          />
          <FormInput
            id="sku"
            label="SKU"
            value={formData.sku}
            onChange={handleChange}
            error={formErrors.sku}
          />
        </FormCardBody>
        <FormCardFooter>
          <Button variant="ghost" href={backUrl}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={submitting}>
            <Check size={16} className="mr-2" />
            Save
          </Button>
        </FormCardFooter>
      </form>
    </FormCard>
  );
}
```

Key patterns:

- **Page + inner form split**: page component handles loading/error, inner form receives data as props and initializes state directly. No `useEffect` for syncing API data — React 19 compliant.
- **Return page preservation**: table edit links include `?returnPage=N`, edit page reads it and redirects back to the same page after submit or cancel. Handled via `useSearchParams`.
- **URL-synced pagination**: `useTableData` reads `?page=N` from the URL and pushes page changes back, so table pages are bookmarkable and support browser back/forward.
