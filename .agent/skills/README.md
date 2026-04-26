# Agent Skills — Lingkar CRM (Frontend)

Read these files before making changes to the project.

## Step 1 — Always Read (every session)

```
.agent/skills/component-rules.md       ← Read FIRST before writing any JSX
```

## Step 2 — Read Based on Task

| File                            | When to Read                    | Description                                                                   |
| ------------------------------- | ------------------------------- | ----------------------------------------------------------------------------- |
| `component-rules.md`            | **Always**                      | Forbidden native elements, FormCard, TableCard, hooks, Common Mistakes        |
| `new-feature-checklist.md`      | Building new features           | Complete checklist (backend + frontend + docs + routing)                      |
| `fullstack-feature-pattern.md`  | Building fullstack features     | Step-by-step template from API to UI, with real module references             |
| `state-management-patterns.md`  | Any state or data fetching work | useState vs useTableData vs useDetailData vs Zustand decision guide           |
| `error-handling-patterns.md`    | Any form or async action        | handleFormError, showNotification, showConfirm, fetch error patterns          |
| `documentation-update-guide.md` | After any change                | Which docs to update and when                                                 |
| `testing-workflows.md`          | After implementation            | Verification commands for Kiro (MCP), Antigravity (browser_subagent), and CLI |

## Agent Capabilities

| Agent              | Browser Testing Tool    | Note                                      |
| ------------------ | ----------------------- | ----------------------------------------- |
| Kiro               | `mcp_chrome_devtools_*` | Auto-injects skills via `.kiro/steering/` |
| Antigravity/Claude | `browser_subagent`      | Must read skill files manually            |
| Augment            | Varies                  | Must read skill files manually            |

## Quick Start

1. Read `component-rules.md` before writing any JSX
2. Use `new-feature-checklist.md` as your todo list for new features
3. Use `state-management-patterns.md` for any state/data fetching decisions
4. Use `error-handling-patterns.md` for submit handlers and async actions
5. Use `documentation-update-guide.md` to know which docs to update
