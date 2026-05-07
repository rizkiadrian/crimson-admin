---
name: documentation-update-guide
description: "After ANY change, check this guide to know which documentation files need updating. Covers all doc files across both repos."
---

# Documentation Update Guide

After ANY change, check this table to know which docs need updating.

## When to Update What

| Change Type                         | Files to Update                                                                                                        |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| New UI component                    | `docs/DESIGN_SYSTEM.md`, `/design-system` showcase, `docs/ARCHITECTURE.md` (if new directory)                          |
| New feature page                    | `docs/PRD.md` (feature module section), `README.md` (Feature Status table), `docs/ARCHITECTURE.md` (project structure) |
| New API endpoint (backend)          | Backend `README.md` (API Endpoints), Postman collection + validate JSON, Backend `CLAUDE.md` (API Modules table)       |
| New service/store/hook              | `docs/ARCHITECTURE.md` (project structure section)                                                                     |
| New library added                   | `docs/ARCHITECTURE.md` (Tech Stack table), `README.md` (Tech Stack table)                                              |
| Visual change to existing component | `docs/DESIGN_SYSTEM.md`, `/design-system` showcase                                                                     |
| New sidebar entry                   | `docs/PRD.md` (Navigation Structure)                                                                                   |
| New pattern/convention              | `CLAUDE.md` (both repos), `.agents/skills/` (if reusable)                                                              |

## Documentation Files Reference

| File                    | Location          | Purpose                                                      |
| ----------------------- | ----------------- | ------------------------------------------------------------ |
| `CLAUDE.md`             | Root of each repo | Master reference for AI agents (auto-read by Claude/Augment) |
| `AGENTS.md`             | Root of each repo | Quick reference for AI agents (auto-read by Kiro)            |
| `README.md`             | Root of each repo | Human-readable project overview, tech stack, feature status  |
| `docs/PRD.md`           | Frontend only     | Feature modules, acceptance criteria, roadmap                |
| `docs/DESIGN_SYSTEM.md` | Frontend only     | Component library reference with props tables                |
| `docs/ARCHITECTURE.md`  | Frontend only     | Project structure, ADRs, conventions, data flow              |
| `/design-system` page   | Frontend only     | Live interactive component showcase                          |
| Postman collection      | Backend only      | API endpoint collection for testing                          |
