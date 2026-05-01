# Implementation Plan: Service Category Management

## Overview

Implementasi fitur Service Category Management yang memungkinkan Backoffice User mengelola kategori layanan (bidang) melalui antarmuka CRUD di CRM (Next.js). Backend Laravel sudah memiliki API endpoint CRUD lengkap di `/api/v1/backoffice/service-categories`, sehingga implementasi fokus sepenuhnya di frontend CRM.

Fitur mencakup: service layer (typed wrapper), list page dengan search/pagination/status toggle/delete, create page dengan form + SVG icon upload, edit page dengan "Page + Inner Form" split pattern, sidebar navigation (group "Master Data" baru), dan routing configuration. Mengikuti pattern yang sudah ada di banner-management dan deposit-request-management.

## Tasks

- [x] 1. Frontend: Service Layer — Service Categories
  - [x] 1.1 Buat type definitions di `src/services/backoffice/service-categories/service-categories.types.ts`
    - Type `CategoryType = "general" | "daily" | "monthly" | "popular"`
    - Interface `IServiceCategory` dengan fields: `id` (number), `name`, `slug`, `description` (string | null), `icon` (string | null — full URL dari backend accessor), `types` (CategoryType[] | null), `is_active` (boolean), `created_at`, `updated_at`
    - Interface `IServiceCategoryParams` extends `IPaginationParams` (extensible untuk future filters)
    - _Requirements: 1.6_

  - [x] 1.2 Buat service functions di `src/services/backoffice/service-categories/service-categories.service.ts`
    - `serviceCategoriesService.list(params)` → `api.get("/backoffice/service-categories", { params })`
    - `serviceCategoriesService.detail(id)` → `api.get(\`/backoffice/service-categories/${id}\`)`
    - `serviceCategoriesService.create(data)` → `api.post("/backoffice/service-categories", data)` (FormData untuk icon upload)
    - `serviceCategoriesService.update(id, data)` → `api.post(\`/backoffice/service-categories/${id}\`, data)`(POST with`\_method=PUT` untuk multipart FormData)
    - `serviceCategoriesService.delete(id)` → `api.delete(\`/backoffice/service-categories/${id}\`)`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 1.3 Buat barrel export di `src/services/backoffice/service-categories/index.ts`
    - Re-export semua dari types dan service files
    - _Requirements: 1.1_

- [x] 2. Frontend: Routing dan Sidebar Navigation
  - [x] 2.1 Update `src/config/routing.ts`
    - Tambah `SERVICE_CATEGORIES_SERVICES` dengan:
      - `serviceCategories: "/dashboard/service-categories"`
      - `serviceCategoryCreate: "/dashboard/service-categories/create"`
      - `serviceCategoryEdit: (id: number) => \`/dashboard/service-categories/${id}/edit\``
    - Spread ke `PATHS` export
    - _Requirements: 6.1, 6.2_

  - [x] 2.2 Update sidebar navigation di `src/app/components/layout/Sidebar/Sidebar.tsx`
    - Tambah `MASTER_DATA_NAV` NavGroup baru dengan label "Master Data", icon `Database` dari lucide-react
    - Item: `{ label: "Service Categories", href: PATHS.serviceCategories, icon: FolderTree }`
    - Insert ke backoffice nav array antara `ANALYTICS_NAV` dan `OTHER_NAVS` (setelah Analytics, sebelum Banners/Reports/Notifikasi)
    - Import `Database` dan `FolderTree` dari lucide-react
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 3. Checkpoint — Service layer dan routing frontend selesai
  - Jalankan `npx tsc --noEmit` di `lingkar-crm/` untuk memastikan tidak ada type error
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Frontend: Service Category List Page
  - [x] 4.1 Buat page component di `src/app/(dashboard)/dashboard/service-categories/page.tsx`
    - Gunakan `useTableData` hook dengan `serviceCategoriesService.list`
    - `TableCard` dengan kolom: icon (thumbnail via Next.js `<Image>` dengan `unoptimized` untuk SVG), name, slug, types (sebagai badges), status (badge active/inactive), created date, actions
    - `SearchInput` untuk search by name via API search parameter
    - Tombol "Create Service Category" di header yang navigasi ke `PATHS.serviceCategoryCreate`
    - Actions per row:
      - Toggle status (kirim update request ke API untuk toggle `is_active`)
      - Edit (link ke `PATHS.serviceCategoryEdit(id)` dengan `returnPage` query parameter)
      - Delete (dengan `ConfirmDialog` sebelum mengirim delete request)
    - Success/error notification via `useNotificationStore` untuk toggle status dan delete
    - Refresh table data setelah toggle status atau delete berhasil
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 8.1, 8.2, 8.3, 8.4_

