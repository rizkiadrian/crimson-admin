# Implementation Plan: Sales Activities Timeline List Page

## Overview

Implementasi halaman daftar Sales Activities dalam format timeline/list view dengan infinite scroll. Pendekatan incremental: mulai dari service layer (types + API), lalu custom hook, helper functions, komponen timeline, halaman utama, dan terakhir routing + sidebar integration. Setiap langkah membangun di atas langkah sebelumnya sehingga tidak ada kode yang orphan.

## Tasks

- [x] 1. Buat service layer untuk activity logs
  - [x] 1.1 Buat type definitions di `src/services/sales/activity-logs/activity-logs.types.ts`
    - Definisikan `ActivityLogType`, `ActivityLogStatus`, `IActivityLogLead`, `IActivityLog`, `IActivityLogParams`
    - Ikuti pola yang ada di `src/services/sales/active-leads/active-leads.types.ts`
    - `IActivityLogParams` extends `IPaginationParams` dari `@services/general`
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_
  - [x] 1.2 Buat service functions di `src/services/sales/activity-logs/activity-logs.service.ts`
    - Implementasi `activityLogsService.getActivityLogs(params)` yang memanggil `GET /sales/activity-logs`
    - Return type `IApiListResponse<IActivityLog, IPaginationMeta>`
    - Ikuti pola `activeLeadsService` yang sudah ada
    - _Requirements: 1.1, 3.1_
  - [x] 1.3 Buat barrel export di `src/services/sales/activity-logs/index.ts`
    - Re-export semua dari types dan service files
    - _Requirements: 1.1_

- [x] 2. Buat `useInfiniteScroll` hook
  - [x] 2.1 Implementasi hook di `src/lib/hooks/use-infinite-scroll.ts`
    - Gunakan `useReducer` + `queueMicrotask` untuk React 19 compliance (ikuti pola `useDetailData`)
    - State machine: `idle` → `loading` → `success`/`error`, `success` → `loading_more` → `success`/`load_more_error`
    - `loadMore` mengappend data baru ke array existing (bukan replace)
    - `handleSearch` mereset data ke `[]`, page ke `1`, dan sync ke URL `?search=`
    - IntersectionObserver via `useEffect` pada `sentinelRef`, hanya trigger jika `hasMore && !isFetchingMore`
    - `hasMore` dihitung dari `current_page < last_page`
    - URL sync menggunakan `useSearchParams` + `useRouter` + `usePathname`
    - Baca URL `?search=` saat mount untuk inisialisasi search query
    - Debounce sudah ditangani oleh `SearchInput` component, hook tidak perlu debounce sendiri
    - _Requirements: 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 6.1, 6.2, 6.3, 7.2, 7.3_
  - [ ]\* 2.2 Write property test: search resets accumulated data and page
    - **Property 3: Search change resets accumulated data and page**
    - **Validates: Requirements 2.4, 2.5**
  - [ ]\* 2.3 Write property test: infinite scroll appends data correctly
    - **Property 4: Infinite scroll appends data correctly**
    - **Validates: Requirements 3.3**
  - [ ]\* 2.4 Write property test: hasMore boundary check
    - **Property 5: hasMore boundary check**
    - **Validates: Requirements 3.5**
  - [ ]\* 2.5 Write property test: loading guard prevents duplicate fetches
    - **Property 6: Loading guard prevents duplicate fetches**
    - **Validates: Requirements 3.6**
  - [ ]\* 2.6 Write property test: existing data preservation invariant
    - **Property 7: Existing data preservation invariant**
    - **Validates: Requirements 4.2, 6.2**
  - [ ]\* 2.7 Write property test: search URL sync round-trip
    - **Property 8: Search URL sync round-trip**
    - **Validates: Requirements 7.2, 7.3**

- [x] 3. Checkpoint — Pastikan service layer dan hook tidak ada TypeScript error
  - Jalankan `npx tsc --noEmit` dan pastikan tidak ada error
  - Tanyakan ke user jika ada pertanyaan

