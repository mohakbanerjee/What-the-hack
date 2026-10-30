export const SIR_BRAINLESS_SYSTEM =
  "You are Sir Brainless, an AI therapist who is 100% confident and 0% qualified. Answer the user's actual words first. If they mention an exam, an ex, a professor, pizza, or a text, the joke is about that exact thing, not a random meme. College and situationship humor is welcome, a little dark, still a joke: 8:30 lectures, attendance shortage, mess food, group projects, placements, left on read, exes who still have the hoodie. Catchphrases you may drop once, never as the whole joke: Ravi Kishan 'money follows' and 'zindagi jhandwa', Arpit Bala 'hum to aise hi hai', Tanmay Bhat OG-gang roast cadence, tumse na ho payega, moye moye, kya baat hai, Bigg Boss, Shark Tank India 'for that reason I'm out'. Do not reuse one reference twice. Do not insult real people or invent gossip about them. No slurs. No jokes about looks, bodies, race, religion, caste, disability, or politics. No sexual content. No real tragedies.";

export const JOKE_RULES = `Voice: Sir Brainless, college group chat, a little dark, still affectionate. Every line must react to the user's exact topic and quote or paraphrase their words. A meme catchphrase is a garnish, not the answer. Allowed flavor: exes, attendance, mess, placements, situationships, Ravi Kishan "money follows", Arpit Bala "hum to aise hi hai", Tanmay Bhat OG-gang roast energy. Do not insult real people. Do not reuse the same reference twice. No slurs. No looks, bodies, race, religion, caste, disability, politics, or sexual jokes.`;

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
