import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Teh Kita — Platform Es Teh & Minuman",
  description: "QR Menu, POS Offline-First, Reservasi DP, Delivery & Buku Besar — PWA + REST API",
};

function Nav() {
  const links = [
    { href: "/", label: "Beranda" },
    { href: "/m/KRW01/M03", label: "Menu QR" },
    { href: "/pos", label: "POS Kasir" },
    { href: "/kds", label: "Dapur KDS" },
    { href: "/reservasi", label: "Reservasi" },
    { href: "/delivery", label: "Antar" },
    { href: "/admin", label: "Admin & Akuntansi" },
    { href: "/courier", label: "Kurir" },
    { href: "/login", label: "Login" },
  ];
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-[#fdfcf8]/90 border-b border-stone-200">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 h-[56px] flex items-center justify-between gap-4">
        <a href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-teal-700 flex items-center justify-center text-white font-bold text-sm">TK</div>
          <div className="leading-none">
            <div className="font-bold text-sm tracking-tight">TEH KITA</div>
            <div className="text-[10px] tracking-[0.14em] text-stone-500 font-medium">PWA · OFFLINE-FIRST</div>
          </div>
          <span className="hidden sm:inline-flex ml-2 text-[10px] px-2 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">KRW01 · Karawang</span>
        </a>
        <nav className="hidden lg:flex items-center gap-1 text-sm">
          {links.map(l => (
            <a key={l.href} href={l.href} className="px-3 py-1.5 rounded-full hover:bg-stone-100 text-stone-700 hover:text-stone-900 transition">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Online · Sync 0 antrean
          </span>
          <a href="/login" className="hidden sm:inline-flex text-xs px-3 py-2 rounded-full border border-stone-200 bg-white hover:bg-stone-50 font-medium">🔒 Edit Pribadi</a>
          <a href="/pos" className="text-xs sm:text-sm px-3.5 py-2 rounded-full bg-teal-700 text-white hover:bg-teal-800 transition font-medium">Buka POS</a>
        </div>
      </div>
      <div className="lg:hidden overflow-x-auto border-t border-stone-100">
        <div className="flex gap-1 px-4 py-2">
          {links.map(l => (
            <a key={l.href} href={l.href} className="whitespace-nowrap text-xs px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-dvh flex flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-stone-200 py-6 text-center text-xs text-stone-500">
          <div className="mx-auto max-w-[1280px] px-6">
            Blueprint v1.0 · Monolit Modular · PostgreSQL + Redis + BullMQ · Satu region Jakarta · RTO 1j RPO 5m · © Teh Kita
          </div>
        </footer>
      </body>
    </html>
  );
}
