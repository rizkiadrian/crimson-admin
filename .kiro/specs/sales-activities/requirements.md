# Requirements Document

## Introduction

Fitur **Sales Activities** menyediakan halaman daftar (list page) yang menampilkan activity log milik sales user dalam format **timeline/list view** (bukan tabel). Halaman ini memungkinkan sales user melihat riwayat aktivitas mereka secara kronologis, melakukan pencarian, dan memuat data tambahan secara otomatis menggunakan infinite scroll. Data diambil dari endpoint `GET /api/v1/sales/activity-logs` yang sudah tersedia di backend.

## Constraints

- **Frontend-only**: Implementasi dilakukan sepenuhnya di sisi frontend (lingkar-crm). Backend API (`GET /api/v1/sales/activity-logs`) sudah tersedia dengan dukungan pagination (`page`, `per_page`, `search`). Perubahan backend hanya dilakukan jika benar-benar diperlukan.
- **Existing API contract**: Response API mengikuti format standar `{ success, message, data, meta: { http_status, pagination } }` dengan pagination berisi `total`, `per_page`, `current_page`, `last_page`, `next_page_url`, `prev_page_url`.

## Glossary

- **Timeline_View**: Komponen tampilan daftar yang menyajikan data secara vertikal kronologis dengan indikator waktu, ikon tipe aktivitas, dan informasi ringkas per item — bukan format tabel/grid.
- **Activity_Log**: Entitas yang merepresentasikan satu catatan aktivitas sales, berisi informasi tipe, judul, deskripsi, status, lead terkait, dan timestamp.
- **Activity_Card**: Satu item dalam Timeline_View yang menampilkan ringkasan Activity_Log termasuk ikon tipe, judul, status badge, nama lead (jika ada), dan waktu relatif.
- **Status_Badge**: Komponen visual berupa label berwarna yang menunjukkan status Activity_Log (pending, approved, rejected).
- **Type_Icon**: Ikon visual yang membedakan tipe aktivitas (general_note, request_lead_assign, request_update_lead_status).
- **Search_Bar**: Komponen input pencarian yang memfilter Activity_Log berdasarkan judul atau deskripsi.
- **Infinite_Scroll**: Mekanisme pemuatan data otomatis yang mendeteksi posisi scroll user dan memuat halaman berikutnya ketika user mendekati bagian bawah daftar, menggunakan IntersectionObserver.
- **Scroll_Sentinel**: Elemen DOM tidak terlihat yang ditempatkan di bawah item terakhir dalam daftar, diobservasi oleh IntersectionObserver untuk memicu pemuatan data berikutnya.
- **Sales_Activities_Page**: Halaman utama yang menampung Timeline_View beserta Search_Bar dan Infinite_Scroll.
- **Empty_State**: Tampilan yang muncul ketika tidak ada Activity_Log yang ditemukan, baik karena belum ada data maupun hasil pencarian kosong.
- **Loading_State**: Tampilan skeleton/placeholder yang muncul saat data sedang dimuat dari API.
- **Loading_More_Indicator**: Indikator visual (spinner/skeleton) yang muncul di bagian bawah daftar saat halaman berikutnya sedang dimuat.

## Requirements

### Requirement 1: Menampilkan Daftar Activity Log dalam Timeline View

**User Story:** Sebagai sales user, saya ingin melihat daftar aktivitas saya dalam format timeline, sehingga saya dapat memahami riwayat aktivitas secara kronologis.

#### Acceptance Criteria

1. WHEN Sales_Activities_Page dimuat, THE Timeline_View SHALL menampilkan daftar Activity_Log milik user yang sedang login, diurutkan dari yang terbaru.
2. THE Activity_Card SHALL menampilkan informasi berikut untuk setiap Activity_Log: Type_Icon, judul, Status_Badge, nama lead (jika ada), dan waktu relatif dari created_at.
3. WHEN tipe Activity_Log adalah "general_note", THE Type_Icon SHALL menampilkan ikon catatan umum.
4. WHEN tipe Activity_Log adalah "request_lead_assign", THE Type_Icon SHALL menampilkan ikon request assign.
5. WHEN tipe Activity_Log adalah "request_update_lead_status", THE Type_Icon SHALL menampilkan ikon request update status.
6. WHEN status Activity_Log adalah "pending", THE Status_Badge SHALL menampilkan label "Pending" dengan warna kuning/warning.
7. WHEN status Activity_Log adalah "approved", THE Status_Badge SHALL menampilkan label "Approved" dengan warna hijau/success.
8. WHEN status Activity_Log adalah "rejected", THE Status_Badge SHALL menampilkan label "Rejected" dengan warna merah/danger.

### Requirement 2: Pencarian Activity Log

**User Story:** Sebagai sales user, saya ingin mencari aktivitas berdasarkan judul atau deskripsi, sehingga saya dapat menemukan catatan tertentu dengan cepat.

#### Acceptance Criteria