- [x] 4. Buat helper functions dan timeline components
  - [x] 4.1 Buat helper functions di `src/app/(dashboard)/sales-activities/_partials/activity-card/activity-card.tsx` (atau file utils terpisah)
    - `formatRelativeTime(isoString: string): string` — konversi ISO timestamp ke waktu relatif Bahasa Indonesia ("Baru saja", "X menit lalu", "X jam lalu", "X hari lalu", "X minggu lalu", "X bulan lalu")
    - `getActivityTypeConfig(type: ActivityLogType)` — return `{ icon, label, bgColor, iconColor }` mapping untuk setiap tipe
    - `getStatusBadgeConfig(status: ActivityLogStatus)` — return `{ label, variant }` mapping untuk setiap status
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_
  - [ ]\* 4.2 Write property test: activity log sort order is descending
    - **Property 1: Activity log sort order is descending by created_at**
    - **Validates: Requirements 1.1**
  - [x] 4.3 Buat `ActivityCard` component di `src/app/(dashboard)/sales-activities/_partials/activity-card/activity-card.tsx`
    - Terima prop `activity: IActivityLog`
    - Tampilkan Type Icon (lucide icons: `FileText`, `UserPlus`, `RefreshCw`) dengan warna background sesuai tipe
    - Tampilkan judul, Status Badge (gunakan `Badge` dari `@app/components/ui/Table`), nama lead (jika ada), dan waktu relatif
    - Buat barrel export di `_partials/activity-card/index.ts`
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_
  - [ ]\* 4.4 Write property test: activity card renders all required fields
    - **Property 2: Activity card renders all required fields**
    - **Validates: Requirements 1.2**
  - [x] 4.5 Buat `ActivityCardSkeleton` component di `src/app/(dashboard)/sales-activities/_partials/activity-card-skeleton/activity-card-skeleton.tsx`
    - Skeleton placeholder yang menyerupai bentuk ActivityCard
    - Buat barrel export di `_partials/activity-card-skeleton/index.ts`
    - _Requirements: 4.1_
  - [x] 4.6 Buat `ActivityTimeline` container component di `src/app/(dashboard)/sales-activities/_partials/activity-timeline/activity-timeline.tsx`
    - Terima prop `items: IActivityLog[]`
    - Render daftar `ActivityCard` dalam layout timeline vertikal
    - Buat barrel export di `_partials/activity-timeline/index.ts`
    - _Requirements: 1.1, 1.2_

- [x] 5. Implementasi halaman utama Sales Activities
  - [x] 5.1 Buat page component di `src/app/(dashboard)/sales-activities/page.tsx`
    - Gunakan `useInfiniteScroll` hook dengan `activityLogsService.getActivityLogs` sebagai fetcher
    - Render page header dengan judul "Sales Activities" dan tombol "+ New Report" (link ke `/sales-activities/create`)
    - Render `SearchInput` di bagian atas dengan `value={searchQuery}` dan `onSearch={handleSearch}`
    - Render `ActivityTimeline` untuk menampilkan data
    - Render skeleton loading state (beberapa `ActivityCardSkeleton`) saat `isInitialLoad`
    - Render empty state dengan pesan "Belum ada aktivitas" (no data) atau "Tidak ada hasil ditemukan" (no search results) menggunakan `EmptyState` component
    - Render error state dengan pesan deskriptif dan tombol retry saat initial error
    - Render loading more indicator (spinner/skeleton kecil) saat `isFetchingMore`
    - Render inline error + tombol "Coba Lagi" saat `loadMoreError`
    - Render scroll sentinel `<div ref={sentinelRef} />` saat `hasMore && !isFetchingMore`
    - _Requirements: 1.1, 2.1, 2.2, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 7.1_

- [x] 6. Routing dan sidebar integration
  - [x] 6.1 Update `src/config/routing.ts`
    - Tambahkan `SALES_ACTIVITIES_SERVICES` dengan `salesActivities: "/sales-activities"` dan `salesActivitiesCreate: "/sales-activities/create"`
    - Spread ke `PATHS` export
    - _Requirements: 7.1_
  - [x] 6.2 Update sidebar navigation di `src/app/components/layout/Sidebar/Sidebar.tsx`
    - Ubah `SALES_NAVS` entry "Sales Activity Report" dari `href: PATHS.leads` ke `href: PATHS.salesActivities`
    - Import ikon yang sesuai (misalnya `FileText` dari lucide-react)
    - _Requirements: 7.1_

- [x] 7. Final checkpoint — Verifikasi TypeScript dan integrasi
  - Jalankan `npx tsc --noEmit` dan pastikan tidak ada TypeScript error
  - Pastikan semua requirements ter-cover oleh implementasi
  - Tanyakan ke user jika ada pertanyaan

- [x] 8. Update dokumentasi
  - [x] 8.1 Update `docs/PRD.md` — Tambahkan modul Sales Activities (timeline list page, infinite scroll, search)
  - [x] 8.2 Update `docs/ARCHITECTURE.md` — Tambahkan `useInfiniteScroll` hook, service layer `sales/activity-logs/`, dan partials structure ke project structure
  - [x] 8.3 Update `README.md` (frontend) — Tambahkan Sales Activities ke Feature Status table
  - [x] 8.4 Update `CLAUDE.md` (frontend) — Tambahkan info Sales Activities page, `useInfiniteScroll` hook, dan timeline component pattern
  - [x] 8.5 Update `docs/DESIGN_SYSTEM.md` — Tambahkan ActivityCard dan ActivityTimeline component jika ada visual baru yang reusable
  - [x] 8.6 Buat showcase di `/design-system` page — Tambahkan section ActivityCard/ActivityTimeline showcase di `src/app/design-system/` (buat `activity-card-showcase/` component, import di `page.tsx`)

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Setiap task mereferensikan requirements spesifik untuk traceability
- Checkpoints memastikan validasi incremental
- Property tests memvalidasi correctness properties universal dari design document
- Backend API (`GET /api/v1/sales/activity-logs`) sudah tersedia, tidak perlu perubahan backend
- Gunakan komponen UI yang sudah ada (`Button`, `Badge`, `SearchInput`, `EmptyState`) — jangan buat native HTML elements
