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

Rewrite the user's exact opinion as a ragebait post. Intensity ${intensity} out of 5. The post and every reply must argue with what they actually said. Quote their words. If they said something about food, college, an ex, or a habit, stay on that subject. Do not reply with a generic meme that would fit any post. One catchphrase per reply, each different.

Do not repeat any of these recent lines: ${JSON.stringify(avoid)}

User text: ${JSON.stringify(text || "having a normal opinion")}

Return JSON:
{"post":"the ragebait post","rageScore":86,"replies":["reply1","reply2","reply3","reply4","reply5"]}
rageScore is an integer from 55 to 100. exactly 5 short replies.`,
  );
  return NextResponse.json(sanitizeRage(raw, fallback));
}
