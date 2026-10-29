"use client";

import { useEffect, useState } from "react";
import { THINKING_STEPS } from "@/lib/fallbacks";
import { drawFresh } from "@/lib/shuffle";

export function ThinkingLoader({
  show,
  steps = THINKING_STEPS,
  poolId = "loading",
}: {
  show: boolean;
  steps?: readonly string[];
  poolId?: string;
}) {
  const [index, setIndex] = useState(0);
  const [cycle, setCycle] = useState<{ show: boolean; order: readonly string[] }>({
    show: false,
    order: steps,
  });

  if (show !== cycle.show) {
    setCycle({
      show,
      order: show ? drawFresh(poolId, [...steps], steps.length) : cycle.order,
    });
    setIndex(0);
  }

  useEffect(() => {
    if (!show) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % Math.max(cycle.order.length, 1));
    }, 700);
    return () => window.clearInterval(id);
  }, [show, cycle.order]);

  if (!show || cycle.order.length === 0) return null;
  const line = cycle.order[index] ?? cycle.order[0];

  return (
    <div
      className="mt-5 rounded-3xl border border-white/10 bg-black/30 p-5"
      role="status"
      aria-live="polite"
    >
      <div className="mb-3 flex items-center gap-3">
        <span className="text-4xl" aria-hidden="true">
          🧠
        </span>
        <div>
          <p className="font-display text-xl font-bold">Sir Brainless is thinking</p>
          <p className="text-sm text-white/50">confidence 100% · facts loading never</p>
        </div>
      </div>
      <p key={`${line}-${index}`} className="step-pop text-lg text-neon sm:text-xl">
        {line}
      </p>
      <div className="indeterminate mt-4">
        <span />
      </div>
    </div>
  );
}
