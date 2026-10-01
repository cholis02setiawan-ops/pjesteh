"use client";
import { useState } from "react";
import { zones, products } from "@/lib/data";
import { formatIDR } from "@/lib/money";

export default function Delivery() {
  const [address, setAddress] = useState("Jl. Galuh Mas, Karawang");
  const [zoneIdx, setZoneIdx] = useState(1);
  const [cod, setCod] = useState(false);
  const [eta, setEta] = useState(18);
  const product = products[0];
  const zone = zones[zoneIdx];
  const distance = [2.1, 5.4, 9.8][zoneIdx];
  const fee = zone.fee + (zoneIdx>0 ? Math.round((distance-3)*zone.perKm) : 0);
  const durability = product.durability_minutes;
  const blocked = eta > durability;

  return (
    <div className="mx-auto max-w-[980px] px-4 py-6">
      <h1 className="text-xl font-bold">Pesanan Antar — Zona, Kurir & COD</h1>
      <p className="text-sm text-stone-600">Tarif per zona (0-3, 3-7, &gt;7 km) · jarak rute sungguhan (bukan garis lurus) · guard <code className="bg-stone-100 px-1 rounded">durabilitas_menit</code> agar es tidak cair.</p>

      <div className="mt-4 grid lg:grid-cols-[1.1fr_0.9fr] gap-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <label className="text-sm font-medium">Alamat antar
            <input value={address} onChange={e=>setAddress(e.target.value)} className="mt-1 w-full rounded-full border border-stone-200 px-3 py-2 text-sm" />
          </label>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {zones.map((z,i)=>(
              <button key={z.id} onClick={()=>{setZoneIdx(i); setEta([12,18,32][i]);}} className={`rounded-xl border p-3 text-left ${zoneIdx===i?"border-teal-700 bg-teal-50":"bg-white border-stone-200"}`}>
                <div className="h-2 rounded-full" style={{background:z.color}} />
                <div className="font-semibold text-xs mt-1">{z.name}</div>
                <div className="text-xs text-stone-500">Fee {formatIDR(z.fee)}{z.perKm?` + ${formatIDR(z.perKm)}/km`:""}</div>
              </button>
            ))}
          </div>

          <div className="mt-3 rounded-xl border p-3 flex items-center gap-3" style={{borderColor: blocked? "#fecaca":"#e7e5e4", background: blocked?"#fef2f2":"#fff"}}>
            <div className="text-2xl">🗺️</div>
            <div className="text-sm">
              <div><b>Jarak rute:</b> {distance} km · <b>ETA:</b> {eta} menit · <b>Zona:</b> {zone.name}</div>
              <div className="text-xs" style={{color: blocked? "#dc2626":"#57534e"}}>Durabilitas {product.name}: {durability} menit {blocked? "⚠️ Melebihi batas — es akan cair!" : "✓ Layak kirim"}</div>
            </div>
          </div>

          {blocked && <div className="mt-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm">Saran: pilih varian <b>Es Terpisah</b> atau tanpa es. Sistem menolak alamat yang ETA &gt; durabilitas.</div>}

          <div className="mt-3 flex items-center gap-2 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={cod} onChange={e=>setCod(e.target.checked)} /> COD</label>
            <span className="text-xs text-stone-500">COD: uang di kurir = <code className="bg-stone-100 px-1 rounded">1-1310 Piutang kurir</code> sampai disetor</span>
          </div>

          <button className="mt-3 w-full py-2.5 rounded-full bg-teal-700 text-white font-semibold text-sm">Hitung — POST /delivery/quote</button>
          <pre className="mt-2 text-xs bg-stone-900 text-stone-100 rounded-xl p-3 overflow-auto">{`{
  "zone": "${zone.name}",
  "distance_km": ${distance},
  "eta_minutes": ${eta},
  "fee": ${fee},
  "minOrder": 25000,
  "freeAbove": 75000,
  "blocked": ${blocked}
}`}</pre>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <div className="font-semibold">Rincian</div>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-stone-500">Ongkir</span><span className="font-semibold">{formatIDR(fee)}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Belanja</span><span>{formatIDR(36000)}</span></div>
              <div className="flex justify-between font-bold"><span>Total</span><span>{formatIDR(36000+fee)}</span></div>
              {cod && <div className="text-xs text-stone-500">COD akan dicatat: D 1-1310 / K 4-11xx + 2-1300. Setor akhir shift → D 1-1100 / K 1-1310</div>}
            </div>
            <button disabled={blocked} className="mt-3 w-full py-2.5 rounded-full bg-amber-400 text-stone-900 font-semibold text-sm disabled:opacity-50">Buat Pesanan Antar</button>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <div className="font-semibold text-sm">Papan Kurir (PWA)</div>
            <div className="mt-2 space-y-2 text-sm">
              {[
                { id:"DLV-0144", addr:"Galuh Mas Blok B", fee: fee, status:"MENUNGGU_KURIR" },
                { id:"DLV-0145", addr:"Tuparev 45", fee: 8000, status:"DALAM_PERJALANAN" },
              ].map(d=>(
                <div key={d.id} className="rounded-xl border p-3 flex items-center justify-between">
                  <div><b>{d.id}</b><div className="text-xs text-stone-500">{d.addr} · {formatIDR(d.fee)}</div></div>
                  <span className={`text-xs px-2 py-1 rounded-full border ${d.status==="DALAM_PERJALANAN"?"bg-amber-50 border-amber-200 text-amber-700":"bg-white border-stone-200"}`}>{d.status}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs text-stone-500">Kurir: terima tugas → navigasi → foto bukti serah → setor COD. Pelacakan tanpa login via tautan.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
