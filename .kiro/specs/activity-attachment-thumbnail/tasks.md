# Implementation Plan: Activity Attachment Thumbnail

## Overview

Implementasi fitur thumbnail attachment pada timeline Sales Activities. Backend (Laravel) akan generate thumbnail saat gambar diupload menggunakan Intervention Image v3, dan frontend (Next.js) akan menampilkan thumbnail preview atau file icon badge di ActivityCard.

Implementasi dibagi menjadi dua bagian utama: backend (Laravel — `lingkar-id-backend/`) dan frontend (Next.js — `lingkar-crm/`).

## Tasks

- [x] 1. Backend: Install Intervention Image v3 dan buat ThumbnailService
  - [x] 1.1 Install Intervention Image v3 via Composer
    - Jalankan `composer require intervention/image:^3.0` di `lingkar-id-backend/`
    - Pastikan GD atau Imagick driver tersedia
    - _Requirements: 1.1_

  - [x] 1.2 Buat `ThumbnailService` class di `app/Services/Sales/ThumbnailService.php`
    - Implementasi constant `IMAGE_MIMES` dengan `['image/jpeg', 'image/png', 'image/gif', 'image/webp']`
    - Implementasi method `isImage(string $storedPath): bool` — cek MIME type file via Storage
    - Implementasi method `getThumbnailPath(string $originalPath): string` — return path dengan `thumb_` prefix pada filename
    - Implementasi method `generateThumbnail(string $storedPath): ?string` — baca file dari storage, resize max 200×200 dengan `scaleDown()` (preserve aspect ratio), simpan ke path thumbnail, return thumbnail path atau null jika bukan gambar
    - Implementasi method `deleteThumbnail(string $storedPath): void` — hapus thumbnail file dari storage
    - Wrap thumbnail generation dalam try-catch: jika gagal, log error via `Log::error()` dan return null (jangan gagalkan proses utama)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 4.1_

  - [ ]\* 1.3 Write property tests untuk ThumbnailService
    - **Property 2: Thumbnail path derivation** — Untuk berbagai path random, verify `getThumbnailPath()` menghasilkan path di directory yang sama dengan prefix `thumb_` pada filename
    - **Property 3: Image classification correctness** — Untuk berbagai MIME types, verify `isImage()` return true hanya untuk image/jpeg, image/png, image/gif, image/webp
    - Gunakan PHPUnit data providers dengan minimum 100 iterasi per property
    - Buat test file di `tests/Unit/Services/Sales/ThumbnailServiceTest.php`
    - **Validates: Requirements 1.2, 1.3, 4.1**

- [x] 2. Backend: Integrasikan ThumbnailService ke ActivityLogService
  - [x] 2.1 Modifikasi method `handleAttachmentUpload` di `ActivityLogService`
    - Inject `ThumbnailService` via constructor
    - Setelah store original file, panggil `$this->thumbnailService->generateThumbnail($storedPath)`
    - Saat update (delete old attachment), panggil `$this->thumbnailService->deleteThumbnail($oldPath)` sebelum delete original
    - Pastikan jika thumbnail generation gagal, activity log tetap tersimpan dengan attachment path original
    - _Requirements: 1.1, 1.4, 1.5, 1.6_

  - [ ]\* 2.2 Write unit tests untuk integrasi ActivityLogService dengan ThumbnailService
    - Test create flow: upload gambar → thumbnail generated
    - Test create flow: upload non-gambar → thumbnail tidak di-generate
    - Test update flow: ganti attachment → old thumbnail & old file dihapus, new thumbnail generated
    - Test error handling: thumbnail generation gagal → activity log tetap tersimpan
    - Mock ThumbnailService dan Storage di test
    - Buat test file di `tests/Unit/Services/Sales/ActivityLogServiceTest.php`
    - **Validates: Requirements 1.4, 1.5, 1.6**

- [x] 3. Backend: Tambah Model Accessors dan $appends pada ActivityLog
  - [x] 3.1 Tambah accessor dan `$appends` di `app/Models/ActivityLog.php`
    - Tambah `protected $appends = ['attachment_url', 'thumbnail_url', 'attachment_type']`
    - Implementasi `getAttachmentUrlAttribute(): ?string` — return `Storage::disk('public')->url($this->attachment)` jika attachment ada, null jika tidak
    - Implementasi `getThumbnailUrlAttribute(): ?string` — derive thumbnail path dengan `thumb_` prefix, cek apakah file exists di storage, return URL jika ada, null jika tidak
    - Implementasi `getAttachmentTypeAttribute(): ?string` — return `'image'` jika extension adalah jpeg/jpg/png/gif/webp, `'file'` jika attachment ada tapi bukan gambar, `null` jika tidak ada attachment
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]\* 3.2 Write property tests untuk ActivityLog model accessors
    - **Property 4: URL accessor correctness** — Untuk berbagai state attachment (null, image path, non-image path), verify accessor output sesuai spesifikasi
    - Gunakan PHPUnit data providers dengan minimum 100 iterasi
    - Buat test file di `tests/Unit/Models/ActivityLogTest.php`
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

- [x] 4. Backend: Verifikasi syntax PHP
  - Jalankan `php -l` pada semua file yang dimodifikasi/dibuat:
    - `app/Services/Sales/ThumbnailService.php`
    - `app/Services/Sales/ActivityLogService.php`
    - `app/Models/ActivityLog.php`
  - Pastikan tidak ada syntax error
  - _Requirements: 1.1, 2.1_

