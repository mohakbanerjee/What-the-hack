import { NextResponse } from "next/server";
import { ragebaitFallback } from "@/lib/fallbacks";
import { generateJson, JOKE_RULES } from "@/lib/gemini";
import { asAvoid, cleanText, sanitizeRage } from "@/lib/shape";

export const maxDuration = 15;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    text?: unknown;
    intensity?: unknown;
    avoid?: unknown;
  };
  const text = cleanText(body.text, 400);
  const intensity = Math.min(5, Math.max(1, Math.round(Number(body.intensity) || 1)));
  const avoid = asAvoid(body.avoid);
  const fallback = ragebaitFallback(text, intensity, avoid);
  const raw = await generateJson(
    `${JOKE_RULES}

Rewrite the user's mild opinion as a ragebait post that makes it worse. Intensity ${intensity} out of 5. Higher means sillier, still harmless. Quote their words. Use a fresh meme catchphrase, not a celebrity scandal. The five replies must each use a different reference.

Do not repeat any of these recent lines: ${JSON.stringify(avoid)}

User text: ${JSON.stringify(text || "having a normal opinion")}

Return JSON:
{"post":"the ragebait post","rageScore":86,"replies":["reply1","reply2","reply3","reply4","reply5"]}
rageScore is an integer from 55 to 100. exactly 5 short replies.`,
  );
  return NextResponse.json(sanitizeRage(raw, fallback));
}
