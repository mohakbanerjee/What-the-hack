"use client";

import { useEffect, useRef, useState } from "react";
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [image, setImage] = useState<PreparedImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ToastResult | null>(null);
  const [sharing, setSharing] = useState(false);
  const [camOn, setCamOn] = useState(false);

  function stopCam() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCamOn(false);
  }

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

  async function startCam() {
    if (!navigator.mediaDevices?.getUserMedia) {
      flash("this browser will not open the webcam. upload from gallery instead.");
      playBuzz();
      return;
    }
    try {
      stopCam();
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }
      streamRef.current = stream;
      setCamOn(true);
    } catch {
      flash("camera said no. allow the webcam, or upload from gallery.");
      playBuzz();
    }
  }

  async function snap() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) {
      flash("the webcam is still waking up. give it a second.");
      playBuzz();
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
    stopCam();
    if (!blob) {
      showFallback(setReport);
      flash("the snap came out blank. here is a diagnosis anyway.");
      playDing();
      return;
    }
    await onFile(new File([blob], "toast-cam.jpg", { type: "image/jpeg" }));
  }

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
          <BigButton type="button" tone="sun" className="cam-on-desktop" onClick={() => void startCam()}>
            Take photo 📷
          </BigButton>
          <div className="cam-on-phone">
            <PhotoPick label="Take photo 📷" capture="environment" tone="sun" onFile={(file) => void onFile(file)} />
          </div>
          <PhotoPick label="Upload from gallery" onFile={(file) => void onFile(file)} />
        </div>
        <div className="relative mt-5 overflow-hidden rounded-3xl border border-white/10 bg-black/40">
          {camOn ? (
            <video ref={videoRef} autoPlay muted playsInline className="max-h-80 w-full bg-black object-contain" />
          ) : preview ? (
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
        <div className="mt-4 flex flex-wrap gap-3">
          {camOn ? (
            <>
              <BigButton type="button" tone="sun" onClick={() => void snap()}>
                Snap photo
              </BigButton>
              <BigButton type="button" tone="ghost" onClick={stopCam}>
                Close camera
              </BigButton>
            </>
          ) : null}
          <BigButton type="button" disabled={loading || camOn} onClick={() => void judge()}>
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
