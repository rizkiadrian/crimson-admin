# Implementation Plan: Blog/Article Management

## Overview

Implementasi fitur Blog/Article Management yang memungkinkan Backoffice User membuat dan mengelola konten artikel dengan rich text editor (Tiptap). Fitur menggunakan pendekatan modular: Authors, Article Categories, Article Tags, dan Articles sebagai entitas terpisah.

Implementasi mencakup dua bagian: backend (Laravel — `lingkar-id-backend/`) dan frontend (Next.js — `lingkar-crm/`). Backend dikerjakan terlebih dahulu karena frontend bergantung pada API.

> **Skills referenced:** `fullstack-feature-pattern`, `new-feature-checklist`, `component-rules`, `state-management-patterns`, `error-handling-patterns`, `testing-workflows`, `documentation-update-guide`

## Tasks

- [ ] 1. Backend: Migration dan Model — Authors
  - [ ] 1.1 Buat migration `create_authors_table`
    - Kolom: `id` (bigint, PK, auto-increment), `name` (varchar 100, not null), `email` (varchar 255, nullable), `avatar_path` (varchar 500, nullable), `timestamps`, `softDeletes`
    - _Requirements: 1_

  - [ ] 1.2 Buat model `Author` di `app/Models/Author.php`
    - `$fillable`: `name`, `email`, `avatar_path`
    - Accessor `avatarUrl()` → return full URL dari `avatar_path`
    - `$appends`: `['avatar_url']`
    - Use `SoftDeletes` trait
    - Relation: `hasMany(Article::class)`
    - Scope: `scopeSearch($query, ?string $search)` — ILIKE pada name dan email
    - _Requirements: 1_

- [ ] 2. Backend: Migration dan Model — Article Categories
  - [ ] 2.1 Buat migration `create_article_categories_table`
    - Kolom: `id` (bigint, PK), `name` (varchar 100, not null, unique), `slug` (varchar 120, not null, unique), `description` (varchar 500, nullable), `timestamps`, `softDeletes`
    - _Requirements: 2_

  - [ ] 2.2 Buat model `ArticleCategory` di `app/Models/ArticleCategory.php`
    - `$fillable`: `name`, `slug`, `description`
    - Use `SoftDeletes` trait
    - Relation: `hasMany(Article::class, 'category_id')`
    - Boot: auto-generate slug dari name pada creating event
    - _Requirements: 2_

- [ ] 3. Backend: Migration dan Model — Article Tags
  - [ ] 3.1 Buat migration `create_article_tags_table`
    - Kolom: `id` (bigint, PK), `name` (varchar 50, not null, unique), `slug` (varchar 60, not null, unique), `timestamps`, `softDeletes`
    - _Requirements: 3_

  - [ ] 3.2 Buat model `ArticleTag` di `app/Models/ArticleTag.php`
    - `$fillable`: `name`, `slug`
    - Use `SoftDeletes` trait
    - Relation: `belongsToMany(Article::class, 'article_tag')`
    - Boot: auto-generate slug dari name pada creating event
    - Scope: `scopeSearch($query, ?string $search)` — ILIKE pada name
    - _Requirements: 3_

- [ ] 4. Backend: Migration dan Model — Articles
  - [ ] 4.1 Buat migration `create_articles_table`
    - Kolom: `id` (bigint, PK), `title` (varchar 255, not null), `slug` (varchar 280, not null, unique), `excerpt` (text, nullable), `body` (longtext, not null), `thumbnail_path` (varchar 500, nullable), `author_id` (bigint, FK → authors.id, not null), `category_id` (bigint, FK → article_categories.id, nullable), `status` (enum: draft/scheduled/published/archived, default draft), `published_at` (timestamp, nullable), `is_featured` (boolean, default false), `meta_title` (varchar 255, nullable), `meta_description` (varchar 500, nullable), `timestamps`, `softDeletes`
    - Index pada `['status', 'published_at']`
    - _Requirements: 4, 5_

  - [ ] 4.2 Buat migration `create_article_tag_table` (pivot)
    - Kolom: `article_id` (bigint, FK → articles.id, on delete cascade), `tag_id` (bigint, FK → article_tags.id, on delete cascade)
    - Composite primary key `(article_id, tag_id)`
    - _Requirements: 4_

  - [ ] 4.3 Buat model `Article` di `app/Models/Article.php`
    - `$fillable`: `title`, `slug`, `excerpt`, `body`, `thumbnail_path`, `author_id`, `category_id`, `status`, `published_at`, `is_featured`, `meta_title`, `meta_description`
    - `$casts`: `published_at` → datetime, `is_featured` → boolean
    - Accessor `thumbnailUrl()` → return full URL dari `thumbnail_path`
    - `$appends`: `['thumbnail_url']`
    - Use `SoftDeletes` trait
    - Relations: `belongsTo(Author::class)`, `belongsTo(ArticleCategory::class, 'category_id')`, `belongsToMany(ArticleTag::class, 'article_tag', 'article_id', 'tag_id')`
    - Boot: auto-generate slug dari title pada creating event
    - Scopes: `scopeSearch($query, ?string $search)` (ILIKE pada title), `scopeOfStatus($query, ?string $status)`, `scopeOfCategory($query, ?int $categoryId)`, `scopeOfTag($query, ?int $tagId)`
    - _Requirements: 4, 5_

