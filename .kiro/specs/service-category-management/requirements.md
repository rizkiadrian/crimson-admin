# Requirements Document

## Introduction

Fitur Service Category Management menyediakan antarmuka CRUD lengkap di CRM (Next.js) untuk mengelola kategori layanan (bidang) yang digunakan di seluruh sistem Lingkar ID. Backend Laravel sudah memiliki API endpoint CRUD di `/api/v1/backoffice/service-categories` dengan model `ServiceCategory` yang mencakup field: name, slug (auto-generated), description, icon (SVG upload), types (array: general/daily/monthly/popular), dan is_active. Fitur ini membangun halaman frontend di CRM agar Backoffice User dapat membuat, melihat, mengedit, menghapus, dan mengatur status aktif kategori layanan. Service Category digunakan sebagai referensi oleh modul Mitra Members dan Leads.

## Glossary

- **Service_Category_API**: Endpoint Laravel yang sudah ada di bawah prefix `/api/v1/backoffice/service-categories` yang menangani operasi CRUD kategori layanan.
- **Service_Category_List_Page**: Halaman CRM di `/dashboard/service-categories` yang menampilkan tabel daftar semua kategori layanan dengan fitur pencarian, filter, dan pagination.
- **Service_Category_Create_Page**: Halaman CRM di `/dashboard/service-categories/create` yang menyediakan form untuk membuat kategori layanan baru.
- **Service_Category_Edit_Page**: Halaman CRM di `/dashboard/service-categories/{id}/edit` yang menyediakan form untuk mengedit kategori layanan yang sudah ada.
- **Service_Category_Service_Layer**: Modul service di frontend (`src/services/backoffice/service-categories/`) yang menyediakan fungsi typed wrapper untuk berkomunikasi dengan Service_Category_API.
- **Backoffice_User**: Pengguna dengan role admin atau backoffice yang memiliki akses ke fitur Service Category Management di CRM.
- **Category_Type**: Klasifikasi kategori layanan berupa array yang berisi satu atau lebih nilai: "general", "daily", "monthly", "popular".
- **Category_Icon**: File ikon berformat SVG yang di-upload untuk merepresentasikan kategori layanan secara visual, maksimal 2 MB.

## Requirements

### Requirement 1: Frontend Service Layer untuk Service Category

**User Story:** As a developer, I want a typed service layer in the CRM frontend that communicates with the existing Service Category API, so that all components can fetch and mutate service category data through a consistent interface.

#### Acceptance Criteria

1. THE Service_Category_Service_Layer SHALL provide a `list` function that sends a paginated GET request to Service_Category_API and returns typed `IServiceCategory` data with pagination metadata.
2. THE Service_Category_Service_Layer SHALL provide a `detail` function that sends a GET request for a single service category by identifier and returns typed `IServiceCategory` data.
3. THE Service_Category_Service_Layer SHALL provide a `create` function that sends a POST request with FormData (to support icon file upload) and returns the created `IServiceCategory` data.
4. THE Service_Category_Service_Layer SHALL provide an `update` function that sends a POST request with `_method=PUT` and FormData (to support icon file upload) and returns the updated `IServiceCategory` data.
5. THE Service_Category_Service_Layer SHALL provide a `delete` function that sends a DELETE request for a single service category by identifier and returns a success response.
6. THE Service_Category_Service_Layer SHALL define TypeScript interfaces `IServiceCategory` and `IServiceCategoryParams` that match the Service_Category_API response and request structures.

### Requirement 2: Halaman Daftar Service Category

**User Story:** As a Backoffice_User, I want to see all service categories in a paginated table with search capability, so that I can efficiently browse and manage the category inventory.

#### Acceptance Criteria

1. THE Service_Category_List_Page SHALL display a paginated table of all service categories showing: icon (thumbnail), name, slug, types (as badges), status (active/inactive), and creation date.
2. THE Service_Category_List_Page SHALL provide a search input that filters service categories by name via the Service_Category_API search parameter.
3. THE Service_Category_List_Page SHALL synchronize pagination state with URL query parameters using the `useTableData` hook.
4. THE Service_Category_List_Page SHALL provide a navigation button to the Service_Category_Create_Page.
5. THE Service_Category_List_Page SHALL provide an edit action for each row that navigates to the Service_Category_Edit_Page with `returnPage` query parameter.
6. THE Service_Category_List_Page SHALL provide a delete action for each row that shows a ConfirmDialog before sending the delete request to Service_Category_API.
7. WHEN a delete operation succeeds, THE Service_Category_List_Page SHALL show a success notification and refresh the table data.
8. IF a delete operation fails, THEN THE Service_Category_List_Page SHALL show an error notification with the error message from the API response.

### Requirement 3: Halaman Buat Service Category

**User Story:** As a Backoffice_User, I want to create a new service category with name, description, icon, types, and active status, so that I can add new service categories to the system.

#### Acceptance Criteria

