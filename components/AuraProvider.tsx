"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { playBuzz, playDing } from "@/lib/sounds";

const AURA_KEY = "cw-aura";
const DEMO_KEY = "cw-demo";
const AURA_EVENT = "cw-aura-change";
const DEMO_EVENT = "cw-demo-change";

type Toast = { id: number; text: string };

type AuraContextValue = {
  aura: number;
  demo: boolean;
  setDemo: (on: boolean) => void;
  applyQuery: (value: string | null) => void;
  href: (path: string) => string;
  flash: (text: string) => void;
  nudge: (options?: { sound?: boolean; suffix?: string }) => void;
};

const AuraContext = createContext<AuraContextValue | null>(null);

let memoryAura: number | null = null;
let memoryDemo: "0" | "1" | null = null;

function readAura() {
  if (memoryAura != null) return memoryAura;
  try {
    const raw = localStorage.getItem(AURA_KEY);
    if (raw == null) return 40;
    const value = Number(raw);
    return Number.isFinite(value) ? Math.max(0, Math.round(value)) : 40;
  } catch {
    return 40;
  }
}

function writeAura(next: number) {
  memoryAura = next;
  try {
    localStorage.setItem(AURA_KEY, String(next));
  } catch {
    /* private mode keeps the in-memory number */
  }
  window.dispatchEvent(new Event(AURA_EVENT));
}

function readDemoFlag() {
  if (memoryDemo) return memoryDemo;
  try {
    return localStorage.getItem(DEMO_KEY) === "1" ? "1" : "0";
  } catch {
    return "0";
  }
}

function writeDemo(on: boolean) {
  memoryDemo = on ? "1" : "0";
  try {
    localStorage.setItem(DEMO_KEY, memoryDemo);
  } catch {
    /* private mode keeps the in-memory flag */
  }
  window.dispatchEvent(new Event(DEMO_EVENT));
}

function subscribeAura(callback: () => void) {
  window.addEventListener(AURA_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(AURA_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function subscribeDemo(callback: () => void) {
  window.addEventListener(DEMO_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(DEMO_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function AuraProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [toast, setToast] = useState<Toast | null>(null);
  const aura = useSyncExternalStore(subscribeAura, readAura, () => 40);
  const demo = useSyncExternalStore(subscribeDemo, readDemoFlag, () => "0") === "1";

  const applyQuery = useCallback((value: string | null) => {
    if (value === "1") writeDemo(true);
    else if (value === "0") writeDemo(false);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 3400);
    return () => window.clearTimeout(id);
  }, [toast]);

  const api = useMemo<AuraContextValue>(() => {
    const flash = (text: string) => setToast({ id: Date.now(), text });
    return {
      aura,
      demo,
      applyQuery,
      href: (path: string) => (demo ? `${path}?demo=1` : path),
      flash,
      setDemo: (on: boolean) => {
        writeDemo(on);
        const params = new URLSearchParams(window.location.search);
        if (on) params.set("demo", "1");
        else params.delete("demo");
        const query = params.toString();
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
      },
      nudge: (options) => {
        const choices = [-34, -21, -13, -8, 6, 11, 18, 27, 40];
        const delta = choices[Math.floor(Math.random() * choices.length)] ?? 6;
        writeAura(Math.max(0, readAura() + delta));
        const lead =
          delta > 0
            ? `+${delta} aura. undeserved. sharma ji ka beta still clears you.`
            : `${delta} aura. tumse na ho payega, affectionately.`;
        flash(`${lead}${options?.suffix ?? ""}`);
        if (options?.sound !== false) {
          if (delta > 0) playDing();
          else playBuzz();
        }
      },
    };
  }, [applyQuery, aura, demo, pathname, router]);

  return (
    <AuraContext.Provider value={api}>
      {children}
      {toast ? (
        <div
          key={toast.id}
          className="toast-pop fixed bottom-6 left-1/2 z-[70] max-w-[92vw] rounded-full border border-white/15 bg-[#14081c]/95 px-5 py-3 text-center text-base font-semibold text-white shadow-[0_10px_40px_rgba(0,0,0,0.45)] sm:text-lg"
          role="status"
        >
          {toast.text}
        </div>
      ) : null}
    </AuraContext.Provider>
  );
}

export function useAura() {
  const value = useContext(AuraContext);
  if (!value) throw new Error("useAura must be used inside AuraProvider");
  return value;
}

export function DemoSync() {
  const searchParams = useSearchParams();
  const { applyQuery } = useAura();
  useEffect(() => {
    applyQuery(searchParams.get("demo"));
  }, [applyQuery, searchParams]);
  return null;
}