- [ ] 5. Backend: FormRequests
  - [ ] 5.1 Buat `StoreAuthorRequest`
    - Rules: `name` → required|string|max:100; `email` → nullable|email|max:255; `avatar` → nullable|file|mimes:jpeg,png,webp|max:1024
    - _Requirements: 1_

  - [ ] 5.2 Buat `UpdateAuthorRequest`
    - Sama seperti Store tapi avatar opsional
    - _Requirements: 1_

  - [ ] 5.3 Buat `StoreArticleCategoryRequest`
    - Rules: `name` → required|string|max:100|unique:article_categories,name; `description` → nullable|string|max:500
    - _Requirements: 2_

  - [ ] 5.4 Buat `UpdateArticleCategoryRequest`
    - Sama tapi unique ignore current ID
    - _Requirements: 2_

  - [ ] 5.5 Buat `StoreArticleTagRequest`
    - Rules: `name` → required|string|max:50|unique:article_tags,name
    - _Requirements: 3_

  - [ ] 5.6 Buat `UpdateArticleTagRequest`
    - Sama tapi unique ignore current ID
    - _Requirements: 3_

  - [ ] 5.7 Buat `StoreArticleRequest`
    - Rules: `title` → required|string|max:255; `body` → required|string; `author_id` → required|exists:authors,id; `excerpt` → nullable|string; `thumbnail` → nullable|file|mimes:jpeg,png,webp|max:2048; `category_id` → nullable|exists:article_categories,id; `tag_ids` → nullable|array; `tag_ids.*` → exists:article_tags,id; `meta_title` → nullable|string|max:255; `meta_description` → nullable|string|max:500; `is_featured` → nullable|boolean
    - _Requirements: 4_

  - [ ] 5.8 Buat `UpdateArticleRequest`
    - Sama seperti Store, thumbnail opsional
    - _Requirements: 4_

  - [ ] 5.9 Buat `ScheduleArticleRequest`
    - Rules: `published_at` → required|date|after:now
    - _Requirements: 5_

  - [ ] 5.10 Buat `UploadArticleImageRequest`
    - Rules: `image` → required|file|mimes:jpeg,png,webp,gif|max:5120
    - _Requirements: 6_

- [ ] 6. Backend: Services
  - [ ] 6.1 Buat `AuthorService` di `app/Services/Backoffice/AuthorService.php`
    - Use `ApiPaginationTrait`
    - Methods: `getAllAuthors()`, `getAuthorById(int $id)`, `createAuthor(array $data)`, `updateAuthor(Author $author, array $data)`, `deleteAuthor(Author $author)`
    - Delete guard: throw exception jika author punya published articles
    - File handling: store/delete avatar via Storage disk `public`, path dari `config('filepath.authors')`
    - _Requirements: 1_

  - [ ] 6.2 Buat `ArticleCategoryService` di `app/Services/Backoffice/ArticleCategoryService.php`
    - Use `ApiPaginationTrait`
    - Methods: `getAllCategories()`, `getCategoryById(int $id)`, `createCategory(array $data)`, `updateCategory(ArticleCategory $category, array $data)`, `deleteCategory(ArticleCategory $category)`
    - Delete guard: throw exception jika category punya articles
    - _Requirements: 2_

  - [ ] 6.3 Buat `ArticleTagService` di `app/Services/Backoffice/ArticleTagService.php`
    - Use `ApiPaginationTrait`
    - Methods: `getAllTags()`, `getTagById(int $id)`, `createTag(array $data)`, `updateTag(ArticleTag $tag, array $data)`, `deleteTag(ArticleTag $tag)`
    - _Requirements: 3_

  - [ ] 6.4 Buat `ArticleService` di `app/Services/Backoffice/ArticleService.php`
    - Use `ApiPaginationTrait`
    - Methods: `getAllArticles()` (eager load author, category; support filters: search, status, category_id, tag_id), `getArticleById(int $id)` (eager load author, category, tags), `createArticle(array $data)` (store thumbnail, sync tags via pivot), `updateArticle(Article $article, array $data)` (update thumbnail if new, sync tags), `deleteArticle(Article $article)` (soft delete + delete thumbnail from storage), `publishArticle(Article $article)` (set status=published, published_at=now), `unpublishArticle(Article $article)` (set status=draft, clear published_at), `archiveArticle(Article $article)` (set status=archived), `scheduleArticle(Article $article, array $data)` (set status=scheduled, published_at from payload), `uploadImage(UploadedFile $file): string` (store in article_images path, return full URL), `publishScheduledArticles(): int` (transition scheduled→published where published_at <= now)
    - _Requirements: 4, 5, 6_

