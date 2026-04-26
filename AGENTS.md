<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:lingkar-crm-agent-rules -->

# Lingkar CRM — Agent Quick Reference

Read `CLAUDE.md` for the full reference. This is a condensed version for quick onboarding.

## Critical Rules (MUST follow)

1. **No native HTML elements.** Use the component system:
   - `<button>` → `<Button>` from `@app/components/ui/Button`
   - `<input>` → `<FormInput>` from `@app/components/ui/FormInput`
   - `<select>` → `<FormSelect>` from `@app/components/ui/FormSelect`
   - `<a>` → `<Button href="...">` (renders as Next.js Link)
   - `<img>` → `<Image>` from `next/image`

2. **No direct API calls.** Use typed service functions in `src/services/`. Never call `api.get()` from components.

3. **React 19 compliance.** No synchronous `setState` inside `useEffect`. Use `useReducer` + `queueMicrotask` for data hooks. Edit pages use "Page + Inner Form" split.

4. **Password hashing.** Backend: always `AuthHelper::hashPassword()`, never `Hash::make()`.

5. **Chart colors.** Always use `CHART_COLORS`/`CHART_SETS` from `chart-colors.ts`. Never hardcode hex.

6. **After every change, update docs:** PRD.md, DESIGN_SYSTEM.md, ARCHITECTURE.md, README.md, Postman collection, /design-system showcase.

## MANDATORY: Read Skills Before Writing Any Code

> **CRITICAL — Not optional.** Unlike Kiro (which auto-injects skills via `.kiro/steering/`), Claude and Augment do NOT auto-load skills. You MUST read them manually at the start of every session before writing any code or making any changes.

### Step 1 — Always Read (every session)

```
.agent/skills/component-rules.md       ← Read FIRST before writing any JSX
```

### Step 2 — Read Based on Task

| Task Type                       | Read This Skill File                          |
| ------------------------------- | --------------------------------------------- |
| Building any feature            | `.agent/skills/new-feature-checklist.md`      |
| Fullstack feature (API+UI)      | `.agent/skills/fullstack-feature-pattern.md`  |
| Any state or data fetching work | `.agent/skills/state-management-patterns.md`  |
| Any form submit or async action | `.agent/skills/error-handling-patterns.md`    |
| After any change                | `.agent/skills/documentation-update-guide.md` |
| Verifying / testing             | `.agent/skills/testing-workflows.md`          |

### Agent Capabilities

| Agent              | Browser Testing Tool    | Skills Auto-Loaded?      |
| ------------------ | ----------------------- | ------------------------ |
| Kiro               | `mcp_chrome_devtools_*` | ✅ via `.kiro/steering/` |
| Antigravity/Claude | `browser_subagent`      | ❌ read manually         |
| Augment            | Varies                  | ❌ read manually         |

### Key Reference Files

- `CLAUDE.md` — Full project reference (single source of truth)
- `docs/ARCHITECTURE.md` — Project structure, ADRs, data flow
- `docs/DESIGN_SYSTEM.md` — Component library reference
- `docs/PRD.md` — Feature modules and acceptance criteria
- `src/app/globals.css` — Design tokens (colors, semantic tokens)
- `src/lib/api.ts` — Axios client with silent refresh
- `src/lib/hooks/use-table-data.ts` — Paginated list hook
- `src/lib/hooks/use-detail-data.ts` — Single resource hook

## Verification Commands

```bash
npx tsc --noEmit    # TypeScript check (must pass)
npm audit           # No new vulnerabilities
npm run dev         # Start dev server at localhost:3000
```

## Login Credentials

- URL: `http://localhost:3000/login`
- Email: `admin@example.com`
- Password: `Password123`
<!-- END:lingkar-crm-agent-rules -->
