"use client";
import { useEffect, useState } from "react";
import { products, variants } from "@/lib/data";
import { formatIDR } from "@/lib/money";

type Tx = { localRef: string; idempotencyKey: string; total: number; method: string; at: string; synced: boolean };

export default function POS() {
  const [shiftOpen, setShiftOpen] = useState(true);
  const [openingFloat] = useState(500000);
  const [cart, setCart] = useState<{id:string; name:string; price:number; qty:number}[]>([]);
  const [tendered, setTendered] = useState("");
  const [method, setMethod] = useState<"CASH"|"QRIS"|"VOUCHER">("CASH");
  const [queue, setQueue] = useState<Tx[]>(()=> {
    if (typeof window==="undefined") return [];
    try { return JSON.parse(localStorage.getItem("pos_queue")||"[]"); } catch { return []; }
  });
  const [online, setOnline] = useState(true);
  const [drawer, setDrawer] = useState(740000);

  useEffect(()=>{
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    setOnline(navigator.onLine);
    return ()=>{ window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); };
  },[]);
  useEffect(()=>{ localStorage.setItem("pos_queue", JSON.stringify(queue)); },[queue]);

  const subtotal = cart.reduce((s,c)=>s + c.price*c.qty, 0);
  const pbjt = Math.round(subtotal*0.1);
  const total = subtotal + pbjt;
  const tender = parseInt(tendered||"0",10) || 0;
  const change = tender - total;

  const syncQueue = () => {
    setQueue(q=> q.map(x=> ({...x, synced: true})));
    setDrawer(d=> d + queue.filter(q=>!q.synced).reduce((s,q)=> s + q.total, 0));
  };

  return (
    <div className="mx-auto max-w-[1280px] px-3 sm:px-4 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`text-xs px-3 py-1.5 rounded-full border ${online?"bg-emerald-50 border-emerald-200 text-emerald-700":"bg-red-50 border-red-200 text-red-700"}`}>{online?"● Online · Sinkron":"● Offline · Antrean lokal aktif"}</span>
        <span className="text-xs px-3 py-1.5 rounded-full bg-white border">Shift PAGI · Kasir: Sari · {shiftOpen?"DIBUKA":"DITUTUP"}</span>
        <span className="text-xs px-3 py-1.5 rounded-full bg-stone-900 text-white">Modal awal {formatIDR(openingFloat)} · Laci {formatIDR(drawer)}</span>
        {!online && queue.filter(q=>!q.synced).length>0 && <span className="text-xs px-3 py-1.5 rounded-full bg-amber-400 text-stone-900">{queue.filter(q=>!q.synced).length} antrean menunggu sinkron</span>}
        <div className="ml-auto flex gap-1.5">
          <button onClick={()=>setShiftOpen(v=>!v)} className="text-xs px-3 py-1.5 rounded-full border bg-white hover:bg-stone-50">{shiftOpen?"Tutup Shift (hitung fisik)":"Buka Shift"}</button>
          <button onClick={syncQueue} disabled={online===false} className="text-xs px-3 py-1.5 rounded-full bg-teal-700 text-white disabled:opacity-50">Sync antrian</button>
        </div>
      </div>

      <div className="mt-4 grid lg:grid-cols-[1.2fr_0.8fr] gap-4 items-start">
        <div>
          <div className="rounded-2xl border border-stone-200 bg-white p-3">
            <div className="flex items-center gap-2">
              <input placeholder="Scan barcode / cari produk..." className="flex-1 rounded-full border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-teal-600" />
              <button className="px-3 py-2 rounded-full bg-stone-900 text-white text-xs">Hold</button>
              <button className="px-3 py-2 rounded-full border text-xs">Gabung</button>
              <button className="px-3 py-2 rounded-full border text-xs">Pisah Bill</button>
            </div>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {products.map(p=>(
                <button key={p.id} onClick={()=>{
                  setCart(c=>{
                    const idx=c.findIndex(x=>x.id===p.id);
                    if(idx>=0){ const copy=[...c]; copy[idx]={...copy[idx], qty: copy[idx].qty+1}; return copy; }
                    return [...c, {id:p.id, name:p.name, price:p.price, qty:1}];
                  });
                }} className="text-left rounded-2xl border border-stone-200 bg-gradient-to-br from-white to-stone-50 p-3 hover:border-teal-300 transition">
                  <div className="text-xl">{p.image}</div>
                  <div className="font-semibold text-sm leading-tight mt-1">{p.name}</div>
                  <div className="text-xs text-stone-500">{p.sku}</div>
                  <div className="font-bold text-sm mt-1">{formatIDR(p.price)}</div>
                  <div className="text-[11px] text-stone-500">Varian: {variants.map(v=>v.name).join(" · ")}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-stone-200 bg-white p-3">
            <div className="font-semibold text-sm">Antrean offline (IndexedDB/Dexie · outbox seq)</div>
            <div className="text-xs text-stone-500">Format localRef: <code className="bg-stone-100 px-1 rounded">pos-krw-01-000142</code> · Idempotency UUID · Background Sync saat online</div>
            <div className="mt-2 space-y-1 max-h-40 overflow-auto text-xs">
              {queue.length===0? <div className="text-stone-500 border border-dashed rounded-xl p-3 text-center">Belum ada transaksi antrean</div> :
                queue.map(q=>(
                  <div key={q.localRef} className={`flex justify-between rounded-xl border px-3 py-2 ${q.synced?"bg-emerald-50 border-emerald-200":"bg-amber-50 border-amber-200"}`}>
                    <span><b>{q.localRef}</b> · {q.at} · {q.method} · {formatIDR(q.total)}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border ${q.synced?"bg-white border-emerald-200 text-emerald-700":"bg-white border-amber-200 text-amber-700"}`}>{q.synced?"ACCEPTED · ord_81f3":"MENUNGGU_SYNC"}</span>
                  </div>
                ))}
            </div>
            <div className="mt-2 text-[11px] text-stone-500">Promo & poin dinonaktifkan saat offline (validasi kuota global butuh server). Konflik stok: penjualan tetap sah → tugas penyesuaian stok untuk supervisor.</div>
          </div>
        </div>

        <div className="lg:sticky lg:top-[68px] space-y-3">
          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <div className="font-semibold">Keranjang Kasir</div>
            <div className="mt-2 space-y-1.5 max-h-[260px] overflow-auto">
              {cart.length===0? <div className="text-sm text-stone-500 border border-dashed rounded-xl p-4 text-center">Belum ada item — ketuk produk di kiri</div> :
                cart.map((c,i)=>(
                  <div key={i} className="flex items-center gap-2 text-sm border border-stone-100 rounded-xl px-2 py-2">
                    <div className="flex-1"><b>{c.name}</b> <span className="text-stone-500">x{c.qty}</span></div>
                    <span className="font-medium">{formatIDR(c.price*c.qty)}</span>
                    <button onClick={()=>setCart(cart=> cart.flatMap((x,idx)=> idx===i ? (x.qty>1?[{...x, qty:x.qty-1}]:[]) : [x]))} className="h-7 w-7 rounded-full border">−</button>
                    <button onClick={()=>setCart(cart=> cart.map((x,idx)=> idx===i?{...x, qty:x.qty+1}:x))} className="h-7 w-7 rounded-full border">+</button>
                  </div>
                ))}
            </div>
            <div className="mt-3 border-t pt-3 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-stone-500">Subtotal</span><span>{formatIDR(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">PBJT 10%</span><span>{formatIDR(pbjt)}</span></div>
              <div className="flex justify-between font-bold text-base"><span>Total</span><span>{formatIDR(total)}</span></div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-1.5">
              {(["CASH","QRIS","VOUCHER"] as const).map(m=>(
                <button key={m} onClick={()=>setMethod(m)} className={`py-2 rounded-full text-xs font-semibold border ${method===m?"bg-teal-700 text-white border-teal-700":"bg-white border-stone-200"}`}>{m}</button>
              ))}
            </div>
            {method==="CASH" ? (
              <>
                <input value={tendered} onChange={e=>setTendered(e.target.value.replace(/\D/g,""))} placeholder="Uang diterima" className="mt-2 w-full rounded-full border border-stone-200 px-3 py-2 text-sm" />
                <div className="mt-1 text-xs flex justify-between"><span className="text-stone-500">Kembalian</span><span className={`font-bold ${change<0?"text-red-600":"text-emerald-700"}`}>{formatIDR(Math.max(0, change))}</span></div>
              </>
            ) : (
              <div className="mt-2 rounded-xl bg-stone-50 border border-dashed p-4 text-center text-xs text-stone-500">{method} — QRIS/VA akan tampil, network-only tanpa cache</div>
            )}

            <div className="mt-2 grid grid-cols-2 gap-2">
              <button onClick={()=>setCart([])} className="py-2 rounded-full border text-sm">Kosongkan</button>
              <button disabled={cart.length===0 || (method==="CASH" && change<0)} onClick={()=>{
                const localRef = `pos-krw-01-${String(queue.length+142).padStart(6,"0")}`;
                const idempotencyKey = (typeof crypto!=="undefined" && "randomUUID" in crypto) ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
                const tx: Tx = { localRef, idempotencyKey, total, method, at: new Date().toLocaleTimeString("id-ID"), synced: online ? true : false };
                if (!online) setQueue(q=>[...q, tx]);
                else setDrawer(d=> d + total);
                // cetak struk mock
                alert(`Transaksi selesai${online?"":" (offline, antrean) "} · ${localRef}\n${online? "Nomor resmi: KRW-20260924-0"+(142+queue.length) : "Menunggu sinkron"}\nCetakan ESC/POS via agen lokal`);
                setCart([]); setTendered("");
                if (!online && typeof window!=="undefined") localStorage.setItem("pos_last_tx", JSON.stringify(tx));
              }} className="py-2 rounded-full bg-amber-400 text-stone-900 font-semibold text-sm hover:bg-amber-300 disabled:opacity-50">Bayar & Cetak</button>
            </div>
            <div className="mt-2 flex gap-1.5 text-[11px]">
              <span className="px-2 py-1 rounded-full bg-stone-100 border">ESC/POS Bluetooth/USB</span>
              <span className="px-2 py-1 rounded-full bg-stone-100 border">Idempotency-Key: UUID</span>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-stone-900 text-white p-3 text-xs">
            <div className="font-semibold">Laci Kas & Shift</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button className="py-2 rounded-full bg-white/10 border border-white/20">Kas Masuk</button>
              <button className="py-2 rounded-full bg-white/10 border border-white/20">Kas Keluar (beli es)</button>
            </div>
            <div className="mt-2 text-stone-300">Tutup shift: hitung fisik per pecahan → selisih otomatis jadi jurnal <code className="text-amber-300">6-1900 Selisih kas</code>. X/Z report terkunci.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