- [ ] 7. Backend: Controllers dan Routes
  - [ ] 7.1 Buat `AuthorController` di `app/Http/Controllers/Api/v1/Backoffice/AuthorController.php`
    - Inject `AuthorService`
    - Thin controller: validate via FormRequest → call service → return `ApiResponse::success` / `paginatedResponse`
    - Methods: `index()`, `show(int $id)`, `store(StoreAuthorRequest)`, `update(UpdateAuthorRequest, Author)`, `destroy(Author)`
    - _Requirements: 1_

  - [ ] 7.2 Buat `ArticleCategoryController` di `app/Http/Controllers/Api/v1/Backoffice/ArticleCategoryController.php`
    - Inject `ArticleCategoryService`
    - Methods: `index()`, `show(int $id)`, `store(StoreArticleCategoryRequest)`, `update(UpdateArticleCategoryRequest, ArticleCategory)`, `destroy(ArticleCategory)`
    - _Requirements: 2_

  - [ ] 7.3 Buat `ArticleTagController` di `app/Http/Controllers/Api/v1/Backoffice/ArticleTagController.php`
    - Inject `ArticleTagService`
    - Methods: `index()`, `show(int $id)`, `store(StoreArticleTagRequest)`, `update(UpdateArticleTagRequest, ArticleTag)`, `destroy(ArticleTag)`
    - _Requirements: 3_

  - [ ] 7.4 Buat `ArticleController` di `app/Http/Controllers/Api/v1/Backoffice/ArticleController.php`
    - Inject `ArticleService`
    - Methods: `index()`, `show(int $id)`, `store(StoreArticleRequest)`, `update(UpdateArticleRequest, Article)`, `destroy(Article)`, `publish(Article)`, `unpublish(Article)`, `archive(Article)`, `schedule(ScheduleArticleRequest, Article)`, `uploadImage(UploadArticleImageRequest)`
    - _Requirements: 4, 5, 6_

  - [ ] 7.5 Tambah routes di `routes/api.php`
    - Backoffice routes (prefix `backoffice`, middleware `role:admin,backoffice`):
      - `apiResource('authors', AuthorController::class)`
      - `apiResource('article-categories', ArticleCategoryController::class)`
      - `apiResource('article-tags', ArticleTagController::class)`
      - `apiResource('articles', ArticleController::class)`
      - `PATCH /articles/{article}/publish` → `ArticleController@publish`
      - `PATCH /articles/{article}/unpublish` → `ArticleController@unpublish`
      - `PATCH /articles/{article}/archive` → `ArticleController@archive`
      - `PATCH /articles/{article}/schedule` → `ArticleController@schedule`
      - `POST /articles/upload-image` → `ArticleController@uploadImage`
    - _Requirements: 1, 2, 3, 4, 5, 6_

- [ ] 8. Backend: Scheduled Task dan Filepath Config
  - [ ] 8.1 Register scheduled task di `app/Console/Kernel.php`
    - Call `ArticleService::publishScheduledArticles()` every minute
    - _Requirements: 5_

  - [ ] 8.2 Tambah paths di `config/filepath.php`
    - `'authors' => 'backoffice/authors'`
    - `'articles' => 'backoffice/articles'`
    - `'article_images' => 'backoffice/article-images'`
    - _Requirements: 1, 4, 6_

- [ ] 9. Backend: Verifikasi
  - Jalankan `php -l` pada semua file baru
  - Jalankan `docker exec lingkarid.local php artisan route:list --path=backoffice/authors`
  - Jalankan `docker exec lingkarid.local php artisan route:list --path=backoffice/article`
  - Pastikan tidak ada syntax error dan routes terdaftar
  - _Requirements: 1, 2, 3, 4, 5, 6_

