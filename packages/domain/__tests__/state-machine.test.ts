import { describe, it, expect } from "vitest";
import { canTransition } from "../src/index";

describe("Order State Machine", () => {
  it("DRAFT bisa ke WAITING_PAYMENT", () => {
    expect(canTransition("DRAFT", "WAITING_PAYMENT")).toBe(true);
  });

  it("DRAFT tidak bisa langsung ke COMPLETED", () => {
    expect(canTransition("DRAFT", "COMPLETED")).toBe(false);
  });

  it("CONFIRMED bisa ke PREPARING", () => {
    expect(canTransition("CONFIRMED", "PREPARING")).toBe(true);
  });

  it("COMPLETED tidak punya next state", () => {
    expect(canTransition("COMPLETED", "APPROVED")).toBe(false);
  });
});

describe("Reservation State Machine", () => {
  it("DRAFT bisa ke PENDING_DEPOSIT", () => {
    expect(canTransition("DRAFT", "PENDING_DEPOSIT")).toBe(true);
  });

  it("CONFIRMED bisa ke SEATED", () => {
    expect(canTransition("CONFIRMED", "SEATED")).toBe(true);
  });
});
