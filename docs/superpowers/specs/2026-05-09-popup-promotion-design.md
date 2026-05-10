# In-App Popup Promotion Management — Design Spec

**Date:** 2026-05-09
**Module:** Marketing
**Approach:** Monolithic CRM Module (Approach A)
**Platform:** Mobile app first, API designed platform-agnostic for future web support

---

## Overview

A new marketing module for creating and managing in-app popup promotions. Marketing team can design popups (via templates, image upload, canvas editor, or HTML code), configure advanced targeting and triggers, schedule delivery, run A/B tests, and track full conversion analytics — all from the CRM backoffice.

---

## 1. Data Model & Status Lifecycle

### Table: `popup_promotions`

| Field           | Type                                                    | Keterangan                                          |
| --------------- | ------------------------------------------------------- | --------------------------------------------------- |
| id              | uuid                                                    | Primary key                                         |
| name            | string                                                  | Nama internal (untuk tim marketing)                 |
| content_type    | enum: `template`, `image`, `canvas`, `html`             | Mode pembuatan konten                               |
| content_config  | JSON                                                    | Isi konten sesuai type                              |
| status          | enum: `draft`, `scheduled`, `active`, `paused`, `ended` | Status lifecycle                                    |
| priority        | integer                                                 | Urutan prioritas (higher = ditampilkan duluan)      |
| trigger_config  | JSON                                                    | Kapan muncul                                        |
| target_config   | JSON                                                    | Ke siapa                                            |
| schedule_config | JSON                                                    | Jadwal tayang                                       |
| frequency_cap   | JSON                                                    | Batas tampil per user                               |
| linked_action   | JSON                                                    | CTA action (deeplink, voucher_id, service page)     |
| ab_variant      | string/null                                             | Variant label ("A", "B") — null jika bukan A/B test |
| ab_group_id     | uuid/null                                               | Group ID menghubungkan variant A & B                |
| created_at      | timestamp                                               |                                                     |
| updated_at      | timestamp                                               |                                                     |
| deleted_at      | timestamp                                               | Soft delete                                         |

### Table: `popup_events`

| Field       | Type                                                 | Keterangan                       |
| ----------- | ---------------------------------------------------- | -------------------------------- |
| id          | bigint                                               | Auto-increment                   |
| popup_id    | uuid                                                 | FK to popup_promotions           |
| user_id     | uuid/null                                            | User yang melihat/klik           |
| event_type  | enum: `impression`, `click`, `dismiss`, `conversion` | Tipe event                       |
| device_type | string                                               | `android`, `ios`                 |
| metadata    | JSON                                                 | Conversion details, session info |
| created_at  | timestamp                                            |                                  |

### Table: `popup_ab_assignments`

| Field       | Type      | Keterangan          |
| ----------- | --------- | ------------------- |
| id          | bigint    |                     |
| user_id     | uuid      | User yang di-assign |
| ab_group_id | uuid      | Group mana          |
| variant     | string    | "A" atau "B"        |
| assigned_at | timestamp |                     |

**Unique constraint:** `(user_id, ab_group_id)` — satu user hanya dapat satu variant per group.

### Status Lifecycle

```
draft → scheduled (saat set tanggal mulai)
scheduled → active (otomatis saat start_date tercapai)
active → paused (manual oleh marketing)
paused → active (resume)
active → ended (otomatis saat end_date tercapai, atau manual stop)
```

### A/B Testing Flow

1. Marketing buat popup A, lalu klik "Create A/B Test" → sistem generate `ab_group_id` dan buat popup B (clone) dengan `ab_variant = "B"`
2. Saat mobile app request eligible popup, backend assign user ke variant secara random (50/50), simpan di `popup_ab_assignments`
3. User yang sama selalu lihat variant yang sama (sticky assignment)
4. Analytics page menampilkan comparison side-by-side dengan statistical significance indicator

---

## 2. Content Creation — 4 Modes

### Mode 1: Template-based

Pilih dari template siap pakai, isi slot konten:

| Template      | Layout                                 | Use Case              |
| ------------- | -------------------------------------- | --------------------- |
| Welcome Offer | Gambar atas + headline + subtext + CTA | First-time user promo |
| Flash Sale    | Countdown + bold headline + CTA        | Limited time offer    |
| Voucher Promo | Voucher code display + CTA "Klaim"     | Voucher distribution  |
| Announcement  | Icon + text + dismiss button           | Info/update           |

Slot per template: headline, subtext, image, CTA text, CTA action, warna tema.

### Mode 2: Image Upload

- Upload gambar popup (PNG/JPG/WebP)
- CTA button overlay (posisi, teks, action) — opsional
- Close button position configurable

