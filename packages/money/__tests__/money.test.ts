import { describe, it, expect } from "vitest";
import { toMoney, plus, minus, multiply, percent, formatIDR, allocate } from "./src/index";

describe("Money", () => {
  it("mengkonversi rupiah ke sen dengan benar", () => {
    const m = toMoney(15000);
    expect(m.amountMinor).toBe(1500000n);
    expect(m.currency).toBe("IDR");
  });

  it("penjumlahan uang bekerja", () => {
    const a = toMoney(10000);
    const b = toMoney(5000);
    const result = plus(a, b);
    expect(result.amountMinor).toBe(1500000n);
  });

  it("pengurangan uang bekerja", () => {
    const a = toMoney(20000);
    const b = toMoney(5000);
    const result = minus(a, b);
    expect(result.amountMinor).toBe(1500000n);
  });

  it("persentase dihitung benar", () => {
    const m = toMoney(100000);
    const result = percent(m, 10);
    expect(result.amountMinor).toBe(1000000n);
  });

  it("format IDR benar", () => {
    const m = toMoney(15000);
    expect(formatIDR(m)).toMatch(/^Rp\s*15.000$/);
  });

  it("alokasi proporsional dengan remainder", () => {
    const total = toMoney(100000);
    const result = allocate(total, [1, 1]);
    expect(result[0].amountMinor + result[1].amountMinor).toBe(total.amountMinor);
  });
});
