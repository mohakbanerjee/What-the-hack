export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function thinkDelay(demo: boolean) {
  return demo ? 650 + Math.random() * 400 : 2000 + Math.random() * 2000;
}

export async function postJson<T>(
  url: string,
  body: unknown,
  fallback: T,
  accept: (data: unknown, fallback: T) => T,
): Promise<T> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) return fallback;
    const data: unknown = await response.json();
    return accept(data, fallback);
  } catch {
    return fallback;
  }
}

export async function runWithThink<T>(demo: boolean, task: Promise<T>): Promise<T> {
  const [result] = await Promise.all([task, sleep(thinkDelay(demo))]);
  return result;
}
