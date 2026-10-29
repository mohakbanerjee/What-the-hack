"use client";

import Link from "next/link";
import { Mascot } from "@/components/Mascot";
import { useAura } from "@/components/AuraProvider";
import { TAGLINE } from "@/lib/types";

const PROBLEMS = [
  {
    href: "/ragebait",
    emoji: "🔥",
    session: "Session: Ragebait",
    name: "Ragebait",
    pitch: "you said something normal and now you want chaos.",
    glow: "shadow-[0_0_36px_rgba(255,61,206,0.28)] hover:border-pink/70",
  },
  {
    href: "/overthink",
    emoji: "🌀",
    session: "Session: Overthinking",
    name: "Overthinking",
    pitch: "they replied ok. you have already built a case file.",
    glow: "shadow-[0_0_36px_rgba(192,132,252,0.28)] hover:border-grape/70",
  },
  {
    href: "/toast",
    emoji: "🍞",
    session: "Session: Undercooked toast",
    name: "Undercooked toast",
    pitch: "the bread needs a diagnosis. sir brainless has a certificate.",
    glow: "shadow-[0_0_36px_rgba(255,225,74,0.22)] hover:border-sun/70",
  },
  {
    href: "/not-him",
    emoji: "💀",
    session: "Session: Not knowing if you're him",
    name: "Not knowing if you're him",
    pitch: "life's biggest question. the answer is already no.",
    glow: "shadow-[0_0_36px_rgba(61,255,242,0.22)] hover:border-neon/70",
  },
];

export function HomeDashboard() {
  const { href } = useAura();

  return (
    <div className="space-y-10">
      <section className="flex flex-col items-center text-center">
        <div className="mb-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-semibold uppercase tracking-[0.18em] text-white/60">
          artificial super unintelligence
        </div>
        <Mascot className="my-4" />
        <h1 className="max-w-full px-2 font-display text-[clamp(2rem,9vw,7.5rem)] font-extrabold leading-[0.88]">
          <span className="block">Sir</span>
          <span className="text-glow">Brainless</span>
        </h1>
        <p className="mt-4 max-w-3xl text-xl text-white/80 sm:text-3xl">{TAGLINE}</p>
        <p className="mt-4 max-w-3xl text-lg text-white/70 sm:text-2xl">
          Sir Brainless, the AI therapist for life&apos;s 4 biggest problems: ragebait, overthinking,
          undercooked toast, and not knowing if you&apos;re him.
        </p>
        <p className="mt-5 font-display text-2xl font-extrabold text-neon sm:text-4xl">what&apos;s troubling you today?</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {PROBLEMS.map((problem, index) => (
          <Link
            key={problem.href}
            href={href(problem.href)}
            className={`group rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 ${problem.glow}`}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/45">
              problem 0{index + 1}
            </p>
            <div className="my-3 text-5xl" aria-hidden="true">
              {problem.emoji}
            </div>
            <h2 className="font-display text-3xl font-extrabold sm:text-4xl">{problem.name}</h2>
            <p className="mt-2 text-lg text-white/75">{problem.pitch}</p>
            <p className="mt-4 text-base font-semibold text-sun">{problem.session} →</p>
          </Link>
        ))}
      </section>

      <section id="about" className="rounded-3xl border border-white/10 bg-black/20 p-6 sm:p-8">
        <h2 className="font-display text-3xl font-extrabold sm:text-5xl">
          we tried to build AGI. we built this instead.
        </h2>
        <p className="mt-4 max-w-3xl text-lg text-white/75 sm:text-xl">
          One therapist. Four problems. Zero qualifications. He will turn a normal opinion into a group-chat
          incident, read “ok.” like a court filing, grade your toast like a talent show, and prove you are
          not him. Please do not book a follow up.
        </p>
      </section>
    </div>
  );
}
