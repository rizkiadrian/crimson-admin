# Implementation Plan: Dashboard Cookie Auth Refactoring

## Overview

Refaktor logika routing dashboard dari client-side (Zustand + `useEffect` + `router.replace`) ke server-side menggunakan secure cookie di Next.js middleware. Implementasi dilakukan secara incremental: mulai dari config & cookie helpers, lalu auth action, middleware routing, dan terakhir update komponen UI agar membaca role dari prop (bukan Zustand).

Semua perubahan ada di workspace `lingkar-crm/` (frontend-only, TypeScript/Next.js).

## Tasks

- [x] 1. Tambah cookie key dan role cookie helpers
  - [x] 1.1 Tambah `COOKIE_KEYS.roleName` di `src/config/env.ts`
    - Tambahkan `roleName: "role_name"` ke object `COOKIE_KEYS`
    - _Requirements: 1.2_

  - [x] 1.2 Tambah role cookie helpers di `src/lib/secure-cookie.ts`
    - Tambah fungsi `setRoleCookie(roleName: string, response?: NextResponse): Promise<void>` — set cookie `role_name` dengan opsi httpOnly, secure (production), sameSite lax, path "/", maxAge 1 hari
    - Tambah fungsi `getRoleCookie(): Promise<string | null>` — baca cookie `role_name` via `cookies()` dari `next/headers`
    - Update `setAuth` agar menerima optional parameter `roleName?: string` — jika ada, panggil `setRoleCookie`
    - Update `removeAuth` agar juga menghapus cookie `role_name` via `removeSecureCookie`
    - _Requirements: 1.1, 2.1_

- [x] 2. Update auth action: fetch `/auth/me` setelah login dan set role cookie
  - [x] 2.1 Modifikasi `setCredentials` di `src/actions/auth/auth.actions.ts`
    - Setelah login berhasil dan token didapat, lakukan fetch `GET /auth/me` dengan `Authorization: Bearer {access_token}` untuk mendapatkan `role_name`
    - Panggil `setAuth(authData, roleName)` agar role cookie ikut di-set
    - Jika fetch `/auth/me` gagal, login tetap sukses (tokens di-set), tapi role cookie tidak di-set (graceful degradation)
    - _Requirements: 1.1, 1.3_

  - [x] 2.2 Tambah server action `syncRoleCookie` di `src/actions/auth/auth.actions.ts`
    - Export async function `syncRoleCookie(roleName: string): Promise<void>` yang memanggil `setRoleCookie(roleName)`
    - Fungsi ini akan dipanggil dari `useUserProfile` store untuk sinkronisasi cookie saat profile di-fetch
    - _Requirements: 6.1_

- [x] 3. Checkpoint — Verifikasi cookie layer
  - Pastikan `npx tsc --noEmit` pass tanpa error
  - Pastikan semua fungsi cookie baru (setRoleCookie, getRoleCookie, syncRoleCookie) sudah ter-export dengan benar
  - Tanyakan ke user jika ada pertanyaan

- [x] 4. Update middleware dengan role-based routing
  - [x] 4.1 Modifikasi `src/middleware.ts` untuk role-based redirect
    - Import `BUSINESSFLOW` dari `@config/env`
    - Setelah auth check existing, baca `role_name` dari `request.cookies`
    - Jika `roleName` ada dan `token` ada:
      - Sales mengakses `/dashboard` (exact) → 307 redirect ke `/sales-dashboard`
      - Sales mengakses `/dashboard/*` (sub-routes) → 307 redirect ke `/sales-dashboard`
      - Backoffice mengakses `/sales-dashboard` atau `/sales-activities` → 307 redirect ke `/dashboard`
    - Jika `role_name` cookie tidak ada atau role tidak dikenali → lanjut tanpa redirect (fallback)
    - Jika tidak ada `access_token` → redirect ke login (perilaku existing, tidak berubah)
    - Pastikan juga route `/sales-dashboard` dan `/sales-activities` dilindungi auth (redirect ke login jika tidak ada token), sama seperti `/dashboard`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 2.2_

