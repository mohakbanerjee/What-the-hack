"use client";

import { useEffect, useRef, useState } from "react";
import { useAura } from "@/components/AuraProvider";
import { PhotoPick } from "@/components/PhotoPick";
import { ThinkingLoader } from "@/components/ThinkingLoader";
import { BigButton, DemoNote, EndSession, Panel, ToolHeader, fieldClass } from "@/components/ui";
import { postJson, runWithThink, sleep } from "@/lib/ai";
import { SCAN_STEPS, notHimFallback, presentAppeal, presentHim } from "@/lib/fallbacks";
import { fileToJpeg, looksLikeImage } from "@/lib/image";
import { sanitizeNotHim } from "@/lib/shape";
import { seenLines } from "@/lib/shuffle";
import { playBuzz, playVineBoom } from "@/lib/sounds";
import type { NotHimResult } from "@/lib/types";

type Phase = "idle" | "scan" | "glitch" | "result";

export function NotHimTool() {
  const { demo, nudge, flash } = useAura();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const runRef = useRef(0);
  const [name, setName] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<NotHimResult | null>(null);
  const [appealNote, setAppealNote] = useState("");
  const [appealing, setAppealing] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [camError, setCamError] = useState("");
  const [selfie, setSelfie] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (!camOn || !videoRef.current || !streamRef.current) return;
    videoRef.current.srcObject = streamRef.current;
    void videoRef.current.play().catch(() => undefined);
  }, [camOn]);

  useEffect(() => {
    if (phase !== "scan") return;
    const id = window.setInterval(() => {
      setStep((current) => (current + 1) % SCAN_STEPS.length);
    }, 700);
    return () => window.clearInterval(id);
  }, [phase]);

  function stopCam() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCamOn(false);
  }

  async function startCam() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCamError("this browser does not do webcams. upload a selfie or proceed faceless.");
      playBuzz();
      return;
    }
    try {
      stopCam();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      setSelfie(null);
      setCamError("");
      setCamOn(true);
    } catch {
      setCamError("camera said no. scanning your vibe blind anyway.");
      playBuzz();
    }
  }

  async function onSelfie(file: File | undefined) {
    if (!file || !looksLikeImage(file)) {
      flash("that file would not sit for a scan. the vibe check can wait.");
      playBuzz();
      return;
    }
    try {
      const prepared = await fileToJpeg(file, 640);
      stopCam();
      setSelfie(prepared.dataUrl);
      setCamError("");
    } catch {
      flash("the selfie dissolved. the scan does not need a face anyway.");
      playBuzz();
    }
  }

  async function scan() {
    const cleaned = name.trim();
    if (!cleaned) {
      flash("type a name. even sharma ji ka beta has a name, and he is fake.");
      playBuzz();
      return;
    }
    const id = runRef.current + 1;
    runRef.current = id;
    setPhase("scan");
    setProgress(0);
    setResult(null);
    setAppealNote("");
    setStep(0);
    const duration = demo ? 2600 : 8000 + Math.random() * 2000;
    const started = performance.now();
    const avoid = [...seenLines("him-reasons"), ...seenLines("matches")];
    const fallback = notHimFallback(cleaned, false, avoid);
    const task = demo
      ? Promise.resolve(fallback)
      : postJson("/api/nothim", { name: cleaned, appeal: false, avoid }, fallback, sanitizeNotHim);

    await new Promise<void>((resolve) => {
      const tick = (now: number) => {
        if (runRef.current !== id) {
          resolve();
          return;
        }
        const amount = Math.min(1, (now - started) / duration);
        setProgress(Math.min(99, amount * 99));
        if (amount < 1) window.requestAnimationFrame(tick);
        else resolve();
      };
      window.requestAnimationFrame(tick);
    });
    if (runRef.current !== id) return;
    const data = await task;
    if (runRef.current !== id) return;
    const shown = demo ? data : { ...data, ...presentHim(data.reason, data.celebrityMatch) };
    setProgress(99);
    setPhase("glitch");
    await sleep(demo ? 420 : 760);
    if (runRef.current !== id) return;
    setResult(shown);
    setPhase("result");
    playVineBoom();
    nudge({ sound: false });
  }

  async function appeal() {
    const cleaned = name.trim();
    setAppealing(true);
    const avoid = [...seenLines("appeals"), ...seenLines("matches")];
    const fallback = notHimFallback(cleaned, true, avoid);
    const task = demo
      ? Promise.resolve(fallback)
      : postJson("/api/nothim", { name: cleaned, appeal: true, avoid }, fallback, sanitizeNotHim);
    const data = await runWithThink(demo, task);
    const shown = demo ? data : { ...data, ...presentAppeal(data.reason, data.celebrityMatch) };
    setResult(shown);
    setAppealNote("APPEAL DENIED");
    setAppealing(false);
    playBuzz();
    nudge({ sound: false });
  }

  const scanning = phase === "scan" || phase === "glitch";
  const stats = [
    ["aura detected", Math.round(progress * 14)],
    ["rizz levels", `${Math.round(progress * 0.8)}%`],
    ["sigma frequency", `${(progress * 0.047).toFixed(2)} Hz`],
    ["main character energy", progress > 72 ? "buffering" : "loading"],
  ] as const;

  return (
    <div>
      <ToolHeader
        emoji="💀"
        title="Him Detector"
        session="Not knowing if you're him"
        pitch="today's problem: you need a professional opinion on whether you are him. you are not."
      />
      <DemoNote demo={demo} />
      <Panel>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void scan();
          }}
        >
          <label htmlFor="him-name" className="block text-lg font-semibold">
            your name
          </label>
          <input
            id="him-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="type a name"
            maxLength={40}
            className={fieldClass}
          />
          <div className="flex flex-wrap gap-3">
            <BigButton type="button" tone="ghost" onClick={() => void startCam()}>
              turn on webcam
            </BigButton>
            <PhotoPick label="upload a selfie" onFile={(file) => void onSelfie(file)} />
          </div>
          {camError ? <p className="text-sun">{camError}</p> : null}
          <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-3xl border border-neon/40 bg-black/50">
            {camOn ? (
              <video ref={videoRef} muted playsInline autoPlay className="h-full w-full object-cover" />
            ) : selfie ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selfie} alt="Selfie staged for a scan" className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center text-7xl" aria-hidden="true">
                🧍
              </div>
            )}
            {scanning ? (
              <>
                <div className="grid-overlay" />
                <div className="laser" />
                <div className="scan-corners" />
              </>
            ) : null}
          </div>
          <BigButton type="submit" disabled={phase === "scan" || phase === "glitch"}>
            Scan for Him-ness 🔍
          </BigButton>
        </form>

        {scanning ? (
          <div className="mt-5 space-y-3" role="status">
            <div className="flex items-end justify-between">
              <p className={`font-display text-6xl font-extrabold tabular-nums ${phase === "glitch" ? "glitch" : ""}`} data-text="99%">
                {phase === "glitch" ? "99%" : `${Math.round(progress)}%`}
              </p>
              <p className="text-white/50">{phase === "glitch" ? "signal lost" : "scanning"}</p>
            </div>
            <div className="h-4 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-neon to-pink"
                style={{ width: `${phase === "glitch" ? 99 : progress}%` }}
              />
            </div>
            <p key={SCAN_STEPS[step]} className="step-pop text-lg text-neon">
              {SCAN_STEPS[step]}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {stats.map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-black/30 px-3 py-2">
                  <p className="text-sm uppercase tracking-wide text-white/45">{label}</p>
                  <p className="font-display text-2xl font-bold tabular-nums">{value}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        <ThinkingLoader show={appealing} steps={SCAN_STEPS} />
      </Panel>

      {phase === "result" && result ? (
        <div className="shake mt-6 space-y-4 text-center">
          {appealNote ? (
            <p className="text-2xl font-extrabold tracking-[0.2em] text-pink">{appealNote}</p>
          ) : null}
          <h2
            className="glitch font-display text-5xl font-extrabold leading-none sm:text-7xl md:text-8xl"
            data-text="U R NOT HIM 💀"
          >
            U R NOT HIM 💀
          </h2>
          <p className="text-xl text-white/70">
            him-ness score{" "}
            <span className="font-display text-4xl font-extrabold text-pink">{result.himScore.toFixed(1)}%</span>
          </p>
          <p className="text-xl">
            closest celebrity match: <span className="font-bold text-sun">{result.celebrityMatch}</span>
          </p>
          <p className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-xl">
            {result.reason}
          </p>
          <BigButton type="button" disabled={appealing} onClick={() => void appeal()}>
            appeal the verdict
          </BigButton>
        </div>
      ) : null}
      <EndSession />
    </div>
  );
}
