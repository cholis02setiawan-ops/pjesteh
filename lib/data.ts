// Mock domain data — mirrors BP.md ERD & COA
export type Outlet = { code: string; name: string; addr: string };
export const outlets: Outlet[] = [
  { code: "KRW01", name: "Karawang — Outlet 01", addr: "Jl. Tuparev No. 88, Karawang" },
  { code: "KRW02", name: "Karawang — Outlet 02", addr: "Jl. Galuh Mas Raya" },
];

export type Product = {
  id: string; sku: string; name: string; type: "BEVERAGE"|"FOOD"|"PACKAGED";
  durability_minutes: number; price: number; category: string; image: string; is_active: boolean;
  recipe?: { ingredient: string; qty: number; unit: string }[];
};
export const products: Product[] = [
  { id: "p_esteh_original", sku: "EST-001", name: "Es Teh Original", type: "BEVERAGE", durability_minutes: 90, price: 8000, category: "Es Teh", image: "🍃", is_active: true, recipe: [{ingredient:"Teh melati", qty:8, unit:"g"}, {ingredient:"Gula", qty:30, unit:"ml"}, {ingredient:"Es", qty:180, unit:"g"}]},
  { id: "p_esteh_melati", sku: "EST-002", name: "Es Teh Melati Premium", type: "BEVERAGE", durability_minutes: 75, price: 12000, category: "Es Teh", image: "🌸", is_active: true },
  { id: "p_esteh_lemon", sku: "EST-003", name: "Es Teh Lemon Madu", type: "BEVERAGE", durability_minutes: 60, price: 15000, category: "Es Teh", image: "🍋", is_active: true },
  { id: "p_esteh_susu", sku: "EST-004", name: "Es Teh Susu Gula Aren", type: "BEVERAGE", durability_minutes: 90, price: 18000, category: "Es Teh", image: "🥤", is_active: true },
  { id: "p_pisgor", sku: "FOOD-001", name: "Pisang Goreng Madu", type: "FOOD", durability_minutes: 45, price: 16000, category: "Cemilan", image: "🍌", is_active: true },
  { id: "p_mendoan", sku: "FOOD-002", name: "Tempe Mendoan", type: "FOOD", durability_minutes: 40, price: 14000, category: "Cemilan", image: "🍘", is_active: true },
  { id: "p_botol1l", sku: "PKG-001", name: "Es Teh Botol 1L", type: "PACKAGED", durability_minutes: 240, price: 25000, category: "Kemasan", image: "🧃", is_active: true },
];

export const variants = [
  { id: "v_reguler", name: "Reguler", priceDelta: 0 },
  { id: "v_large", name: "Large", priceDelta: 4000 },
  { id: "v_botol1l", name: "Botol 1L", priceDelta: 12000 },
];
export const modifiers = [
  { group: "Gula", options: [{ id: "m_gula_normal", name: "Normal", delta: 0 }, { id: "m_gula_less", name: "Less Sugar", delta: 0 }, { id: "m_gula_extra", name: "Extra Sweet", delta: 1000 }]},
  { group: "Es", options: [{ id: "m_es_normal", name: "Normal", delta: 0 }, { id: "m_es_less", name: "Less Ice", delta: 0 }, { id: "m_es_no", name: "Tanpa Es", delta: 0 }, { id: "m_es_separate", name: "Es Terpisah", delta: 0 }]},
  { group: "Topping", options: [{ id: "m_top_boba", name: "+ Boba", delta: 5000 }, { id: "m_top_jelly", name: "+ Jelly", delta: 4000 }]},
];

export type DepositPolicy = {
  id: string; name: string; calc_method: "NONE"|"FLAT"|"PERCENT"|"PER_PAX";
  value: number; min_amount?: number; max_amount?: number; min_party_size: number;
  scope: string; payment_window_minutes: number; on_arrival: "DEDUCT"|"FORFEIT"|"PARTIAL";
  cancellation_tiers: { hoursBefore: number; refundPercent: number }[];
  priority: number;
};
export const depositPolicies: DepositPolicy[] = [
  { id:"pv_9f31", name:"Akhir pekan — area lesehan", calc_method:"PER_PAX", value:25000, min_party_size:6, scope:"Outlet KRW01 · Area Lesehan · Weekend", payment_window_minutes:60, on_arrival:"DEDUCT", priority:10, cancellation_tiers:[{hoursBefore:24, refundPercent:100},{hoursBefore:6, refundPercent:50},{hoursBefore:0, refundPercent:0}]},
  { id:"pv_base", name:"Hari biasa", calc_method:"FLAT", value:50000, min_amount:50000, max_amount:500000, min_party_size:6, scope:"Semua area · Hari biasa", payment_window_minutes:60, on_arrival:"DEDUCT", priority:1, cancellation_tiers:[{hoursBefore:24, refundPercent:100},{hoursBefore:6, refundPercent:50},{hoursBefore:0, refundPercent:0}]},
  { id:"pv_none", name:"Tanpa DP", calc_method:"NONE", value:0, min_party_size:99, scope:"Rombongan kecil", payment_window_minutes:60, on_arrival:"DEDUCT", priority:0, cancellation_tiers:[]},
];

