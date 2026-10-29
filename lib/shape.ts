import type {
  NotHimResult,
  OverthinkResult,
  RagebaitResult,
  ToastResult,
} from "@/lib/types";
import { clamp, round1 } from "@/lib/random";

export function asAvoid(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.length < 400).slice(0, 60);
}

export function cleanText(input: unknown, max: number) {
  return String(input ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown, fallback: string, max = 600) {
  if (typeof value !== "string") return fallback;
  const trimmed = value.replace(/\s+/g, " ").trim();
  return trimmed ? trimmed.slice(0, max) : fallback;
}

function asNumber(value: unknown, fallback: number, min: number, max: number) {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  if (!Number.isFinite(n)) return fallback;
  return clamp(n, min, max);
}

function asStringList(value: unknown, fallback: string[], min: number, max: number) {
  if (!Array.isArray(value)) return fallback.slice(0, max);
  const list = value
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .map((item) => item.replace(/\s+/g, " ").trim().slice(0, 220));
  if (list.length < min) return fallback.slice(0, max);
  return list.slice(0, max);
}

export function sanitizeRage(data: unknown, fallback: RagebaitResult): RagebaitResult {
  const record = asRecord(data);
  if (!record) return fallback;
  const replies = asStringList(record.replies, fallback.replies, 3, 5);
  const padded = [...replies];
  let i = 0;
  while (padded.length < 5) {
    padded.push(fallback.replies[i % fallback.replies.length] ?? "who asked");
    i += 1;
  }
  return {
    post: asString(record.post, fallback.post, 420),
    rageScore: Math.round(asNumber(record.rageScore, fallback.rageScore, 1, 100)),
    replies: padded.slice(0, 5),
  };
}

export function sanitizeOverthink(
  data: unknown,
  fallback: OverthinkResult,
  level: number,
): OverthinkResult {
  const record = asRecord(data);
  if (!record) return fallback;
  let percent = asNumber(record.overthinkPercent, fallback.overthinkPercent, 0, 250);
  percent = level <= 1 ? clamp(percent, 87, 99.9) : clamp(percent, 101, 180);
  percent = level <= 1 ? round1(percent) : Math.round(percent);
  const spirals = asStringList(record.spirals, fallback.spirals, 5, 7);
  const forensics = asStringList(record.forensics, fallback.forensics, 3, 4);
  return {
    overthinkPercent: percent,
    spirals,
    forensics,
    verdict: asString(record.verdict, fallback.verdict, 240),
  };
}

export function sanitizeToast(data: unknown, fallback: ToastResult): ToastResult {
  const record = asRecord(data);
  if (!record) return fallback;
  return {
    goldenBrownIndex: Math.round(
      asNumber(record.goldenBrownIndex, fallback.goldenBrownIndex, 0, 100),
    ),
    crunch: asString(record.crunch, fallback.crunch, 80),
    butter: asString(record.butter, fallback.butter, 80),
    aura: asString(record.aura, fallback.aura, 80),
    integrity: asString(record.integrity, fallback.integrity, 80),
    grade: asString(record.grade, fallback.grade, 40),
    identifiedAs: asString(record.identifiedAs, fallback.identifiedAs, 80),
    critique: asString(record.critique, fallback.critique, 700),
  };
}

export function sanitizeNotHim(data: unknown, fallback: NotHimResult): NotHimResult {
  const record = asRecord(data);
  if (!record) return fallback;
  const score = round1(asNumber(record.himScore, fallback.himScore, 0.3, 4));
  return {
    reason: asString(record.reason, fallback.reason, 180),
    himScore: score,
    celebrityMatch: asString(record.celebrityMatch, fallback.celebrityMatch, 80),
  };
}
