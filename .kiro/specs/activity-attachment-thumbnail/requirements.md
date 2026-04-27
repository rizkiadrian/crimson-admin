# Requirements Document

## Introduction

Fitur ini menambahkan tampilan thumbnail attachment pada ActivityCard di timeline Sales Activities. Saat ini, field `attachment` pada `activity_logs` menyimpan path file tetapi tidak ditampilkan di frontend. Fitur ini mencakup:

1. Backend: generate thumbnail (versi kecil) saat upload gambar agar timeline tidak memuat gambar full-size
2. Frontend: tampilkan thumbnail preview di ActivityCard untuk attachment gambar
3. Frontend: tampilkan file icon/badge untuk attachment non-gambar (PDF, DOC, dll)

## Glossary

- **Thumbnail_Generator**: Service backend yang bertanggung jawab membuat versi thumbnail dari gambar yang diupload menggunakan Intervention Image library
- **ActivityCard**: Komponen UI di frontend yang menampilkan satu item activity log dalam timeline
- **Activity_Log_Service**: Service backend (`ActivityLogService`) yang menangani CRUD activity logs termasuk upload attachment
- **Thumbnail**: Versi gambar berukuran kecil (max 200x200 pixel) yang dihasilkan dari gambar asli untuk ditampilkan di timeline
- **Attachment_URL**: URL publik lengkap untuk mengakses file attachment melalui Laravel Storage public disk
- **Thumbnail_URL**: URL publik lengkap untuk mengakses file thumbnail yang telah di-generate
- **Image_Attachment**: File attachment dengan MIME type gambar (jpeg, png, gif, webp)
- **Non_Image_Attachment**: File attachment dengan MIME type selain gambar (pdf, doc, docx, xls, xlsx, dll)

## Requirements

### Requirement 1: Backend Thumbnail Generation (Effort: Medium)

**User Story:** Sebagai developer, saya ingin backend otomatis membuat thumbnail saat gambar diupload, sehingga timeline tidak perlu memuat gambar full-size yang berat.

#### Acceptance Criteria

1. WHEN an Image_Attachment is uploaded, THE Thumbnail_Generator SHALL create a Thumbnail with maximum dimensions of 200x200 pixels while preserving the aspect ratio
2. WHEN an Image*Attachment is uploaded, THE Thumbnail_Generator SHALL store the Thumbnail in the same storage directory with a `thumb*` prefix on the filename
3. WHEN a Non_Image_Attachment is uploaded, THE Thumbnail_Generator SHALL skip thumbnail generation and store only the original file
4. IF the Thumbnail_Generator fails to create a Thumbnail, THEN THE Activity_Log_Service SHALL still save the activity log with the original attachment path and log the error
5. WHEN an activity log with an Image_Attachment is updated with a new attachment, THE Thumbnail_Generator SHALL delete the old Thumbnail and generate a new one
6. WHEN an activity log with an Image_Attachment is updated with a new attachment, THE Activity_Log_Service SHALL delete the old original attachment file

### Requirement 2: API Response dengan Thumbnail URL (Effort: Low)

**User Story:** Sebagai frontend developer, saya ingin API mengembalikan URL thumbnail dan attachment URL lengkap, sehingga frontend dapat langsung menampilkan gambar tanpa perlu merakit URL secara manual.

#### Acceptance Criteria

1. THE Activity_Log_Service SHALL include `attachment_url` field in the API response containing the full public URL of the original attachment
2. THE Activity_Log_Service SHALL include `thumbnail_url` field in the API response containing the full public URL of the generated Thumbnail
3. WHEN an activity log has no attachment, THE Activity_Log_Service SHALL return `null` for both `attachment_url` and `thumbnail_url` fields
4. WHEN an activity log has a Non_Image_Attachment, THE Activity_Log_Service SHALL return the `attachment_url` with the file URL and `thumbnail_url` as `null`
5. THE Activity_Log_Service SHALL include `attachment_type` field in the API response with value `image` or `file` to indicate the attachment category

### Requirement 3: Tampilan Thumbnail di ActivityCard (Effort: Medium)

**User Story:** Sebagai sales user, saya ingin melihat preview thumbnail dari gambar yang saya lampirkan di timeline, sehingga saya bisa dengan cepat mengenali attachment tanpa harus membuka detail.

#### Acceptance Criteria

1. WHEN an activity log has an Image_Attachment, THE ActivityCard SHALL display the Thumbnail as a clickable image preview below the description
2. WHEN an activity log has a Non_Image_Attachment, THE ActivityCard SHALL display a file icon badge with the file extension label below the description
3. WHEN an activity log has no attachment, THE ActivityCard SHALL not render any attachment section
4. WHEN the user clicks on a Thumbnail preview, THE ActivityCard SHALL open the full-size image in a new browser tab using the `attachment_url`
5. THE ActivityCard SHALL display the Thumbnail with rounded corners and a maximum width of 120 pixels
6. WHILE the Thumbnail image is loading, THE ActivityCard SHALL display a placeholder skeleton with the same dimensions

### Requirement 4: Supported File Types (Effort: Low)

**User Story:** Sebagai sales user, saya ingin sistem mendukung berbagai format file attachment, sehingga saya bisa melampirkan dokumen apapun yang relevan.

#### Acceptance Criteria

1. THE Thumbnail_Generator SHALL recognize the following MIME types as Image_Attachment: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
2. THE ActivityCard SHALL display distinct file icons for the following Non_Image_Attachment types: PDF, DOC/DOCX, XLS/XLSX, and a generic file icon for other types
3. WHEN a file extension cannot be determined, THE ActivityCard SHALL display a generic file icon with label "FILE"

## Estimasi Effort

| Requirement                           | Effort | Estimasi Kredit | Catatan                                                                          |
| ------------------------------------- | ------ | --------------- | -------------------------------------------------------------------------------- |
| 1. Backend Thumbnail Generation       | Medium | ~3 kredit       | Install Intervention Image, buat ThumbnailService, modifikasi ActivityLogService |
| 2. API Response dengan Thumbnail URL  | Low    | ~1 kredit       | Tambah accessor/append di Model ActivityLog                                      |
| 3. Tampilan Thumbnail di ActivityCard | Medium | ~3 kredit       | Modifikasi ActivityCard component, tambah skeleton loading, click handler        |
| 4. Supported File Types               | Low    | ~1 kredit       | Konfigurasi MIME type mapping dan file icon mapping                              |

**Total estimasi: ~8 kredit**

### Breakdown per Layer

- **Backend (Laravel):** ~4 kredit
  - Install & configure Intervention Image (~0.5)
  - ThumbnailService class (~1.5)
  - Modifikasi ActivityLogService untuk integrasi thumbnail (~1)
  - Model accessor untuk URL fields (~0.5)
  - Migration untuk `thumbnail` column (opsional, bisa pakai konvensi prefix) (~0.5)

- **Frontend (Next.js):** ~4 kredit
  - Update TypeScript types (`IActivityLog`) (~0.5)
  - Modifikasi ActivityCard component (~2)
  - File icon mapping utility (~0.5)
  - Skeleton loading state (~0.5)
  - Testing & integration (~0.5)
