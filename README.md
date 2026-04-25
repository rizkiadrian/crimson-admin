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
| Quality   | ESLint, Prettier, Husky, commitlint |

## Feature Status

| Module             | List | Create | Edit | Delete | Filter |
| ------------------ | ---- | ------ | ---- | ------ | ------ |
| Backoffice Members | ✅   | ✅     | ✅   | ✅     | ✅     |
| Client Members     | ✅   | ✅     | ✅   | ✅     | ✅     |
| Mitra Management   | 🔲   | 🔲     | 🔲   | 🔲     | 🔲     |
| Deposit Management | 🔲   | 🔲     | 🔲   | 🔲     | 🔲     |
| Service Categories | 🔲   | 🔲     | 🔲   | 🔲     | 🔲     |

## Project Structure

```
src/
├── app/
│   ├── components/ui/       # Button, FormInput, Table, FormCard, FilterPopup, ConfirmDialog
│   ├── components/layout/   # Sidebar (accordion), Navbar
│   ├── (dashboard)/         # Dashboard pages (backoffice-members, client-members)
│   └── design-system/       # Live component preview
├── lib/hooks/               # useTableData (list + URL sync), useDetailData (single resource)
├── services/                # API service layer per domain
├── store/                   # Zustand stores (notifications, confirm dialog)
└── config/                  # Routing paths, environment
```
