"use client";

import { useRef, useState } from "react";
import { useAura } from "@/components/AuraProvider";
import { PhotoPick } from "@/components/PhotoPick";
import { ThinkingLoader } from "@/components/ThinkingLoader";
import { ToastCertificate } from "@/components/ToastCertificate";
import { BigButton, DemoNote, EndSession, Panel, ToolHeader } from "@/components/ui";
import { postJson, runWithThink } from "@/lib/ai";
import { downloadNodePng } from "@/lib/certificate";
import { TOAST_STEPS, presentToast, toastFallback } from "@/lib/fallbacks";
import { fileToJpeg, looksLikeImage, type PreparedImage } from "@/lib/image";
import { sanitizeToast } from "@/lib/shape";
import { seenLines } from "@/lib/shuffle";
import { playBuzz, playDing } from "@/lib/sounds";
import type { ToastResult } from "@/lib/types";

function showFallback(setReport: (report: ToastResult) => void) {
  setReport(toastFallback(seenLines("toast-critiques")));
}

export function ToastTool() {
  const { demo, nudge, flash } = useAura();
  const certRef = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [image, setImage] = useState<PreparedImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ToastResult | null>(null);
  const [sharing, setSharing] = useState(false);

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (!looksLikeImage(file)) {
      setPreview(null);
      setImage(null);
      showFallback(setReport);
      flash("that file had no crumbs. sir brainless graded the idea of toast.");
      playDing();
      return;
    }
    try {
      const prepared = await fileToJpeg(file);
      setPreview(prepared.dataUrl);
      setImage(prepared);
      setReport(null);
    } catch {
      setPreview(null);
      setImage(null);
      showFallback(setReport);
      flash("the photo would not sit still. here is a diagnosis anyway.");
      playDing();
    }
  }

  async function judge() {
    if (!image) {
      showFallback(setReport);
      flash("no photo, no problem. the bread was imaginary and still undercooked.");
      playDing();
      return;
    }
    setLoading(true);
    const avoid = seenLines("toast-critiques");
    const fallback = toastFallback(avoid);
    const task = demo
      ? Promise.resolve(fallback)
      : postJson(
          "/api/toast",
          { imageBase64: image.base64, mimeType: image.mimeType, avoid },
          fallback,
          sanitizeToast,
        );
    const data = await runWithThink(demo, task);
    const varied = demo ? null : presentToast(data.critique, data.grade);
    setReport(varied ? { ...data, ...varied } : data);
    setLoading(false);
    nudge();
    playDing();
  }

  async function share() {
    if (!certRef.current) return;
    setSharing(true);
    try {
      await downloadNodePng(certRef.current, "toast-certificate.png");
      flash("certificate downloaded. hang it up. the aunties will still talk.");
      playDing();
    } catch {
      flash("the certificate refused to be perceived. try again.");
      playBuzz();
    } finally {
      setSharing(false);
    }
  }

  return (
    <div>
      <ToolHeader
        emoji="🍞"
        title="Check My Toast"
        session="Undercooked toast"
        pitch="today's problem: the bread is not golden and you need a professional opinion from someone unqualified."
      />
      <DemoNote demo={demo} />
      <Panel>
        <div className="flex flex-wrap gap-3">
          <PhotoPick label="Take photo 📷" capture="environment" tone="sun" onFile={(file) => void onFile(file)} />
          <PhotoPick label="Upload from gallery" onFile={(file) => void onFile(file)} />
        </div>
        <div className="relative mt-5 overflow-hidden rounded-3xl border border-white/10 bg-black/40">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Toast preview" className="max-h-80 w-full object-contain" />
          ) : (
            <div className="grid min-h-48 place-items-center text-center text-lg text-white/50">
              no specimen yet. bread, cardboard, and ceilings all welcome.
            </div>
          )}
          {loading ? (
            <div className="absolute inset-0">
              <div className="grid-overlay" />
              <div className="laser" />
              <div className="absolute inset-x-0 bottom-3 text-center text-lg font-bold text-neon">
                analyzing crunch molecules...
              </div>
            </div>
          ) : null}
        </div>
        <div className="mt-4">
          <BigButton type="button" disabled={loading} onClick={() => void judge()}>
            Judge my toast 🍞
          </BigButton>
        </div>
        <ThinkingLoader show={loading} steps={TOAST_STEPS} poolId="toast-loading" />
      </Panel>

      {report ? (
        <div className="mt-6 space-y-4">
          <ToastCertificate ref={certRef} report={report} preview={preview} />
          <BigButton type="button" tone="ghost" disabled={sharing} onClick={() => void share()}>
            share certificate
          </BigButton>
        </div>
      ) : null}
      <EndSession />
    </div>
  );
}
