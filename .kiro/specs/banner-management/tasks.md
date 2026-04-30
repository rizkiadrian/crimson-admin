# Implementation Plan: Banner Management

## Overview

Implementasi fitur Banner Management yang memungkinkan Backoffice User membuat, mengelola, dan mempublikasikan banner untuk ditampilkan di mobile app. Terdapat dua tipe banner: (1) Image Upload — upload gambar langsung, dan (2) Text Placement — editor canvas di CRM untuk menempatkan elemen teks secara bebas di atas background warna.

Implementasi mencakup tiga bagian utama: backend (Laravel — `lingkar-id-backend/`), frontend (Next.js — `lingkar-crm/`), dan dokumentasi. Backend dikerjakan terlebih dahulu karena frontend bergantung pada API baru.

## Tasks

- [x] 1. Backend: Migration dan Model
  - [x] 1.1 Buat migration `create_banners_table`
    - Kolom: `id` (uuid, primary), `title` (string 100), `type` (enum: image, text_placement), `status` (enum: active, inactive, default inactive), `display_order` (integer, default 0), `image_path` (string, nullable), `background_config` (json, nullable), `text_elements` (json, nullable), `timestamps`, `softDeletes`
    - Tambah composite index pada `['status', 'display_order']`
    - Jalankan migration via `docker exec lingkarid.local php artisan migrate`
    - _Requirements: 1.1, 7.1, 7.2, 10.1, 10.2_

  - [x] 1.2 Buat model `Banner` di `app/Models/Banner.php`
    - UUID primary key (`$keyType = 'string'`, `$incrementing = false`)
    - `$fillable`: `id`, `title`, `type`, `status`, `display_order`, `image_path`, `background_config`, `text_elements`
    - `$casts`: `background_config` → array, `text_elements` → array, `display_order` → integer
    - Accessor `imageUrl()` → return `url('storage/' . $this->image_path)` jika `image_path` ada, null jika tidak
    - `$appends`: `['image_url']`
    - Use `SoftDeletes` trait
    - Scopes: `scopeActive($query)`, `scopeSearch($query, ?string $search)` (ILIKE pada title), `scopeOfType($query, ?string $type)`, `scopeOfStatus($query, ?string $status)`
    - _Requirements: 1.1, 1.5, 1.6, 1.7, 2.5, 7.1, 10.1, 10.2_

  - [x] 1.3 Tambah path `'banners' => 'backoffice/banners'` di `config/filepath.php`
    - _Requirements: 2.5_

- [x] 2. Backend: FormRequests
  - [x] 2.1 Buat `StoreBannerRequest` di `app/Http/Requests/Backoffice/StoreBannerRequest.php`
    - Rules: `title` → required|string|max:100; `type` → required|in:image,text_placement
    - Conditional rules untuk type `image`: `image` → required|file|mimes:jpeg,png,webp|max:2048 + custom dimension validation (1080x608 ±10px tolerance)
    - Conditional rules untuk type `text_placement`: `background_config` → required|array; `background_config.type` → required|in:solid,gradient; `background_config.colors` → required|array; conditional color count validation (1 for solid, 2+ for gradient); `background_config.direction` → required_if:background_config.type,gradient|in:to-right,to-bottom,to-bottom-right; `text_elements` → required|array|min:1; each text element: `content` → required|string|max:200, `position_x` → required|numeric|between:0,100, `position_y` → required|numeric|between:0,100, `font_size` → required|integer|between:12,72, `font_color` → required|string|regex hex, `font_weight` → required|in:normal,bold,semibold
    - _Requirements: 1.6, 1.7, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 10.4_

  - [x] 2.2 Buat `UpdateBannerRequest` di `app/Http/Requests/Backoffice/UpdateBannerRequest.php`
    - Sama seperti StoreBannerRequest tapi image opsional (nullable) untuk type image, dan background_config/text_elements opsional untuk type text_placement
    - _Requirements: 1.4, 2.6, 3.1, 4.2_

  - [x] 2.3 Buat `UpdateBannerStatusRequest` di `app/Http/Requests/Backoffice/UpdateBannerStatusRequest.php`
    - Rules: `status` → required|in:active,inactive
    - _Requirements: 7.4_

  - [x] 2.4 Buat `ReorderBannersRequest` di `app/Http/Requests/Backoffice/ReorderBannersRequest.php`
    - Rules: `banners` → required|array|min:1; `banners.*.id` → required|uuid|exists:banners,id; `banners.*.display_order` → required|integer|min:0
    - _Requirements: 7.5_

