# Requirements Document

## Introduction

Fitur Banner Management memungkinkan pengguna backoffice untuk membuat, mengelola, dan mempublikasikan banner yang ditampilkan di mobile app (React Native). Terdapat dua tipe banner: (1) Image Upload — upload gambar langsung, dan (2) Text Placement + Background — editor canvas di CRM untuk menempatkan elemen teks secara bebas di atas background warna (gradient/non-gradient), dengan dukungan template dan preview sebelum submit. Backend (Laravel API) menyimpan data banner dan menyajikan endpoint untuk mobile app. CRM (Next.js) menyediakan antarmuka CRUD dan canvas editor.

## Glossary

- **Banner_Management_System**: Keseluruhan sistem yang mencakup backend API, CRM frontend, dan mobile app untuk mengelola dan menampilkan banner.
- **Banner_API**: Endpoint Laravel di bawah prefix `/api/v1/backoffice/banners` yang menangani operasi CRUD banner.
- **Banner_Editor**: Halaman CRM yang menyediakan form pembuatan dan pengeditan banner, termasuk canvas editor untuk tipe Text Placement.
- **Canvas_Editor**: Komponen di CRM yang memungkinkan pengguna menempatkan elemen teks secara bebas di atas background warna pada area canvas berukuran mobile.
- **Text_Element**: Objek teks individual pada canvas yang memiliki properti konten, posisi (x, y), ukuran font, warna font, dan font weight.
- **Banner_Template**: Konfigurasi layout teks yang sudah ditentukan sebelumnya untuk mempermudah pembuatan banner tipe Text Placement.
- **Banner_Preview**: Tampilan pratinjau banner sebelum disimpan, merepresentasikan tampilan akhir di mobile app.
- **Mobile_Banner_API**: Endpoint publik (client-facing) yang menyajikan daftar banner aktif untuk ditampilkan di mobile app.
- **Background_Preset**: Kumpulan rekomendasi warna background (solid dan gradient) yang tersedia untuk dipilih pengguna.
- **Banner_Image**: File gambar yang di-upload untuk banner tipe Image Upload, disimpan di storage backend.
- **Backoffice_User**: Pengguna dengan role admin atau backoffice yang memiliki akses ke fitur Banner Management di CRM.

## Requirements

### Requirement 1: Banner CRUD Operations

**User Story:** As a Backoffice_User, I want to create, view, edit, and delete banners, so that I can manage promotional content displayed in the mobile app.

#### Acceptance Criteria

1. THE Banner_API SHALL provide a paginated list endpoint that returns all banners ordered by display order and creation date.
2. THE Banner_API SHALL provide a detail endpoint that returns a single banner by its identifier.
3. WHEN a Backoffice_User submits a valid banner creation request, THE Banner_API SHALL create a new banner record and return the created banner data.
4. WHEN a Backoffice_User submits a valid banner update request, THE Banner_API SHALL update the existing banner record and return the updated banner data.
5. WHEN a Backoffice_User submits a banner deletion request, THE Banner_API SHALL soft-delete the banner record and return a success response.
6. THE Banner_API SHALL validate that the banner title is present and does not exceed 100 characters.
7. THE Banner_API SHALL validate that the banner type is either "image" or "text_placement".

### Requirement 2: Image Upload Banner Type

**User Story:** As a Backoffice_User, I want to upload a banner image directly, so that I can quickly create banners from pre-designed graphics.

#### Acceptance Criteria

1. WHEN a Backoffice_User creates a banner with type "image", THE Banner_API SHALL require an image file upload.
2. THE Banner_API SHALL validate that the uploaded image file is in JPEG, PNG, or WebP format.
3. THE Banner_API SHALL validate that the uploaded image file does not exceed 2 MB in size.
4. THE Banner_API SHALL validate that the uploaded image has a 16:9 aspect ratio with recommended dimensions of 1080x608 pixels (tolerance of 10 pixels).
5. WHEN a valid image is uploaded, THE Banner_API SHALL store the image file in the configured storage path and save the file path in the banner record.
6. WHEN a banner image is updated with a new image, THE Banner_API SHALL delete the previous image file from storage before saving the new image.

### Requirement 3: Text Placement Banner Type — Background Selection

**User Story:** As a Backoffice_User, I want to choose a background color for my banner from recommended presets including gradients, so that I can create visually appealing banners without a designer.

#### Acceptance Criteria

1. WHEN a Backoffice_User creates a banner with type "text_placement", THE Banner_API SHALL require a background configuration object.
2. THE Banner_API SHALL validate that the background type is either "solid" or "gradient".
3. WHEN the background type is "solid", THE Banner_API SHALL validate that a single hex color value is provided.
4. WHEN the background type is "gradient", THE Banner_API SHALL validate that at least two hex color values and a gradient direction (e.g., "to-right", "to-bottom", "to-bottom-right") are provided.
5. THE Banner_Editor SHALL display a set of Background_Preset options containing at least 8 solid colors and 8 gradient combinations.
6. THE Banner_Editor SHALL allow the Backoffice_User to input a custom hex color value in addition to selecting from Background_Preset options.

### Requirement 4: Text Placement Banner Type — Text Elements

**User Story:** As a Backoffice_User, I want to add any number of text elements with free placement on the banner canvas, so that I can create custom banner layouts with flexible text positioning.

#### Acceptance Criteria

