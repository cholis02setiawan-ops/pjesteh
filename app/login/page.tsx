"use client";
import { useEffect, useState } from "react";
import { createOwner, login, hasOwner, isLoggedIn, currentUser, logout } from "@/lib/auth";

export default function LoginPage() {
  const [mode, setMode] = useState<"login"|"register">("login");
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [p2, setP2] = useState("");
  const [msg, setMsg] = useState("");
  const [logged, setLogged] = useState(false);
  const [user, setUser] = useState<string | null>(null);

  useEffect(()=>{
    if (!hasOwner()) setMode("register");
    setLogged(isLoggedIn());
    setUser(currentUser());
  },[]);

  const handleRegister = () => {
    if (!u.trim() || p.length<6) { setMsg("Username wajib & password minimal 6 karakter"); return; }
    if (p!==p2) { setMsg("Konfirmasi password tidak cocok"); return; }
    if (hasOwner()) { setMsg("Owner sudah ada — silakan login"); setMode("login"); return; }
    createOwner(u, p);
    setMsg("Owner berhasil dibuat & otomatis login");
    setLogged(true); setUser(u.trim());
    setTimeout(()=> location.href="/admin", 800);
  };
  const handleLogin = () => {
    if (login(u,p)) { setMsg("Login berhasil"); setLogged(true); setUser(u.trim()); setTimeout(()=> location.href="/admin", 500); }
    else setMsg("Username atau password salah");
  };

  if (logged) {
    return (
      <div className="mx-auto max-w-[480px] px-4 py-10">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <div className="text-2xl">🔓</div>
          <div className="font-bold">Sudah login sebagai {user}</div>
          <div className="text-sm text-stone-600 mt-1">Anda bisa edit semua data di <a href="/admin" className="text-teal-700 underline">Admin</a>. Hanya owner yang bisa edit — pengunjung lain hanya bisa lihat & pesan.</div>
          <button onClick={()=>{logout(); setLogged(false); setUser(null); setMsg("Logout berhasil");}} className="mt-4 w-full py-2.5 rounded-full bg-stone-900 text-white text-sm">Logout</button>
          <a href="/admin" className="mt-2 block w-full py-2.5 rounded-full border bg-white text-sm">Kembali ke Admin</a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[520px] px-4 py-8">
      <div className="rounded-[24px] border border-stone-200 bg-white p-6">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold">TK</div>
          <h1 className="mt-2 text-xl font-bold">{mode==="register" ? "Buat Akun Owner (Pertama Kali)" : "Login Owner — Edit Pribadi"}</h1>
          <p className="text-sm text-stone-600 mt-1">{mode==="register" ? "Belum ada owner. Buat username & password yang hanya Anda tahu. Setelah ini, hanya login yang bisa edit." : "Hanya owner yang bisa edit menu, harga, outlet & kebijakan DP. Pengunjung lain hanya bisa pesan."}</p>
        </div>

        <div className="mt-5 space-y-3">
          <label className="block text-sm">Username
            <input value={u} onChange={e=>setU(e.target.value)} placeholder="mis. owner / admin" className="mt-1 w-full rounded-full border border-stone-200 px-4 py-2.5 outline-none focus:border-teal-600" />
          </label>
          <label className="block text-sm">Password
            <input type="password" value={p} onChange={e=>setP(e.target.value)} placeholder="minimal 6 karakter" className="mt-1 w-full rounded-full border border-stone-200 px-4 py-2.5 outline-none focus:border-teal-600" />
          </label>
          {mode==="register" && (
            <label className="block text-sm">Konfirmasi Password
              <input type="password" value={p2} onChange={e=>setP2(e.target.value)} placeholder="ulang password" className="mt-1 w-full rounded-full border border-stone-200 px-4 py-2.5 outline-none focus:border-teal-600" />
            </label>
          )}
          {msg && <div className={`text-sm rounded-xl border px-3 py-2 ${msg.includes("berhasil")?"bg-emerald-50 border-emerald-200 text-emerald-700":"bg-amber-50 border-amber-200 text-amber-800"}`}>{msg}</div>}
          {mode==="register" ? (
            <>
              <button onClick={handleRegister} className="w-full py-2.5 rounded-full bg-teal-700 text-white font-semibold hover:bg-teal-800">Buat Owner & Login</button>
              {hasOwner() && <button onClick={()=>setMode("login")} className="w-full py-2 rounded-full border text-sm">Sudah punya akun? Login</button>}
            </>
          ) : (
            <>
              <button onClick={handleLogin} className="w-full py-2.5 rounded-full bg-stone-900 text-white font-semibold">Login & Buka Editor</button>
              <button onClick={()=>setMode("register")} className="w-full py-2 rounded-full border text-sm" disabled={hasOwner()}>Buat Owner Baru (reset dulu)</button>
            </>
          )}
          <div className="text-xs text-stone-500 leading-5 border-t pt-3">
            <b>Keamanan:</b> Kredensial disimpan di <code className="bg-stone-100 px-1 rounded">localStorage</code> per-browser (demo). Untuk produksi, ganti dengan NextAuth + PG + RLS + JWT 15m + refresh rotasi (`BP.md:42`). Klik logout untuk mengunci editor. Reset total di <a href="/admin" className="underline">Admin → Pengaturan</a>.
          </div>
        </div>
      </div>
      <div className="mt-3 text-center text-xs text-stone-500"><a href="/" className="underline">← Kembali ke Beranda</a> · <a href="/admin" className="underline">Admin</a></div>
    </div>
  );
}