### Mode 3: Canvas Editor (Advanced)

Extend pattern dari existing `BannerEditor/CanvasEditor`. Perbedaan:

- **Aspect ratio:** Popup vertikal (3:4 atau 2:3) vs banner horizontal (2:1)
- **Elemen tambahan:** Image element, shape/divider
- **Close button:** Wajib ada, posisi configurable

**Draggable elements:**

- Text (headline, body, caption — font size, color, weight)
- Image (upload, resize, reposition)
- CTA Button (text, bg color, border radius, action link)
- Shape (rectangle, circle — background accent)
- Close/dismiss button

**Property panel (form-based):**
Klik elemen di canvas → panel kanan menampilkan form properti (posisi X/Y, ukuran, warna, font, dll). Same pattern as existing `TextPropertiesPanel` dan `CtaPropertiesPanel`.

**Color & Background System:**

| Type             | Keterangan                                                                           |
| ---------------- | ------------------------------------------------------------------------------------ |
| Solid            | Preset swatches ATAU hex input manual                                                |
| Gradient         | 2-4 color stops, direction configurable (linear angle 0-360° / radial), hex per stop |
| Image background | Upload gambar sebagai background canvas                                              |
| Pattern/Texture  | Pattern bawaan (dots, lines, geometric) dengan warna customizable                    |

**Color picker (semua properti warna):**

1. Preset swatches — warna brand + populer (quick pick)
2. Hex input — ketik `#FF5733` atau `rgb()`
3. Visual color picker — hue slider + saturation/brightness area

**Gradient editor:**

- Tambah/hapus color stops (min 2, max 4)
- Drag stop position di gradient bar
- Direction: linear (angle 0-360°) atau radial (center/corner)
- Live preview saat editing

**Opacity:** Semua warna support alpha (RGBA). Opacity slider per elemen (0-100%).

**Output:** JSON config (posisi + properti semua elemen). Mobile app render native dari JSON.

### Mode 4: HTML Code Editor

- Code editor dengan syntax highlighting (Monaco/CodeMirror)
- Live preview split view
- HTML + inline CSS (scoped)
- Template variables: `{{user_name}}`, `{{voucher_code}}`, `{{deeplink}}`
- Validasi: cek close button, CTA element, sanitize script
- Mobile app render via sandboxed WebView

### Render Strategy per Mode

| Mode          | Render di Mobile               |
| ------------- | ------------------------------ |
| Template      | Native component               |
| Image Upload  | Native image + CTA overlay     |
| Canvas Editor | Native render dari JSON config |
| HTML Code     | WebView (sandboxed)            |

---

## 3. Targeting & Triggers

### Target Audience

| Target        | Config                           | Keterangan                                                                       |
| ------------- | -------------------------------- | -------------------------------------------------------------------------------- |
| User type     | `user_types: string[]`           | `client`, `mitra`                                                                |
| All users     | —                                | Semua visitor                                                                    |
| Journey stage | `journey_stages: string[]`       | `registered`, `verified`, `funded`, `active` (dari existing user journey funnel) |
| New user      | `registered_within_days: number` | Baru register dalam X hari                                                       |
| Device        | `platforms: string[]`            | `android`, `ios`                                                                 |
| Segment       | `segment_ids: number[]`          | Dari existing analytics segments module                                          |

**Note:** Location/city skipped — belum ada data kota di sistem.

### Trigger Rules

| Trigger       | Config                              | Keterangan                                       |
| ------------- | ----------------------------------- | ------------------------------------------------ |
| Immediate     | —                                   | Langsung muncul saat halaman load                |
| Delay         | `delay_seconds: number`             | Muncul setelah X detik                           |
| Scroll depth  | `scroll_percent: number`            | Muncul saat scroll ke X%                         |
| Exit intent   | —                                   | Saat user mau keluar app (swipe back / minimize) |
| Session count | `min_sessions: number`              | Setelah user buka app X kali                     |
| Inactivity    | `idle_seconds: number`              | Saat user idle X detik                           |
| Event-based   | `event_key` + `metadata_conditions` | Saat event tertentu terjadi                      |

**Event-based trigger dengan metadata matching:**

```json
{
  "trigger_type": "event",
  "event_key": "page_viewed",
  "metadata_conditions": [
    { "field": "screen", "operator": "equals", "value": "service_detail" },
    { "field": "category", "operator": "in", "value": ["cleaning", "laundry"] }
  ]
}
```

**Metadata operators:** `equals`, `not_equals`, `in`, `contains`, `exists`

Triggers bisa di-combine (AND logic): misal "delay 5 detik + event page_viewed screen=home".