- [ ] 10. Backend: Property-based Tests
  - [ ] 10.1 Write property test untuk Author delete guard
    - **Property 1: Author deletion guard prevents deleting authors with published articles**
    - Create author, create published article referencing author, attempt delete, verify 422 rejection. Create author with no articles, verify delete succeeds.
    - Buat test file di `tests/Feature/Backoffice/BackofficeAuthorTest.php`
    - **Validates: Requirements 1**

  - [ ] 10.2 Write property test untuk Author avatar upload
    - **Property 2: Author avatar upload validates format and size**
    - Generate random files (valid: jpeg/png/webp ≤1MB, invalid: pdf/gif/>1MB), verify validation accepts valid and rejects invalid
    - **Validates: Requirements 1**

  - [ ] 10.3 Write property test untuk Category slug generation dan uniqueness
    - **Property 3: Category slug auto-generation and uniqueness**
    - Generate random category names, verify slug is auto-generated (kebab-case), verify duplicate names are rejected, verify update with same name (self) is accepted
    - Buat test file di `tests/Feature/Backoffice/BackofficeArticleCategoryTest.php`
    - **Validates: Requirements 2**

  - [ ] 10.4 Write property test untuk Category delete guard
    - **Property 4: Category deletion guard prevents deleting categories with articles**
    - Create category with articles, attempt delete, verify 422. Create empty category, verify delete succeeds.
    - **Validates: Requirements 2**

  - [ ] 10.5 Write property test untuk Tag pivot cleanup
    - **Property 5: Tag deletion removes pivot associations**
    - Create tag, attach to articles via pivot, delete tag, verify pivot records removed and articles unaffected
    - Buat test file di `tests/Feature/Backoffice/BackofficeArticleTagTest.php`
    - **Validates: Requirements 3**

  - [ ] 10.6 Write property test untuk Article list filters
    - **Property 6: Article list filters return correct subsets**
    - Create articles with various statuses/categories/tags, query with each filter combination, verify only matching articles returned
    - Buat test file di `tests/Feature/Backoffice/BackofficeArticleTest.php`
    - **Validates: Requirements 4**

  - [ ] 10.7 Write property test untuk Article validation rules
    - **Property 7: Article creation validation enforces required fields and FK integrity**
    - Generate payloads with missing title/body/author_id, non-existent author_id/category_id/tag_ids, verify each rejected with correct error. Generate valid payload, verify accepted.
    - **Validates: Requirements 4**

  - [ ] 10.8 Write property test untuk Article tag sync
    - **Property 8: Article tag sync correctly manages pivot table**
    - Create article with tags [1,2,3], update to [2,3,4], verify pivot only contains [2,3,4]. Update to [], verify pivot empty.
    - **Validates: Requirements 4**

  - [ ] 10.9 Write property test untuk status workflow transitions
    - **Property 9: Article status workflow transitions are valid**
    - Test publish (draft→published, sets published_at to now), schedule (draft→scheduled, requires future date, rejects past date), unpublish (published→draft, clears published_at), archive (any→archived)
    - **Validates: Requirements 5**

  - [ ] 10.10 Write property test untuk scheduled publishing
    - **Property 10: Scheduled articles auto-publish when published_at is reached**
    - Create scheduled articles with various published_at times (past, future), run publishScheduledArticles(), verify only past-due articles transition to published
    - **Validates: Requirements 5**

  - [ ] 10.11 Write property test untuk inline image upload
    - **Property 11: Image upload validates format/size and returns accessible URL**
    - Generate random files (valid: jpeg/png/webp/gif ≤5MB, invalid: pdf/svg/>5MB), verify validation. For valid uploads, verify returned URL is publicly accessible string.
    - **Validates: Requirements 6**

  - [ ] 10.12 Write property test untuk soft-delete exclusion
    - **Property 12: Soft-deleted entities excluded from all list queries**
    - Create and soft-delete authors/categories/tags/articles, verify they don't appear in list endpoints, detail returns 404
    - **Validates: Requirements 1, 2, 3, 4**

- [ ] 11. Checkpoint — Backend selesai
  - Jalankan `php artisan test` — semua tests pass
  - Verify routes via `route:list`
  - Curl test minimal 1 endpoint (create article) untuk sanity check
  - _Requirements: 1, 2, 3, 4, 5, 6_

- [ ] 12. Frontend: Install Tiptap dependencies
  - `npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder`
  - _Requirements: 7_

- [ ] 13. Frontend: Service layer — Authors
  - [ ] 13.1 Buat `src/services/backoffice/authors/authors.types.ts`
    - Interface `IAuthor`: id, name, email, avatar_path, avatar_url, created_at, updated_at, deleted_at
    - Interface `IAuthorParams` extends `IPaginationParams`: search?
    - _Requirements: 1_

  - [ ] 13.2 Buat `src/services/backoffice/authors/authors.service.ts`
    - `authorsService.list(params)` → `api.get('/backoffice/authors', { params })`
    - `authorsService.detail(id)` → `api.get('/backoffice/authors/${id}')`
    - `authorsService.create(data)` → `api.post('/backoffice/authors', data)` (FormData for avatar)
    - `authorsService.update(id, data)` → `api.post('/backoffice/authors/${id}', data)` (POST with \_method=PUT for multipart)
    - `authorsService.delete(id)` → `api.delete('/backoffice/authors/${id}')`
    - _Requirements: 1_

  - [ ] 13.3 Buat `src/services/backoffice/authors/index.ts` — barrel export
    - _Requirements: 1_

- [ ] 14. Frontend: Service layer — Article Categories
  - [ ] 14.1 Buat `src/services/backoffice/article-categories/article-categories.types.ts`
    - Interface `IArticleCategory`: id, name, slug, description, created_at, updated_at, deleted_at
    - Interface `IArticleCategoryParams` extends `IPaginationParams`
    - _Requirements: 2_

  - [ ] 14.2 Buat `src/services/backoffice/article-categories/article-categories.service.ts`
    - `articleCategoriesService.list(params)`, `.detail(id)`, `.create(data)`, `.update(id, data)`, `.delete(id)`
    - _Requirements: 2_

  - [ ] 14.3 Buat `src/services/backoffice/article-categories/index.ts` — barrel export
    - _Requirements: 2_

