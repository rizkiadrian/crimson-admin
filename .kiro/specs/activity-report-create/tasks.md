# Implementation Plan: Activity Report Create Form Enhancement

## Overview

Implementasi form "Create Activity Report" yang berfungsi penuh di `/sales-activities/create`. Pendekatan incremental: mulai dari type correction (`IUserAuth.sales_id`), lalu service layer (`createActivityLog`), kemudian update form component (conditional field, submit logic, error handling), verifikasi backend notification, TypeScript check, dan terakhir update dokumentasi. Setiap langkah membangun di atas langkah sebelumnya.

## Tasks

- [x] 1. Perbaiki tipe `IUserAuth.sales_id` dan tambahkan payload type
  - [x] 1.1 Update `IUserAuth.sales_id` di `src/services/auth/auth.types.ts`
    - Ubah tipe field `sales_id` dari `number | null` menjadi `string | null`
    - Pastikan tidak ada komponen lain yang break akibat perubahan tipe ini
    - _Requirements: 4.1, 4.2_
  - [x] 1.2 Tambahkan `ICreateActivityLogPayload` di `src/services/sales/activity-logs/activity-logs.types.ts`
    - Definisikan interface dengan field: `lead_id?`, `type` (ActivityLogType), `title`, `description?`, `attachment?` (File | null), `metadata?` (dengan `requested_status?` dan `requested_sales_id?`)
    - _Requirements: 1.1, 3.8, 3.9_

- [x] 2. Implementasi service function `createActivityLog`
  - [x] 2.1 Tambahkan `createActivityLog` di `src/services/sales/activity-logs/activity-logs.service.ts`
    - Implementasi fungsi yang menerima `ICreateActivityLogPayload` dan mengirim `POST /sales/activity-logs`
    - Jika `payload.attachment` adalah instance `File`, kirim sebagai `multipart/form-data` (bangun `FormData` object)
    - Jika tidak ada file, kirim sebagai JSON biasa
    - Return type `IApiResponse<IActivityLog>`
    - Import `IApiResponse` dari `@services/general` dan `ICreateActivityLogPayload` dari types
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 3. Checkpoint — Pastikan service layer tidak ada TypeScript error
  - Jalankan `npx tsc --noEmit` dan pastikan tidak ada error
  - Tanyakan ke user jika ada pertanyaan

- [x] 4. Update form component `CreateSalesActivityReportPage`
  - [x] 4.1 Update imports dan state di `src/app/(dashboard)/sales-activities/create/page.tsx`
    - Import `activityLogsService` dan `ICreateActivityLogPayload` dari `@services/sales/activity-logs`
    - Import `useUserProfile` dari `@store/useUserProfile`
    - Import `useNotificationStore` dari `@store/useNotificationStore`
    - Import `handleFormError` dari `@lib/utils`
    - Import `PATHS` dari `@config/routing`
    - Import `ActivityLogType` dari types dan gunakan di `ActivityReportForm` interface (ganti `type: string` → `type: ActivityLogType`)
    - Inisialisasi `showNotification` dari `useNotificationStore`
    - Inisialisasi `profile` dari `useUserProfile`
    - _Requirements: 2.3, 3.1, 3.2, 3.3, 3.4, 3.5_
  - [x] 4.2 Implementasi conditional "Requested Sales Member ID" field
    - Ganti `FormInput` yang ada untuk `metadata.requested_sales_id` menjadi read-only field
    - Auto-populate value dari `profile?.sales_id` saat tipe `request_lead_assign` dipilih
    - Set attribute `readOnly` pada input dan tambahkan visual styling yang menunjukkan field tidak bisa diedit
    - Jika `profile?.sales_id` bernilai `null` atau `undefined`, tampilkan placeholder "Sales ID tidak tersedia"
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  - [x] 4.3 Implementasi submit handler lengkap
    - Validasi client-side: title tidak boleh kosong (trim whitespace)
    - Bangun payload `ICreateActivityLogPayload` dari form state
    - Saat tipe `request_lead_assign`, sertakan `metadata.requested_sales_id` dengan nilai `profile?.sales_id`
    - Saat tipe `request_update_lead_status`, sertakan `metadata.requested_status`
    - Panggil `activityLogsService.createActivityLog(payload)`
    - Sukses: tampilkan toast success via `showNotification(resp.message, "success")` lalu `router.push(PATHS.salesActivities)`
    - Error 422: gunakan `handleFormError(err, setFormErrors)` untuk menampilkan field-level errors
    - Error umum: tampilkan toast error via `showNotification(err.message, "error")`
    - Disable submit button dan tampilkan loading indicator selama proses submit (`isSubmitting` state)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_
  - [ ]\* 4.4 Write property test: Title whitespace rejection
    - **Property 1: Title whitespace rejection**
    - Untuk setiap string yang hanya terdiri dari whitespace characters (termasuk empty string, spaces, tabs, newlines), form HARUS menolak submit dan `activityLogsService` TIDAK boleh dipanggil
    - Gunakan `fast-check` untuk generate arbitrary whitespace strings
    - **Validates: Requirements 3.7**

