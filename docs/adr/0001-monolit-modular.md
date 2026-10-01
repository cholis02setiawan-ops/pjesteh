# Architecture Decision Records

## ADR-001: Monolit Modular dulu, Pecah Belakangan

**Status:** Accepted
**Date:** September 2026
**Context:** Blueprint menggambarkan sistem multi-outlet multi-tenant dengan 5 modul besar. Memecah jadi mikrolayanan sejak awal menambah overhead operasional yang tidak sebanding dengan skala pilot (1 outlet).
**Decision:** Bangun monolit modular dengan batas modul yang ditegakkan lewat aturan impor. Pisahkan modul hanya ketika ada beban operasional yang membenarkan.
**Consequences:**
- Kode lebih sederhana di awal, satu proses deploy
- Tidak ada overhead jaringan antar-layanan
- Kapan pun dibutuhkan, modul bisa diangkat tanpa membongkar ulang (pakai domain events)

## ADR-002: PostgreSQL dengan tipe numeric untuk uang

**Status:** Accepted
**Date:** September 2026
**Context:** Penyimpanan uang harus presisi. Floating point (float/double) menimbulkan error pembulatan yang tidak dapat diterima dalam kontrak keuangan.
**Decision:** Gunakan `numeric(18,2)` di PostgreSQL dan `bigint` dalam satuan sen di TypeScript. Tidak ada pembulatan kecuali di sisi presentation.
**Consequences:**
- Kueri agak lebih lambat dari float, tapi dapat diterima
- Semua uang dihitung di sisi server, tidak di klien
- Audit trail dapat telusuri ke sen

## ADR-003: Outbox Pattern untuk Event

**Status:** Accepted
**Date:** September 2026
**Context:** Event domain harus andal. Jika proses mati di tengah kirim event, event bisa hilang dan jurnal tidak posting.
**Decision:** Event ditulis ke tabel `domain_events` dalam transaksi database yang sama dengan perubahan bisnis. Worker mengirim secara async dengan deduplikasi.
**Consequences:**
- Tidak ada event yang hilang saat crash
- Sedikit lebih lambat dibanding langsung publish, tapi andal
- Worker perlu handle retry dan dead letter queue

## ADR-004: Uang Muka adalah Liabilitas, Bukan Pendapatan

**Status:** Accepted
**Date:** September 2026
**Context:** DP reservasi sering disalahpahami sebagai pendapatan langsung, sehingga laporan laba rugi melebih-lebihkan pendapatan bulan berjalan.
**Decision:** DP dicatat sebagai `Pendapatan Diterima di Muka` (liabilitas). Baru diakui sebagai pendapatan saat tamu datang atau DP hangus.
**Consequences:**
- Laporan keuangan akurat sesuai SAK
- Perlu akun tambahan di bagan akun (2-1200)
- Kode lebih kompleks tapi benar

## ADR-005: PWA Satu Aplikasi untuk Semua Peran

**Status:** Accepted
**Date:** September 2026
**Context:** Blueprint menggambarkan 4 antarmuka terpisah (QR menu, POS, KDS, Kurir). Aplikasi native akan menambah kompleksitas pengembangan dan distribusi.
**Decision:** Satu basis kode Next.js dengan manifest.json terpisah per peran. Setiap role menginstal PWA dengan ikon dan nama berbeda.
**Consequences:**
- Satu proses build, satu CI/CD
- Tablet Android direkomendasikan (iOS support terbatas untuk PWA offline)
- WebBluetooth/WebUSB memerlukan agen cetak cadangan untuk Safari

## ADR-006: Satu Region Cloud Jakarta

**Status:** Accepted
**Date:** September 2026
**Context:** Pelanggan semua di Indonesia. Multi-region menambah kompleksitas replikasi tanpa manfaat latensi signifikan karena POS sudah offline-first.
**Decision:** Deploy satu region (Jakarta) dengan replika di zona ketersediaan berbeda. Ketahanan dari WAL backup + snapshot harian.
**Consequences:**
- Lebih sederhana operasional
- RTO 1 jam, RPO 5 menit via backup
- Tidak perlu latensi cross-region
