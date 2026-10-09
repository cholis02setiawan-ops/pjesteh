"use client";
import { useEffect, useState } from "react";
import { loadProducts } from "@/lib/store";
import type { Product } from "@/lib/data";
import { formatIDR } from "@/lib/money";
import { ProductImage } from "@/lib/ProductImage";

export function MenuPreviewGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    setProducts(loadProducts());
    const onStore = () => setProducts(loadProducts());
    window.addEventListener("focus", onStore);
    window.addEventListener("tehkita:products", onStore as EventListener);
    return () => {
      window.removeEventListener("focus", onStore);
      window.removeEventListener("tehkita:products", onStore as EventListener);
    };
  }, []);

  return (
    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {products.map(p => (
        <div key={p.id} className="rounded-2xl border border-stone-200 bg-white overflow-hidden hover:shadow-sm transition">
          <ProductImage src={p.image} emoji={p.image} alt={p.name} rounded="" className="h-28 w-full" />
          <div className="p-3">
            <div className="text-xs px-2 py-0.5 rounded-full bg-stone-100 border border-stone-200 inline-block">{p.category}</div>
            <div className="mt-1 font-semibold text-sm leading-tight">{p.name}</div>
            <div className="text-xs text-stone-500 line-clamp-1">{p.sku} · Tahan {p.durability_minutes} menit</div>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-bold text-sm">{formatIDR(p.price)}</span>
              <span className={`text-[10px] px-2 py-1 rounded-full border ${p.is_active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>{p.is_active ? "Tersedia" : "Habis"}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}