- [ ] 15. Frontend: Service layer — Article Tags
  - [ ] 15.1 Buat `src/services/backoffice/article-tags/article-tags.types.ts`
    - Interface `IArticleTag`: id, name, slug, created_at, updated_at, deleted_at
    - Interface `IArticleTagParams` extends `IPaginationParams`: search?
    - _Requirements: 3_

  - [ ] 15.2 Buat `src/services/backoffice/article-tags/article-tags.service.ts`
    - `articleTagsService.list(params)`, `.detail(id)`, `.create(data)`, `.update(id, data)`, `.delete(id)`
    - _Requirements: 3_

  - [ ] 15.3 Buat `src/services/backoffice/article-tags/index.ts` — barrel export
    - _Requirements: 3_

- [ ] 16. Frontend: Service layer — Articles
  - [ ] 16.1 Buat `src/services/backoffice/articles/articles.types.ts`
    - Type `ArticleStatus = 'draft' | 'scheduled' | 'published' | 'archived'`
    - Interface `IArticle`: all fields + optional relations (author?, category?, tags?)
    - Interface `IArticleParams` extends `IPaginationParams`: status?, category_id?, tag_id?, search?
    - Interface `IArticleCreatePayload`: title, body, author_id, excerpt?, category_id?, tag_ids?, meta_title?, meta_description?, is_featured?
    - _Requirements: 4_

  - [ ] 16.2 Buat `src/services/backoffice/articles/articles.service.ts`
    - `articlesService.list(params)`, `.detail(id)`, `.create(data)` (FormData), `.update(id, data)` (FormData), `.delete(id)`
    - `.publish(id)` → `api.patch(...)`, `.unpublish(id)`, `.archive(id)`, `.schedule(id, payload)`
    - `.uploadImage(file)` → `api.post('/backoffice/articles/upload-image', formData)` returns `{ url }`
    - _Requirements: 4, 5, 6_

  - [ ] 16.3 Buat `src/services/backoffice/articles/index.ts` — barrel export
    - _Requirements: 4_

- [ ] 17. Frontend: Routing dan Sidebar
  - [ ] 17.1 Update `src/config/routing.ts`
    - Tambah `ARTICLE_SERVICES`:
      ```ts
      const ARTICLE_SERVICES = {
        articles: "/dashboard/articles",
        articleCreate: "/dashboard/articles/create",
        articleEdit: (id: number) => `/dashboard/articles/${id}/edit`,
        authors: "/dashboard/authors",
        authorCreate: "/dashboard/authors/create",
        authorEdit: (id: number) => `/dashboard/authors/${id}/edit`,
        articleCategories: "/dashboard/article-categories",
        articleCategoryCreate: "/dashboard/article-categories/create",
        articleCategoryEdit: (id: number) =>
          `/dashboard/article-categories/${id}/edit`,
        articleTags: "/dashboard/article-tags",
        articleTagCreate: "/dashboard/article-tags/create",
        articleTagEdit: (id: number) => `/dashboard/article-tags/${id}/edit`,
      };
      ```
    - Spread ke `PATHS` export
    - _Requirements: 7_

  - [ ] 17.2 Update sidebar di `src/app/components/layout/Sidebar/Sidebar.tsx`
    - Tambah "Blog" NavGroup di bawah Marketing group
    - Sub-items: Articles (`FileText` icon), Authors (`UserPen` icon), Categories (`FolderOpen` icon), Tags (`Tag` icon)
    - Href: `PATHS.articles`, `PATHS.authors`, `PATHS.articleCategories`, `PATHS.articleTags`
    - _Requirements: 7_

- [ ] 18. Checkpoint — Service layer dan routing selesai
  - Jalankan `npx tsc --noEmit` — no type errors
  - _Requirements: 1, 2, 3, 4, 5, 6, 7_

- [ ] 19. Frontend: Tiptap Editor Component
  - [ ] 19.1 Buat `src/app/components/ui/TiptapEditor/TiptapEditor.tsx`
    - Props: `content: string`, `onChange: (html: string) => void`, `onImageUpload: (file: File) => Promise<string>`, `placeholder?: string`, `error?: string`
    - Setup Tiptap dengan extensions: StarterKit (headings H2-H4), Image, Link, Placeholder
    - Toolbar menggunakan `<Button variant="ghost" size="icon">` (BUKAN native button)
    - Toolbar actions: Bold, Italic, H2, H3, H4, BulletList, OrderedList, Blockquote, Link, Image, HorizontalRule, Code
    - Image upload: toolbar button → file picker → call `onImageUpload` → insert image node
    - Drag-and-drop: intercept drop event → call `onImageUpload` → insert image node
    - Error state: tampilkan error message di bawah editor (sama pattern seperti FormInput)
    - _Requirements: 6, 7_

  - [ ] 19.2 Buat `src/app/components/ui/TiptapEditor/index.ts` — barrel export
    - _Requirements: 6_

