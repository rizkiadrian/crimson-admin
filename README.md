# Lingkar CRM

Internal backoffice CRM dashboard for the Lingkar service marketplace. Built with Next.js 16, TypeScript, Tailwind CSS 4, and a custom component library.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Documentation

| Document                                    | Description                                                                    |
| ------------------------------------------- | ------------------------------------------------------------------------------ |
| [Product Requirements (PRD)](./docs/PRD.md) | Feature modules, user flows, API endpoints, acceptance criteria, roadmap       |
| [Design System](./docs/DESIGN_SYSTEM.md)    | Component library reference, props tables, hooks API, code templates           |
| [Architecture](./docs/ARCHITECTURE.md)      | Tech stack, project structure, architectural decisions, conventions, data flow |
| [Live Preview](/design-system)              | Interactive component showcase at `/design-system` (run dev server first)      |

## Tech Stack

| Layer     | Technology                          |
| --------- | ----------------------------------- |
| Framework | Next.js 16 (App Router)             |
| Language  | TypeScript 5                        |
| Styling   | Tailwind CSS 4                      |
| State     | Zustand                             |
| HTTP      | Axios                               |
| Calendar  | react-day-picker 9 + date-fns 4     |
| Icons     | Lucide React                        |
| Charts    | Recharts                            |
| Editor    | Tiptap (@tiptap/react)              |
| Quality   | ESLint, Prettier, Husky, commitlint |

## Feature Status

| Module               | List | Create | Show | Edit | Delete | Verify | Filter | Dashboard |
| -------------------- | ---- | ------ | ---- | ---- | ------ | ------ | ------ | --------- |
| Dashboard            | —    | —      | —    | —    | —      | —      | —      | ✅        |
| Backoffice Dashboard | —    | —      | —    | —    | —      | —      | —      | ✅        |
| Finance Dashboard    | —    | —      | —    | —    | —      | —      | —      | ✅        |
| Marketing Dashboard  | —    | —      | —    | —    | —      | —      | —      | ✅        |
| Sales Dashboard      | —    | —      | —    | —    | —      | —      | —      | ✅        |
| Backoffice Members   | ✅   | ✅     | —    | ✅   | ✅     | —      | ✅     | —         |
| Client Members       | ✅   | ✅     | —    | ✅   | ✅     | ✅     | ✅     | —         |
| Mitra Management     | ✅   | —      | ✅   | ✅   | ✅     | ✅     | ✅     | —         |
| Leads Management     | ✅   | ✅     | —    | ✅   | ✅     | —      | ✅     | ✅        |
| Sales Members        | ✅   | ✅     | —    | ✅   | ✅     | —      | ✅     | —         |
| Sales Activities     | ✅   | ✅     | ✅   | —    | —      | —      | —      | —         |
| Activity Log Review  | ✅   | —      | ✅   | —    | —      | —      | ✅     | —         |
| Notifications        | ✅   | —      | —    | —    | —      | —      | —      | ✅        |
| Deposit Management   | ✅   | —      | ✅   | —    | —      | —      | ✅     | ✅        |
| Banner Management    | ✅   | ✅     | —    | ✅   | ✅     | —      | ✅     | —         |
| User Journey Funnel  | ✅   | —      | —    | —    | —      | —      | ✅     | ✅        |
| Service Categories   | ✅   | ✅     | —    | ✅   | ✅     | —      | ✅     | —         |
| Voucher Management   | ✅   | ✅     | ✅   | ✅   | ✅     | —      | ✅     | —         |
| Referral Program     | ✅   | ✅     | ✅   | ✅   | ✅     | —      | ✅     | —         |
| Articles             | ✅   | ✅     | —    | ✅   | ✅     | —      | ✅     | —         |
| Authors              | ✅   | ✅     | —    | ✅   | ✅     | —      | —      | —         |
| Article Categories   | ✅   | ✅     | —    | ✅   | ✅     | —      | —      | —         |
| Article Tags         | ✅   | ✅     | —    | ✅   | ✅     | —      | —      | —         |

## Project Structure

```
src/
├── app/
│   ├── components/ui/       # Button, FormInput, FormSelect, Table, FormCard, DetailCard, FilterPopup, ConfirmDialog, SearchInput, StatCard, Chart, ActivityCard (with attachment thumbnail preview), CommentThread
│   ├── components/layout/   # Sidebar (accordion, ROLE_NAV_CONFIG per role), Navbar (with NotificationBell dropdown — supports all backoffice roles, resolveLink deep link fallback)
│   ├── (dashboard)/         # Dashboard pages (backoffice-dashboard, finance-dashboard, marketing-dashboard, backoffice-members, client-members, mitra-members, leads, sales-members, notifications, activity-logs, deposit-requests, banners, vouchers, referral-campaigns, referrals, sales-activities, analytics/funnel, analytics/segments, analytics/events, service-categories)
│   └── design-system/       # Live component preview
├── lib/hooks/               # useTableData (list + URL sync), useInfiniteScroll (infinite scroll + URL sync), useDetailData (single resource)
├── services/                # API service layer per domain (backoffice/*, backoffice/backoffice-dashboard, backoffice/finance-dashboard, backoffice/marketing-dashboard, notifications (generic factory), sales/activity-logs, sales/dashboard, shared/comments)
├── store/                   # Zustand stores (useNotificationStore (toast), useRoleNotificationStore (generic per-role), confirm dialog)
└── config/                  # Routing paths, environment (ROLE_NOTIFICATION_ENDPOINT, ROLE_DASHBOARD_MAP), cookie keys
```

## Authentication

Login is handled via server action (`setCredentials`) which calls the backend API, stores `access_token`, `refresh_token`, and `role_name` as httpOnly secure cookies. The `role_name` cookie enables server-side role-based routing in Next.js middleware — Sales users are redirected to `/sales-dashboard`, Backoffice users to `/backoffice-dashboard`, Finance to `/finance-dashboard`, Marketing to `/marketing-dashboard`, and Admin to `/dashboard`, all before the page renders (no client-side flash). Each role sees only their permitted sidebar navigation items. See [Architecture](./docs/ARCHITECTURE.md) for the full login flow and cookie schema.
