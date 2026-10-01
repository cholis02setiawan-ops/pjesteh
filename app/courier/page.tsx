"use client";
import { useState } from "react";
import { formatIDR } from "@/lib/money";

type CourierTask = { id: string; addr: string; status: string; cod: number; fee: number };
export default function Courier() {
  const [tasks, setTasks] = useState<CourierTask[]>([
    { id:"DLV-0144", addr:"Jl. Galuh Mas Blok B No.12", status:"DITUGASKAN", cod: 44000, fee: 12000 },
    { id:"DLV-0145", addr:"Jl. Tuparev 45", status:"DIAMBIL", cod: 0, fee: 8000 },
  ]);
  return (
    <div className="mx-auto max-w-[560px] px-4 py-6">
      <h1 className="font-bold text-lg">PWA Kurir</h1>
      <p className="text-sm text-stone-600">Geolocation + Wake Lock saat antar · Unggah bukti serah · Setor COD</p>
      <div className="mt-4 space-y-3">
        {tasks.map(t=>(
          <div key={t.id} className="rounded-2xl border border-stone-200 bg-white p-4">
            <div className="flex justify-between">
              <b>{t.id}</b>
              <span className="text-xs px-2 py-1 rounded-full bg-amber-50 border border-amber-200">{t.status}</span>
            </div>
            <div className="text-sm mt-1">{t.addr}</div>
            <div className="text-xs text-stone-500">Ongkir {formatIDR(t.fee)} {t.cod?`· COD ${formatIDR(t.cod)} dipegang kurir (piutang)`:""}</div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={()=>setTasks(s=> s.map(x=> x.id===t.id? {...x, status:"DIAMBIL"}:x))} className="py-2 rounded-full bg-teal-700 text-white text-xs font-semibold">Tandai Diambil</button>
              <button onClick={()=>setTasks(s=> s.map(x=> x.id===t.id? {...x, status:"TERKIRIM"}:x))} className="py-2 rounded-full bg-stone-900 text-white text-xs font-semibold">Unggah Bukti + Terkirim</button>
            </div>
            {t.cod>0 && <button onClick={()=>alert(`Setor COD ${formatIDR(t.cod)} ke kasir → D 1-1100 Kas / K 1-1310 Piutang kurir · CodRemitted`)} className="mt-2 w-full py-2 rounded-full border text-xs">Setor COD ke Kasir</button>}
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-3 text-xs">Notifikasi tugas baru via Push VAPID + WebSocket. Mantapkan <code className="bg-stone-100 px-1 rounded">Wake Lock</code> agar layar tidak mati selama perjalanan.</div>
    </div>
  );
}