- [x] 3. Backend: Service
  - [x] 3.1 Buat `BannerService` di `app/Services/Backoffice/BannerService.php`
    - Use `ApiPaginationTrait`
    - Method `getAllBanners()`: paginated query, eager load nothing (no relations). Support filter: `search` (via `scopeSearch`), `type` (via `scopeOfType`), `status` (via `scopeOfStatus`). Order by `display_order` asc, `created_at` desc.
    - Method `getBannerById(string $id)`: `Banner::findOrFail($id)`
    - Method `createBanner(array $data)`: generate UUID, set `status` default 'inactive', set `display_order` ke `Banner::max('display_order') + 1`. Jika type image → store file via `Storage::disk('public')->putFile(config('filepath.banners'), $data['image'])`, simpan path. Jika type text_placement → simpan `background_config` dan `text_elements` langsung.
    - Method `updateBanner(Banner $banner, array $data)`: Jika type image dan ada file baru → hapus file lama dari storage, store file baru. Jika type text_placement → update `background_config` dan `text_elements` jika ada.
    - Method `deleteBanner(Banner $banner)`: soft delete. Jika type image dan ada `image_path` → hapus file dari storage.
    - Method `updateStatus(Banner $banner, array $data)`: update status field.
    - Method `reorderBanners(array $data)`: loop `$data['banners']`, update `display_order` per banner.
    - Method `getActiveBanners()`: `Banner::active()->orderBy('display_order', 'asc')->get()` — untuk mobile endpoint.
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.5, 2.6, 7.3, 7.4, 7.5, 8.1_

- [x] 4. Backend: Controllers dan Routes
  - [x] 4.1 Buat `BannerController` di `app/Http/Controllers/Api/v1/Backoffice/BannerController.php`
    - Inject `BannerService`
    - `index()` → paginated list via service `getAllBanners()`, return `paginatedResponse`
    - `show(string $id)` → `ApiResponse::success` dari service `getBannerById($id)`
    - `store(StoreBannerRequest $request)` → panggil service `createBanner()`, return `ApiResponse::success` dengan status 201
    - `update(UpdateBannerRequest $request, Banner $banner)` → panggil service `updateBanner()`, return `ApiResponse::success`
    - `destroy(Banner $banner)` → panggil service `deleteBanner()`, return `ApiResponse::success`
    - `updateStatus(UpdateBannerStatusRequest $request, Banner $banner)` → panggil service `updateStatus()`, return `ApiResponse::success`
    - `reorder(ReorderBannersRequest $request)` → panggil service `reorderBanners()`, return `ApiResponse::success`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 7.4, 7.5_

  - [x] 4.2 Buat `ClientBannerController` di `app/Http/Controllers/Api/v1/Client/ClientBannerController.php`
    - Inject `BannerService`
    - `index()` → `ApiResponse::success` dari service `getActiveBanners()`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 4.3 Tambah routes di `routes/api.php`
    - Backoffice routes (di dalam prefix `backoffice`, middleware `role:admin,backoffice`):
      - `GET /backoffice/banners` → `BannerController@index`
      - `GET /backoffice/banners/{banner}` → `BannerController@show`
      - `POST /backoffice/banners` → `BannerController@store`
      - `PUT /backoffice/banners/{banner}` → `BannerController@update`
      - `DELETE /backoffice/banners/{banner}` → `BannerController@destroy`
      - `PATCH /backoffice/banners/{banner}/status` → `BannerController@updateStatus`
      - `PATCH /backoffice/banners/reorder` → `BannerController@reorder`
    - Client routes (di dalam prefix `client`, middleware `role:client`):
      - `GET /client/banners` → `ClientBannerController@index`
    - _Requirements: 1.1, 7.4, 7.5, 8.1, 8.4_

- [x] 5. Backend: Verifikasi syntax PHP
  - Jalankan `php -l` pada semua file baru/dimodifikasi
  - Pastikan tidak ada syntax error
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 7.4, 7.5, 8.1_

