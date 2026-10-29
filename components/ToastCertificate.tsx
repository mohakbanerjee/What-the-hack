"use client";

import { forwardRef, type CSSProperties } from "react";
import type { ToastResult } from "@/lib/types";

const card: CSSProperties = {
  width: "100%",
  maxWidth: 680,
  margin: "0 auto",
  boxSizing: "border-box",
  padding: 28,
  borderRadius: 28,
  background: "#1a0d24",
  color: "#fff8ea",
  border: "2px solid #ffe14a",
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
};

const row: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  padding: "10px 0",
  borderBottom: "1px solid rgba(255,255,255,0.12)",
  fontSize: 18,
};

export const ToastCertificate = forwardRef<
  HTMLDivElement,
  { report: ToastResult; preview?: string | null }
>(function ToastCertificate({ report, preview }, ref) {
  return (
    <div ref={ref} style={card}>
      <p style={{ letterSpacing: "0.18em", fontSize: 12, color: "#ffe14a", margin: 0 }}>
        DEPARTMENT OF QUESTIONABLE CRUNCH
      </p>
      <h2 style={{ fontSize: 34, lineHeight: 1, margin: "10px 0 6px" }}>OFFICIAL TOAST CERTIFICATE</h2>
      <p style={{ margin: "0 0 16px", color: "#ffe14a", fontSize: 18 }}>
        specimen identified as: {report.identifiedAs}
      </p>
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="The alleged toast"
          style={{ width: 140, height: 140, objectFit: "cover", borderRadius: 16, marginBottom: 16 }}
        />
      ) : null}
      <p style={{ margin: "0 0 8px", fontSize: 16 }}>Golden Brown Index</p>
      <p style={{ margin: "0 0 8px", fontSize: 28, fontWeight: 800 }}>{report.goldenBrownIndex} / 100</p>
      <div
        style={{
          position: "relative",
          height: 18,
          borderRadius: 999,
          background: "linear-gradient(90deg, #f6e7c1, #e0a15a, #8a4b22, #1a120c)",
          marginBottom: 18,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -4,
            left: `calc(${report.goldenBrownIndex}% - 7px)`,
            width: 14,
            height: 26,
            borderRadius: 4,
            background: "#ffffff",
            border: "2px solid #14081c",
          }}
        />
      </div>
      {(
        [
          ["Crunch Level", report.crunch],
          ["Butter Distribution", report.butter],
          ["Toast Aura", report.aura],
          ["Structural Integrity", report.integrity],
        ] as const
      ).map(([label, value]) => (
        <div key={label} style={row}>
          <span>{label}</span>
          <strong style={{ textAlign: "right" }}>{value}</strong>
        </div>
      ))}
      <p style={{ fontSize: 64, fontWeight: 800, margin: "18px 0 8px", lineHeight: 1 }}>{report.grade}</p>
      <p style={{ fontSize: 18, lineHeight: 1.45, margin: "0 0 18px" }}>{report.critique}</p>
      <p style={{ margin: 0, color: "#3dfff2", fontSize: 14 }}>
        signed, sir brainless, who has never eaten toast · confidence 100%
      </p>
    </div>
  );
});