1. THE Sales_Activities_Page SHALL menampilkan Search_Bar di bagian atas halaman.
2. WHEN user mengetik query di Search_Bar, THE Sales_Activities_Page SHALL memfilter Activity_Log berdasarkan judul atau deskripsi yang mengandung query tersebut.
3. WHEN user mengetik di Search_Bar, THE Sales_Activities_Page SHALL menerapkan debounce selama 300-500ms sebelum mengirim request ke API.
4. WHEN pencarian diterapkan, THE Infinite_Scroll SHALL reset ke halaman pertama dan mengosongkan data yang sudah dimuat sebelumnya.
5. WHEN query pencarian dikosongkan, THE Sales_Activities_Page SHALL menampilkan semua Activity_Log tanpa filter, dimulai dari halaman pertama.

### Requirement 3: Infinite Scroll

**User Story:** Sebagai sales user, saya ingin data aktivitas dimuat secara otomatis saat saya scroll ke bawah, sehingga saya dapat menelusuri riwayat tanpa harus mengklik tombol pagination.

#### Acceptance Criteria

1. THE Sales_Activities_Page SHALL memuat maksimal 10 Activity_Log per request API.
2. THE Sales_Activities_Page SHALL menempatkan Scroll_Sentinel di bawah item terakhir dalam Timeline_View.
3. WHEN Scroll_Sentinel terlihat di viewport (terdeteksi oleh IntersectionObserver), THE Sales_Activities_Page SHALL memuat halaman data berikutnya dari API dan menambahkan (append) hasilnya ke daftar yang sudah ada.
4. WHILE halaman berikutnya sedang dimuat, THE Sales_Activities_Page SHALL menampilkan Loading_More_Indicator di bawah item terakhir.
5. WHEN semua data sudah dimuat (current_page >= last_page), THE Sales_Activities_Page SHALL menyembunyikan Scroll_Sentinel dan menghentikan pemuatan otomatis.
6. WHILE halaman berikutnya sedang dimuat, THE Infinite_Scroll SHALL mengabaikan trigger IntersectionObserver tambahan untuk mencegah duplikasi request.

### Requirement 4: Loading State

**User Story:** Sebagai sales user, saya ingin melihat indikator loading saat data sedang dimuat, sehingga saya tahu sistem sedang memproses.

#### Acceptance Criteria

1. WHILE data Activity_Log sedang dimuat untuk pertama kali (halaman pertama), THE Sales_Activities_Page SHALL menampilkan Loading_State berupa skeleton placeholder yang menyerupai bentuk Activity_Card.
2. WHILE halaman berikutnya sedang dimuat via infinite scroll, THE Sales_Activities_Page SHALL menampilkan Loading_More_Indicator berupa spinner atau skeleton kecil di bagian bawah daftar, tanpa menghilangkan data yang sudah ditampilkan.

### Requirement 5: Empty State

**User Story:** Sebagai sales user, saya ingin melihat pesan informatif ketika tidak ada aktivitas, sehingga saya memahami bahwa halaman berfungsi normal.

#### Acceptance Criteria

1. WHEN tidak ada Activity_Log sama sekali, THE Sales_Activities_Page SHALL menampilkan Empty_State dengan pesan "Belum ada aktivitas" dan deskripsi yang mengarahkan user untuk membuat aktivitas baru.
2. WHEN hasil pencarian kosong, THE Sales_Activities_Page SHALL menampilkan Empty_State dengan pesan "Tidak ada hasil ditemukan" dan saran untuk mengubah kata kunci pencarian.
3. THE Empty_State SHALL menampilkan ikon ilustratif yang sesuai konteks.

### Requirement 6: Error Handling

**User Story:** Sebagai sales user, saya ingin melihat pesan error yang jelas ketika terjadi kegagalan, sehingga saya tahu apa yang terjadi dan apa yang harus dilakukan.

#### Acceptance Criteria

1. IF request ke API gagal, THEN THE Sales_Activities_Page SHALL menampilkan pesan error yang deskriptif.
2. IF request ke API gagal, THEN THE Sales_Activities_Page SHALL tetap menampilkan layout halaman dan data yang sudah dimuat sebelumnya tanpa crash.
3. IF request halaman berikutnya gagal saat infinite scroll, THEN THE Sales_Activities_Page SHALL menampilkan pesan error di bawah daftar dengan opsi untuk mencoba memuat ulang.

### Requirement 7: Navigasi dan Routing

**User Story:** Sebagai sales user, saya ingin mengakses halaman Sales Activities dari navigasi utama, sehingga saya dapat dengan mudah menemukan fitur ini.

#### Acceptance Criteria

1. THE Sales_Activities_Page SHALL dapat diakses melalui URL path `/sales-activities`.
2. THE Sales_Activities_Page SHALL menyinkronkan parameter pencarian ke URL query parameter `?search=`.
3. WHEN halaman dimuat dengan query parameter `?search=` di URL, THE Sales_Activities_Page SHALL menerapkan filter pencarian sesuai parameter tersebut.
