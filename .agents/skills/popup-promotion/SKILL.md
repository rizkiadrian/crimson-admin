---
name: popup-promotion
description: "Complete reference for the In-App Popup Promotion Management feature. Covers backend services, frontend components, canvas editor, A/B testing, targeting engine, and event registry."
---

# Popup Promotion Management

Full-stack feature for creating, targeting, A/B testing, and analyzing in-app popup promotions.

---

## Architecture Overview

### Backend (lingkar-id-backend)

| Layer       | Files                                                                                                                               |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Migrations  | `2026_05_09_10000[1-4]_*.php` (event_registry, popup_promotions, popup_events, popup_ab_assignments)                                |
| Models      | `EventRegistry`, `PopupPromotion` (HasUuids, SoftDeletes, JSON casts), `PopupEvent`, `PopupAbAssignment`                            |
| Services    | `EventRegistryService`, `PopupPromotionService`, `TargetingEngine`, `ABTestService`, `PopupAnalyticsService`                        |
| Controllers | `EventRegistryController`, `PopupPromotionController`, `PopupAnalyticsController`, `ClientPopupController`, `ClientEventController` |
| Routes      | `routes/api/marketing.php`, `routes/api/client.php`                                                                                 |
| Config      | `config/businessflow.php` → `journey.event_stage_map` (system events source)                                                        |

### Frontend (lingkar-crm)

| Layer      | Files                                                                                        |
| ---------- | -------------------------------------------------------------------------------------------- |
| Services   | `src/services/marketing/event-registry/`, `src/services/marketing/popup-promotions/`         |
| Components | `src/app/components/ui/PopupEditor/` (9 components)                                          |
| Pages      | `src/app/(dashboard)/dashboard/event-registry/` (list, create, edit)                         |
| Pages      | `src/app/(dashboard)/dashboard/popup-promotions/` (list, create, edit, detail, compare)      |
| Partials   | `_partials/TriggerRulesBuilder.tsx`                                                          |
| Middleware | `src/middleware.ts` — Marketing role allowed paths include popup-promotions + event-registry |

---

## Key Components

### PopupEditor System (`src/app/components/ui/PopupEditor/`)

| Component                 | Purpose                                                                                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PopupCanvasEditor`       | Drag-drop canvas with size presets (1:1, 3:4, 9:16, 4:3), inline text editing (double-click), free resize handles, keyboard delete, add element toolbar |
| `PopupElementPanel`       | Floating properties panel with sections (Position & Size, Appearance, Typography, Button Style, Shape, Image, Delete)                                   |
| `PopupColorPicker`        | Lingkar design system presets (12 solid + 6 gradient), hex input, native picker                                                                         |
| `PopupGradientEditor`     | 2-4 stops, linear/radial, angle control                                                                                                                 |
| `PopupBackgroundSelector` | Modes: solid, gradient (with presets), image, pattern (dots, lines, geometric, waves)                                                                   |
| `PopupTemplateSelector`   | 4 template presets + slot forms (headline, subtext, image, CTA, theme color)                                                                            |
| `PopupHtmlEditor`         | Code editor + iframe-sandboxed preview (safe for full HTML documents)                                                                                   |
| `PopupPreviewModal`       | Mobile frame preview for all content types                                                                                                              |
| `PopupImageInput`         | URL input + file upload button (backend endpoint) + thumbnail preview                                                                                   |

### TriggerRulesBuilder (`_partials/TriggerRulesBuilder.tsx`)

Dynamic form for configuring popup trigger conditions:

- 7 trigger types: immediate, delay, scroll_depth, exit_intent, session_count, inactivity, event
- Event type: dropdown from Event Registry API + metadata conditions (field, operator, value)
- Operators: equals, not_equals, in, contains, exists

---

## Backend Services

### TargetingEngine

Determines which popup to show a user. Methods:

- `getEligiblePopup(user)` — highest priority matching popup
- `matchesTarget(popup, user)` — user_type matching
- `matchesSchedule(popup)` — time window, days of week
- `matchesFrequencyCap(popup, user)` — max per day/week/lifetime
- `matchesTrigger(popup, event)` — event key + metadata conditions

### ABTestService

- `getOrAssignVariant(userId, groupId)` — sticky 50/50 assignment
- `getComparisonMetrics(groupId)` — side-by-side metrics
- Max 2 variants per group

### PopupPromotionService

- CRUD + `changeStatus` (draft→scheduled→active→paused→ended)
- `duplicatePopup`, `createABVariant` (auto-names Variant A/B)
- `uploadImage` (stores to `public/popup-promotions/`)
- `activateScheduledPopups`, `endExpiredPopups` (scheduled tasks)

### EventRegistryService

- CRUD for custom events (system events protected)
- `trackEvent(eventKey, metadata)` — validates event exists + active
- System events sourced from `config('businessflow.journey.event_stage_map')`

---

## API Endpoints

### Marketing (admin/marketing role)

```
POST   /marketing/popup-promotions/upload-image
GET    /marketing/popup-promotions
POST   /marketing/popup-promotions
GET    /marketing/popup-promotions/{id}
PUT    /marketing/popup-promotions/{id}
DELETE /marketing/popup-promotions/{id}
PATCH  /marketing/popup-promotions/{id}/status
POST   /marketing/popup-promotions/{id}/duplicate
POST   /marketing/popup-promotions/{id}/ab-variant
GET    /marketing/popup-promotions/{id}/analytics
GET    /marketing/popup-promotions/{id}/analytics/timeline
GET    /marketing/popup-promotions/{id}/analytics/breakdown
GET    /marketing/popup-promotions/{id}/compare
GET    /marketing/event-registry
POST   /marketing/event-registry
PUT    /marketing/event-registry/{id}
DELETE /marketing/event-registry/{id}
```

### Client (authenticated users)

```
GET    /client/popups/eligible
POST   /client/popups/{id}/impression
POST   /client/popups/{id}/click
POST   /client/popups/{id}/dismiss
POST   /client/events
```

---

## Content Modes

1. **Template** — 4 presets (welcome_offer, flash_sale, voucher_promo, announcement) with slot forms
2. **Canvas** — drag-drop editor with elements (text, image, cta_button, shape, close_button)
3. **HTML** — code editor with iframe-sandboxed preview
4. **Image** — URL input + file upload

---

## Design System Colors

Presets used in PopupColorPicker:

- Primary: `#d32f2f`, `#e46767`, `#7f1c1c`
- Neutral: `#222222`, `#4f4f4f`, `#888888`
- Success: `#10b981`, `#34d399`
- Warning: `#f59e0b`, `#fbbf24`
- Base: `#FFFFFF`, `#000000`

Gradient presets: Crimson, Crimson Soft, Dark, Emerald, Sunset, Warm

---

## Testing

- Backend: `docker exec lingkarid.local php artisan test --filter=Marketing` (17 tests)
- Frontend: `npx vitest run src/__tests__/popup-promotions src/services/marketing` (53 tests)
- TypeScript: `npx tsc --noEmit`
