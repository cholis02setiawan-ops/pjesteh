# ADR-007: Offline-First untuk POS

**Status:** Accepted
**Date:** September 2026
**Context:** Kasir harus tetap melayani saat internet mati. Ini adalah persyaratan non-negotiable karena outlet tidak boleh berhenti beroperasi.
**Decision:** POS berjalan sepenuhnya offline menggunakan IndexedDB via Dexie.js. Transaksi disimpan di antrean lokal dengan idempotency_key. Background sync mengirim saat koneksi pulih.
**Consequences:**
- Nomor struk sementara di-generasi lokal, nomor final dari server
- Promo berbasis kuota global tidak bisa di-validasi offline
- Saldo poin dinonaktifkan saat offline
- Stok mungkin minus saat sinkron, diselesaikan dengan tugas penyesuaian
- Server adalah sumber kebenaran, bukan perangkat

## ADR-008: Server-Side Authentication

**Status:** Accepted
**Date:** September 2026
**Context:** Prototipe saat ini menyimpan credential di localStorage. Ini bukan kontrol keamanan produksi.
**Decision:** JWT access token (15 menit) + refresh token (7 hari, berotasi). Otentikasi server-side via PostgreSQL + bcrypt. RLS PostgreSQL menegakkan tenant isolation.
**Consequences:**
- Pelanggan tidak perlu password (OTP WhatsApp)
- Staf memakai password + PIN 6 digit untuk aksi cepat
- Semua endpoint memeriksa tenant_id dari token, bukan dari header
- Role-based access control di server, bukan UI only

## ADR-009: Minimal Accounting Scope

**Status:** Accepted
**Date:** September 2026
**Context:** Blueprint menggambarkan neraca penuh, laporan arus kas, catatan atas. Untuk pilot, ini terlalu berat.
**Decision:** Fokus pada laporan laba rugi dan jurnal berpasangan. Neraca dan arus kas bisa ditambahkan di fase selanjutnya tanpa migrasi data.
**Consequences:**
- Struktur akun disederhanakan (kelompok akun esensial saja)
- Laporan laba rugi per produk/kategori/kanal/kasir
- Ekspor ke CSV untuk eksternal software akuntansi
- Kapan pun dibutuhkan, neraca bisa dibangun di atas data jurnal yang sudah ada

## ADR-010: Simple Deposit Policy

**Status:** Accepted
**Date:** September 2026
**Context:** Blueprint menggambarkan kebijakan DP sangat kompleks (per-tanggal, per-area, per-hari).
**Decision:** Mulai dari sederhana — nominal tetap untuk rombongan besar. Kembangkan setelah data perilaku pelanggan nyata.
**Consequences:**
- Kebijakan default: DP nominal tetap untuk rombongan 6+ orang
- Tanpa perhitungan persentase di awal
- Configurable via admin panel tanpa deploy
- Kapan pun bisa naikkan kerumitan (versioned policy)