- [ ] 20. Frontend: Authors Pages
  - [ ] 20.1 Buat `src/app/(dashboard)/dashboard/authors/page.tsx`
    - Use `useTableData` hook with `authorsService.list`
    - `TableCard` + `TableCardContent` + `TableCardPagination`
    - Columns: avatar (small circle via `<Image>`), name, email, actions
    - Actions: edit (link `PATHS.authorEdit(id)`), delete (`ConfirmDialog` via `useConfirmStore`)
    - `SearchInput` for search
    - `Button href={PATHS.authorCreate}` for create
    - _Requirements: 1, 7_

  - [ ] 20.2 Buat `src/app/(dashboard)/dashboard/authors/create/page.tsx`
    - `FormCard` + `FormCardHeader` + `FormCardBody` + `FormCardFooter`
    - Fields: name (`FormInput`, required), email (`FormInput`), avatar (file input with preview)
    - Submit: build FormData, call `authorsService.create()`, use `handleFormError()` for validation errors
    - Success: `showNotification` + redirect to `PATHS.authors`
    - _Requirements: 1, 7_

  - [ ] 20.3 Buat `src/app/(dashboard)/dashboard/authors/[id]/edit/page.tsx`
    - "Page + Inner Form" split pattern (React 19 compliant)
    - Page: `useDetailData` with `authorsService.detail`
    - Inner form: receives `initialData` as prop, pre-fills all fields
    - Avatar: show current avatar + option to change
    - Submit: `authorsService.update(id, data)`, preserve return page
    - _Requirements: 1, 7_

- [ ] 21. Frontend: Article Categories Pages
  - [ ] 21.1 Buat `src/app/(dashboard)/dashboard/article-categories/page.tsx`
    - `useTableData` + `TableCard`
    - Columns: name, slug, description (truncated), actions (edit, delete)
    - Paginated
    - _Requirements: 2, 7_

  - [ ] 21.2 Buat `src/app/(dashboard)/dashboard/article-categories/create/page.tsx`
    - `FormCard`: name (`FormInput`, required), description (`FormInput` or textarea, optional)
    - Submit: `articleCategoriesService.create()`, `handleFormError()`
    - _Requirements: 2, 7_

  - [ ] 21.3 Buat `src/app/(dashboard)/dashboard/article-categories/[id]/edit/page.tsx`
    - "Page + Inner Form" split, `useDetailData`, pre-fill
    - _Requirements: 2, 7_

- [ ] 22. Frontend: Article Tags Pages
  - [ ] 22.1 Buat `src/app/(dashboard)/dashboard/article-tags/page.tsx`
    - `useTableData` + `TableCard`
    - Columns: name, slug, actions (edit, delete)
    - `SearchInput` for search
    - Paginated
    - _Requirements: 3, 7_

  - [ ] 22.2 Buat `src/app/(dashboard)/dashboard/article-tags/create/page.tsx`
    - `FormCard`: name (`FormInput`, required)
    - _Requirements: 3, 7_

  - [ ] 22.3 Buat `src/app/(dashboard)/dashboard/article-tags/[id]/edit/page.tsx`
    - "Page + Inner Form" split, `useDetailData`, pre-fill
    - _Requirements: 3, 7_

- [ ] 23. Frontend: Articles List Page
  - [ ] 23.1 Buat `src/app/(dashboard)/dashboard/articles/page.tsx`
    - `useTableData` with `articlesService.list`
    - `TableCard` columns: thumbnail (small `<Image>`), title, author name (from eager-loaded relation), category (badge), status (badge: draft=neutral, scheduled=primary, published=success, archived=muted), published_at (formatted date), is_featured (toggle via inline `Button`), actions (edit, delete)
    - `SearchInput` for title search
    - `FilterPopup` with `FilterChipGroup` for status filter + category `FormSelect`
    - `Button href={PATHS.articleCreate}` for create
    - _Requirements: 4, 7_

- [ ] 24. Frontend: Article Create Page
  - [ ] 24.1 Buat `src/app/(dashboard)/dashboard/articles/create/page.tsx`
    - Full-page layout (NOT FormCard — karena Tiptap butuh space):
    - **Left column** (wide): title (`FormInput`), `TiptapEditor` (body), excerpt (`FormInput` multiline)
    - **Right sidebar**: author (`FormSelect` with search/autocomplete querying `authorsService.list`), category (`FormSelect` querying `articleCategoriesService.list`), tags (multi-select `FormSelect` querying `articleTagsService.list`), thumbnail (file upload with preview via `<Image>`), status display (badge), schedule date picker (conditional, shown when "Schedule" clicked), SEO section (meta_title `FormInput`, meta_description `FormInput`), is_featured (`FormCheckbox`)
    - **Action buttons** (top-right): `Button` "Save Draft", `Button` "Publish", `Button` "Schedule" (opens date picker)
    - Image upload in Tiptap: `onImageUpload` calls `articlesService.uploadImage(file)`, returns URL
    - Submit: build FormData (if thumbnail) or JSON, call `articlesService.create()`
    - Success: `showNotification` + redirect to `PATHS.articles`
    - Error: `handleFormError()` for validation errors
    - _Requirements: 4, 5, 6, 7_