1. WHEN a Backoffice_User creates a banner with type "text_placement", THE Banner_API SHALL require at least one Text_Element in the text elements array.
2. THE Banner_API SHALL validate each Text_Element contains: content (non-empty string, max 200 characters), position_x (number, 0-100 representing percentage), position_y (number, 0-100 representing percentage), font_size (number, 12-72), font_color (valid hex color), and font_weight (one of "normal", "bold", "semibold").
3. THE Canvas_Editor SHALL render a canvas area with 16:9 aspect ratio matching the mobile banner dimensions (1080x608 logical pixels).
4. THE Canvas_Editor SHALL allow the Backoffice_User to add a new Text_Element by clicking an "Add Text" control.
5. THE Canvas_Editor SHALL allow the Backoffice_User to reposition a Text_Element by dragging the element to a new position within the canvas boundaries.
6. THE Canvas_Editor SHALL allow the Backoffice_User to edit the content, font size, font color, and font weight of each Text_Element through a properties panel.
7. THE Canvas_Editor SHALL allow the Backoffice_User to remove a Text_Element from the canvas.
8. THE Canvas_Editor SHALL display the selected background (solid or gradient) as the canvas background in real time.

### Requirement 5: Banner Templates

**User Story:** As a Backoffice_User, I want to use pre-configured templates for text placement banners, so that I can quickly create banners without manually positioning every text element.

#### Acceptance Criteria

1. THE Banner_Editor SHALL provide at least 4 Banner_Template options for the text placement banner type.
2. WHEN a Backoffice_User selects a Banner_Template, THE Canvas_Editor SHALL populate the canvas with the template's pre-configured Text_Element positions, font sizes, and placeholder text.
3. THE Canvas_Editor SHALL allow the Backoffice_User to modify any Text_Element properties after applying a Banner_Template.
4. WHEN a Banner_Template is applied, THE Canvas_Editor SHALL preserve the currently selected background configuration.
5. THE Banner_Editor SHALL display a visual thumbnail preview for each available Banner_Template.

### Requirement 6: Banner Preview

**User Story:** As a Backoffice_User, I want to preview the banner before submitting, so that I can verify the final appearance matches my intention.

#### Acceptance Criteria

1. THE Banner_Editor SHALL provide a "Preview" action that displays the Banner_Preview.
2. FOR banner type "image", THE Banner_Preview SHALL render the uploaded image at the mobile banner dimensions (1080x608 logical pixels).
3. FOR banner type "text_placement", THE Banner_Preview SHALL render the background and all Text_Element objects at their configured positions, sizes, colors, and weights at the mobile banner dimensions.
4. THE Banner_Preview SHALL display the banner in a modal or dedicated preview area that simulates the mobile app viewport width (approximately 375px CSS width).
5. THE Banner_Preview SHALL provide a "Close" or "Back to Edit" action to return to the editor.

### Requirement 7: Banner Status and Ordering

**User Story:** As a Backoffice_User, I want to control which banners are active and their display order, so that I can manage the banner carousel in the mobile app.

#### Acceptance Criteria

1. THE Banner_API SHALL store a status field for each banner with values "active" or "inactive".
2. THE Banner_API SHALL store a display_order integer field for each banner.
3. WHEN a Backoffice_User creates a banner, THE Banner_API SHALL default the status to "inactive" and assign the next available display_order value.
4. THE Banner_API SHALL provide an endpoint to update the status of a banner between "active" and "inactive".
5. THE Banner_API SHALL provide an endpoint to update the display_order of banners.
6. THE Banner_Editor SHALL display the current status of each banner in the list view with a toggle or action to change the status.

### Requirement 8: Mobile App Banner Endpoint

**User Story:** As a mobile app user, I want to see active banners on the home screen, so that I can view current promotions and announcements.

#### Acceptance Criteria

1. THE Mobile_Banner_API SHALL provide a public endpoint that returns only banners with status "active", ordered by display_order ascending.
2. FOR banner type "image", THE Mobile_Banner_API SHALL return the full image URL.
3. FOR banner type "text_placement", THE Mobile_Banner_API SHALL return the background configuration and all Text_Element data so the mobile app can render the banner natively.
4. THE Mobile_Banner_API SHALL be accessible to authenticated users with the "client" role.
5. IF no active banners exist, THEN THE Mobile_Banner_API SHALL return an empty array with a success response.

### Requirement 9: CRM Banner List Page

**User Story:** As a Backoffice_User, I want to see all banners in a table with search and filter capabilities, so that I can efficiently manage the banner inventory.

#### Acceptance Criteria

1. THE Banner_Editor SHALL display a paginated table of all banners showing: thumbnail preview, title, type, status, display order, and creation date.
2. THE Banner_Editor SHALL provide a search input that filters banners by title.
3. THE Banner_Editor SHALL provide a filter for banner type ("image" or "text_placement").
4. THE Banner_Editor SHALL provide a filter for banner status ("active" or "inactive").
5. THE Banner_Editor SHALL provide navigation to the create banner page and edit banner page for each row.
6. THE Banner_Editor SHALL provide a delete action for each banner row with a confirmation dialog before deletion.

### Requirement 10: Banner Data Serialization

**User Story:** As a developer, I want the text placement banner data to be reliably serialized and deserialized, so that banners render consistently across CRM and mobile app.

#### Acceptance Criteria

1. THE Banner_API SHALL store text_elements as a JSON column containing an array of Text_Element objects.
2. THE Banner_API SHALL store background_config as a JSON column containing the background type, colors, and direction.
3. FOR ALL valid text_placement banner data, serializing the data to JSON and deserializing it back SHALL produce an equivalent data structure (round-trip property).
4. THE Banner_API SHALL validate the JSON structure of text_elements and background_config on every create and update request.
