"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { Mascot } from "@/components/Mascot";
import { useAura } from "@/components/AuraProvider";

const tones = {
  pink: "bg-gradient-to-r from-pink to-grape text-white shadow-[0_0_28px_rgba(255,61,206,0.4)]",
  sun: "bg-sun text-ink shadow-[0_0_24px_rgba(255,225,74,0.35)]",
  ghost: "border border-white/15 bg-white/5 text-white",
};

export function BigButton({
  children,
  tone = "pink",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: keyof typeof tones }) {
  return (
    <button
      {...props}
      className={`inline-flex min-h-14 items-center justify-center gap-2 rounded-full px-6 text-lg font-bold transition hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 ${tones[tone]} ${className}`}
    >
      {children}
    </button>
  );
}

export const fieldClass =
  "w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-4 text-lg text-white outline-none placeholder:text-white/35 focus:border-neon focus:ring-2 focus:ring-neon/30";

export function ToolHeader({
  emoji,
  title,
  session,
  pitch,
}: {
  emoji: string;
  title: string;
  session: string;
  pitch: string;
}) {
  return (
    <header className="mb-6 space-y-3">
      <div className="flex items-center gap-3">
        <div className="h-16 w-16 shrink-0 overflow-hidden">
          <div className="origin-top-left scale-[0.42]">
            <Mascot />
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-neon">Session: {session}</p>
          <p className="text-sm text-white/55">Sir Brainless is in. 100% confident. 0% qualified.</p>
        </div>
      </div>
      <h1 className="font-display text-4xl font-extrabold leading-[0.95] sm:text-6xl">
        <span className="mr-2">{emoji}</span>
        {title}
      </h1>
      <p className="max-w-3xl text-lg text-white/75 sm:text-2xl">{pitch}</p>
    </header>
  );
}

export function EndSession() {
  const { href } = useAura();
  return (
    <div className="mt-8">
      <Link
        href={href("/")}
        className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 text-lg font-bold text-white"
      >
        end session / see another problem
      </Link>
    </div>
  );
}

export function DemoNote({ demo }: { demo: boolean }) {
  if (!demo) return null;
  return (
    <p className="mb-4 inline-flex rounded-full border border-sun/40 bg-sun/10 px-3 py-1 text-sm font-semibold text-sun">
      demo mode · skipping the API · still wrong
    </p>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_0_40px_rgba(192,132,252,0.08)] sm:p-6 ${className}`}>
      {children}
    </section>
  );
}
