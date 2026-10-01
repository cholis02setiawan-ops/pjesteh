// packages/money/src/index.ts
export type Money = { amountMinor: bigint; currency: string };

export const IDR = "IDR" as const;

export function toMoney(rupiah: number): Money {
  return { amountMinor: BigInt(Math.round(rupiah * 100)), currency: IDR };
}

export function fromMinor(minor: bigint): Money {
  return { amountMinor: minor, currency: IDR };
}

export function money(rupiah: number): Money {
  return toMoney(rupiah);
}

export const zero: Money = { amountMinor: BigInt(0), currency: IDR };

export function plus(a: Money, b: Money): Money {
  return { amountMinor: a.amountMinor + b.amountMinor, currency: IDR };
}

export function minus(a: Money, b: Money): Money {
  return { amountMinor: a.amountMinor - b.amountMinor, currency: IDR };
}

export function multiply(a: Money, n: number): Money {
  return { amountMinor: a.amountMinor * BigInt(n), currency: IDR };
}

export function percent(a: Money, rate: number): Money {
  return { amountMinor: (a.amountMinor * BigInt(Math.round(rate * 100))) / BigInt(10000), currency: IDR };
}

export function formatIDR(m: Money | number | bigint): string {
  const minor = typeof m === "number" ? BigInt(Math.round(m * 100)) : typeof m === "bigint" ? m : m.amountMinor;
  const rupiah = Number(minor / BigInt(100));
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(rupiah);
}

export function formatMinor(minor: bigint): string {
  return formatIDR({ amountMinor: minor, currency: IDR });
}

export function allocate(total: Money, ratios: number[]): Money[] {
  const sum = ratios.reduce((a, b) => a + b, 0);
  let remainder = total.amountMinor;
  const result: Money[] = [];
  for (let i = 0; i < ratios.length; i++) {
    const share = i === ratios.length - 1 ? remainder : (total.amountMinor * BigInt(ratios[i])) / BigInt(sum);
    result.push({ amountMinor: share, currency: IDR });
    remainder -= share;
  }
  let idx = 0;
  while (remainder > BigInt(0)) { result[idx % result.length].amountMinor += BigInt(1); remainder -= BigInt(1); idx++; }
  return result;
}

// Validasi uang tidak boleh negatif atau NaN
export function validateMoney(amount: number, label: string): void {
  if (isNaN(amount) || amount < 0) {
    throw new Error(`Uang ${label} tidak valid: ${amount}`);
  }
}