- [x] 6. Checkpoint — Backend selesai
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Backend: Property-based tests
  - [x] 7.1 Write property test untuk JSON serialization round-trip
    - **Property 1: Banner data serialization round-trip**
    - Generate random valid text_placement banner data (background_config + text_elements), serialize ke JSON dan deserialize kembali, verify data equivalent
    - Buat test file di `tests/Feature/Backoffice/BackofficeBannerTest.php`
    - **Validates: Requirements 10.3**

  - [x] 7.2 Write property test untuk title validation
    - **Property 2: Title validation rejects invalid lengths**
    - Generate random strings (empty, 1-100 chars, >100 chars), verify validation accepts 1-100 dan rejects empty atau >100
    - **Validates: Requirements 1.6**

  - [x] 7.3 Write property test untuk image aspect ratio validation
    - **Property 3: Image aspect ratio validation with tolerance**
    - Generate random image dimension pairs, verify validation accepts dimensions within ±10px of 1080x608 dan rejects dimensions outside tolerance
    - **Validates: Requirements 2.4**

  - [x] 7.4 Write property test untuk background config validation
    - **Property 4: Background config validation**
    - Generate random background config objects (solid with 1 color, gradient with 2+ colors + direction, invalid types), verify validation rules
    - **Validates: Requirements 3.2, 3.3, 3.4, 10.4**

  - [x] 7.5 Write property test untuk TextElement field validation
    - **Property 5: TextElement field validation**
    - Generate random TextElement objects, verify validation accepts valid elements (content 1-200 chars, position 0-100, font_size 12-72, valid hex color, valid font_weight) dan rejects invalid
    - **Validates: Requirements 4.2, 10.4**

  - [x] 7.6 Write property test untuk soft-delete exclusion
    - **Property 6: Soft-deleted banners are excluded from list results**
    - Generate random banners, soft-delete beberapa, verify list endpoint tidak mengembalikan soft-deleted banners
    - **Validates: Requirements 1.5**

  - [x] 7.7 Write property test untuk default values on creation
    - **Property 7: New banners default to inactive with next display order**
    - Generate random valid banner creation requests, verify status selalu 'inactive' dan display_order > max existing display_order
    - **Validates: Requirements 7.3**

  - [x] 7.8 Write property test untuk mobile endpoint
    - **Property 8: Mobile endpoint returns only active banners in display order**
    - Generate random banners dengan mixed statuses, verify mobile endpoint hanya mengembalikan active banners ordered by display_order asc
    - **Validates: Requirements 8.1**

- [x] 8. Checkpoint — Backend tests selesai
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Frontend: Service layer — Banners
  - [x] 9.1 Buat type definitions di `src/services/backoffice/banners/banners.types.ts`
    - Type `BannerType = 'image' | 'text_placement'`
    - Type `BannerStatus = 'active' | 'inactive'`
    - Type `BackgroundType = 'solid' | 'gradient'`
    - Type `GradientDirection = 'to-right' | 'to-bottom' | 'to-bottom-right'`
    - Type `FontWeight = 'normal' | 'bold' | 'semibold'`
    - Interface `ITextElement`: `id` (string), `content`, `position_x`, `position_y`, `font_size`, `font_color`, `font_weight`
    - Interface `IBackgroundConfig`: `type` (BackgroundType), `colors` (string[]), `direction?` (GradientDirection)
    - Interface `IBanner`: `id`, `title`, `type`, `status`, `display_order`, `image_path`, `image_url`, `background_config`, `text_elements`, `created_at`, `updated_at`, `deleted_at`
    - Interface `IBannerParams` extends `IPaginationParams`: `type?`, `status?`
    - _Requirements: 1.1, 10.1, 10.2_

  - [x] 9.2 Buat service functions di `src/services/backoffice/banners/banners.service.ts`
    - `bannersService.list(params)` → `api.get('/backoffice/banners', { params })`
    - `bannersService.detail(id)` → `api.get('/backoffice/banners/${id}')`
    - `bannersService.create(data)` → `api.post('/backoffice/banners', data)` (FormData atau object)
    - `bannersService.update(id, data)` → `api.post('/backoffice/banners/${id}', data)` (POST with `_method=PUT` untuk multipart)
    - `bannersService.delete(id)` → `api.delete('/backoffice/banners/${id}')`
    - `bannersService.updateStatus(id, payload)` → `api.patch('/backoffice/banners/${id}/status', payload)`
    - `bannersService.reorder(payload)` → `api.patch('/backoffice/banners/reorder', payload)`
    - _Requirements: 1.1, 1.3, 1.4, 7.4, 7.5_

  - [x] 9.3 Buat barrel export di `src/services/backoffice/banners/index.ts`
    - Re-export semua dari types dan service files
    - _Requirements: 1.1_

- [x] 10. Frontend: Routing dan Sidebar Navigation
  - [x] 10.1 Update `src/config/routing.ts`
    - Tambah `BANNER_SERVICES` dengan `banners: '/dashboard/banners'`, `bannerCreate: '/dashboard/banners/create'`, `bannerEdit: (id: string) => \`/dashboard/banners/${id}/edit\``
    - Spread ke `PATHS` export
    - _Requirements: 9.5_

  - [x] 10.2 Update sidebar navigation di `src/app/components/layout/Sidebar/Sidebar.tsx`
    - Tambah "Banners" item di group yang sesuai untuk backoffice users
    - Icon: `Image` dari lucide-react
    - Href: `PATHS.banners`
    - _Requirements: 9.5_