- [x] 5. Frontend: Service Category Create Page
  - [x] 5.1 Buat page component di `src/app/(dashboard)/dashboard/service-categories/create/page.tsx`
    - `FormCard` dengan fields:
      - **Name** — `FormInput` (required, max 255 chars)
      - **Description** — `FormInput` atau textarea (optional)
      - **Icon** — File upload input (accept SVG only: `.svg`, max 2MB) dengan preview
      - **Types** — Multi-checkbox group: general, daily, monthly, popular (menggunakan native checkbox styled dengan Tailwind, bukan `FormSelect`)
      - **Is Active** — Toggle/checkbox (default: false)
    - Client-side validation sebelum submit:
      - Name tidak boleh kosong
      - Name tidak boleh melebihi 255 karakter
      - Icon file harus SVG format (mimes: svg, mimetype: image/svg+xml)
      - Icon file tidak boleh melebihi 2MB
    - Submit: build `FormData`, panggil `serviceCategoriesService.create(data)`
    - Untuk types array: append setiap type value ke FormData (e.g., `types[]`)
    - Success: `showNotification` success toast + `router.push(PATHS.serviceCategories)`
    - Error 422: `handleFormError(err, setFormErrors)` untuk field-level errors
    - Error non-422: `showNotification(err.message, "error")` untuk general error toast
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 6. Frontend: Service Category Edit Page
  - [x] 6.1 Buat page component di `src/app/(dashboard)/dashboard/service-categories/[id]/edit/page.tsx`
    - Gunakan "Page + Inner Form" split pattern (React 19 compliance):
      - **Outer Page Component**: Fetch data via `useDetailData` dengan `serviceCategoriesService.detail`, tampilkan loading/error states
      - **Inner Form Component**: Terima `initialData` sebagai prop, pre-populate form fields
    - Form fields sama dengan Create Page: name, description, icon, types, is_active
    - Tampilkan preview icon yang sudah ada (jika ada) menggunakan Next.js `<Image>` dengan `unoptimized`
    - File upload icon opsional (hanya jika ingin mengganti icon yang ada)
    - Submit: build `FormData` dengan `_method=PUT`, panggil `serviceCategoriesService.update(id, data)`
    - Success: `showNotification` success toast + navigate back ke list page dengan preserved `returnPage` parameter
    - Error handling sama dengan Create Page (422 → field errors, non-422 → toast)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

- [x] 7. Checkpoint — Frontend pages selesai
  - Jalankan `npx tsc --noEmit` di `lingkar-crm/` untuk memastikan tidak ada TypeScript error
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Property-Based Tests
  - [x] 8.1 Write property test untuk types array JSON round-trip
    - **Property 1: Types array JSON round-trip**
    - Generate random arrays dari valid `CategoryType` values (subset dari {"general", "daily", "monthly", "popular"}, termasuk empty array)
    - Serialize via `JSON.stringify` dan deserialize via `JSON.parse`
    - Verify hasil deep equal dengan array original
    - Buat test file di `src/services/backoffice/service-categories/__tests__/service-categories.properties.test.ts`
    - Gunakan `fast-check` library dengan minimum 100 iterasi
    - Tag: **Feature: service-category-management, Property 1: Types array JSON round-trip**
    - **Validates: Requirements 7.6**