### Scheduling

| Field        | Type                             | Keterangan                                         |
| ------------ | -------------------------------- | -------------------------------------------------- |
| start_date   | datetime                         | Kapan mulai aktif                                  |
| end_date     | datetime/null                    | Kapan berakhir (null = manual stop)                |
| time_window  | `{start: "HH:mm", end: "HH:mm"}` | Jam tayang                                         |
| days_of_week | `number[]/null`                  | Hari aktif (0=Minggu..6=Sabtu). Null = setiap hari |

### Frequency Cap

| Field            | Type        | Keterangan                       |
| ---------------- | ----------- | -------------------------------- |
| max_per_day      | number/null | Maks tampil per user per hari    |
| max_per_session  | number/null | Maks per session                 |
| max_lifetime     | number/null | Maks total seumur hidup per user |
| cooldown_minutes | number/null | Jeda minimum antar popup         |

### Priority & Conflict Resolution

- Popup dengan `priority` lebih tinggi ditampilkan duluan
- Hanya 1 popup per trigger event (tidak stack)
- Setelah dismiss/click, popup berikutnya bisa muncul di trigger event selanjutnya

---

## 4. Analytics & Performance Tracking

### Metrics per Popup

| Metric       | Sumber                         | Keterangan                      |
| ------------ | ------------------------------ | ------------------------------- |
| Impressions  | `popup_events` type=impression | Berapa kali ditampilkan         |
| Clicks       | `popup_events` type=click      | Berapa kali CTA di-klik         |
| Dismissals   | `popup_events` type=dismiss    | Berapa kali ditutup             |
| CTR          | calculated                     | clicks / impressions × 100%     |
| Dismiss rate | calculated                     | dismissals / impressions × 100% |
| Conversions  | `popup_events` type=conversion | Action completed setelah klik   |
| CVR          | calculated                     | conversions / clicks × 100%     |

### Conversion Tracking

Popup punya `linked_action`. Saat user klik CTA lalu complete action dalam attribution window → conversion.

| Linked Action Type      | Conversion Event                 |
| ----------------------- | -------------------------------- |
| `voucher_redeem`        | User redeem voucher yang di-link |
| `service_order`         | User order jasa                  |
| `registration_complete` | User selesai registrasi          |
| `custom_event`          | Event key tertentu terjadi       |

**Attribution window:** configurable per popup (default 24 jam).

### Dashboard Views

**Overview (list page):** Tabel semua popup + kolom impressions, clicks, CTR, conversions, CVR.

**Detail analytics (per popup):**

- Line chart: impressions & clicks over time (daily/weekly)
- Breakdown by device (Android vs iOS)
- Breakdown by journey stage
- Breakdown by time of day

**A/B comparison:**

- Side-by-side metrics variant A vs B
- Statistical significance indicator (confidence level)
- Winner recommendation

**Marketing dashboard widget (tambahan):**

- StatCard: "Active Popups" + total impressions bulan ini
- StatCard: "Popup Conversions" bulan ini
- Chart: top performing popups by CVR

---

## 5. CRM Pages & UI Structure

### Pages

| Page                  | Route                                      | Fungsi                       |
| --------------------- | ------------------------------------------ | ---------------------------- |
| List                  | `/dashboard/popup-promotions`              | Tabel + filter + quick stats |
| Create                | `/dashboard/popup-promotions/create`       | Wizard multi-step            |
| Edit                  | `/dashboard/popup-promotions/{id}/edit`    | Same as create, pre-filled   |
| Detail                | `/dashboard/popup-promotions/{id}`         | View config + analytics      |
| A/B Compare           | `/dashboard/popup-promotions/{id}/compare` | Side-by-side A/B results     |
| Event Registry List   | `/dashboard/event-registry`                | Tabel system + custom events |
| Event Registry Create | `/dashboard/event-registry/create`         | Form create custom event     |
| Event Registry Edit   | `/dashboard/event-registry/{id}/edit`      | Edit custom event            |

### Create/Edit Wizard Steps

1. **Basic Info** — name, content_type, priority
2. **Content** — template selector / image upload / canvas editor / HTML editor
3. **Targeting & Triggers** — user type, journey stage, device, segment, trigger rules, frequency cap
4. **Scheduling** — start/end date, time window, days of week, A/B test toggle
5. **Review & Publish** — summary, preview, save as draft atau schedule

### List Page Features

- Filter: status, content_type, user_type target, date range
- Quick actions: pause/resume, duplicate, delete
- Inline stats: impressions, CTR per row

### Event Registry

**List page — 2 sections:**