- [x] 5. Update layout dan komponen UI agar membaca role dari cookie/prop
  - [x] 5.1 Update `src/app/(dashboard)/layout.tsx` menjadi async server component
    - Import `cookies` dari `next/headers` dan `COOKIE_KEYS` dari `@config/env`
    - Baca `role_name` dari cookie store: `const roleName = cookieStore.get(COOKIE_KEYS.roleName)?.value ?? null`
    - Pass `roleName` sebagai prop ke `<BackofficeStatus>`, `<Sidebar>`, dan `<Navbar>`
    - _Requirements: 5.1_

  - [x] 5.2 Update `Sidebar` di `src/app/components/layout/Sidebar/Sidebar.tsx` agar menerima `roleName` prop
    - Tambah interface `SidebarProps { roleName: string | null }`
    - Ganti logika `navs` dari `profile.role_name` ke `roleName` prop
    - Ganti `navLoaded` dari `profile !== null && !isLoading` ke `roleName !== null`
    - Hapus import `useUserProfile` dan `BUSINESSFLOW` dari Zustand (BUSINESSFLOW tetap dipakai dari config)
    - Hapus dependency `profile` dari `useMemo`, ganti dengan `roleName`
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 5.3 Update `Navbar` di `src/app/components/layout/Navbar/Navbar.tsx` agar meneruskan `roleName` prop ke `NotificationBell`
    - Tambah interface `NavbarProps { roleName: string | null }`
    - Terima `roleName` prop dan teruskan ke `<NotificationBell roleName={roleName} />`
    - _Requirements: 5.1_

  - [x] 5.4 Update `NotificationBell` di `src/app/components/layout/Navbar/NotificationBell.tsx` agar menerima `roleName` prop
    - Tambah interface `NotificationBellProps { roleName: string | null }`
    - Ganti logika `profile && BUSINESSFLOW.backofficeRoles.includes(profile.role_name)` dengan `roleName && BUSINESSFLOW.backofficeRoles.includes(roleName)`
    - Hapus import `useUserProfile` (tidak lagi dibutuhkan untuk role check)
    - _Requirements: 5.1_

  - [x] 5.5 Update `BackofficeStatus` di `src/app/components/core/BackofficeStatus/BackofficeStatus.tsx` agar menerima `roleName` prop
    - Tambah interface `BackofficeStatusProps { roleName: string | null }`
    - Ganti logika role check dari `profile.role_name` ke `roleName` prop
    - `fetchProfile` tetap dipanggil di sini (untuk mengisi Zustand store yang dibutuhkan komponen lain)
    - Hapus dependency `profile` dari useEffect role check, ganti dengan `roleName`
    - _Requirements: 5.1_

- [x] 6. Checkpoint — Verifikasi UI layer
  - Pastikan `npx tsc --noEmit` pass tanpa error
  - Verifikasi bahwa semua komponen yang diubah menerima prop dengan benar
  - Tanyakan ke user jika ada pertanyaan

- [x] 7. Bersihkan client-side redirect dan sinkronisasi cookie
  - [x] 7.1 Hapus client-side role redirect dari `src/app/(dashboard)/dashboard/page.tsx`
    - Hapus `useEffect` yang melakukan `router.replace(PATHS.salesDashboard)` berdasarkan `profile.role_name`
    - Hapus guard condition `BUSINESSFLOW.salesRoles.includes(profile.role_name)` yang menampilkan loading
    - Hapus import `useRouter` (jika tidak dipakai lagi)
    - Hapus import `BUSINESSFLOW` (jika tidak dipakai lagi)
    - Pertahankan `useUserProfile` untuk data profil yang dibutuhkan `useDetailData`
    - Simplifikasi `enabled` condition di `useDetailData` — middleware sudah menjamin hanya backoffice yang sampai ke halaman ini
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 7.2 Update `useUserProfile` store di `src/store/useUserProfile.ts` untuk sync role cookie
    - Import `syncRoleCookie` dari `@actions/auth/auth.actions`
    - Setelah `fetchProfile` berhasil dan `res.data.role_name` tersedia, panggil `syncRoleCookie(res.data.role_name)` secara fire-and-forget (tanpa await)
    - Ini memastikan cookie selalu sinkron dengan data profil terbaru dari API
    - _Requirements: 6.1, 6.2_

- [x] 8. Final checkpoint — TypeScript verification
  - Jalankan `npx tsc --noEmit` dan pastikan tidak ada error
  - Verifikasi semua file yang dimodifikasi: `env.ts`, `secure-cookie.ts`, `auth.actions.ts`, `middleware.ts`, `layout.tsx`, `Sidebar.tsx`, `Navbar.tsx`, `NotificationBell.tsx`, `BackofficeStatus.tsx`, `dashboard/page.tsx`, `useUserProfile.ts`
  - Tanyakan ke user jika ada pertanyaan

- [x] 9. Update dokumentasi
  - [x] 9.1 Update `docs/ARCHITECTURE.md`
    - Tambahkan penjelasan tentang role-based routing via cookie di middleware
    - Update data flow diagram jika ada
    - Dokumentasikan cookie `role_name` di bagian authentication/cookies
    - _Requirements: 1.1, 3.1_

  - [x] 9.2 Update `README.md`
    - Tambahkan catatan tentang role cookie di bagian authentication jika relevan
    - _Requirements: 1.1_

  - [x] 9.3 Update `CLAUDE.md`
    - Tambahkan referensi ke role cookie pattern di bagian yang relevan
    - Update informasi middleware routing
    - _Requirements: 3.1_

## Notes

- Semua perubahan ada di workspace `lingkar-crm/` (frontend-only, TypeScript/Next.js)
- Tidak ada property-based tests karena fitur ini berupa routing logic dengan input terbatas dan cookie side-effects (lihat design document bagian Testing Strategy)
- Checkpoints memastikan TypeScript compilation pass di setiap tahap penting
- Graceful degradation: jika role cookie tidak ada, middleware dan Sidebar fallback ke perilaku saat ini
- Setiap task mereferensikan requirements spesifik untuk traceability
