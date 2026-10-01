"use client";
import { kdsOrders } from "@/lib/data";
import { useState } from "react";

type KdsOrder = { id: string; number: string; channel: string; table: string; time: string; items: number; status: string; eta: string };
export default function KDS() {
  const [orders, setOrders] = useState<KdsOrder[]>(kdsOrders as KdsOrder[]);
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-bold">Layar Dapur KDS</h1>
        <span className="text-xs px-3 py-1.5 rounded-full bg-stone-900 text-white">Landscape lock · Socket.IO</span>
        <span className="text-xs px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">● 3 antrean · Terhubung</span>
        <span className="text-xs px-3 py-1.5 rounded-full bg-amber-400 text-stone-900">Avg 6.2 menit</span>
      </div>
      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {orders.map(o=>(
          <div key={o.id} className="rounded-2xl border-2 bg-white p-4 flex flex-col min-h-[180px]" style={{borderColor: o.status==="SIAP" ? "#10b981" : o.status==="DIPROSES" ? "#f59e0b" : "#e7e5e4"}}>
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold text-sm">{o.number}</div>
                <div className="text-xs text-stone-500">{o.channel} · Meja {o.table} · {o.time}</div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${o.status==="SIAP"?"bg-emerald-50 border-emerald-200 text-emerald-700": o.status==="DIPROSES"?"bg-amber-50 border-amber-200 text-amber-700":"bg-stone-100 border-stone-200"}`}>{o.status}</span>
            </div>
            <div className="mt-3 text-sm">
              <div>• 2x Es Teh Large (Less Sugar, Es Terpisah)</div>
              <div>• 1x Pisang Goreng Madu</div>
              <div className="text-xs text-stone-500 mt-1">Catatan: jangan terlalu manis</div>
            </div>
            <div className="mt-auto pt-3 flex gap-2">
              {o.status!=="SIAP" ? (
                <button onClick={()=>setOrders(s=> s.map(x=> x.id===o.id? {...x, status:"SIAP", eta:"Siap"}:x))} className="flex-1 py-2 rounded-full bg-teal-700 text-white text-sm font-semibold">Tandai Siap →</button>
              ) : (
                <button onClick={()=>setOrders(s=> s.filter(x=> x.id!==o.id))} className="flex-1 py-2 rounded-full bg-emerald-600 text-white text-sm font-semibold">Serahkan ✓</button>
              )}
              <span className="px-3 py-2 rounded-full border text-xs bg-stone-50">ETA {o.eta}</span>
            </div>
          </div>
        ))}
        <div className="rounded-2xl border-2 border-dashed border-stone-300 p-4 flex items-center justify-center text-sm text-stone-500 min-h-[180px]">Menunggu pesanan baru…<br/>Dorong via WebSocket</div>
      </div>
      <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-3 text-xs leading-5">
        <b>Aturan:</b> QR yang bayar di kasir tidak masuk KDS sebelum kasir konfirmasi (anti iseng). Pesanan dikirim sebagai event <code className="bg-stone-100 px-1 rounded">OrderPaid</code> → diposting ke jurnal otomatis (outbox + worker).
      </div>
    </div>
  );
}