1. **System Events** (read-only, badge "System") — journey funnel events: `user_registered`, `email_verified`, `first_deposit`, `first_transaction`
2. **Custom Events** (CRUD, badge "Custom") — `page_viewed`, `banner_clicked`, `app_opened`, `service_viewed`, dan event lain yang ditambah marketing

**Form fields:** key (slug, unique), label, category (`engagement`/`marketing`/`transaction`), description, status (active/inactive)

### Sidebar Navigation (tambahan di MARKETING_NAV)

- "Popup Promotions" (icon: `Layers`)
- "Event Registry" (icon: `Zap`)

---

## 6. API Contract

### Backoffice Endpoints (CRM)

**Popup Promotions CRUD:**

| Method | Endpoint                                             | Keterangan                                                                                    |
| ------ | ---------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| GET    | `/api/v1/marketing/popup-promotions`                 | List + filter + pagination. Params: `page`, `per_page`, `status`, `content_type`, `user_type` |
| POST   | `/api/v1/marketing/popup-promotions`                 | Create popup                                                                                  |
| GET    | `/api/v1/marketing/popup-promotions/{id}`            | Detail + full config                                                                          |
| PUT    | `/api/v1/marketing/popup-promotions/{id}`            | Update                                                                                        |
| DELETE | `/api/v1/marketing/popup-promotions/{id}`            | Soft delete                                                                                   |
| PATCH  | `/api/v1/marketing/popup-promotions/{id}/status`     | Change status (pause/resume/end)                                                              |
| POST   | `/api/v1/marketing/popup-promotions/{id}/duplicate`  | Duplicate popup                                                                               |
| POST   | `/api/v1/marketing/popup-promotions/{id}/ab-variant` | Create variant B                                                                              |

**Popup Analytics:**

| Method | Endpoint                                                      | Keterangan                     |
| ------ | ------------------------------------------------------------- | ------------------------------ |
| GET    | `/api/v1/marketing/popup-promotions/{id}/analytics`           | Aggregate metrics              |
| GET    | `/api/v1/marketing/popup-promotions/{id}/analytics/timeline`  | Daily/weekly chart data        |
| GET    | `/api/v1/marketing/popup-promotions/{id}/analytics/breakdown` | By device, journey stage, time |
| GET    | `/api/v1/marketing/popup-promotions/{id}/compare`             | A/B comparison                 |

**Event Registry:**

| Method | Endpoint                                | Keterangan                                |
| ------ | --------------------------------------- | ----------------------------------------- |
| GET    | `/api/v1/marketing/event-registry`      | List all. Params: `category`, `is_system` |
| POST   | `/api/v1/marketing/event-registry`      | Create custom event                       |
| PUT    | `/api/v1/marketing/event-registry/{id}` | Update custom event                       |
| DELETE | `/api/v1/marketing/event-registry/{id}` | Delete (system events blocked)            |

### Mobile App Endpoints (Client-facing)

| Method | Endpoint                                | Keterangan                         |
| ------ | --------------------------------------- | ---------------------------------- |
| GET    | `/api/v1/client/popups/eligible`        | Popup eligible untuk user saat ini |
| POST   | `/api/v1/client/popups/{id}/impression` | Track impression                   |
| POST   | `/api/v1/client/popups/{id}/click`      | Track click                        |
| POST   | `/api/v1/client/popups/{id}/dismiss`    | Track dismiss                      |
| POST   | `/api/v1/client/events`                 | Generic event ingestion            |

**GET `/eligible` response:**

```json
{
  "data": {
    "id": "uuid",
    "content_type": "canvas",
    "content_config": { "..." },
    "trigger_config": { "..." },
    "linked_action": { "type": "deeplink", "value": "..." },
    "ab_variant": "A"
  }
}
```

**POST `/events` request:**

```json
{
  "event_key": "page_viewed",
  "metadata": {
    "screen": "service_detail",
    "service_id": 42,
    "category": "cleaning"
  }
}
```

---

## Key Design Decisions

1. **Monolithic approach** — all logic in CRM, consistent with existing patterns
2. **System events = journey funnel only** — `user_registered`, `email_verified`, `first_deposit`, `first_transaction` (read-only in registry)
3. **`page_viewed` = custom event** — fired by mobile app, editable in registry
4. **Location/city skipped** — no city data in current system
5. **Event registry** — master data for configurable events, reusable across popup triggers and analytics
6. **Canvas editor extends BannerEditor** — reuse existing drag & drop infrastructure
7. **Platform-agnostic API** — designed for mobile first, web can consume same endpoints later
8. **JSON config over rendered images** — mobile app renders natively from config (except HTML mode → WebView)