- [x] 9. Unit Tests
  - [x] 9.1 Write unit tests untuk service layer
    - Buat test file di `src/services/backoffice/service-categories/__tests__/service-categories.service.test.ts`
    - Test `list()` calls correct endpoint with params
    - Test `detail()` calls correct endpoint with id
    - Test `create()` sends FormData to correct endpoint
    - Test `update()` sends FormData with `_method=PUT`
    - Test `delete()` calls correct endpoint
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 9.2 Write unit tests untuk list page
    - Buat test file di `src/app/(dashboard)/dashboard/service-categories/__tests__/page.test.tsx`
    - Test renders table dengan correct columns
    - Test search input triggers API call
    - Test delete action shows ConfirmDialog
    - Test status toggle sends update request
    - _Requirements: 2.1, 2.2, 2.6, 2.7, 8.2, 8.3_

  - [x] 9.3 Write unit tests untuk create page
    - Buat test file di `src/app/(dashboard)/dashboard/service-categories/__tests__/create-page.test.tsx`
    - Test renders all form fields
    - Test client-side validation (empty name, invalid icon format, icon size)
    - Test successful submission navigates to list
    - Test 422 errors show field-level messages
    - _Requirements: 3.1, 3.2, 3.4, 3.5, 7.1, 7.3_

  - [x] 9.4 Write unit tests untuk edit page
    - Buat test file di `src/app/(dashboard)/dashboard/service-categories/__tests__/edit-page.test.tsx`
    - Test fetches and pre-populates form data
    - Test shows existing icon preview
    - Test successful update navigates back with returnPage
    - Test loading and error states render correctly
    - _Requirements: 4.1, 4.2, 4.4, 4.6_

- [x] 10. Checkpoint — Tests selesai
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Dokumentasi
  - [x] 11.1 Update dokumentasi frontend (`lingkar-crm/`)
    - Update `docs/PRD.md`: tambah modul Service Category Management (list, create, edit, status toggle, delete)
    - Update `docs/ARCHITECTURE.md`: tambah service-categories service layer, routing updates, Master Data nav group, project structure
    - Update `docs/DESIGN_SYSTEM.md`: update jika ada komponen baru atau perubahan visual
    - Update `README.md`: tambah Service Category Management ke Feature Status table
    - Update `CLAUDE.md`: tambah info Service Category Management pages, service layer, sidebar Master Data group, serviceCategoriesService documentation
    - _Requirements: 2.1, 3.1, 4.1, 5.1, 6.1_

  - [x] 11.2 Update Postman collection (`lingkar-id-backend/postman/Lingkar_ID_API.postman_collection.json`)
    - Tambah/verifikasi folder "Service Categories" dengan semua endpoint:
      - `GET /api/v1/backoffice/service-categories` (list with pagination + search)
      - `GET /api/v1/backoffice/service-categories/{id}` (detail)
      - `POST /api/v1/backoffice/service-categories` (create with FormData)
      - `PUT /api/v1/backoffice/service-categories/{id}` (update with FormData)
      - `DELETE /api/v1/backoffice/service-categories/{id}` (delete)
    - Setiap request harus memiliki contoh body/params yang sesuai
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 11.3 Validasi Postman collection JSON
    - Jalankan: `python3 -c "import json; json.load(open('lingkar-id-backend/postman/Lingkar_ID_API.postman_collection.json')); print('Valid')"`
    - Pastikan output "Valid" tanpa error
    - _Requirements: 1.1_

- [x] 12. Final checkpoint — Semua selesai
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks bertanda `*` bersifat opsional dan bisa di-skip untuk implementasi lebih cepat
- Setiap task mereferensikan requirements spesifik untuk traceability
- Backend API sudah ada dan tidak perlu modifikasi — semua tasks fokus di frontend CRM
- Checkpoints memastikan validasi incremental di setiap fase
- Property test memvalidasi 1 correctness property dari design document (types array JSON round-trip)
- Mengikuti pattern banner-management untuk CRUD dengan file upload (FormData + `_method=PUT`)
- Icon SVG menggunakan Next.js `<Image>` dengan `unoptimized` prop (SVG tidak perlu image optimizer)
- Types field menggunakan multi-checkbox (bukan multi-select) karena hanya 4 opsi
- Status toggle langsung di list page mengikuti pattern banner management
- Sidebar menambahkan group "Master Data" baru (setelah Analytics, sebelum Banners/Reports)
- Frontend menggunakan component system project (Button, FormInput, FormCard, TableCard, DetailCard, Badge, ConfirmDialog, SearchInput) — jangan gunakan native HTML elements
- Format tanggal mengikuti pattern yang sudah ada di project
- `id` menggunakan `number` (integer), bukan UUID — berbeda dengan Banner yang menggunakan UUID
