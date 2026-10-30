"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect } from "react";
import { AuraProvider, DemoSync, useAura } from "@/components/AuraProvider";

const LINKS = [
  { href: "/ragebait", label: "Ragebait" },
  { href: "/overthink", label: "Overthink" },
  { href: "/toast", label: "Toast" },
  { href: "/not-him", label: "U R NOT HIM" },
];

function Chrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { aura, demo, setDemo, href } = useAura();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="relative z-10 flex min-h-dvh flex-col overflow-x-hidden">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07060f]/80 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm font-bold uppercase tracking-[0.14em] sm:text-base">
          <span>
            model confidence: <span className="text-neon">100%</span>
          </span>
          <span className="text-white/30">|</span>
          <span>
            accuracy: <span className="text-pink">0%</span>
          </span>
          <span className="hidden text-white/40 sm:inline">regrets: 0 · braincells online: 3</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link href={href("/")} className="font-display text-xl font-extrabold sm:text-2xl">
            🧠 ConfidentlyWrong.ai
          </Link>
          <div className="flex items-center gap-2">
            <div className="rounded-full border border-sun/40 bg-sun/10 px-3 py-1.5 text-sm font-bold text-sun sm:text-base">
              aura <span className="tabular-nums">{aura}</span> ✨
            </div>
            <button
              type="button"
              onClick={() => setDemo(!demo)}
              aria-pressed={demo}
              className={`rounded-full border px-3 py-1.5 text-sm font-bold sm:text-base ${
                demo ? "border-neon bg-neon text-ink" : "border-white/15 bg-white/5 text-white"
              }`}
            >
              {demo ? "demo on" : "demo mode"}
            </button>
          </div>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-4 pb-3">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={href(link.href)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold sm:text-base ${
                  active ? "bg-white text-ink" : "bg-white/5 text-white/75"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main key={pathname} className="page-enter mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-10">
        {children}
      </main>
      <footer className="border-t border-white/10 px-4 py-8 text-center text-base text-white/60 sm:text-lg">
        MyZgang. made by 4 people who should&apos;ve been studying.
      </footer>
    </div>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <AuraProvider>
      <Suspense fallback={null}>
        <DemoSync />
      </Suspense>
      <Chrome>{children}</Chrome>
    </AuraProvider>
  );
}
