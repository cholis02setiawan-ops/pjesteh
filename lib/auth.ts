"use client";
export type OwnerCred = { username: string; passwordHash: string; createdAt: string };
const OWNER_KEY = "tehkita_owner";
const SESSION_KEY = "tehkita_session";

function hash(pw: string): string {
  // Simple hash for demo — not for production crypto, but obfuscates localStorage
  let h = 0;
  for (let i=0;i<pw.length;i++) h = Math.imul(31, h) + pw.charCodeAt(i) | 0;
  return "h_" + Math.abs(h).toString(36) + "_" + pw.length;
}

export function getOwner(): OwnerCred | null {
  if (typeof window==="undefined") return null;
  try { const v = localStorage.getItem(OWNER_KEY); return v? JSON.parse(v): null; } catch { return null; }
}
export function hasOwner(): boolean { return !!getOwner(); }

export function createOwner(username: string, password: string): void {
  const cred: OwnerCred = { username: username.trim(), passwordHash: hash(password), createdAt: new Date().toISOString() };
  localStorage.setItem(OWNER_KEY, JSON.stringify(cred));
  localStorage.setItem(SESSION_KEY, JSON.stringify({ username: cred.username, loginAt: new Date().toISOString() }));
}
export function login(username: string, password: string): boolean {
  const o = getOwner();
  if (!o) return false;
  if (o.username===username.trim() && o.passwordHash===hash(password)) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ username: o.username, loginAt: new Date().toISOString() }));
    return true;
  }
  return false;
}
export function logout(): void { localStorage.removeItem(SESSION_KEY); }
export function isLoggedIn(): boolean {
  if (typeof window==="undefined") return false;
  return !!localStorage.getItem(SESSION_KEY);
}
export function currentUser(): string | null {
  try { const v = localStorage.getItem(SESSION_KEY); return v? JSON.parse(v).username : null; } catch { return null; }
}
export function changePassword(oldPw: string, newPw: string): boolean {
  const o = getOwner();
  if (!o || o.passwordHash!==hash(oldPw)) return false;
  const updated: OwnerCred = { ...o, passwordHash: hash(newPw) };
  localStorage.setItem(OWNER_KEY, JSON.stringify(updated));
  return true;
}
export function resetAll(): void {
  localStorage.removeItem(OWNER_KEY);
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem("tehkita_products");
  localStorage.removeItem("tehkita_outlets");
  localStorage.removeItem("tehkita_policies");
}
