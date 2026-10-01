"use client";
import { useState, useMemo } from "react";
import { depositPolicies, products, variants } from "@/lib/data";
import { formatIDR } from "@/lib/money";

export default function Reservasi() {
  const [party, setParty] = useState(8);
  const [date, setDate] = useState("2026-10-04");
  const [time, setTime] = useState("19:00");
  const [area, setArea] = useState("a_lesehan");
  const [preOrderQty, setPreOrderQty] = useState(2);
  const [showResult, setShowResult] = useState(false);

  const policy = useMemo(()=>{
    // priority: weekend + lesehan > base
    const isWeekend = new Date(date).getDay()===0 || new Date(date).getDay()===6;
    if (party>=6 && area==="a_lesehan" && isWeekend) return depositPolicies[0];
    if (party>=6) return depositPolicies[1];
    return depositPolicies[2];
  }, [party, area, date]);

  const preOrderTotal = 8* (products[0].price + 4000) * (preOrderQty/2); // mock
  const deposit = policy.calc_method==="PER_PAX" ? policy.value*party : policy.calc_method==="FLAT" ? policy.value : 0;
  const clamped = policy.max_amount? Math.min(deposit, policy.max_amount): deposit;

  return (
    <div className="mx-auto max-w-[980px] px-4 py-6">
      <h1 className="text-xl font-bold">Reservasi — Uang Muka diatur Admin</h1>
      <p className="text-sm text-stone-600">Kebijakan versioned: reservasi terkunci ke <code className="bg-stone-100 px-1 rounded">policy_version_id</code> saat dibuat. DP adalah liabilitas <code className="bg-stone-100 px-1 rounded">2-1200</code>, bukan pendapatan.</p>

      <div className="mt-4 grid lg:grid-cols-[1.1fr_0.9fr] gap-4 items-start">
        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="text-sm">Tanggal<input type="date" value={date} onChange={e=>setDate(e.target.value)} className="mt-1 w-full rounded-full border border-stone-200 px-3 py-2" /></label>
            <label className="text-sm">Jam<input type="time" value={time} onChange={e=>setTime(e.target.value)} className="mt-1 w-full rounded-full border border-stone-200 px-3 py-2" /></label>
            <label className="text-sm">Jumlah orang<input type="number" value={party} onChange={e=>setParty(parseInt(e.target.value)||0)} className="mt-1 w-full rounded-full border border-stone-200 px-3 py-2" /></label>
            <label className="text-sm">Area
              <select value={area} onChange={e=>setArea(e.target.value)} className="mt-1 w-full rounded-full border border-stone-200 px-3 py-2">
                <option value="a_lesehan">Lesehan</option>
                <option value="a_indoor">Indoor</option>
                <option value="a_outdoor">Outdoor</option>
              </select>
            </label>
          </div>
          <div className="mt-3">
            <div className="text-sm font-semibold">Pra-pesan menu (opsional)</div>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span>8x Es Teh Large</span>
              <input type="range" min={0} max={8} value={preOrderQty} onChange={e=>setPreOrderQty(parseInt(e.target.value))} />
              <span>{preOrderQty} item</span>
              <span className="ml-auto text-stone-500">{formatIDR(preOrderTotal)}</span>
            </div>
            <div className="mt-2 flex gap-2">
              <button onClick={()=>setShowResult(true)} className="flex-1 py-2.5 rounded-full bg-teal-700 text-white font-semibold text-sm">Hitung DP — POST /reservations/quote</button>
              <button className="px-4 py-2.5 rounded-full border text-sm">Cek ketersediaan SLOT</button>
            </div>
            <div className="mt-2 text-xs text-stone-500">Kapasitas: max 8 reservasi per slot 90 menit · Tanggal tutup: Idul Fitri · Slot dilepas jika lewat <code className="bg-stone-100 px-1 rounded">payment_window 60m</code></div>
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <div className="font-semibold">Kebijakan terpilih <span className="text-xs font-normal text-stone-500">prioritas {policy.priority}</span></div>
          <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <div className="font-semibold text-sm">{policy.name}</div>
            <div className="text-xs text-stone-600">{policy.scope} · Metode {policy.calc_method} · {policy.calc_method==="PER_PAX" ? `${formatIDR(policy.value)}/orang` : formatIDR(policy.value)}</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-white border p-2"><div className="text-stone-500">DP dihitung</div><div className="font-bold">{formatIDR(clamped)}</div><div className="text-stone-500">{policy.calc_method==="PER_PAX" ? `25k × ${party}`: "flat"}</div></div>
              <div className="rounded-xl bg-white border p-2"><div className="text-stone-500">Jatuh tempo</div><div className="font-bold">{policy.payment_window_minutes} menit</div><div className="text-stone-500">via QRIS/VA</div></div>
            </div>
            <div className="mt-2 text-xs">
              <div className="font-semibold">Tangga pembatalan:</div>
              <div className="flex gap-1.5 mt-1">
                {policy.cancellation_tiers.map(t=>(
                  <span key={t.hoursBefore} className="px-2 py-1 rounded-full bg-white border text-xs">{">"} {t.hoursBefore}j: {t.refundPercent}% kembali</span>
                ))}
                {policy.cancellation_tiers.length===0 && <span className="text-stone-500">Tanpa DP — bebas batal</span>}
              </div>
              <div className="mt-1 text-stone-600">Tidak datang lewat 30 menit → <b>hangus</b> → diakui sebagai <code className="bg-white px-1 rounded border">4-1400 Pendapatan DP hangus</code></div>
            </div>
          </div>
          {showResult && (
            <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm">
              <div className="font-semibold">Quote — 200 OK</div>
              <pre className="mt-1 text-xs bg-white border rounded-xl p-2 overflow-auto">{`{
  "policyVersionId": "${policy.id}",
  "calcMethod": "${policy.calc_method}",
  "depositRequired": ${clamped},
  "paymentDueAt": "2026-09-24T15:05:00+07:00",
  "allowedMethods": ["QRIS","VA_BCA","VA_MANDIRI"],
  "onArrival": "${policy.on_arrival}",
  "cancellationTiers": ${JSON.stringify(policy.cancellation_tiers)}
}`}</pre>
              <button className="mt-2 w-full py-2 rounded-full bg-stone-900 text-white text-sm">Buat Reservasi & Terbitkan Tagihan DP</button>
              <div className="mt-1 text-xs text-stone-600">Webhook lunas → <code className="bg-white px-1 rounded border">DepositReceived</code> D 1-1300 / K 2-1200. Saat tamu datang → <code className="bg-white px-1 rounded border">DepositApplied</code> potong tagihan.</div>
            </div>
          )}
          <div className="mt-3 rounded-xl border border-stone-200 p-3 text-xs leading-5">
            <b>Aturan versioned:</b> Ubah kebijakan tidak pengaruhi reservasi yang sudah terbit (simpan <code className="bg-stone-100 px-1 rounded">policy_version_id</code>). Slot dikunci sementara saat quote.
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-900 text-white p-4">
        <div className="font-semibold">Kelola Kebijakan DP (Admin)</div>
        <div className="mt-2 grid sm:grid-cols-3 gap-2 text-xs">
          {depositPolicies.map(p=>(
            <div key={p.id} className="rounded-xl bg-white/10 border border-white/15 p-3">
              <div className="font-semibold">{p.name}</div>
              <div className="text-white/70">{p.calc_method} · {p.scope}</div>
              <div className="mt-1">Min party: {p.min_party_size} · Bayar {p.payment_window_minutes}m</div>
            </div>
          ))}
        </div>
        <div className="mt-2 text-xs text-white/70">CRUD di <code className="bg-white/20 px-1 rounded">GET/POST/PUT /admin/deposit-policies</code> · prioritas + scope paling spesifik menang.</div>
      </div>
    </div>
  );
}
