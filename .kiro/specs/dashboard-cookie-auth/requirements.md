# Requirements Document

## Introduction

Refaktor logika routing dashboard dari client-side (Zustand + `useEffect` + `router.replace`) ke server-side menggunakan secure cookie. Saat ini, user yang login dengan role Sales mengalami flash/loading state karena redirect terjadi di client setelah profile di-fetch. Dengan menyimpan `role_name` di secure cookie saat login, middleware Next.js dapat langsung menentukan routing tanpa menunggu client-side hydration.

## Glossary

- **Middleware**: Next.js Edge Middleware (`src/middleware.ts`) yang berjalan sebelum halaman di-render
- **Role_Cookie**: HTTP-only secure cookie yang menyimpan `role_name` user
- **Backoffice_User**: User dengan `role_name` yang termasuk dalam `BUSINESSFLOW.backofficeRoles` (Admin, Backoffice)
- **Sales_User**: User dengan `role_name` yang termasuk dalam `BUSINESSFLOW.salesRoles` (Sales)
- **SetCredentials_Action**: Server action `setCredentials` di `src/actions/auth/auth.actions.ts` yang menangani proses login
- **Zustand_Store**: State management store `useUserProfile` yang menyimpan data profil user
- **Sidebar_Component**: Komponen navigasi samping yang menampilkan menu berdasarkan role user
- **BUSINESSFLOW_Config**: Konfigurasi di `src/config/env.ts` yang mendefinisikan daftar role backoffice dan sales

## Requirements

### Requirement 1: Set Role Cookie Saat Login

**User Story:** Sebagai sistem, saya ingin menyimpan role_name user ke secure cookie saat login berhasil, sehingga middleware dapat membaca role tanpa perlu fetch API tambahan.

#### Acceptance Criteria

1. WHEN login berhasil dan API mengembalikan data user, THE SetCredentials_Action SHALL menyimpan `role_name` ke Role_Cookie dengan opsi httpOnly, secure, sameSite lax, dan path "/"
2. THE Role_Cookie SHALL menggunakan key yang didefinisikan di `COOKIE_KEYS` config
3. WHEN login gagal, THE SetCredentials_Action SHALL tidak membuat atau mengubah Role_Cookie

### Requirement 2: Hapus Role Cookie Saat Logout

**User Story:** Sebagai sistem, saya ingin menghapus role cookie saat user logout, sehingga tidak ada data role yang tersisa di browser setelah sesi berakhir.

#### Acceptance Criteria

1. WHEN user melakukan logout, THE removeAuth function SHALL menghapus Role_Cookie bersamaan dengan access_token dan refresh_token
2. WHEN Role_Cookie dihapus, THE Middleware SHALL memperlakukan request berikutnya sebagai unauthenticated

### Requirement 3: Middleware Role-Based Routing

**User Story:** Sebagai user, saya ingin langsung diarahkan ke dashboard yang sesuai dengan role saya tanpa flash/loading state, sehingga pengalaman navigasi lebih cepat dan mulus.

#### Acceptance Criteria

1. WHEN Sales_User mengakses `/dashboard`, THE Middleware SHALL redirect ke `/sales-dashboard` dengan HTTP 307 response
2. WHEN Backoffice_User mengakses `/sales-dashboard` atau `/sales-activities`, THE Middleware SHALL redirect ke `/dashboard` dengan HTTP 307 response
3. WHEN Sales_User mengakses rute backoffice (`/dashboard/*` selain `/dashboard` itu sendiri), THE Middleware SHALL redirect ke `/sales-dashboard` dengan HTTP 307 response
4. WHILE Role_Cookie tidak tersedia dan access_token tersedia, THE Middleware SHALL mengizinkan request melanjutkan tanpa role-based redirect (fallback ke perilaku saat ini)
5. WHEN user belum login (tidak ada access_token), THE Middleware SHALL redirect ke halaman login tanpa memeriksa Role_Cookie

### Requirement 4: Hapus Client-Side Role Redirect dari Dashboard Page

**User Story:** Sebagai developer, saya ingin menghapus logika redirect berbasis role di client-side, sehingga tidak ada duplikasi routing logic dan kode lebih bersih.

#### Acceptance Criteria

1. THE Dashboard_Page SHALL tidak melakukan `router.replace` berdasarkan `profile.role_name`
2. THE Dashboard_Page SHALL tidak menampilkan loading state yang disebabkan oleh pengecekan role (loading untuk data fetch tetap diperbolehkan)
3. THE Zustand_Store SHALL tetap digunakan untuk menyimpan data profil (name, email, dll.) yang dibutuhkan komponen UI

### Requirement 5: Sidebar Membaca Role dari Cookie

**User Story:** Sebagai user, saya ingin sidebar menampilkan menu navigasi yang sesuai dengan role saya segera saat halaman dimuat, tanpa menunggu profile fetch selesai.

#### Acceptance Criteria

1. WHEN halaman dimuat, THE Sidebar_Component SHALL membaca role dari cookie (via server component atau helper) untuk menentukan menu navigasi yang ditampilkan
2. WHEN role adalah Backoffice_User, THE Sidebar_Component SHALL menampilkan menu Dashboard, User Management, Sales Management, dan Other Navs
3. WHEN role adalah Sales_User, THE Sidebar_Component SHALL menampilkan menu Sales Dashboard dan Sales Activity Report
4. WHILE Role_Cookie tidak tersedia, THE Sidebar_Component SHALL menampilkan skeleton loading sebagai fallback

### Requirement 6: Konsistensi Cookie dengan Profile Data

**User Story:** Sebagai sistem, saya ingin memastikan role di cookie selalu sinkron dengan data profil dari API, sehingga tidak terjadi inkonsistensi routing.

#### Acceptance Criteria

1. WHEN profile di-fetch dan `role_name` berbeda dari nilai di Role_Cookie, THE System SHALL memperbarui Role_Cookie dengan nilai terbaru dari API
2. IF Role_Cookie berisi nilai yang tidak dikenali (bukan bagian dari backofficeRoles atau salesRoles), THEN THE Middleware SHALL mengizinkan request melanjutkan tanpa role-based redirect
