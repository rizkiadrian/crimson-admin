# Requirements Document

## Introduction

Fitur Blog/Article memungkinkan pengguna backoffice untuk membuat, mengelola, dan mempublikasikan artikel blog yang ditampilkan di mobile app dan public website. Artikel ditulis menggunakan rich text editor (Tiptap) dengan dukungan inline images. Sistem menggunakan pendekatan modular: Authors, Categories, Tags, dan Articles sebagai entitas terpisah dengan CRUD masing-masing. Scope implementasi mencakup backend API (Laravel) dan CRM frontend (Next.js) — tanpa mobile app atau public frontend.

## Glossary

- **Article**: Konten blog yang ditulis oleh author, memiliki kategori, tag, dan status publikasi.
- **Author**: Entitas penulis artikel dengan nama, email, dan avatar. Dipilih via autocomplete saat membuat artikel.
- **Article_Category**: Pengelompokan utama artikel (misal: Tips, News, Promo, Tutorial). Satu artikel memiliki satu kategori.
- **Article_Tag**: Label cross-cutting yang bisa di-attach ke banyak artikel. Satu artikel bisa memiliki banyak tag.
- **Tiptap_Editor**: Rich text editor berbasis ProseMirror yang digunakan untuk menulis body artikel di CRM.
- **Article_Status**: Status lifecycle artikel: draft, scheduled, published, archived.
- **Backoffice_User**: Pengguna dengan role admin atau backoffice yang memiliki akses ke fitur Blog/Article di CRM.
- **Inline_Image**: Gambar yang di-upload dan disisipkan di dalam body artikel melalui Tiptap editor.
- **Featured_Article**: Artikel yang ditandai untuk ditampilkan secara prominent (highlight) di frontend.

## Requirements

### Requirement 1: Author Management

**User Story:** As a Backoffice_User, I want to manage authors (create, view, edit, delete), so that I can maintain a list of article writers that can be selected when creating articles.

#### Acceptance Criteria

1. THE Author API SHALL provide a paginated list endpoint with search capability for autocomplete use.
2. THE Author API SHALL provide a detail endpoint that returns a single author by its identifier.
3. WHEN a Backoffice_User submits a valid author creation request with name (required), email (optional), and avatar file (optional), THE Author API SHALL create a new author record.
4. THE Author API SHALL validate that the author name is present and does not exceed 100 characters.
5. THE Author API SHALL validate that the avatar file, if provided, is in JPEG, PNG, or WebP format and does not exceed 1 MB.
6. WHEN a Backoffice_User submits an author deletion request, THE Author API SHALL soft-delete the author record.
7. THE Author API SHALL prevent deletion of an author that has associated published articles, returning an appropriate error message.

### Requirement 2: Article Category Management

**User Story:** As a Backoffice_User, I want to manage article categories, so that I can organize articles into logical groups.

#### Acceptance Criteria

1. THE Article Category API SHALL provide a paginated list endpoint.
2. WHEN a Backoffice_User creates a category with a name, THE API SHALL auto-generate a unique slug from the name.
3. THE API SHALL validate that the category name is unique and does not exceed 100 characters.
4. THE API SHALL accept an optional description field (max 500 characters).
5. WHEN a Backoffice_User deletes a category, THE API SHALL soft-delete the record.
6. THE API SHALL prevent deletion of a category that has associated articles, returning an appropriate error message.

### Requirement 3: Article Tag Management

**User Story:** As a Backoffice_User, I want to manage article tags, so that I can label articles with cross-cutting topics for better discoverability.

#### Acceptance Criteria

1. THE Article Tag API SHALL provide a paginated list endpoint with search capability for multi-select use.
2. WHEN a Backoffice_User creates a tag with a name, THE API SHALL auto-generate a unique slug from the name.
3. THE API SHALL validate that the tag name is unique and does not exceed 50 characters.
4. WHEN a Backoffice_User deletes a tag, THE API SHALL soft-delete the record and remove associations from the pivot table.

### Requirement 4: Article CRUD Operations