- [x] 5. Checkpoint — Backend selesai
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Frontend: Update TypeScript types dan buat file icon utility
  - [x] 6.1 Update `IActivityLog` interface di `src/services/sales/activity-logs/activity-logs.types.ts`
    - Tambah field `attachment_url: string | null`
    - Tambah field `thumbnail_url: string | null`
    - Tambah field `attachment_type: 'image' | 'file' | null`
    - _Requirements: 2.1, 2.2, 2.5_

  - [x] 6.2 Buat file icon mapping utility di `src/app/components/ui/ActivityCard/activity-card-file-icons.ts`
    - Import icon dari `lucide-react` (FileText, File, dll)
    - Definisikan interface `FileIconConfig` dengan `icon`, `label`, `bgColor`, `iconColor`
    - Implementasi function `getFileIconConfig(attachmentUrl: string): FileIconConfig`
    - Mapping: `.pdf` → FileText (red, label "PDF"), `.doc`/`.docx` → FileText (blue, label "DOC"), `.xls`/`.xlsx` → FileText (green, label "XLS"), default → File (gray, label "FILE")
    - Extract extension dari URL, handle case insensitive, handle URL tanpa extension
    - _Requirements: 4.2, 4.3_

  - [ ]\* 6.3 Write property test untuk file icon mapping
    - **Property 5: File icon mapping correctness** — Untuk berbagai URL string random, verify label dan color sesuai extension
    - Gunakan Vitest + fast-check
    - Buat test file di `src/app/components/ui/ActivityCard/__tests__/activity-card-file-icons.test.ts`
    - **Validates: Requirements 4.2, 4.3**

- [x] 7. Frontend: Modifikasi ActivityCard untuk tampilkan attachment preview
  - [x] 7.1 Modifikasi `ActivityCard` component di `src/app/components/ui/ActivityCard/activity-card.tsx`
    - Tambah section attachment preview antara description dan relative time
    - Jika `attachment_type === 'image'` dan `thumbnail_url` ada:
      - Render `<a href={attachment_url} target="_blank" rel="noopener noreferrer">` yang membungkus `<Image>` dari `next/image`
      - `<Image>` menggunakan `thumbnail_url` sebagai src, max width 120px, rounded corners (`rounded-lg`)
      - Tambah skeleton loading state menggunakan state `isLoading` — tampilkan placeholder skeleton dengan dimensi yang sama saat gambar loading
      - Handle `onError` pada `<Image>`: jika thumbnail gagal load, fallback ke file icon display
    - Jika `attachment_type === 'file'` dan `attachment_url` ada:
      - Render file icon badge menggunakan `getFileIconConfig()` dari utility
      - Tampilkan icon dengan background color dan label extension
      - Bungkus dalam `<a href={attachment_url} target="_blank" rel="noopener noreferrer">` agar bisa didownload
    - Jika tidak ada attachment (`attachment_type === null`): tidak render apa-apa
    - Gunakan `<Image>` dari `next/image` (BUKAN `<img>` native — sesuai component rules)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ]\* 7.2 Write unit tests untuk ActivityCard attachment rendering
    - Test render image attachment: verify thumbnail image ditampilkan dengan link ke full-size
    - Test render file attachment: verify file icon badge ditampilkan dengan label yang benar
    - Test render tanpa attachment: verify tidak ada attachment section
    - Test skeleton loading state
    - Test onError fallback
    - Buat test file di `src/app/components/ui/ActivityCard/__tests__/activity-card.test.tsx`
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

- [x] 8. Frontend: Update next.config.ts jika diperlukan
  - Periksa `next.config.ts` — entry `localhost:8000/storage/**` sudah ada untuk development
  - Jika ada production hostname untuk storage (misalnya S3 atau domain production), tambahkan remotePatterns entry baru
  - Jika tidak ada production hostname yang diketahui, skip — konfigurasi existing sudah cukup untuk development
  - _Requirements: 3.1_

- [x] 9. Frontend: Verifikasi TypeScript
  - Jalankan `npx tsc --noEmit` di `lingkar-crm/` untuk memastikan tidak ada type error
  - Fix semua error yang ditemukan
  - _Requirements: 3.1, 4.2_

- [x] 10. Checkpoint — Frontend selesai
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Dokumentasi
  - [x] 11.1 Update dokumentasi backend (`lingkar-id-backend/`)
    - Update `README.md`: tambah info ThumbnailService di Project Structure, update API response fields
    - Update `CLAUDE.md`: tambah ThumbnailService di API Modules table jika ada
    - _Requirements: 1.1, 2.1_

  - [x] 11.2 Update dokumentasi frontend (`lingkar-crm/`)
    - Update `README.md`: tambah info file icon utility dan perubahan ActivityCard
    - Update `docs/PRD.md`: tambah acceptance criteria untuk attachment thumbnail feature
    - Update `docs/DESIGN_SYSTEM.md`: tambah dokumentasi ActivityCard attachment preview variant
    - Update `docs/ARCHITECTURE.md`: tambah info tentang thumbnail flow jika relevan
    - _Requirements: 3.1, 4.2_

- [x] 12. Final checkpoint — Semua selesai
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks bertanda `*` bersifat opsional dan bisa di-skip untuk implementasi lebih cepat
- Setiap task mereferensikan requirements spesifik untuk traceability
- Backend tasks (1-5) harus diselesaikan sebelum frontend tasks (6-10) karena frontend bergantung pada API response baru
- Checkpoints memastikan validasi incremental di setiap fase
- Property tests memvalidasi correctness properties universal dari design document
- Unit tests memvalidasi contoh spesifik dan edge cases
- Dokumentasi update wajib dilakukan sesuai project rules (AGENTS.md)
