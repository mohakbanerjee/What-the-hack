import { pickN } from "@/lib/random";

const STORAGE_KEY = "cw-joke-seen";

type SeenMap = Record<string, string[]>;

function readMap(): SeenMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) || window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const map: SeenMap = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (Array.isArray(value)) {
        map[key] = value.filter((item): item is string => typeof item === "string");
      }
    }
    return map;
  } catch {
    return {};
  }
}

function writeMap(map: SeenMap) {
  if (typeof window === "undefined") return;
  try {
    const raw = JSON.stringify(map);
    window.localStorage.setItem(STORAGE_KEY, raw);
    window.sessionStorage.setItem(STORAGE_KEY, raw);
  } catch {
    /* private mode still returns jokes, it just cannot remember them */
  }
}

export function seenLines(poolId: string): string[] {
  return readMap()[poolId] ?? [];
}

export function noteShown(poolId: string, lines: readonly string[]) {
  const map = readMap();
  const current = map[poolId] ?? [];
  const next = [...current];
  for (const line of lines) {
    if (line && !next.includes(line)) next.push(line);
  }
  map[poolId] = next.slice(-250);
  writeMap(map);
}

export function drawFresh(
  poolId: string,
  pool: readonly string[],
  count: number,
  extraAvoid: readonly string[] = [],
): string[] {
  const remembered = seenLines(poolId);
  const blocked = new Set([...remembered, ...extraAvoid]);
  let open = pool.filter((line) => !blocked.has(line));
  let baseMemory = remembered;
  if (open.length < count) {
    baseMemory = [];
    open = pool.filter((line) => !extraAvoid.includes(line));
    if (open.length < count) open = [...pool];
  }
  const picked = pickN(open, Math.min(count, open.length));
  const map = readMap();
  map[poolId] = [...baseMemory.filter((line) => !picked.includes(line)), ...picked].slice(-250);
  writeMap(map);
  return picked;
}

export function presentPool(poolId: string, pool: readonly string[], incoming: readonly string[]): string[] {
  let memory = seenLines(poolId);
  if (memory.length >= pool.length) memory = [];
  const used = new Set(memory);
  const shown = incoming.map((line) => {
    if (!used.has(line)) {
      used.add(line);
      return line;
    }
    const alt = pool.find((item) => !used.has(item));
    if (!alt) return line;
    used.add(alt);
    return alt;
  });
  const map = readMap();
  map[poolId] = [...memory.filter((line) => !shown.includes(line)), ...shown].slice(-250);
  writeMap(map);
  return shown;
}
