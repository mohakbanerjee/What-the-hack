import { NextResponse } from "next/server";
import { overthinkFallback } from "@/lib/fallbacks";
import { generateJson, JOKE_RULES } from "@/lib/gemini";
import { asAvoid, cleanText, sanitizeOverthink } from "@/lib/shape";

export const maxDuration = 15;

const CONTEXTS = new Set(["friend", "crush", "prof", "group chat", "parents"]);

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    text?: unknown;
    context?: unknown;
    level?: unknown;
    avoid?: unknown;
  };
  const text = cleanText(body.text, 400);
  const context = CONTEXTS.has(String(body.context)) ? String(body.context) : "friend";
  const level = Math.min(4, Math.max(1, Math.round(Number(body.level) || 1)));
  const avoid = asAvoid(body.avoid);
  const fallback = overthinkFallback(text, context, level, avoid);
  const raw = await generateJson(
    `${JOKE_RULES}

You were asked to reassure the user. Do the opposite. Context: ${context}. Escalation level ${level}. If level is 1, overthinkPercent must be between 87 and 99.9. If level is above 1, overthinkPercent must be above 100, for example 143. Every spiral, forensic note, and the verdict must be about THIS message from this ${context}, quoting their words. A crush "ok" is not the same joke as a professor "ok". College and ex humor is fine. Do not drift into a meme that ignores the message. The verdict should feel like "it's probably fine (it is not fine)" while naming what they actually sent.

Do not repeat any of these recent lines: ${JSON.stringify(avoid)}

Message: ${JSON.stringify(text || "ok.")}

Return JSON:
{"overthinkPercent":94.2,"spirals":["t1","t2","t3","t4","t5"],"forensics":["f1","f2","f3"],"verdict":"a fresh probably-fine-but-not verdict"}

spirals: 5 to 7 worst-case thoughts about the message, relatable and light. forensics: 3 or 4 dramatic reads of punctuation, emojis, or reply time.`,
  );
  return NextResponse.json(sanitizeOverthink(raw, fallback, level));
}