export const zones = [
  { id:"z1", name:"Zona 1 · 0-3 km", fee: 8000, perKm: 0, color:"#0f766e" },
  { id:"z2", name:"Zona 2 · 3-7 km", fee: 12000, perKm: 2500, color:"#f59e0b" },
  { id:"z3", name:"Zona 3 · >7 km", fee: 18000, perKm: 3500, color:"#dc2626" },
];

export const chartOfAccounts = [
  { code:"1-1100", name:"Kas di laci kasir", type:"ASSET", normal:"DEBIT", postable:true },
  { code:"1-1150", name:"Kas di brankas", type:"ASSET", normal:"DEBIT", postable:true },
  { code:"1-1200", name:"Bank", type:"ASSET", normal:"DEBIT", postable:true },
  { code:"1-1300", name:"Piutang payment gateway", type:"ASSET", normal:"DEBIT", postable:true },
  { code:"1-1310", name:"Piutang kurir COD", type:"ASSET", normal:"DEBIT", postable:true },
  { code:"1-1400", name:"Persediaan bahan baku", type:"ASSET", normal:"DEBIT", postable:true },
  { code:"2-1100", name:"Utang usaha", type:"LIABILITY", normal:"CREDIT", postable:true },
  { code:"2-1200", name:"Pendapatan diterima di muka — DP", type:"LIABILITY", normal:"CREDIT", postable:true },
  { code:"2-1300", name:"Utang pajak PBJT", type:"LIABILITY", normal:"CREDIT", postable:true },
  { code:"4-1100", name:"Penjualan minuman", type:"REVENUE", normal:"CREDIT", postable:true },
  { code:"4-1300", name:"Pendapatan pengiriman", type:"REVENUE", normal:"CREDIT", postable:true },
  { code:"4-1400", name:"Pendapatan DP hangus", type:"REVENUE", normal:"CREDIT", postable:true },
  { code:"5-1100", name:"HPP bahan", type:"EXPENSE", normal:"DEBIT", postable:true },
  { code:"6-1400", name:"Beban MDR gateway", type:"EXPENSE", normal:"DEBIT", postable:true },
  { code:"6-1900", name:"Selisih kas", type:"EXPENSE", normal:"DEBIT", postable:true },
];

export const kdsOrders = [
  { id:"ord_81f3", number:"KRW-20260924-0142", channel:"QR" as const, table:"M03", time:"11:42", items:2, status:"DIPROSES" as const, eta:"8 menit" },
  { id:"ord_81f4", number:"KRW-20260924-0143", channel:"POS" as const, table:"Kasir 01", time:"11:45", items:3, status:"DIKONFIRMASI" as const, eta:"5 menit" },
  { id:"ord_81f5", number:"KRW-20260924-0144", channel:"DELIVERY" as const, table:"Antar - Zona 2", time:"11:48", items:4, status:"SIAP" as const, eta:"Siap" },
];

export type JournalEntry = { id:string; date:string; ref:string; desc:string; lines:{account:string; debit:number; credit:number}[]; status:"POSTED"|"DRAFT" };
export const journals: JournalEntry[] = [
  { id:"JE-20260924-001", date:"2026-09-24", ref:"ord_81f3", desc:"Penjualan QR M03 — 3x Es Teh Large", status:"POSTED", lines:[
    {account:"1-1100 Kas di laci", debit:24000, credit:0},
    {account:"4-1100 Penjualan minuman", debit:0, credit:21818},
    {account:"2-1300 Utang PBJT 10%", debit:0, credit:2182},
  ]},
  { id:"JE-20260924-002", date:"2026-09-24", ref:"ord_81f3", desc:"HPP — 3x Es Teh Large", status:"POSTED", lines:[
    {account:"5-1100 HPP bahan", debit:5400, credit:0},
    {account:"1-1400 Persediaan bahan", debit:0, credit:5400},
  ]},
  { id:"JE-20260924-003", date:"2026-09-24", ref:"rsv_BK-9F31", desc:"DP Reservasi Lesehan 8 orang — Diterima", status:"POSTED", lines:[
    {account:"1-1300 Piutang gateway", debit:200000, credit:0},
    {account:"2-1200 Pendapatan dimuka", debit:0, credit:200000},
  ]},
];