1. THE Service_Category_Create_Page SHALL display a form with fields: name (text input, required), description (textarea, optional), icon (file upload accepting SVG only, optional), types (multi-select checkboxes for "general", "daily", "monthly", "popular", optional), and is_active (toggle/checkbox, default false).
2. WHEN a Backoffice_User submits a valid form, THE Service_Category_Create_Page SHALL send the data to Service_Category_API using the Service_Category_Service_Layer `create` function.
3. WHEN the create operation succeeds, THE Service_Category_Create_Page SHALL show a success notification and navigate to the Service_Category_List_Page.
4. IF the Service_Category_API returns a 422 validation error, THEN THE Service_Category_Create_Page SHALL display field-level error messages using the `handleFormError` utility.
5. IF the Service_Category_API returns a non-422 error, THEN THE Service_Category_Create_Page SHALL display a general error notification using `showNotification`.
6. THE Service_Category_Create_Page SHALL validate that the icon file is in SVG format before submission.

### Requirement 4: Halaman Edit Service Category

**User Story:** As a Backoffice_User, I want to edit an existing service category, so that I can update category information as needed.

#### Acceptance Criteria

1. THE Service_Category_Edit_Page SHALL fetch the existing service category data using the Service_Category_Service_Layer `detail` function and pre-populate the form fields.
2. THE Service_Category_Edit_Page SHALL use the "Page + Inner Form" split pattern to pass fetched data as initial state to the form component, complying with React 19 rules.
3. THE Service_Category_Edit_Page SHALL display the same form fields as the Service_Category_Create_Page: name, description, icon, types, and is_active.
4. WHEN the service category has an existing icon, THE Service_Category_Edit_Page SHALL display a preview of the current icon image.
5. WHEN a Backoffice_User submits a valid form, THE Service_Category_Edit_Page SHALL send the data to Service_Category_API using the Service_Category_Service_Layer `update` function.
6. WHEN the update operation succeeds, THE Service_Category_Edit_Page SHALL show a success notification and navigate back to the Service_Category_List_Page with the preserved `returnPage` parameter.
7. IF the Service_Category_API returns a 422 validation error, THEN THE Service_Category_Edit_Page SHALL display field-level error messages using the `handleFormError` utility.
8. IF the Service_Category_API returns a non-422 error, THEN THE Service_Category_Edit_Page SHALL display a general error notification using `showNotification`.

### Requirement 5: Navigasi Sidebar

**User Story:** As a Backoffice_User, I want to access Service Category Management from the sidebar navigation, so that I can easily navigate to the feature from any page.

#### Acceptance Criteria

1. THE CRM Sidebar SHALL include a "Service Categories" menu item that navigates to the Service_Category_List_Page.
2. THE CRM Sidebar SHALL highlight the "Service Categories" menu item when the current route starts with `/dashboard/service-categories`.
3. THE CRM Sidebar SHALL place the "Service Categories" menu item in a logical group alongside related master data items (e.g., near Mitra Members or in a dedicated "Master Data" group).

### Requirement 6: Routing dan Path Configuration

**User Story:** As a developer, I want service category routes registered in the routing configuration, so that navigation and path references are consistent across the application.

#### Acceptance Criteria

1. THE routing configuration SHALL define paths for: service category list (`/dashboard/service-categories`), create page (`/dashboard/service-categories/create`), and edit page (`/dashboard/service-categories/{id}/edit`).
2. THE routing configuration SHALL follow the existing pattern in `src/config/routing.ts` by defining a `SERVICE_CATEGORIES_SERVICES` constant and spreading it into the `PATHS` export.
3. THE Next.js App Router SHALL have page files at `src/app/(dashboard)/dashboard/service-categories/page.tsx`, `src/app/(dashboard)/dashboard/service-categories/create/page.tsx`, and `src/app/(dashboard)/dashboard/service-categories/[id]/edit/page.tsx`.

### Requirement 7: Validasi Data Service Category

**User Story:** As a developer, I want consistent data validation between frontend and backend, so that users receive immediate feedback on invalid input.

#### Acceptance Criteria

1. THE Service_Category_Create_Page SHALL validate that the name field is not empty before submission.
2. THE Service_Category_Create_Page SHALL validate that the name field does not exceed 255 characters.
3. WHEN an icon file is selected, THE Service_Category_Create_Page SHALL validate that the file is in SVG format (mimes: svg, mimetype: image/svg+xml).
4. WHEN an icon file is selected, THE Service_Category_Create_Page SHALL validate that the file size does not exceed 2 MB.
5. THE Service_Category_Create_Page SHALL validate that each selected type value is one of: "general", "daily", "monthly", "popular".
6. FOR ALL valid IServiceCategory objects, serializing the types array to JSON and deserializing it back SHALL produce an equivalent array (round-trip property).

### Requirement 8: Status Toggle pada List Page

**User Story:** As a Backoffice_User, I want to quickly toggle the active/inactive status of a service category from the list page, so that I can manage category availability without navigating to the edit page.

#### Acceptance Criteria

1. THE Service_Category_List_Page SHALL display the current status of each service category as a visual indicator (badge or toggle).
2. WHEN a Backoffice_User clicks the status indicator, THE Service_Category_List_Page SHALL send an update request to Service_Category_API to toggle the `is_active` field.
3. WHEN the status toggle succeeds, THE Service_Category_List_Page SHALL update the displayed status and show a success notification.
4. IF the status toggle fails, THEN THE Service_Category_List_Page SHALL revert the displayed status and show an error notification.