- [ ] 25. Frontend: Article Edit Page
  - [ ] 25.1 Buat `src/app/(dashboard)/dashboard/articles/[id]/edit/page.tsx`
    - "Page + Inner Form" split pattern
    - Page: `useDetailData` with `articlesService.detail`
    - Inner form: same layout as create, pre-filled from `initialData`
    - Additional actions for published articles: `Button` "Unpublish" (calls `articlesService.unpublish`), `Button` "Archive" (calls `articlesService.archive`)
    - Preserve return page
    - _Requirements: 4, 5, 7_

- [ ] 26. Checkpoint — All pages selesai
  - Jalankan `npx tsc --noEmit` — no type errors
  - Jalankan `npm run lint` — no lint errors
  - _Requirements: 1, 2, 3, 4, 5, 6, 7_

- [ ] 27. Frontend: Browser Verification
  - Navigate to each new page via Chrome DevTools MCP (Kiro) or `browser_subagent` (Antigravity/Claude)
  - Login: `http://localhost:3000/login` (admin@example.com / Password123)
  - Verify: `/dashboard/authors`, `/dashboard/article-categories`, `/dashboard/article-tags`, `/dashboard/articles`
  - Verify: create/edit forms render correctly, Tiptap editor loads
  - Check console for errors (`mcp_chrome_devtools_list_console_messages` with types `["error"]`)
  - _Requirements: 7_

- [ ] 28. Frontend: Unit Tests
  - [ ] 28.1 Write unit tests untuk articles list page
    - Test render table dengan mock data (thumbnail, title, author, category, status badge, published_at, featured toggle)
    - Test search functionality (queries API with search param)
    - Test filter functionality (status chip group, category select)
    - Test status badge rendering (draft=neutral, scheduled=primary, published=success, archived=muted)
    - Test delete confirmation dialog (via mocked `useConfirmStore`)
    - Test is_featured toggle action
    - Buat test file di `src/__tests__/articles/article-list.test.tsx`
    - **Validates: Requirements 4, 7**

  - [ ] 28.2 Write unit tests untuk article create/edit form
    - Test full-page layout renders (left column + right sidebar)
    - Test author select queries API on input change (autocomplete behavior)
    - Test category select populates from API
    - Test tags multi-select queries API with search, renders selected tags
    - Test thumbnail upload shows preview
    - Test action buttons: "Save Draft" visible for new/draft articles, "Publish" visible, "Schedule" shows date picker
    - Test published article shows "Unpublish" and "Archive" buttons
    - Test submit builds correct payload (with tag_ids, category_id, author_id)
    - Test edit page pre-fills all fields from detail API response
    - Test `handleFormError` displays validation errors on fields
    - Buat test file di `src/__tests__/articles/article-form.test.tsx`
    - **Validates: Requirements 4, 5, 7**

  - [ ] 28.3 Write unit tests untuk TiptapEditor component
    - Test editor renders with initial content
    - Test toolbar buttons render (all using `<Button>` component, not native button)
    - Test image upload button triggers file picker and calls `onImageUpload` prop
    - Test `onChange` fires with updated HTML when content changes
    - Test placeholder text renders when editor is empty
    - Test error state renders error message below editor
    - Buat test file di `src/__tests__/articles/tiptap-editor.test.tsx`
    - **Validates: Requirements 6, 7**

  - [ ] 28.4 Write unit tests untuk authors list and form
    - Test authors table renders (avatar, name, email, actions)
    - Test search functionality
    - Test delete confirmation with guard error (author has articles)
    - Test create form (name required, email optional, avatar upload with preview)
    - Test edit form pre-fills and shows current avatar
    - Buat test file di `src/__tests__/articles/author-pages.test.tsx`
    - **Validates: Requirements 1, 7**

  - [ ] 28.5 Write unit tests untuk categories and tags pages
    - Test category list renders (name, slug, description, actions)
    - Test category form (name required, description optional)
    - Test category delete guard error (has articles)
    - Test tag list renders (name, slug, actions) with search
    - Test tag form (name required)
    - Buat test file di `src/__tests__/articles/categories-tags.test.tsx`
    - **Validates: Requirements 2, 3, 7**

- [ ] 29. Checkpoint — Frontend tests selesai
  - Jalankan `npm run test:run` — semua pass
  - _Requirements: 1, 2, 3, 4, 5, 6, 7_

