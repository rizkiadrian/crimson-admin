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

Form input with label, icons, password toggle, phone number formatting, and error state.

```tsx
import { FormInput } from "@app/components/ui/FormInput";

<FormInput label="Email" id="email" type="email" />
<FormInput label="Password" id="password" type="password" />
<FormInput label="Phone" id="phone" format="phone" />
<FormInput label="Name" id="name" error="Required field" />
```

| Prop        | Type                     | Default     | Description                               |
| ----------- | ------------------------ | ----------- | ----------------------------------------- |
| `label`     | `string`                 | —           | Input label (required)                    |
| `id`        | `string`                 | —           | HTML id (required)                        |
| `leftIcon`  | `ReactNode`              | —           | Icon inside input (left)                  |
| `rightIcon` | `ReactNode`              | —           | Icon inside input (right)                 |
| `format`    | `"phone"` \| `"default"` | `"default"` | Auto-formats phone to `+62 XXX-XXXX-XXXX` |
| `error`     | `string`                 | —           | Error message, triggers error styling     |

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

| Option          | Type                                    | Description                       |
| --------------- | --------------------------------------- | --------------------------------- |
| `fetcher`       | `(params) => Promise<IApiListResponse>` | Service function to call          |
| `initialParams` | `Partial<TParams>`                      | Extra params beyond page/per_page |
| `perPage`       | `number`                                | Items per page (default: 10)      |

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