- [x] 5. Checkpoint — Pastikan form component tidak ada TypeScript error
  - Jalankan `npx tsc --noEmit` dan pastikan tidak ada error
  - Tanyakan ke user jika ada pertanyaan

- [x] 6. Verifikasi backend notification dispatch
  - [x] 6.1 Verifikasi `NotifyBackofficeUsers` job di backend
    - Baca `lingkar-id-backend/app/Services/Sales/ActivityLogService.php` dan konfirmasi bahwa method `createActivityLog` memanggil `NotifyBackofficeUsers::dispatch()`
    - Baca `lingkar-id-backend/app/Jobs/NotifyBackofficeUsers.php` dan konfirmasi bahwa job membuat `BackofficeNotification` record untuk setiap user dengan role `admin` atau `backoffice`
    - Konfirmasi bahwa notification berisi nama sales user, action yang dilakukan, dan judul activity log
    - Dokumentasikan hasil verifikasi sebagai komentar di task ini
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 7. Final checkpoint — Verifikasi TypeScript dan integrasi keseluruhan
  - Jalankan `npx tsc --noEmit` dan pastikan tidak ada TypeScript error di seluruh project
  - Pastikan semua requirements ter-cover oleh implementasi
  - Tanyakan ke user jika ada pertanyaan

- [x] 8. Update dokumentasi
  - [x] 8.1 Update `docs/PRD.md` — Tambahkan fitur Create Activity Report (form submission, conditional fields, error handling, toast notifications)
  - [x] 8.2 Update `docs/ARCHITECTURE.md` — Tambahkan `createActivityLog` service function, payload type, dan data flow form submission ke dokumentasi arsitektur
  - [x] 8.3 Update `README.md` (frontend) — Update Feature Status table untuk mencerminkan fitur Create Activity Report yang sudah berfungsi penuh
  - [x] 8.4 Update `CLAUDE.md` (frontend) — Tambahkan info tentang `createActivityLog` service, `ICreateActivityLogPayload` type, form submission pattern dengan `handleFormError`, dan koreksi tipe `IUserAuth.sales_id`
  - [x] 8.5 Update `docs/DESIGN_SYSTEM.md` — Dokumentasikan pola read-only FormInput field jika belum ada
  - [x] 8.6 Update `/design-system` showcase — Tambahkan contoh read-only FormInput di showcase page `src/app/design-system/` jika pola ini baru

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Setiap task mereferensikan requirements spesifik untuk traceability
- Checkpoints memastikan validasi incremental
- Property test memvalidasi correctness property dari design document (whitespace title rejection)
- Backend API (`POST /api/v1/sales/activity-logs`) sudah tersedia — tidak perlu perubahan backend
- Gunakan komponen UI yang sudah ada (`Button`, `FormInput`, `FormSelect`, `FormCard`) — jangan buat native HTML elements
- Ikuti pola error handling yang sudah ada: `handleFormError` untuk 422, `showNotification` untuk error umum
- `IUserAuth.sales_id` harus diubah ke `string | null` karena backend mengembalikan format string "SLS-XXXX"