- [x] 11. Checkpoint — Service layer dan routing frontend selesai
  - Jalankan `npx tsc --noEmit` di `lingkar-crm/` untuk memastikan tidak ada type error
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Frontend: Banner List Page
  - [x] 12.1 Buat page component di `src/app/(dashboard)/dashboard/banners/page.tsx`
    - Gunakan `useTableData` hook dengan `bannersService.list`
    - `TableCard` dengan kolom: thumbnail preview (Image component, small size), title, type (badge), status (badge), display order, created date, actions
    - `SearchInput` untuk search by title
    - `FilterPopup` dengan `FilterChipGroup` untuk filter type (image, text_placement) dan status (active, inactive)
    - Actions per row: edit (link ke `PATHS.bannerEdit(id)`), toggle status (via `bannersService.updateStatus`), delete (dengan `ConfirmDialog`)
    - Tombol "Create Banner" link ke `PATHS.bannerCreate`
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [x] 12.2 Write unit tests untuk banner list page
    - Test render table dengan mock data
    - Test search dan filter functionality
    - Test delete confirmation dialog
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.6**

- [x] 13. Frontend: Canvas Editor Component
  - [x] 13.1 Buat Canvas Editor component di `src/app/(dashboard)/dashboard/banners/_components/CanvasEditor.tsx`
    - Props: `textElements: ITextElement[]`, `backgroundConfig: IBackgroundConfig`, `onTextElementsChange: (elements: ITextElement[]) => void`
    - Canvas area dengan 16:9 aspect ratio (responsive width, calculated height)
    - Render background (solid color atau gradient) pada canvas
    - Render text elements pada posisi yang sesuai (percentage-based positioning)
    - Drag-and-drop untuk reposisi text elements (mouse events, update position_x/position_y)
    - Click to select element → highlight selected element
    - Clamp positions within canvas bounds (0-100)
    - _Requirements: 4.3, 4.5, 4.8_

  - [x] 13.2 Buat Properties Panel component di `src/app/(dashboard)/dashboard/banners/_components/TextPropertiesPanel.tsx`
    - Props: `selectedElement: ITextElement | null`, `onUpdate: (element: ITextElement) => void`, `onRemove: (id: string) => void`
    - Fields: content (`FormInput`), font_size (`FormInput` type number), font_color (`FormInput` type color/text), font_weight (`FormSelect` dengan options normal/bold/semibold)
    - Remove button per element
    - Hanya tampil jika ada element yang dipilih
    - _Requirements: 4.6, 4.7_

  - [x] 13.3 Buat Background Selector component di `src/app/(dashboard)/dashboard/banners/_components/BackgroundSelector.tsx`
    - Props: `backgroundConfig: IBackgroundConfig`, `onChange: (config: IBackgroundConfig) => void`
    - Display grid of Background_Preset options (minimal 8 solid + 8 gradient)
    - Presets hardcoded sebagai konstanta
    - Custom color input via `FormInput` (hex color)
    - Gradient direction selector via `FormSelect` (to-right, to-bottom, to-bottom-right)
    - Toggle antara solid dan gradient mode
    - _Requirements: 3.5, 3.6_

  - [x] 13.4 Buat Template Selector component di `src/app/(dashboard)/dashboard/banners/_components/TemplateSelector.tsx`
    - Props: `onApply: (textElements: ITextElement[]) => void`
    - Minimal 4 template options dengan thumbnail preview
    - Templates disimpan sebagai konstanta (pre-configured text element positions, font sizes, placeholder text)
    - Applying template mengganti text elements tanpa mengubah background config
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 13.5 Write unit tests untuk Canvas Editor components
    - Test canvas rendering dengan mock data
    - Test text element add/remove/reposition
    - Test background selector preset selection dan custom color
    - Test template application preserves background
    - **Property 9: Template application preserves background configuration**
    - **Validates: Requirements 4.3, 4.5, 4.6, 4.7, 5.2, 5.4**