- [ ] 30. Documentation: Frontend
  - [ ] 30.1 Update `docs/PRD.md`
    - Tambah feature module section untuk Blog/Article Management
    - Dokumentasikan: routes, user flows, API endpoints, status workflow, acceptance criteria
    - Tambah sidebar entry di Navigation Structure section
    - _Requirements: 7_

  - [ ] 30.2 Update `docs/ARCHITECTURE.md`
    - Tambah Blog/Article ke project structure (services, pages)
    - Tambah Tiptap ke Tech Stack table sebagai dependency baru
    - _Requirements: 7_

  - [ ] 30.3 Update `docs/DESIGN_SYSTEM.md`
    - Tambah TiptapEditor component documentation (props table, usage example)
    - _Requirements: 7_

  - [ ] 30.4 Update `README.md`
    - Tambah Blog/Article Management ke Feature Status table
    - Tambah Tiptap ke Tech Stack jika ada
    - _Requirements: 7_

  - [ ] 30.5 Update `CLAUDE.md`
    - Tambah articles/authors/categories/tags service layer info
    - Tambah TiptapEditor ke component list
    - Tambah Blog pages ke page list
    - _Requirements: 7_

  - [ ] 30.6 Tambah TiptapEditor showcase di `/design-system`
    - Buat `src/app/design-system/components/tiptap-editor-showcase/`
    - Demo: editor with toolbar, placeholder, image upload (mock), error state
    - Register di `src/app/design-system/page.tsx`
    - _Requirements: 7_

- [ ] 31. Documentation: Backend
  - [ ] 31.1 Update backend `README.md`
    - Tambah semua API endpoints baru di API Endpoints table
    - Update Project Structure section
    - _Requirements: 1, 2, 3, 4, 5, 6_

  - [ ] 31.2 Update backend `CLAUDE.md`
    - Tambah AuthorService, ArticleCategoryService, ArticleTagService, ArticleService di API Modules table
    - Tambah Author, ArticleCategory, ArticleTag, Article models
    - _Requirements: 1, 2, 3, 4, 5, 6_

- [ ] 32. Documentation: Postman Collection
  - [ ] 32.1 Buat folder "Blog" di Postman collection (`postman/Lingkar_ID_API.postman_collection.json`)
    - Sub-folders: Authors, Article Categories, Article Tags, Articles
    - _Requirements: 1, 2, 3, 4, 5, 6_

  - [ ] 32.2 Tambah requests untuk Authors
    - GET List (`{{APP_URL}}/api/v1/backoffice/authors?search=&page=1&per_page=10`)
    - POST Create (multipart: name, email, avatar)
    - GET Detail (`{{APP_URL}}/api/v1/backoffice/authors/{{author_id}}`)
    - PUT Update (multipart)
    - DELETE
    - _Requirements: 1_

  - [ ] 32.3 Tambah requests untuk Article Categories
    - GET List, POST Create (name, description), GET Detail, PUT Update, DELETE
    - _Requirements: 2_

  - [ ] 32.4 Tambah requests untuk Article Tags
    - GET List (with search), POST Create (name), GET Detail, PUT Update, DELETE
    - _Requirements: 3_

  - [ ] 32.5 Tambah requests untuk Articles
    - GET List (with filters: status, category_id, tag_id, search)
    - POST Create (multipart: title, body, author_id, excerpt, thumbnail, category_id, tag_ids[], meta_title, meta_description, is_featured)
    - GET Detail
    - PUT Update (multipart)
    - DELETE
    - PATCH Publish, PATCH Unpublish, PATCH Archive
    - PATCH Schedule (body: published_at)
    - POST Upload Image (multipart: image)
    - _Requirements: 4, 5, 6_

  - [ ] 32.6 Validate Postman JSON
    - `python3 -m json.tool postman/Lingkar_ID_API.postman_collection.json > /dev/null`
    - _Requirements: 1, 2, 3, 4, 5, 6_

- [ ] 33. Final Checkpoint
  - Jalankan `npm run test:run` — frontend tests pass
  - Jalankan `npm run build` — build succeeds
  - Jalankan `php artisan test` — backend tests pass
  - Review semua dokumentasi sudah lengkap (checklist dari `documentation-update-guide`)
  - _Requirements: 1, 2, 3, 4, 5, 6, 7_

## Notes

- Backend tasks (1-11) harus diselesaikan sebelum frontend tasks (12-29) karena frontend bergantung pada API
- Setiap task mereferensikan requirements spesifik untuk traceability
- Checkpoints memastikan validasi incremental di setiap fase
- Property tests memvalidasi 12 correctness properties
- Backend commands dijalankan via Docker: `docker exec lingkarid.local php artisan ...`
- Frontend menggunakan component system project — **NEVER** use native HTML elements (lihat `component-rules` skill)
- All forms use `handleFormError()` dari `error-handling-patterns` skill
- Edit pages use "Page + Inner Form" split pattern dari `state-management-patterns` skill
- Service layer pattern: Controllers thin, semua business logic di Services
- Semua API responses menggunakan `ApiResponse::success()` / `paginatedResponse()` pattern
- Article create/edit page menggunakan full-page layout (bukan FormCard) karena Tiptap editor butuh space
- Authors/Categories/Tags pages menggunakan standard FormCard pattern
