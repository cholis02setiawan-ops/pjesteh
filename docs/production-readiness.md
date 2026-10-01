name: Esteh Platform
description: Pengembangan platform penjualan es teh

projects:
  - title: "🔴 Sprint 1 — Fondasi Backend"
    description: "Backend NestJS, PostgreSQL, migrasi, auth, domain model"
    labels: ["priority:critical", "area:backend"]
    milestone: "0.1.0"
    estimated_points: 21

  - title: "🟠 Sprint 2 — Kasir (POS)"
    description: "Katalog, POS offline, shift, jurnal, cetak struk"
    labels: ["area:pos", "priority:high"]
    milestone: "0.2.0"
    estimated_points: 42

  - title: "🟡 Sprint 3 — Pesan QR"
    description: "Menu QR, sesi meja, pembayaran QRIS, layar dapur"
    labels: ["area:ordering", "priority:high"]
    milestone: "0.3.0"
    estimated_points: 28

  - title: "🟢 Sprint 4 — Reservasi & Persediaan"
    description: "Slot, kebijakan DP, resep, mutasi stok, HPP"
    labels: ["area:reservation", "area:inventory"]
    milestone: "0.4.0"
    estimated_points: 28

  - title: "🔵 Sprint 5 — Pengiriman & Laporan"
    description: "Zona, tarif, kurir, laporan laba rugi"
    labels: ["area:delivery", "area:reporting"]
    milestone: "0.5.0"
    estimated_points: 28

  - title: "⚪ Sprint 6 — Skala & Polish"
    description: "Multi-outlet, promo, loyalitas, observability"
    labels: ["area:scale"]
    milestone: "1.0.0"
    estimated_points: 35

workflow:
  - name: Backlog
  - name: "In Progress"
    column_id: 2
  - name: Review
  - name: Done