**User Story:** As a Backoffice_User, I want to create, view, edit, and delete articles with rich text content, so that I can publish blog content for the platform.

#### Acceptance Criteria

1. THE Article API SHALL provide a paginated list endpoint with filters for status, category_id, tag_id, and search (by title).
2. THE Article API SHALL provide a detail endpoint that returns a single article with its author, category, and tags eager-loaded.
3. WHEN a Backoffice_User creates an article, THE API SHALL require: title, body, and author_id. Optional fields: excerpt, thumbnail (file), category_id, tag_ids (array), meta_title, meta_description, is_featured.
4. THE API SHALL auto-generate a unique slug from the article title.
5. THE API SHALL validate that the thumbnail file, if provided, is in JPEG, PNG, or WebP format and does not exceed 2 MB.
6. THE API SHALL validate that the author_id references an existing, non-deleted author.
7. THE API SHALL validate that the category_id, if provided, references an existing, non-deleted category.
8. THE API SHALL validate that all tag_ids, if provided, reference existing, non-deleted tags.
9. WHEN a Backoffice_User deletes an article, THE API SHALL soft-delete the record.

### Requirement 5: Article Status Workflow

**User Story:** As a Backoffice_User, I want to control the publication status of articles (draft, schedule, publish, archive), so that I can manage content lifecycle.

#### Acceptance Criteria

1. WHEN an article is created, THE API SHALL set its status to "draft" by default.
2. WHEN a Backoffice_User publishes an article, THE API SHALL set status to "published" and published_at to the current timestamp.
3. WHEN a Backoffice_User schedules an article with a future published_at datetime, THE API SHALL set status to "scheduled".
4. THE system SHALL automatically transition "scheduled" articles to "published" when the current time reaches published_at (handled by backend scheduler/cron).
5. WHEN a Backoffice_User unpublishes an article, THE API SHALL revert status to "draft" and clear published_at.
6. WHEN a Backoffice_User archives an article, THE API SHALL set status to "archived".
7. THE API SHALL validate that published_at is a future datetime when scheduling an article.

### Requirement 6: Inline Image Upload

**User Story:** As a Backoffice_User, I want to upload images directly within the article editor, so that I can embed visual content in the article body.

#### Acceptance Criteria

1. THE Article API SHALL provide a dedicated image upload endpoint (not tied to a specific article ID) that accepts an image file and returns the uploaded image URL.
2. THE API SHALL validate that the uploaded image is in JPEG, PNG, WebP, or GIF format and does not exceed 5 MB.
3. THE returned URL SHALL be a full, publicly accessible URL that can be embedded in the article HTML body.
4. THE Tiptap_Editor SHALL support drag-and-drop image insertion that triggers the upload endpoint.
5. THE Tiptap_Editor SHALL support image insertion via a toolbar button that opens a file picker.

### Requirement 7: CRM User Interface

**User Story:** As a Backoffice_User, I want an intuitive interface to manage all blog entities (authors, categories, tags, articles), so that I can efficiently create and organize content.

#### Acceptance Criteria

1. THE CRM SHALL display Authors, Categories, Tags, and Articles as separate pages under a "Blog" section in the sidebar navigation.
2. THE Articles list page SHALL display: thumbnail (small), title, author name, category, status badge, published_at, and is_featured toggle.
3. THE Article create/edit page SHALL use a full-page layout with: left column (title, Tiptap editor, excerpt) and right sidebar (author autocomplete, category select, tags multi-select, thumbnail upload, status controls, schedule picker, SEO fields, featured toggle).
4. THE Author select field SHALL use an autocomplete/search input that queries the authors list endpoint.
5. THE Tags select field SHALL use a multi-select with search that queries the tags list endpoint.
6. THE Article form SHALL provide action buttons: "Save Draft", "Publish", and "Schedule" (with date picker). For published articles: "Unpublish" and "Archive".
7. THE Authors, Categories, and Tags pages SHALL use the existing FormCard pattern for create/edit forms.