- [x] 14. Frontend: Banner Preview Modal
  - [x] 14.1 Buat Preview Modal component di `src/app/(dashboard)/dashboard/banners/_components/BannerPreviewModal.tsx`
    - Props: `isOpen: boolean`, `onClose: () => void`, `banner: { type, image (File/URL), backgroundConfig, textElements }`
    - Modal yang menampilkan banner pada ukuran mobile viewport (~375px CSS width)
    - Image type: render uploaded image (dari File object atau URL)
    - Text Placement type: render background + text elements pada posisi yang benar
    - Close/Back to Edit button
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 15. Frontend: Banner Create Page
  - [x] 15.1 Buat page component di `src/app/(dashboard)/dashboard/banners/create/page.tsx`
    - "Page + Inner Form" split pattern untuk React 19 compliance
    - Common fields: title (`FormInput`), type selector (`FormSelect`: image / text_placement)
    - Conditional rendering berdasarkan type:
      - **Image type**: file upload input dengan preview, client-side aspect ratio validation (16:9, 1080x608 ±10px)
      - **Text Placement type**: `BackgroundSelector` + `CanvasEditor` + `TextPropertiesPanel` + `TemplateSelector`
    - "Add Text" button untuk menambah text element baru ke canvas
    - "Preview" button → buka `BannerPreviewModal`
    - Submit button → build FormData (image type) atau JSON object (text_placement type), call `bannersService.create()`
    - Redirect ke banner list setelah sukses
    - _Requirements: 1.3, 2.1, 2.2, 2.3, 2.4, 3.1, 3.5, 3.6, 4.1, 4.4, 5.1, 6.1_

- [x] 16. Frontend: Banner Edit Page
  - [x] 16.1 Buat page component di `src/app/(dashboard)/dashboard/banners/[id]/edit/page.tsx`
    - "Page + Inner Form" split pattern untuk React 19 compliance
    - Gunakan `useDetailData` hook dengan `bannersService.detail` untuk load existing data
    - Pre-populate form fields dari existing banner data
    - Sama seperti create page tapi:
      - Image type: tampilkan current image, file upload opsional (hanya jika ingin ganti)
      - Text Placement type: load existing background_config dan text_elements ke editor
    - Submit → build FormData/JSON, call `bannersService.update(id, data)` (POST with `_method=PUT` untuk multipart)
    - Redirect ke banner list setelah sukses
    - _Requirements: 1.4, 2.6, 3.1, 4.1, 6.1_

- [x] 17. Checkpoint — Frontend pages selesai
  - Jalankan `npx tsc --noEmit` di `lingkar-crm/` untuk memastikan tidak ada TypeScript error
  - Ensure all tests pass, ask the user if questions arise.

- [x] 18. Dokumentasi
  - [x] 18.1 Update dokumentasi backend (`lingkar-id-backend/`)
    - Update `README.md`: tambah API endpoints baru (backoffice banners CRUD, client banners) di API Endpoints table, update Project Structure
    - Update `CLAUDE.md`: tambah BannerService, BannerController, ClientBannerController, Banner model di API Modules table
    - Update Postman collection `postman/Lingkar_ID_API.postman_collection.json`: tambah semua endpoint baru (GET list, GET detail, POST create, PUT update, DELETE, PATCH status, PATCH reorder, GET client banners). Validate JSON setelah edit: `python3 -c "import json; json.load(open('postman/Lingkar_ID_API.postman_collection.json')); print('Valid')"`
    - _Requirements: 1.1, 7.4, 7.5, 8.1_

  - [x] 18.2 Update dokumentasi frontend (`lingkar-crm/`)
    - Update `docs/PRD.md`: tambah modul Banner Management (list, create, edit, canvas editor, preview, status toggle, reorder)
    - Update `docs/ARCHITECTURE.md`: tambah banners service layer, canvas editor components, routing updates
    - Update `README.md`: tambah Banner Management ke Feature Status table
    - Update `CLAUDE.md`: tambah info Banner Management pages, service layer, canvas editor components
    - _Requirements: 9.1, 9.5_

- [x] 19. Final checkpoint — Semua selesai
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks bertanda `*` bersifat opsional dan bisa di-skip untuk implementasi lebih cepat
- Setiap task mereferensikan requirements spesifik untuk traceability
- Backend tasks (1-8) harus diselesaikan sebelum frontend tasks (9-17) karena frontend bergantung pada API baru
- Checkpoints memastikan validasi incremental di setiap fase
- Property tests memvalidasi 9 correctness properties dari design document
- Canvas Editor menggunakan HTML5 Canvas API via `<canvas>` untuk performa drag-and-drop
- Text element positions disimpan sebagai persentase (0-100) untuk responsivitas di berbagai ukuran layar
- Background presets dan templates disimpan sebagai konstanta di frontend (tidak perlu API)
- Backend commands dijalankan via Docker: `docker exec lingkarid.local php artisan ...`
- Frontend menggunakan component system project (Button, FormInput, FormSelect, Image, TableCard, Badge, ConfirmDialog) — jangan gunakan native HTML elements
- Image upload menggunakan FormData, text placement menggunakan JSON body
- Update banner image type menggunakan POST with `_method=PUT` untuk support multipart/form-data
