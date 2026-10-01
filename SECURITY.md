# Keamanan

## Pelaporan Kerentanan

Jangan membuat issue publik untuk kerentanan. Gunakan **Private vulnerability reporting** pada tab Security repositori GitHub, atau hubungi maintainer melalui kanal privat yang terdaftar di profil organisasi.

Maintainer akan mengonfirmasi penerimaan sesegera mungkin, menilai dampak, dan mengoordinasikan perbaikan serta advisori sebelum publikasi.

## Kontrol Keamanan Aktif

### Autentikasi & Otorisasi
- JWT access token 15 menit, refresh token berotasi 7 hari
- Role-based access control server-side (ADMIN, SUPERVISOR, CASHIER, BARISTA, COURIER, FINANCE, OWNER)
- PIN 6 digit untuk aksi cepat di POS tanpa logout
- Pelanggan tanpa password (OTP WhatsApp)

### Data & Privasi
- Nomor telepon dan alamat terenkripsi di kolom database
- `X-Tenant-Id` dan `X-Outlet-Id` wajib untuk semua API
- Row Level Security PostgreSQL aktif untuk semua role aplikasi
- Tidak ada data kartu yang menyentuh server (payment via gateway)

### Audit
- Log audit tak berubah (tambah-saja) untuk semua perubahan state
- Setiap entri audit: aktor, tindakan, nilai lama & baru, IP, trace_id
- Retensi minimal 5 tahun sesuai kebutuhan pembukuan

### Operasional
- Dependabot scanning mingguan untuk npm dan GitHub Actions
- CodeQL analysis di setiap CI run
- Secret scanning diaktifkan di pengaturan organisasi
- Branch protection pada `main` (require CI + review)

## Status Saat Ini

⚠️ **Aplikasi masih dalam pengembangan.** Jangan gunakan untuk transaksi nyata sampai:

1. Backend NestJS + PostgreSQL berjalan dengan migrasi
2. Autentikasi server-side berfungsi
3. Payment gateway terintegrasi
4. Uji coba E2E untuk mode offline berhasil
5. Audit log dan RLS PostgreSQL dikonfigurasi

## Rahasia yang Tidak Boleh Di-commit

- `JWT_SECRET` / `JWT_REFRESH_SECRET`
- `DATABASE_URL` dengan credential
- API key payment gateway
- Kunci enkripsi
- Credential cloud provider

Gunakan GitHub Secrets atau `.env` yang sudah ada di `.gitignore`.
