# Contributing

## Branch Strategy

- `main` → Production-ready (branch protection aktif)
- `develop` → Integration branch
- `feature/*` → Fitur baru (PR ke `develop`)
- `release/*` → Persiapan rilis
- `hotfix/*` → Perbaikan darurat (PR ke `main` dan `develop`)

## Commit Convention

```
<type>(<scope>): <subject>

Examples:
feat(order): tambah void order
fix(auth): perbaiki refresh token expired
refactor(accounting): optimasi query jurnal
docs(readme): update installation guide
test(ordering): tambah unit test confirmOrder
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `style`, `chore`, `security`

## Development

```bash
pnpm install
pnpm dev                    # Jalankan semua package
pnpm --filter @esteh/api dev   # Jalankan API saja
pnpm --filter @esteh/web dev   # Jalankan Web saja
pnpm test                    # Unit tests
pnpm --filter @esteh/api run test:integration  # Integration tests
pnpm build                   # Build semua package
```

## PR Checklist

Sebelum PR, pastikan:
- [ ] `pnpm lint` hijau
- [ ] `pnpm exec tsc --noEmit` hijau
- [ ] `pnpm build` hijau
- [ ] Unit tests passing
- [ ] Tidak ada secret/data sensitif di code
- [ ] Perubahan skema punya migrasi
- [ ] Perubahan akses/otorisasi sudah ditinjau
- [ ] Update dokumentasi jika ada perubahan API
