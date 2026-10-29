import { NextResponse } from "next/server";
import { notHimFallback } from "@/lib/fallbacks";
import { generateJson, JOKE_RULES } from "@/lib/gemini";
import { asAvoid, cleanText, sanitizeNotHim } from "@/lib/shape";

export const maxDuration = 15;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    name?: unknown;
    appeal?: unknown;
    avoid?: unknown;
  };
  const name = cleanText(body.name, 40);
  const appeal = body.appeal === true;
  const avoid = asAvoid(body.avoid);
  const fallback = notHimFallback(name, appeal, avoid);
  const raw = await generateJson(
    `${JOKE_RULES}

${
  appeal
    ? "The user is appealing a previous verdict that they are not him. Reject the appeal with a brand new reason that starts with 'appeal denied'."
    : "The user asked if they are him. Start the reason with 'detected:'."
} They are not him. Name: ${JSON.stringify(name || "anonymous")}. Roast habits, texting, or follow-through. celebrityMatch must be a meme archetype or catchphrase character, not an insult and not a claim about a real person's life. Never mention appearance, race, religion, caste, body, gender, or disability. Do not repeat any of these recent lines: ${JSON.stringify(avoid)}

Return JSON:
{"reason":"detected: replies 'haha' to everything","himScore":1.7,"celebrityMatch":"a loading screen with main character lighting"}

himScore: a number from 0.3 to 4.`,
  );
  return NextResponse.json(sanitizeNotHim(raw, fallback));
}
