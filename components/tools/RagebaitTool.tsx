"use client";

import { useEffect, useState } from "react";
import { useAura } from "@/components/AuraProvider";
import { ThinkingLoader } from "@/components/ThinkingLoader";
import { BigButton, DemoNote, EndSession, Panel, ToolHeader, fieldClass } from "@/components/ui";
import { postJson, runWithThink } from "@/lib/ai";
import { presentRageReplies, rageZone, ragebaitFallback, RAGE_ZONES } from "@/lib/fallbacks";
import { pick } from "@/lib/random";
import { sanitizeRage } from "@/lib/shape";
import { seenLines } from "@/lib/shuffle";
import { playBuzz, playDing } from "@/lib/sounds";
import type { RagebaitResult } from "@/lib/types";

const EXAMPLES = ["I like pineapple on pizza", "I wake up at 7am", "tabs are better than spaces"];
const HANDLES = ["@unwell", "@brunchcrimes", "@certifiedmid", "@sirbrainless", "@ratiofarmer"];
const REPLY_HANDLES = ["@whoasked", "@economist", "@touchgrass", "@librarian", "@barista", "@council", "@notesapp"];
const AVATARS = ["😤", "🤯", "🙄", "🫠", "🤨"];

export function RagebaitTool() {
  const { demo, nudge, flash } = useAura();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [intensity, setIntensity] = useState(1);
  const [result, setResult] = useState<RagebaitResult | null>(null);
  const [replies, setReplies] = useState<string[]>([]);
  const [visible, setVisible] = useState(0);
  const [meter, setMeter] = useState(0);
  const [session, setSession] = useState(0);
  const [handle, setHandle] = useState("@sirbrainless");
  const [avatar, setAvatar] = useState("😤");
  const [likes, setLikes] = useState(0);
  const [reposts, setReposts] = useState(0);

  useEffect(() => {
    if (visible >= replies.length) return;
    const id = window.setTimeout(() => setVisible((count) => count + 1), 650);
    return () => window.clearTimeout(id);
  }, [replies, visible]);

  useEffect(() => {
    if (!session) return;
    const id = window.setInterval(() => {
      setLikes((count) => Math.min(count + 20 + Math.floor(Math.random() * 120), 9_999_999));
      setReposts((count) => Math.min(count + 3 + Math.floor(Math.random() * 28), 999_999));
    }, 160);
    return () => window.clearInterval(id);
  }, [session]);

  async function calm(escalate = false) {
    const source = escalate ? result?.post ?? text : text;
    if (!source.trim()) {
      flash("type something mild. the group chat cannot ragebait air.");
      playBuzz();
      return;
    }
    const nextIntensity = escalate ? Math.min(5, intensity + 1) : 1;
    setLoading(true);
    const avoid = seenLines("rage-replies");
    const fallback = ragebaitFallback(source, nextIntensity, avoid);
    const task = demo
      ? Promise.resolve(fallback)
      : postJson(
          "/api/ragebait",
          { text: source, intensity: nextIntensity, avoid },
          fallback,
          sanitizeRage,
        );
    const data = await runWithThink(demo, task);
    const replies = presentRageReplies(data.replies, source.trim() || "having a normal opinion");
    const previous = escalate ? meter : 0;
    const score = Math.min(100, Math.max(data.rageScore, previous + (escalate ? 8 : 0)));
    if (!escalate) {
      setLikes(24 + Math.floor(Math.random() * 90));
      setReposts(4 + Math.floor(Math.random() * 12));
      setSession((value) => value + 1);
      setHandle(pick(HANDLES));
      setAvatar(pick(AVATARS));
      setReplies(replies);
      setVisible(0);
      setMeter(0);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setMeter(score));
      });
    } else {
      setReplies((current) => {
        const extra = replies.filter((reply) => !current.includes(reply));
        return [...current, ...extra].slice(0, 12);
      });
      setMeter(score);
    }
    setResult({ ...data, replies, rageScore: score });
    setIntensity(nextIntensity);
    setLoading(false);
    nudge();
  }

  async function copyPost() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.post);
      flash("copied. the family group chat is about to have notes.");
      playDing();
    } catch {
      flash("copy failed. the post is too powerful for this browser.");
      playBuzz();
    }
  }

  return (
    <div>
      <ToolHeader
        emoji="🔥"
        title="Ragebait Engine"
        session="Ragebait"
        pitch="today's problem: you said something normal and now you want the timeline to lose its mind."
      />
      <DemoNote demo={demo} />
      <Panel>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void calm(false);
          }}
          className="space-y-4"
        >
          <label className="block text-lg font-semibold" htmlFor="opinion">
            mild opinion or situation
          </label>
          <textarea
            id="opinion"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="I like pineapple on pizza"
            maxLength={400}
            rows={4}
            className={fieldClass}
          />
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setText(example)}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/80"
              >
                {example}
              </button>
            ))}
          </div>
          <BigButton type="submit" disabled={loading}>
            Calm this down 🧘
          </BigButton>
        </form>
        <ThinkingLoader show={loading} />
      </Panel>

      {result ? (
        <div className="mt-6 space-y-4">
          <Panel>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-pink">rage meter</p>
              <p className="font-display text-3xl font-extrabold tabular-nums">{Math.round(meter)}</p>
            </div>
            <div
              className="h-5 overflow-hidden rounded-full bg-white/10"
              role="meter"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(meter)}
              aria-label="rage meter"
            >
              <div className="meter-fill" style={{ width: `${meter}%` }} />
            </div>
            <p className="mt-3 font-display text-2xl font-extrabold text-sun sm:text-3xl">{rageZone(meter)}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {RAGE_ZONES.map((zone) => (
                <span
                  key={zone.label}
                  className={`rounded-full px-2 py-1 text-xs sm:text-sm ${
                    rageZone(meter) === zone.label ? "bg-pink text-white" : "bg-white/5 text-white/50"
                  }`}
                >
                  {zone.label}
                </span>
              ))}
            </div>
          </Panel>

          <article className="rounded-3xl border border-white/10 bg-[#101018] p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-pink to-grape text-3xl">
                {avatar}
              </div>
              <div>
                <p className="text-lg font-bold">
                  Definitely Normal <span className="text-neon">✓</span>
                </p>
                <p className="text-white/50">
                  {handle} · just now · edited with malice
                </p>
              </div>
            </div>
            <p className="mt-4 break-words text-xl leading-relaxed sm:text-2xl">{result.post}</p>
            <div className="mt-4 flex gap-5 text-lg font-bold text-white/80">
              <span>♥ {likes.toLocaleString()} likes</span>
              <span>↻ {reposts.toLocaleString()} reposts</span>
            </div>
            {meter >= 80 ? (
              <p className="mt-3 text-pink">this post has already ruined three brunches.</p>
            ) : null}
          </article>

          <div className="flex flex-wrap gap-3">
            <BigButton type="button" disabled={loading || meter >= 100} onClick={() => void calm(true)}>
              make it worse 🔥
            </BigButton>
            <BigButton type="button" tone="ghost" onClick={() => void copyPost()}>
              copy
            </BigButton>
          </div>

          <ul className="space-y-3">
            {replies.slice(0, visible).map((reply, index) => (
              <li key={`${reply}-${index}`} className="reply-pop rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-sm font-bold text-pink">{REPLY_HANDLES[index % REPLY_HANDLES.length]}</p>
                <p className="text-lg">{reply}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <EndSession />
    </div>
  );
}
