import { NextResponse } from "next/server";
import { toastFallback } from "@/lib/fallbacks";
import { generateJson, JOKE_RULES, type ImagePart } from "@/lib/gemini";
import { asAvoid, sanitizeToast } from "@/lib/shape";

export const maxDuration = 15;

const MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function stripBase64(input: string) {
  const value = input.trim();
  const comma = value.indexOf(",");
  const raw = value.startsWith("data:") && comma >= 0 ? value.slice(comma + 1) : value;
  return raw.replace(/\s/g, "");
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    imageBase64?: unknown;
    mimeType?: unknown;
    avoid?: unknown;
  };
  const avoid = asAvoid(body.avoid);
  const fallback = toastFallback(avoid);
  const data = typeof body.imageBase64 === "string" ? stripBase64(body.imageBase64) : "";
  if (!data || data.length > 1_800_000) {
    return NextResponse.json(fallback);
  }
  const mimeType = MIME.has(String(body.mimeType)) ? String(body.mimeType) : "image/jpeg";
  const image: ImagePart = { mimeType, data };
  const raw = await generateJson(
    `${JOKE_RULES}

A photo is attached. First identify what is actually in the frame (bread, pizza, a ceiling, a shoe, a screenshot). identifiedAs must name that thing. The critique must joke about the colors, shape, and object you can see, as if that object applied to be toast. If it is not bread, say what it really is and roast that. If a person is in frame, ignore their face and body and talk about the object. Do not return a generic bread joke that would fit any photo. Do not repeat any of these recent lines: ${JSON.stringify(avoid)}

Return JSON:
{"goldenBrownIndex":72,"crunch":"short label","butter":"short label","aura":"short label","integrity":"short label","grade":"emotionally golden","identifiedAs":"what you claim it is","critique":"two or three light sentences"}

goldenBrownIndex is an integer from 0 to 100.`,
    image,
  );
  return NextResponse.json(sanitizeToast(raw, fallback));
}
