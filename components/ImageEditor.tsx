"use client";
import { useRef, useState } from "react";
import { compressImageFile, isImageSrc, formatBytes } from "@/lib/image";
import { ProductImage } from "@/lib/ProductImage";

const PRESETS = [
  "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=70",
  "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&q=70",
  "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&q=70",
  "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&q=70",
];

export function ImageEditor({
  value, onChange, compact = false,
}: {
  value?: string | null;
  onChange: (v: string) => void;
  compact?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [url, setUrl] = useState("");

  async function handleFile(file?: File) {
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      const dataUrl = await compressImageFile(file);
      onChange(dataUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memproses gambar");
    } finally {
      setBusy(false);
    }
  }

  function applyUrl(u: string) {
    const trimmed = u.trim();
    if (!trimmed) return;
    if (!isImageSrc(trimmed)) { setError("URL harus diawali http:// atau https://"); return; }
    setError("");
    onChange(trimmed);
  }

  return (
    <div className={`rounded-2xl border border-stone-200 bg-white p-3 ${compact ? "" : "mt-3"}`}>
      <div className="flex flex-wrap items-center gap-3">
        <ProductImage src={value} emoji={value} alt="Pratinjau gambar produk" className="h-16 w-16 shrink-0" />

        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap gap-1.5">
            <label className="cursor-pointer px-3 py-1.5 rounded-full bg-teal-700 text-white text-xs font-semibold">
              {busy ? "Memproses…" : "📷 Upload dari komputer"}
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => { handleFile(e.target.files?.[0]); e.target.value = ""; }} />
            </label>
            <label className="cursor-pointer px-3 py-1.5 rounded-full border bg-white text-xs">
              📷 Ambil foto (kamera)
              <input type="file" accept="image/*" capture="environment" className="hidden"
                onChange={e => { handleFile(e.target.files?.[0]); e.target.value = ""; }} />
            </label>
            {value && isImageSrc(value) && (
              <button onClick={() => onChange("")} className="px-3 py-1.5 rounded-full border bg-red-50 border-red-200 text-red-700 text-xs">Hapus gambar</button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <input value={url} onChange={e => setUrl(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); applyUrl(url); } }}
              placeholder="https://... (URL gambar)"
              className="rounded-full border border-stone-200 px-3 py-1.5 text-xs w-56" />
            <button onClick={() => applyUrl(url)} className="px-3 py-1.5 rounded-full bg-stone-900 text-white text-xs">Pakai URL</button>
          </div>
          <div className="flex flex-wrap gap-1">
            <span className="text-[11px] text-stone-500 self-center">Contoh:</span>
            {PRESETS.map(u => (
              <button key={u} onClick={() => applyUrl(u)} className="h-7 w-7 rounded-md overflow-hidden border" title={u}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u} alt="preset" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          {error && <div className="text-[11px] text-red-600">{error}</div>}
          <div className="text-[11px] text-stone-500">
            JPG/PNG/WebP otomatis dikompres (maks 640px, ±{formatBytes(1_500_000)}). Gambar disimpan di perangkat ini. Untuk multi-outlet & multi-perangkat, simpan ke object storage S3/R2 lewat backend.
          </div>
        </div>
      </div>
    </div>
  );
}