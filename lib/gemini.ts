export const SIR_BRAINLESS_SYSTEM =
  "You are Sir Brainless, an AI therapist who is 100% confident and 0% qualified. You are funny, affectionate, and confidently wrong. Sound like a group chat that grew up on Indian Instagram and global memes. Use catchphrases and viral moments as jokes, never as insults or factual claims about real people. Mix references such as zindagi jhandwa, Rakhi Sawant drama energy, Samay Raina / India's Got Latent style roasting, Arpit Bala, tumse na ho payega, moye moye, kya baat hai, Bigg Boss style drama, Shark Tank India 'for that reason I'm out', just looking like a wow, so beautiful so elegant, bhupendra jogi, plus sigma, aura farming, NPC, it's giving, and not him. Vary the references every time. Do not reuse the same meme, catchphrase, or person twice in one response. Keep it light. No slurs. No jokes about looks, bodies, race, religion, caste, disability, or politics. No sexual content. No real tragedies.";

export const JOKE_RULES = `Voice: one therapist, Sir Brainless. Light, affectionate meme humor. English sentences with short roman-Hindi catchphrases. Reference viral phrases, not gossip. Do not insult real people or claim they did something. Do not reuse the same meme, catchphrase, or person twice in this response. No slurs. No looks, bodies, race, religion, caste, disability, politics, or sexual jokes.`;

export type ImagePart = {
  mimeType: string;
  data: string;
};

function extractText(data: unknown): string {
  if (!data || typeof data !== "object") return "";
  const candidates = (data as { candidates?: unknown }).candidates;
  if (!Array.isArray(candidates) || !candidates[0] || typeof candidates[0] !== "object") return "";
  const content = (candidates[0] as { content?: { parts?: unknown } }).content;
  if (!content || !Array.isArray(content.parts)) return "";
  return content.parts
    .map((part) => {
      if (!part || typeof part !== "object" || !("text" in part)) return "";
      return typeof part.text === "string" ? part.text : "";
    })
    .join("");
}

export function parseJsonLoose(text: string): unknown | null {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start < 0 || end <= start) return null;
    try {
      return JSON.parse(trimmed.slice(start, end + 1)) as unknown;
    } catch {
      return null;
    }
  }
}

export async function generateJson(prompt: string, image?: ImagePart): Promise<unknown | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  const parts: Array<Record<string, unknown>> = [];
  if (image?.data) {
    parts.push({
      inlineData: {
        mimeType: image.mimeType || "image/jpeg",
        data: image.data,
      },
    });
  }
  parts.push({ text: prompt });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SIR_BRAINLESS_SYSTEM }] },
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 1.15,
          },
          contents: [{ role: "user", parts }],
        }),
      },
    );
    if (!response.ok) return null;
    const payload: unknown = await response.json();
    const text = extractText(payload);
    if (!text) return null;
    return parseJsonLoose(text);
  } catch {
    return null;
  }
}
