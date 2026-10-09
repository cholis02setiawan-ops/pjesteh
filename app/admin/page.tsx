"use client";
import { useEffect, useState } from "react";
import { chartOfAccounts, journals } from "@/lib/data";
import type { Product, Outlet, DepositPolicy } from "@/lib/data";
import { formatIDR } from "@/lib/money";
import { isLoggedIn, currentUser, logout, hasOwner, getOwner, changePassword, resetAll } from "@/lib/auth";
import { loadProducts, saveProducts, loadOutlets, saveOutlets, loadPolicies, savePolicies, exportAll, importAll } from "@/lib/store";
import { ProductImage } from "@/lib/ProductImage";
import { ImageEditor } from "@/components/ImageEditor";

const tabs = ["Jurnal", "Laporan", "Menu & Stok", "Outlet", "Kebijakan DP", "Shift & Kas", "Pengaturan"] as const;

export default function Admin() {
  const [tab, setTab] = useState<typeof tabs[number]>("Menu & Stok");
  const [logged, setLogged] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [outlets, setOutletsState] = useState<Outlet[]>([]);
  const [policies, setPolicies] = useState<DepositPolicy[]>([]);
  const [msg, setMsg] = useState("");

  // editing states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({ name: "", price: 8000, category: "Es Teh", sku: "", image: "🍃", durability_minutes: 90, is_active: true, type: "BEVERAGE" });
  const [editingOutlet, setEditingOutlet] = useState<Outlet | null>(null);
  const [newOutlet, setNewOutlet] = useState<Partial<Outlet>>({ code: "", name: "", addr: "" });
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [importJson, setImportJson] = useState("");
  const [showImageEditor, setShowImageEditor] = useState(false);

  useEffect(()=>{
    setLogged(isLoggedIn());
    setUser(currentUser());
    setProducts(loadProducts());
    setOutletsState(loadOutlets());
    setPolicies(loadPolicies());
    const onStorage = () => { setLogged(isLoggedIn()); setUser(currentUser()); };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onStorage);
    return ()=>{ window.removeEventListener("storage", onStorage); window.removeEventListener("focus", onStorage); };
  },[]);

  const saveProductEdits = () => {
    if (!editingProduct) return;
    const updated = products.map(p=> p.id===editingProduct.id ? editingProduct : p);
    setProducts(updated); saveProducts(updated); setEditingProduct(null); setMsg("Produk disimpan ✓ — perubahan langsung tampil di QR & POS");
    setTimeout(()=>setMsg(""), 2500);
  };
  const addProduct = () => {
    if (!newProduct.name || !newProduct.sku || !newProduct.price) { setMsg("Nama, SKU, harga wajib"); return; }
    const id = "p_" + newProduct.sku.toLowerCase().replace(/[^a-z0-9]/g,"_") + "_" + Date.now().toString(36);
    const p: Product = {
      id, sku: newProduct.sku!, name: newProduct.name!, price: Number(newProduct.price), category: newProduct.category||"Es Teh",
      image: newProduct.image||"🍃", durability_minutes: Number(newProduct.durability_minutes)||90, is_active: true, type: (newProduct.type as any)||"BEVERAGE"
    };
    const next = [...products, p]; setProducts(next); saveProducts(next); setNewProduct({ name: "", price: 8000, category: "Es Teh", sku: "", image: "🍃", durability_minutes: 90, is_active: true, type: "BEVERAGE" }); setMsg("Produk baru ditambahkan ✓");
  };
  const deleteProduct = (id: string) => {
    if (!confirm("Hapus produk?")) return;
    const next = products.filter(p=>p.id!==id); setProducts(next); saveProducts(next);
  };
  const saveOutletEdits = () => {
    if (!editingOutlet) return;
    const updated = outlets.map(o=> o.code===editingOutlet.code ? editingOutlet : o);
    setOutletsState(updated); saveOutlets(updated); setEditingOutlet(null); setMsg("Outlet disimpan ✓");
  };
  const addOutlet = () => {
    if (!newOutlet.code || !newOutlet.name) { setMsg("Kode & nama outlet wajib"); return; }
    const next = [...outlets, newOutlet as Outlet]; setOutletsState(next); saveOutlets(next); setNewOutlet({ code: "", name: "", addr: "" }); setMsg("Outlet ditambahkan ✓");
  };

  if (!hasOwner()) {
    return (
      <div className="mx-auto max-w-[560px] px-4 py-10">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <div className="text-2xl">🔒</div>
          <div className="font-bold">Belum ada owner</div>
          <div className="text-sm text-stone-600 mt-1">Buat akun owner dulu agar hanya Anda yang bisa edit. Pengunjung lain hanya bisa lihat & pesan.</div>
          <a href="/login" className="mt-4 inline-block w-full py-2.5 rounded-full bg-teal-700 text-white font-semibold">Buat Akun Owner →</a>
        </div>
      </div>
    );
  }

  if (!logged) {
    return (
      <div className="mx-auto max-w-[560px] px-4 py-10">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center">
          <div className="text-2xl">🔒</div>
          <div className="font-bold text-lg">Mode Edit Pribadi — Terkunci</div>
          <p className="text-sm text-stone-600 mt-2">Hanya <b>owner</b> yang login yang bisa edit menu, harga, outlet, dan kebijakan DP. Pengunjung lain hanya bisa melihat katalog & memesan. Silakan login untuk membuka editor.</p>
          <div className="mt-4 grid gap-2">
            <a href="/login" className="w-full py-2.5 rounded-full bg-stone-900 text-white font-semibold text-center">Login Owner →</a>
            <div className="text-xs text-stone-500">Belum punya akun? <a href="/login" className="underline text-teal-700">Buat di /login</a> · Owner: {getOwner()?.username || "—"}</div>
          </div>
          <div className="mt-4 rounded-xl bg-stone-50 border p-3 text-left text-xs leading-5">
            <b>Keamanan sesuai blueprint BP.md:42:</b> Panel admin dilindungi. Di produksi, ganti localStorage dengan NextAuth + RLS PostgreSQL + JWT 15m + RBAC CASL. Saat ini, sesi disimpan per-browser; logout untuk mengunci kembali.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-bold">Panel Admin & Akuntansi</h1>
        <span className="text-xs px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">🔓 Login sebagai {user}</span>
        <span className="text-xs px-3 py-1.5 rounded-full bg-stone-900 text-white">SAK EMKM · Hanya owner bisa edit</span>
        <button onClick={()=>{logout(); location.reload();}} className="ml-auto text-xs px-3 py-1.5 rounded-full border bg-white hover:bg-stone-50">Logout & Kunci</button>
      </div>
      {msg && <div className="mt-3 text-sm px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">{msg}</div>}
      <div className="mt-3 flex gap-1.5 overflow-x-auto">
        {tabs.map(t=>(
          <button key={t} onClick={()=>setTab(t)} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border ${tab===t?"bg-teal-700 text-white border-teal-700":"bg-white border-stone-200 hover:bg-stone-50"}`}>{t}</button>
        ))}
      </div>

      {tab==="Jurnal" && (
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Buku Besar — Hanya tambah, tidak pernah edit</div>
              <span className="text-xs px-2 py-1 rounded-full bg-amber-100 border border-amber-200">Constraint: debit = kredit</span>
            </div>
            <div className="mt-3 space-y-3">
              {journals.map(j=>(
                <div key={j.id} className="rounded-xl border border-stone-200 overflow-hidden">
                  <div className="flex flex-wrap justify-between gap-2 bg-stone-50 px-3 py-2 text-xs">
                    <span><b>{j.id}</b> · {j.date} · Ref {j.ref} · {j.desc}</span>
                    <span className={`px-2 py-0.5 rounded-full border text-[11px] ${j.status==="POSTED"?"bg-emerald-50 border-emerald-200 text-emerald-700":"bg-amber-50 border-amber-200"}`}>{j.status}</span>
                  </div>
                  <div className="divide-y text-xs">
                    {j.lines.map((l,i)=>(
                      <div key={i} className="grid grid-cols-[1.4fr_0.6fr_0.6fr] gap-2 px-3 py-2">
                        <span>{l.account}</span>
                        <span className="text-right">{l.debit?formatIDR(l.debit):"—"}</span>
                        <span className="text-right">{l.credit?formatIDR(l.credit):"—"}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-stone-900 text-white text-xs px-3 py-1.5 flex justify-between"><span>TOTAL</span><span>{formatIDR(j.lines.reduce((s,l)=>s+l.debit,0))} = {formatIDR(j.lines.reduce((s,l)=>s+l.credit,0))} ✓</span></div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-stone-500">Jurnal bersifat tambah-saja, tidak bisa diedit bahkan oleh owner (audit). Koreksi via jurnal balik.</div>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <div className="font-semibold text-sm">Bagan Akun (COA) · Kode X-YYZZ</div>
            <div className="mt-2 grid sm:grid-cols-2 lg:grid-cols-3 gap-1.5 text-xs">
              {chartOfAccounts.map(a=>(
                <div key={a.code} className="flex justify-between border rounded-xl px-3 py-2 bg-stone-50">
                  <span><b>{a.code}</b> {a.name}</span>
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] ${a.normal==="DEBIT"?"bg-white border-stone-200":"bg-stone-900 text-white border-stone-900"}`}>{a.normal}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab==="Laporan" && (
        <div className="mt-4 grid lg:grid-cols-2 gap-3">
          {[
            { title:"Laba Rugi — Sep 2026", rows:[["Penjualan minuman", 12840000],["Penjualan makanan", 4200000],["Pendapatan antar", 860000],["HPP bahan", -5400000],["Beban MDR", -180000],["Laba kotor", 12400000],["Beban operasional", -6200000],["Laba bersih", 6200000]] },
            { title:"Neraca Saldo", rows:[["Kas laci", 7420000],["Bank", 18400000],["Piutang gateway", 2100000],["Persediaan", 8600000],["Utang PBJT", -1820000],["Modal", -25000000],["Laba ditahan", -6200000]] },
          ].map(card=>(
            <div key={card.title} className="rounded-2xl border border-stone-200 bg-white p-4">
              <div className="font-semibold">{card.title}</div>
              <div className="mt-2 divide-y text-sm">
                {card.rows.map(([label, val])=>(
                  <div key={label as string} className="flex justify-between py-1.5"><span className="text-stone-600">{label as string}</span><span className={`font-medium ${(val as number)<0?"text-red-600":""}`}>{formatIDR(Math.abs(val as number))} {(val as number)<0?"(K)":""}</span></div>
                ))}
              </div>
              <div className="mt-2 flex gap-1.5 text-xs">
                <button className="px-3 py-1.5 rounded-full bg-stone-900 text-white">Export PDF</button>
                <button className="px-3 py-1.5 rounded-full border">CSV</button>
                <button className="px-3 py-1.5 rounded-full border">Accurate/Jurnal</button>
              </div>
            </div>
          ))}
          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <div className="font-semibold">Rekonsiliasi</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3"><div className="font-semibold">Kas Shift Pagi</div><div>Diharapkan 740.000 · Dihitung 738.500 · Selisih -1.500 → 6-1900</div></div>
              <div className="rounded-xl bg-sky-50 border border-sky-200 p-3"><div className="font-semibold">Settlement Midtrans</div><div>Piutang 2.100.000 · Masuk Bank 2.070.000 · MDR 30.000</div></div>
            </div>
          </div>
        </div>
      )}

      {tab==="Menu & Stok" && (
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm flex justify-between items-center">
            <span><b>🔓 Mode Edit Pribadi Aktif</b> — hanya Anda yang bisa ubah. Perubahan langsung tersimpan di browser & tampil di QR/POS.</span>
            <button onClick={()=>{ if(confirm("Reset menu ke default?")) { localStorage.removeItem("tehkita_products"); location.reload(); }}} className="text-xs px-3 py-1 rounded-full border bg-white">Reset Default</button>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <div className="font-semibold">Tambah Produk Baru</div>
            <div className="mt-2 grid sm:grid-cols-6 gap-2 text-sm">
              <input placeholder="Nama" value={newProduct.name} onChange={e=>setNewProduct(s=>({...s, name:e.target.value}))} className="rounded-full border px-3 py-2" />
              <input placeholder="SKU" value={newProduct.sku} onChange={e=>setNewProduct(s=>({...s, sku:e.target.value}))} className="rounded-full border px-3 py-2" />
              <input type="number" placeholder="Harga" value={newProduct.price} onChange={e=>setNewProduct(s=>({...s, price: Number(e.target.value)}))} className="rounded-full border px-3 py-2" />
              <input placeholder="Kategori" value={newProduct.category} onChange={e=>setNewProduct(s=>({...s, category:e.target.value}))} className="rounded-full border px-3 py-2" />
              <input placeholder="Emoji / URL gambar" value={newProduct.image} onChange={e=>setNewProduct(s=>({...s, image:e.target.value}))} className="rounded-full border px-3 py-2" />
              <button onClick={addProduct} className="rounded-full bg-teal-700 text-white px-4 py-2 font-semibold">+ Tambah</button>
            </div>
          </div>

          <ImageEditor
            value={newProduct.image}
            onChange={(v)=>setNewProduct(s=>({...s, image:v}))}
          />

          <div className="grid gap-2">
            {products.map(p=>(
              <div key={p.id} className="rounded-2xl border border-stone-200 bg-white p-3">
                {editingProduct?.id===p.id ? (
                  <div>
                  {showImageEditor && (
                    <div className="mb-2">
                      <ImageEditor
                        value={editingProduct.image}
                        onChange={(v)=>setEditingProduct({...editingProduct, image:v})}
                      />
                    </div>
                  )}
                  <div className="grid sm:grid-cols-6 gap-2 text-sm">
                    <input value={editingProduct.name} onChange={e=>setEditingProduct({...editingProduct, name:e.target.value})} className="rounded-full border px-3 py-2" />
                    <input value={editingProduct.sku} onChange={e=>setEditingProduct({...editingProduct, sku:e.target.value})} className="rounded-full border px-3 py-2" />
                    <input type="number" value={editingProduct.price} onChange={e=>setEditingProduct({...editingProduct, price: Number(e.target.value)})} className="rounded-full border px-3 py-2" />
                    <input value={editingProduct.category} onChange={e=>setEditingProduct({...editingProduct, category:e.target.value})} className="rounded-full border px-3 py-2" />
                    <input value={editingProduct.image} onChange={e=>setEditingProduct({...editingProduct, image:e.target.value})} className="rounded-full border px-3 py-2" />
                    <button type="button" onClick={()=>setShowImageEditor(true)} className="rounded-full border bg-white px-3 py-2">Gambar…</button>
                    <div className="flex gap-1">
                      <button onClick={saveProductEdits} className="flex-1 rounded-full bg-teal-700 text-white px-3 py-2">Simpan</button>
                      <button onClick={()=>setEditingProduct(null)} className="flex-1 rounded-full border px-3 py-2">Batal</button>
                    </div>
                    <div className="sm:col-span-6 flex gap-2">
                      <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={editingProduct.is_active} onChange={e=>setEditingProduct({...editingProduct, is_active:e.target.checked})} /> Aktif</label>
                      <input type="number" value={editingProduct.durability_minutes} onChange={e=>setEditingProduct({...editingProduct, durability_minutes: Number(e.target.value)})} className="rounded-full border px-3 py-1 text-xs w-32" placeholder="Tahan menit" />
                    </div>
                  </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <ProductImage src={p.image} emoji={p.image} alt={p.name} rounded="" className="h-12 w-12 shrink-0" />
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{p.name} <span className="font-normal text-xs text-stone-500">· {p.sku} · {p.category} · {p.durability_minutes} menit</span></div>
                      <div className="text-sm font-bold">{formatIDR(p.price)} <span className={`text-xs px-2 py-0.5 rounded-full border ml-2 ${p.is_active?"bg-emerald-50 border-emerald-200 text-emerald-700":"bg-red-50 border-red-200 text-red-700"}`}>{p.is_active?"Tersedia":"Nonaktif"}</span></div>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={()=>setEditingProduct(p)} className="text-xs px-3 py-1.5 rounded-full border bg-white hover:bg-stone-50">Edit</button>
                      <button onClick={()=>deleteProduct(p.id)} className="text-xs px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700">Hapus</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs">Jika stok bahan habis → menu otomatis tidak tersedia di QR & POS. Mutasi stok mengurangi otomatis saat <code className="bg-white px-1 rounded border">OrderCompleted</code>.</div>
        </div>
      )}

      {tab==="Outlet" && (
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <div className="font-semibold">Kelola Outlet (hanya owner)</div>
            <div className="mt-2 grid sm:grid-cols-4 gap-2 text-sm">
              <input placeholder="Kode (KRW03)" value={newOutlet.code} onChange={e=>setNewOutlet(s=>({...s, code:e.target.value.toUpperCase()}))} className="rounded-full border px-3 py-2" />
              <input placeholder="Nama outlet" value={newOutlet.name} onChange={e=>setNewOutlet(s=>({...s, name:e.target.value}))} className="rounded-full border px-3 py-2 sm:col-span-2" />
              <button onClick={addOutlet} className="rounded-full bg-teal-700 text-white px-4 py-2">+ Tambah Outlet</button>
              <input placeholder="Alamat" value={newOutlet.addr} onChange={e=>setNewOutlet(s=>({...s, addr:e.target.value}))} className="rounded-full border px-3 py-2 sm:col-span-4" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {outlets.map(o=>(
              <div key={o.code} className="rounded-2xl border border-stone-200 bg-white p-3">
                {editingOutlet?.code===o.code ? (
                  <div className="space-y-2 text-sm">
                    <input value={editingOutlet.name} onChange={e=>setEditingOutlet({...editingOutlet, name:e.target.value})} className="w-full rounded-full border px-3 py-2" />
                    <input value={editingOutlet.addr} onChange={e=>setEditingOutlet({...editingOutlet, addr:e.target.value})} className="w-full rounded-full border px-3 py-2" />
                    <div className="flex gap-2">
                      <button onClick={saveOutletEdits} className="flex-1 rounded-full bg-teal-700 text-white py-2">Simpan</button>
                      <button onClick={()=>setEditingOutlet(null)} className="flex-1 rounded-full border py-2">Batal</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-sm">{o.code.slice(0,3)}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{o.name} <span className="text-xs text-stone-500">· {o.code}</span></div>
                      <div className="text-xs text-stone-500">{o.addr}</div>
                    </div>
                    <button onClick={()=>setEditingOutlet(o)} className="text-xs px-3 py-1.5 rounded-full border bg-white">Edit</button>
                    <button onClick={()=>{ if(confirm("Hapus outlet?")) { const next=outlets.filter(x=>x.code!==o.code); setOutletsState(next); saveOutlets(next); }}} className="text-xs px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700">Hapus</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==="Kebijakan DP" && (
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm">🔓 Edit kebijakan DP — versioned, prioritas paling spesifik menang. Perubahan hanya pengaruhi reservasi baru.</div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {policies.map(p=>(
              <div key={p.id} className="rounded-xl border bg-white p-3 text-sm">
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs text-stone-500">{p.scope}</div>
                <div className="mt-1 text-xs">Metode {p.calc_method} · {formatIDR(p.value)}{p.calc_method==="PER_PAX"?"/orang":""} · Prioritas {p.priority}</div>
                <div className="mt-2 flex gap-1 flex-wrap">{p.cancellation_tiers.map(t=> <span key={t.hoursBefore} className="text-[11px] px-2 py-1 rounded-full bg-stone-100 border">{">"} {t.hoursBefore}j: {t.refundPercent}%</span>)}</div>
                <button onClick={()=>{ const v=prompt(`Ganti nilai DP untuk ${p.name} (Rp)`, String(p.value)); if(v!==null){ const next=policies.map(x=> x.id===p.id? {...x, value: Number(v)}:x); setPolicies(next); savePolicies(next); }}} className="mt-2 w-full py-1.5 rounded-full border bg-white text-xs">Edit Nilai</button>
              </div>
            ))}
          </div>
          <button onClick={()=>{ const name=prompt("Nama kebijakan baru"); if(!name) return; const next=[...policies, { id:"pv_"+Date.now().toString(36), name, calc_method:"FLAT" as const, value:50000, min_party_size:6, scope:"Outlet KRW01", payment_window_minutes:60, on_arrival:"DEDUCT" as const, priority:5, cancellation_tiers:[] }]; setPolicies(next); savePolicies(next); }} className="w-full py-2.5 rounded-full bg-teal-700 text-white font-semibold">+ Tambah Kebijakan</button>
        </div>
      )}

      {tab==="Shift & Kas" && (
        <div className="mt-4 grid lg:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <div className="font-semibold">Shift Hari Ini</div>
            <div className="mt-2 space-y-2 text-sm">
              <div className="rounded-xl border p-3 flex justify-between"><span>PAGI · Sari · DIBUKA</span><span className="font-bold">Modal 500.000</span></div>
              <div className="rounded-xl border p-3 flex justify-between bg-amber-50 border-amber-200"><span>SIANG · Budi · DITUTUP</span><span>Selisih +1.200 → Kredit 6-1900</span></div>
            </div>
            <div className="mt-2 text-xs text-stone-500">Hanya owner/supervisor yang bisa setujui selisih kas & tutup shift.</div>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <div className="font-semibold">Kas & Settlement</div>
            <div className="mt-2 text-xs leading-6">
              <div>Kas laci: 742.000 · Brankas: 1.200.000 · Bank: 18.400.000</div>
              <div>Piutang gateway: 2.100.000</div>
              <div>Piutang kurir COD: 88.000</div>
            </div>
          </div>
        </div>
      )}

      {tab==="Pengaturan" && (
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <div className="font-semibold">Akun Owner (Edit Pribadi)</div>
            <div className="mt-2 text-sm">Login sebagai <b>{user}</b> · Owner terdaftar: <b>{getOwner()?.username}</b> · Sejak {getOwner()?.createdAt ? new Date(getOwner()!.createdAt).toLocaleDateString("id-ID"):"—"}</div>
            <div className="mt-3 grid sm:grid-cols-3 gap-2 text-sm">
              <input type="password" placeholder="Password lama" value={oldPw} onChange={e=>setOldPw(e.target.value)} className="rounded-full border px-3 py-2" />
              <input type="password" placeholder="Password baru (min 6)" value={newPw} onChange={e=>setNewPw(e.target.value)} className="rounded-full border px-3 py-2" />
              <button onClick={()=>{ if(changePassword(oldPw, newPw)) { setMsg("Password diganti ✓"); setOldPw(""); setNewPw(""); } else setMsg("Password lama salah atau baru terlalu pendek"); }} className="rounded-full bg-stone-900 text-white px-4 py-2">Ganti Password</button>
            </div>
            <button onClick={()=>{ if(confirm("Reset semua data & akun owner? Tidak bisa undo.")) { resetAll(); location.href="/login"; }}} className="mt-2 w-full py-2 rounded-full bg-red-50 border border-red-200 text-red-700 text-sm">Reset Total (hapus owner & data edit)</button>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <div className="font-semibold">Backup & Restore — Export/Import JSON</div>
            <p className="text-xs text-stone-500">Simpan semua editan (menu, outlet, kebijakan) ke file. Hanya owner yang bisa export/import.</p>
            <div className="mt-2 flex gap-2">
              <button onClick={()=>{ const data=exportAll(); const blob=new Blob([data], {type:"application/json"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`tehkita-backup-${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(url); }} className="flex-1 py-2 rounded-full bg-teal-700 text-white font-semibold text-sm">⬇ Export JSON</button>
              <label className="flex-1 py-2 rounded-full border bg-white text-center text-sm cursor-pointer">⬆ Import JSON<input type="file" accept=".json" className="hidden" onChange={e=>{ const f=e.target.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ setImportJson(String(r.result)); }; r.readAsText(f); }} /></label>
            </div>
            {importJson && (
              <div className="mt-2">
                <textarea value={importJson} onChange={e=>setImportJson(e.target.value)} rows={4} className="w-full rounded-xl border p-2 text-xs font-mono" />
                <div className="flex gap-2 mt-2">
                  <button onClick={()=>{ if(importAll(importJson)) { setMsg("Import berhasil — reload"); setTimeout(()=>location.reload(), 800); } else setMsg("Format JSON salah"); }} className="flex-1 py-2 rounded-full bg-stone-900 text-white text-sm">Terapkan Import</button>
                  <button onClick={()=>setImportJson("")} className="flex-1 py-2 rounded-full border text-sm">Batal</button>
                </div>
              </div>
            )}
            <div className="mt-2 text-xs text-stone-500">Data tersimpan di localStorage per-browser. Untuk produksi multi-device, sync ke PostgreSQL + RLS (`BP.md:8`).</div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-4 text-xs leading-5">
            <b>Hanya Anda yang bisa edit:</b> Pengunjung di URL publik `https://rotten-snails-grin.loca.lt` melihat menu/QR & bisa pesan, tapi tombol Edit hanya muncul jika `isLoggedIn()` true. Logout untuk mengunci. Untuk akses tim, tambah RBAC `BP.md:42` (Kasir/Barista/Supervisor/Keuangan).
          </div>
        </div>
      )}
    </div>
  );
}
