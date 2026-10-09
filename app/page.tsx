import { outlets } from "@/lib/data";
import { MenuPreviewGrid } from "@/lib/MenuPreviewGrid";

export default function Home() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-6 sm:py-8">
      {/* Hero */}
      <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 items-stretch">
        <div className="rounded-[24px] bg-gradient-to-br from-teal-700 to-teal-600 text-white p-6 sm:p-8 flex flex-col justify-between overflow-hidden relative">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] tracking-widest bg-white/15 border border-white/20 rounded-full px-3 py-1">PWA + REST API · MONOLIT MODULAR · OFFLINE-FIRST</div>
            <h1 className="mt-4 text-2xl sm:text-[36px] font-bold leading-tight tracking-tight">Satu platform untuk<br />jual, pesan, dan tutup buku</h1>
            <p className="mt-3 text-sm sm:text-[15px] leading-6 text-teal-50 max-w-[560px]">QR di meja, kasir tetap jalan saat internet mati, reservasi dengan uang muka yang diatur admin, antar dengan zona tarif, dan buku besar berpasangan otomatis.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href="/m/KRW01/M03" className="px-5 py-2.5 rounded-full bg-white text-teal-700 font-semibold text-sm hover:bg-stone-50 transition">Coba Pesan via QR →</a>
              <a href="/pos" className="px-5 py-2.5 rounded-full bg-amber-400 text-stone-900 font-semibold text-sm hover:bg-amber-300 transition">Buka POS Kasir</a>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[{k:"40% ↓", v:"Waktu layan jam sibuk"}, {k:"100%", v:"POS offline tanpa hilang data"}, {k:"<0.3%", v:"Selisih kas per shift"}].map(s=>(
              <div key={s.k} className="rounded-2xl bg-white/10 border border-white/15 p-3 backdrop-blur">
                <div className="text-lg font-bold">{s.k}</div>
                <div className="text-xs text-teal-50 leading-tight">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[24px] border border-stone-200 bg-white p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-stone-900">Kanal pesanan</h2>
            <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Live · Socket.IO Redis</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { title:"QR Meja", desc:"Pindai, pesan, bayar", href:"/m/KRW01/M03", icon:"📱", color:"bg-teal-50 border-teal-200" },
              { title:"POS Kasir", desc:"Shift, tunai, cetak", href:"/pos", icon:"🧾", color:"bg-amber-50 border-amber-200" },
              { title:"Reservasi DP", desc:"Kebijakan admin", href:"/reservasi", icon:"📅", color:"bg-violet-50 border-violet-200" },
              { title:"Pengiriman", desc:"Zona & kurir", href:"/delivery", icon:"🛵", color:"bg-sky-50 border-sky-200" },
            ].map(c=>(
              <a key={c.title} href={c.href} className={`rounded-2xl border p-4 hover:shadow-sm transition ${c.color}`}>
                <div className="text-2xl">{c.icon}</div>
                <div className="mt-2 font-semibold text-sm text-stone-900">{c.title}</div>
                <div className="text-xs text-stone-600">{c.desc}</div>
                <div className="mt-2 text-xs font-medium text-stone-700">Buka →</div>
              </a>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <a href="/kds" className="rounded-2xl bg-stone-900 text-white p-4 flex items-center justify-between">
              <div><div className="font-semibold text-sm">Layar Dapur KDS</div><div className="text-xs text-stone-300">Antrean real-time</div></div>
              <span className="text-xl">👨‍🍳</span>
            </a>
            <a href="/admin" className="rounded-2xl border border-stone-200 p-4 flex items-center justify-between">
              <div><div className="font-semibold text-sm">Akuntansi</div><div className="text-xs text-stone-500">Jurnal & laporan</div></div>
              <span className="text-xl">📊</span>
            </a>
          </div>
        </div>
      </div>

      {/* Outlets */}
      <div className="mt-6 flex items-center justify-between">
        <h3 className="font-semibold">Outlet aktif</h3>
        <a href="/admin" className="text-xs px-3 py-1.5 rounded-full border border-stone-200 hover:bg-stone-50">Kelola outlet →</a>
      </div>
      <div className="mt-3 grid sm:grid-cols-2 gap-3">
        {outlets.map(o=>(
          <div key={o.code} className="rounded-2xl border border-stone-200 bg-white p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-sm">{o.code.slice(0,3)}</div>
            <div className="flex-1">
              <div className="font-semibold text-sm">{o.name}</div>
              <div className="text-xs text-stone-500">{o.addr}</div>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Buka</span>
          </div>
        ))}
      </div>

      {/* Menu preview */}
      <div className="mt-6 flex items-center justify-between">
        <h3 className="font-semibold">Menu unggulan</h3>
        <a href="/m/KRW01/M03" className="text-sm text-teal-700 font-medium hover:underline">Lihat menu QR →</a>
      </div>
      <MenuPreviewGrid />

      {/* Architecture strip */}
      <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-4">
        <div className="text-xs tracking-widest text-stone-500 font-semibold">ARSITEKTUR · BAGIAN 3</div>
        <div className="mt-2 grid lg:grid-cols-4 gap-3 text-xs leading-5">
          <div className="rounded-xl bg-stone-50 border border-stone-200 p-3"><b>Frontend</b><br/>Next.js 15 + PWA Serwist + Dexie + TanStack Query + Zustand<br/><span className="text-stone-500">Menu QR SSR, POS offline-first</span></div>
          <div className="rounded-xl bg-stone-50 border border-stone-200 p-3"><b>Backend</b><br/>NestJS 11 + REST OpenAPI 3.1 + Socket.IO Redis<br/><span className="text-stone-500">Monolit modular, outbox pattern</span></div>
          <div className="rounded-xl bg-stone-50 border border-stone-200 p-3"><b>Data</b><br/>PostgreSQL 16 (partisi, RLS) + Redis 7 + BullMQ<br/><span className="text-stone-500">R2/MinIO S3, numeric(18,2)</span></div>
          <div className="rounded-xl bg-stone-50 border border-stone-200 p-3"><b>Infra</b><br/>Traefik + Coolify + OTel → Grafana/Loki/Tempo<br/><span className="text-stone-500">1 region Jakarta, RTO 1j</span></div>
        </div>
      </div>
    </div>
  );
}
