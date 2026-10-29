let audio: AudioContext | null = null;

function context() {
  if (typeof window === "undefined") return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audio) audio = new Ctx();
  if (audio.state === "suspended") void audio.resume();
  return audio;
}

function tone(
  ctx: AudioContext,
  type: OscillatorType,
  freq: number,
  start: number,
  duration: number,
  peak: number,
  slideTo?: number,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export function playDing() {
  const ctx = context();
  if (!ctx) return;
  const now = ctx.currentTime;
  tone(ctx, "sine", 880, now, 0.18, 0.12);
  tone(ctx, "sine", 1320, now + 0.09, 0.22, 0.1);
}

export function playBuzz() {
  const ctx = context();
  if (!ctx) return;
  const now = ctx.currentTime;
  tone(ctx, "square", 140, now, 0.26, 0.07);
  tone(ctx, "square", 186, now + 0.03, 0.24, 0.05);
}

export function playVineBoom() {
  const ctx = context();
  if (!ctx) return;
  const now = ctx.currentTime;
  tone(ctx, "sine", 150, now, 0.48, 0.8, 36);

  const length = Math.floor(ctx.sampleRate * 0.36);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(240, now);
  filter.frequency.exponentialRampToValueAtTime(50, now + 0.3);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.5, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start(now);
  noise.stop(now + 0.36);
}

export async function burstConfetti() {
  const confetti = (await import("canvas-confetti")).default;
  const colors = ["#3dfff2", "#ff3dce", "#ffe14a", "#c084fc", "#ffffff"];
  await confetti({ particleCount: 110, spread: 78, origin: { y: 0.68 }, colors, disableForReducedMotion: true });
  await confetti({
    particleCount: 50,
    angle: 60,
    spread: 70,
    origin: { x: 0, y: 0.7 },
    colors,
    disableForReducedMotion: true,
  });
  await confetti({
    particleCount: 50,
    angle: 120,
    spread: 70,
    origin: { x: 1, y: 0.7 },
    colors,
    disableForReducedMotion: true,
  });
}
