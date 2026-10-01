"use client";
import { products as defaultProducts, outlets as defaultOutlets, depositPolicies as defaultPolicies, type Product, type Outlet, type DepositPolicy } from "./data";

const K_PRODUCTS = "tehkita_products";
const K_OUTLETS = "tehkita_outlets";
const K_POLICIES = "tehkita_policies";

export function loadProducts(): Product[] {
  if (typeof window==="undefined") return defaultProducts;
  try { const v = localStorage.getItem(K_PRODUCTS); return v? JSON.parse(v) : defaultProducts; } catch { return defaultProducts; }
}
export function saveProducts(p: Product[]): void { localStorage.setItem(K_PRODUCTS, JSON.stringify(p)); }

export function loadOutlets(): Outlet[] {
  if (typeof window==="undefined") return defaultOutlets;
  try { const v = localStorage.getItem(K_OUTLETS); return v? JSON.parse(v) : defaultOutlets; } catch { return defaultOutlets; }
}
export function saveOutlets(o: Outlet[]): void { localStorage.setItem(K_OUTLETS, JSON.stringify(o)); }

export function loadPolicies(): DepositPolicy[] {
  if (typeof window==="undefined") return defaultPolicies;
  try { const v = localStorage.getItem(K_POLICIES); return v? JSON.parse(v) : defaultPolicies; } catch { return defaultPolicies; }
}
export function savePolicies(p: DepositPolicy[]): void { localStorage.setItem(K_POLICIES, JSON.stringify(p)); }

export function exportAll(): string {
  return JSON.stringify({
    products: loadProducts(),
    outlets: loadOutlets(),
    policies: loadPolicies(),
    exportedAt: new Date().toISOString(),
    version: "1.0"
  }, null, 2);
}
export function importAll(json: string): boolean {
  try {
    const data = JSON.parse(json);
    if (data.products) saveProducts(data.products);
    if (data.outlets) saveOutlets(data.outlets);
    if (data.policies) savePolicies(data.policies);
    return true;
  } catch { return false; }
}
