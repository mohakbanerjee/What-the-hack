"use client";

import { useEffect, useState } from "react";
import { useAura } from "@/components/AuraProvider";
import { ThinkingLoader } from "@/components/ThinkingLoader";
import { BigButton, DemoNote, EndSession, Panel, ToolHeader, fieldClass } from "@/components/ui";
import { postJson, runWithThink } from "@/lib/ai";
import { overthinkFallback, presentForensics, presentSpirals, presentVerdict } from "@/lib/fallbacks";
import { sanitizeOverthink } from "@/lib/shape";
import { seenLines } from "@/lib/shuffle";
import { burstConfetti, playBuzz, playDing } from "@/lib/sounds";

const CONTEXTS = ["friend", "crush", "prof", "group chat", "parents"] as const;
const EXAMPLES = ["they replied 'ok.'", "seen", "sure."];

function useCountUp(target: number) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / 1600);
      const eased = 1 - (1 - progress) ** 3;
      setValue(target * eased);
      if (progress < 1) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [target]);
  return value;
}

export function OverthinkTool() {
  const { demo, nudge, flash } = useAura();
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [context, setContext] = useState<(typeof CONTEXTS)[number]>("friend");
  const [loading, setLoading] = useState(false);
  const [level, setLevel] = useState(1);
  const [target, setTarget] = useState(0);
  const [spirals, setSpirals] = useState<string[]>([]);
  const [forensics, setForensics] = useState<string[]>([]);
  const [verdict, setVerdict] = useState("");
  const [shown, setShown] = useState(0);
  const [ready, setReady] = useState(false);
  const shownPercent = useCountUp(target);

  useEffect(() => {
    if (shown >= spirals.length) return;
    const id = window.setTimeout(() => setShown((count) => count + 1), 450);
    return () => window.clearTimeout(id);
  }, [shown, spirals.length]);

  async function ask(escalate = false) {
    const message = (escalate ? source : text).trim();
    if (!message) {
      flash("paste the message. you cannot overthink air. beta, there is nothing there.");
      playBuzz();
      return;
    }
    const nextLevel = escalate ? level + 1 : 1;
    setLoading(true);
    const avoid = [...seenLines("spirals"), ...seenLines("forensics"), ...seenLines("verdicts")];
    const fallback = overthinkFallback(message, context, nextLevel, avoid);
    const task = demo
      ? Promise.resolve(fallback)
      : postJson(
          "/api/overthink",
          { text: message, context, level: nextLevel, avoid },
          fallback,
          (data, fb) => sanitizeOverthink(data, fb, nextLevel),
        );
    const data = await runWithThink(demo, task);
    const spiralsNext = presentSpirals(data.spirals, message, context);
    const forensicsNext = presentForensics(data.forensics, message, context);
    const verdictNext = presentVerdict(data.verdict, message, context);
    if (!escalate) {
      setSpirals(spiralsNext);
      setForensics(forensicsNext);
      setShown(0);
      setTarget(data.overthinkPercent);
    } else {
      setSpirals((current) => {
        const extra = spiralsNext.filter((item) => !current.includes(item));
        return [...current, ...extra].slice(0, 12);
      });
      setForensics((current) => {
        const extra = forensicsNext.filter((item) => !current.includes(item));
        return [...current, ...extra].slice(0, 8);
      });
      setTarget((current) => Math.round(Math.max(current + 22, data.overthinkPercent, 101)));
    }
    setVerdict(verdictNext);
    if (!escalate) setSource(message);
    setLevel(nextLevel);
    setReady(true);
    setLoading(false);
    nudge();
  }

  function touchGrass() {
    void burstConfetti();
    playDing();
    nudge({ sound: false, suffix: " grass touched. the spiral is filing a complaint with the aunties." });
    setText("");
    setSource("");
    setReady(false);
    setSpirals([]);
    setForensics([]);
    setShown(0);
    setTarget(0);
    setVerdict("");
    setLevel(1);
  }

  const label = target >= 100 ? `${Math.round(shownPercent)}%` : `${shownPercent.toFixed(1)}%`;

  return (
    <div>
      <ToolHeader
        emoji="🌀"
        title="Overthink Meter"
        session="Overthinking"
        pitch="today's problem: someone replied like a person, and you have opened a full investigation."
      />
      <DemoNote demo={demo} />
      <Panel>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void ask(false);
          }}
        >
          <label className="block text-lg font-semibold" htmlFor="message">
            the message
          </label>
          <textarea
            id="message"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="they replied 'ok.'"
            maxLength={400}
            rows={4}
            className={fieldClass}
          />
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-sm"
                onClick={() => setText(example)}
              >
                {example}
              </button>
            ))}
          </div>
          <fieldset>
            <legend className="mb-2 text-lg font-semibold">context</legend>
            <div className="flex flex-wrap gap-2">
              {CONTEXTS.map((item) => (
                <label
                  key={item}
                  className={`cursor-pointer rounded-full px-4 py-2 text-base font-semibold ${
                    context === item ? "bg-grape text-white" : "bg-white/5 text-white/75"
                  }`}
                >
                  <input
                    className="sr-only"
                    type="radio"
                    name="context"
                    value={item}
                    checked={context === item}
                    onChange={() => setContext(item)}
                  />
                  {item}
                </label>
              ))}
            </div>
          </fieldset>
          <BigButton type="submit" disabled={loading}>
            Should I be worried? 🤔
          </BigButton>
        </form>
        <ThinkingLoader show={loading} />
      </Panel>

      {ready ? (
        <div className="mt-6 space-y-4">
          <Panel className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/50">overthink %</p>
            <p className="font-display text-7xl font-extrabold tabular-nums text-glow sm:text-8xl md:text-9xl">
              {label}
            </p>
          </Panel>

          <Panel>
            <h2 className="font-display text-2xl font-extrabold sm:text-3xl">spiral timeline</h2>
            <ol className="mt-4 space-y-4 border-l-2 border-grape/70 pl-4">
              {spirals.slice(0, shown).map((spiral, index) => (
                <li key={`${spiral}-${index}`} className="reply-pop">
                  <p className="text-sm font-bold text-grape">worst case {index + 1}</p>
                  <p className="text-lg sm:text-xl">{spiral}</p>
                </li>
              ))}
            </ol>
          </Panel>

          <Panel>
            <h2 className="font-display text-2xl font-extrabold sm:text-3xl">punctuation forensics</h2>
            <ul className="mt-4 space-y-3">
              {forensics.map((item, index) => (
                <li key={`${item}-${index}`} className="rounded-2xl bg-black/30 px-4 py-3 text-lg">
                  <span className="mr-2 font-bold text-neon">exhibit {index + 1}.</span>
                  {item}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel className="relative overflow-hidden">
            <div className="stamp">NOT FINE</div>
            <p className="pr-16 font-display text-2xl font-extrabold leading-tight sm:text-4xl">{verdict}</p>
          </Panel>

          <div className="flex flex-wrap gap-3">
            <BigButton type="button" disabled={loading} onClick={() => void ask(true)}>
              overthink it more
            </BigButton>
            <BigButton type="button" tone="sun" onClick={touchGrass}>
              touch grass
            </BigButton>
          </div>
        </div>
      ) : null}
      <EndSession />
    </div>
  );
}
