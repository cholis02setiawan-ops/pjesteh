"use client";
import { useState, useMemo } from "react";
import { products, variants, modifiers } from "@/lib/data";
import { formatIDR } from "@/lib/money";

type CartLine = { productId: string; variantId: string; mods: string[]; qty: number; note?: string };

export default function QRMenu() {
  const outlet = "KRW01";
  const meja = "M03";
  const [cart, setCart] = useState<CartLine[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<Record<string, string>>({});
  const [selectedMods, setSelectedMods] = useState<Record<string, string[]>>({});
  const [showTracker, setShowTracker] = useState(false);
  const [payMode, setPayMode] = useState<"QRIS"|"CASH">("QRIS");

  const subtotal = useMemo(() => cart.reduce((sum, l) => {
    const p = products.find(x=>x.id===l.productId)!;
    const v = variants.find(x=>x.id===l.variantId)!;
    const modsDelta = l.mods.reduce((s, id) => {
      for (const g of modifiers) { const o = g.options.find(o=>o.id===id); if (o) return s+o.delta; } return s;
    }, 0);
    return sum + (p.price + v.priceDelta + modsDelta) * l.qty;
  }, 0), [cart]);

  const tax = Math.round(subtotal * 0.1); // PBJT 10%
  const service = 0;
  const grand = subtotal + tax + service;

  function addToCart(productId: string) {
    const variantId = selectedVariant[productId] || "v_reguler";
    const mods = selectedMods[productId] || [];
    setCart(c => {
      const idx = c.findIndex(x=>x.productId===productId && x.variantId===variantId && x.mods.join(",")===mods.join(","));
      if (idx>=0) { const copy=[...c]; copy[idx] = { ...copy[idx], qty: copy[idx].qty+1 }; return copy; }
      return [...c, { productId, variantId, mods, qty:1 }];
    });
  }

  if (showTracker) {
    return (
      <div className="mx-auto max-w-[560px] px-4 py-6">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <div className="text-2xl">✅</div>
          <div className="font-bold text-lg">Pesanan terkirim!</div>
          <div className="text-sm text-stone-600">No antrean <b className="text-xl text-stone-900">A-42</b> · Meja {meja} · Outlet {outlet}</div>
          <div className="mt-3 inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-white border">Status: <span className="font-semibold text-amber-600">Sedang dibuat</span> · WebSocket live</div>
          <div className="mt-4 grid grid-cols-4 gap-2 text-xs">
            {["Dikonfirmasi","Diproses","Siap","Diserahkan"].map((s,i)=>(
              <div key={s} className={`rounded-xl border p-2 ${i<=1 ? "bg-teal-700 text-white border-teal-700":"bg-white border-stone-200 text-stone-500"}`}>{s}</div>
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-white border p-3 text-left text-sm">
            <div className="font-semibold">Rincian · {cart.length} item · {formatIDR(grand)}</div>
            <div className="text-xs text-stone-500">Pembayaran: {payMode} · {payMode==="QRIS" ? "QRIS tampil di bawah" : "Bayar di kasir"}</div>
            {payMode==="QRIS" && <div className="mt-3 h-32 rounded-xl bg-stone-100 border border-dashed flex items-center justify-center text-stone-500">QRIS Dinamis · Midtrans · Kedaluwarsa 15:00</div>}
          </div>
          <button onClick={()=>setShowTracker(false)} className="mt-4 w-full py-2.5 rounded-full bg-stone-900 text-white text-sm">Kembali ke menu</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[980px] px-4 py-4 sm:py-6">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="px-3 py-1.5 rounded-full bg-teal-700 text-white font-medium">Outlet {outlet} · Meja {meja}</span>
        <span className="px-3 py-1.5 rounded-full bg-white border">Sesi meja: 3 ponsel bergabung</span>
        <span className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">● Menu tersedia · stok via resep BOM</span>
      </div>

      <div className="mt-4 grid lg:grid-cols-[1.7fr_0.9fr] gap-4 items-start">
        <div>
          <div className="flex items-center gap-2">
            <input placeholder="Cari: es teh, pisang goreng..." className="flex-1 rounded-full border border-stone-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-teal-600" />
            <span className="hidden sm:inline text-xs text-stone-500">LCP &lt;2s · SSR + cache SW</span>
          </div>
          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            {products.map(p=> {
              const selVar = selectedVariant[p.id] || "v_reguler";
              const selMods = selectedMods[p.id] || [];
              const variant = variants.find(v=>v.id===selVar)!;
              const modsDelta = selMods.reduce((s,id)=>{ for(const g of modifiers){ const o=g.options.find(o=>o.id===id); if(o) return s+o.delta; } return s; },0);
              const price = p.price + variant.priceDelta + modsDelta;
              return (
                <div key={p.id} className="rounded-2xl border border-stone-200 bg-white p-3">
                  <div className="flex gap-3">
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-amber-50 to-teal-50 flex items-center justify-center text-2xl">{p.image}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm leading-tight">{p.name}</div>
                      <div className="text-xs text-stone-500">{p.category} · {p.sku}</div>
                      <div className="text-sm font-bold mt-1">{formatIDR(price)} <span className="font-normal text-xs text-stone-500">/ {variant.name}</span></div>
                    </div>
                    <button onClick={()=>addToCart(p.id)} className="self-start px-3 py-1.5 rounded-full bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800">+ Tambah</button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {variants.map(v=>(
                      <button key={v.id} onClick={()=>setSelectedVariant(s=>({...s,[p.id]:v.id}))} className={`text-xs px-2.5 py-1 rounded-full border ${selVar===v.id?"bg-teal-700 text-white border-teal-700":"bg-white border-stone-200"}`}>{v.name} {v.priceDelta?`+${formatIDR(v.priceDelta)}`:""}</button>
                    ))}
                  </div>
                  <details className="mt-2">
                    <summary className="text-xs text-stone-600 cursor-pointer">Opsi gula / es / topping</summary>
                    <div className="mt-2 space-y-2">
                      {modifiers.map(g=>(
                        <div key={g.group}>
                          <div className="text-[11px] tracking-wide font-semibold text-stone-500">{g.group.toUpperCase()}</div>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {g.options.map(o=>{
                              const active = selMods.includes(o.id);
                              return <button key={o.id} onClick={()=>{
                                setSelectedMods(s=>{
                                  const cur = s[p.id]||[];
                                  const next = active ? cur.filter(x=>x!==o.id) : [...cur, o.id];
                                  return {...s, [p.id]: next};
                                });
                              }} className={`text-xs px-2.5 py-1 rounded-full border ${active?"bg-stone-900 text-white border-stone-900":"bg-white border-stone-200"}`}>{o.name} {o.delta?`+${formatIDR(o.delta)}`:""}</button>
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:sticky lg:top-[68px] rounded-2xl border border-stone-200 bg-white p-4">
          <div className="font-semibold">Keranjang · Meja {meja}</div>
          <div className="text-xs text-stone-500">Tersimpan di perangkat · tidak hilang bila app tertutup</div>
          <div className="mt-3 space-y-2 max-h-[320px] overflow-auto pr-1">
            {cart.length===0 ? <div className="text-sm text-stone-500 border border-dashed rounded-xl p-4 text-center">Keranjang kosong — tambah minuman</div> :
              cart.map((l,i)=>{
                const p = products.find(x=>x.id===l.productId)!;
                const v = variants.find(x=>x.id===l.variantId)!;
                return (
                  <div key={i} className="flex gap-2 items-center text-sm border border-stone-100 rounded-xl p-2">
                    <div className="flex-1">
                      <div className="font-medium text-sm leading-tight">{p.name} · {v.name}</div>
                      <div className="text-xs text-stone-500">{l.mods.join(", ")||"Tanpa topping"} · x{l.qty}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={()=>setCart(c=>c.map((x,idx)=> idx===i?{...x, qty: Math.max(1, x.qty-1)}:x))} className="h-7 w-7 rounded-full border">−</button>
                      <span className="w-6 text-center text-sm">{l.qty}</span>
                      <button onClick={()=>setCart(c=>c.map((x,idx)=> idx===i?{...x, qty: x.qty+1}:x))} className="h-7 w-7 rounded-full border">+</button>
                    </div>
                    <button onClick={()=>setCart(c=>c.filter((_,idx)=>idx!==i))} className="text-xs text-red-600">Hapus</button>
                  </div>
                );
              })
            }
          </div>
          <div className="mt-3 border-t pt-3 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-stone-500">Subtotal</span><span>{formatIDR(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-stone-500">PBJT 10%</span><span>{formatIDR(tax)}</span></div>
            <div className="flex justify-between font-bold text-base"><span>Total</span><span>{formatIDR(grand)}</span></div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={()=>setPayMode("QRIS")} className={`py-2 rounded-full border text-sm font-medium ${payMode==="QRIS"?"bg-teal-700 text-white border-teal-700":"bg-white border-stone-200"}`}>Bayar QRIS</button>
            <button onClick={()=>setPayMode("CASH")} className={`py-2 rounded-full border text-sm font-medium ${payMode==="CASH"?"bg-stone-900 text-white border-stone-900":"bg-white border-stone-200"}`}>Bayar di Kasir</button>
          </div>
          <input placeholder="Nama panggilan" className="mt-2 w-full rounded-full border border-stone-200 px-3 py-2 text-sm" defaultValue="Tamu M03" />
          <button disabled={cart.length===0} onClick={()=>setShowTracker(true)} className="mt-2 w-full py-2.5 rounded-full bg-amber-400 text-stone-900 font-semibold text-sm hover:bg-amber-300 disabled:opacity-50">Kirim Pesanan · {formatIDR(grand)}</button>
          <div className="mt-2 text-[11px] text-stone-500">Bayar di kasir = pesanan menunggu verifikasi agar tidak iseng. Status live via WebSocket.</div>
        </div>
      </div>
    </div>
  );
}
