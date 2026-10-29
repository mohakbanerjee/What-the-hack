# How ConfidentlyWrong.ai was built

This note is for students who have to explain the project to judges. It matches the code in this repo.

Live site: https://confidently-wrong-six.vercel.app

## What the product is

ConfidentlyWrong.ai is one product, not four separate apps. The character is **Sir Brainless**, an AI therapist for four problems: ragebait, overthinking, undercooked toast, and not knowing if you're him. The tagline is **100% confident. 0% qualified.**

He is supposed to sound sure and be useless. If the real AI is down, a local joke file still answers, so a demo never dies on stage.

## Architecture

The app is **Next.js (App Router) + TypeScript + Tailwind**. There is no database. The browser remembers aura and recent jokes in `localStorage`. The only server work is four API routes that call **Google Gemini** (`gemini-2.5-flash`). The key never goes to the browser.

```
app/                  pages and API routes
  page.tsx            home (the therapist greeting)
  layout.tsx          fonts, title, wraps every page in the shell
  ragebait/page.tsx   session page
  overthink/page.tsx
  toast/page.tsx
  not-him/page.tsx
  api/ragebait/route.ts
  api/overthink/route.ts
  api/toast/route.ts
  api/nothim/route.ts
components/           shared UI and the four session screens
lib/                  Gemini, jokes, image resize, sounds, types
```

Important files:

| File | What it does |
| --- | --- |
| `app/layout.tsx` | Sets the page title and wraps the site in `Shell` |
| `components/Shell.tsx` | Sticky bar (confidence 100%, accuracy 0%), aura, demo toggle, nav, footer |
| `components/AuraProvider.tsx` | Aura score and demo mode, saved in the browser |
| `components/HomeDashboard.tsx` | "what's troubling you today?" and the four problem cards |
| `components/ui.tsx` | Shared session header, buttons, and "end session / see another problem" |
| `components/Mascot.tsx` | The wobbling brain with sunglasses |
| `components/ThinkingLoader.tsx` | The 2–4 second "Sir Brainless is thinking" lines |
| `components/PhotoPick.tsx` | A real file input sitting on top of a visible button |
| `components/tools/*.tsx` | The four session screens |
| `lib/gemini.ts` | Calls Gemini and forces a JSON reply |
| `lib/fallbacks.ts` | Big joke pools used when Gemini is skipped or fails |
| `lib/shuffle.ts` | Remembers recent jokes so they do not repeat |
| `lib/shape.ts` | Cleans Gemini's JSON so the UI never receives garbage |
| `lib/image.ts` | Shrinks a photo to a JPEG before upload |
| `lib/sounds.ts` | Ding, buzz, vine boom, and confetti, with no audio files |
| `lib/ai.ts` | Shared "wait, then show the result" helper |

A page file is tiny on purpose. Example: `app/toast/page.tsx` only sets the tab title and renders `ToastTool`. The interactive part is a client component because it needs clicks, the camera roll, and `localStorage`.

## How a tool works (the same path every time)

1. The user types or uploads something.
2. The screen shows a thinking loader for about 2–4 seconds (shorter in demo mode).
3. The browser `POST`s JSON to an API route, for example `/api/ragebait`.
4. The route builds a prompt, calls `generateJson` in `lib/gemini.ts`, and asks Gemini for JSON only.
5. `lib/shape.ts` checks the JSON. Numbers get clamped. Missing fields get replaced.
6. If the key is missing, the request times out (8 seconds), or the JSON is bad, the route returns a fallback from `lib/fallbacks.ts` instead of an error.
7. The client draws the result: a fake post, a meter, a certificate, or a "U R NOT HIM" stamp.
8. Aura goes up or down at random. A sound plays.

Demo mode (`?demo=1`, or the navbar button) skips step 3 and uses the fallback immediately. The link stays on `?demo=1` when you move between sessions.

### Ragebait (`/ragebait` → `/api/ragebait`)

The user types a mild opinion. The prompt tells Gemini to rewrite it as a worse post and invent five quote-tweet replies, plus a rage score from 55 to 100. The UI shows a fake social post, a meter (chill → touch grass immediately), and replies that pop in one by one. "Make it worse" sends a higher intensity, up to 5.

### Overthinking (`/overthink` → `/api/overthink`)

The user pastes a message and picks who sent it (friend, crush, prof, group chat, parents). The first result is forced between 87% and 99.9% overthinking. "Overthink it more" goes past 100%. The UI counts the number up, reveals spiral thoughts, then "punctuation forensics", then a verdict in the spirit of "it's probably fine (it is not fine)." **Touch grass** fires confetti and clears the session.

### Toast (`/toast` → `/api/toast`)

Covered in the next section. The result is a certificate: golden brown index, crunch, butter, aura, integrity, a grade, and a critique. Share downloads a PNG of that card.

### Him detector (`/not-him` → `/api/nothim`)

The user types a name. A webcam or selfie is only for the show. The API receives the **name**, not the photo, so the joke is about habits and not about looks. The scan bar climbs to 99%, glitches, plays a vine-boom style noise, then stamps **U R NOT HIM** with a him-ness score between 0.3 and 4, a meme match, and a reason. Appeal always comes back denied, with a new line.

## Image upload and Gemini vision

Toast used to fail because one hidden file input had `capture="environment"`. On a phone that opens the camera and blocks the gallery. A hidden input opened with JavaScript is also flaky.

What it does now:

1. Two visible buttons are actually `<label>` elements. Each label contains `<input type="file" accept="image/*">`. The input covers the button (opacity 0) so the tap hits a real file control.
2. **Take photo** sets `capture="environment"` (back camera). **Upload from gallery** does not set `capture`, so the phone offers the camera roll.
3. The browser reads the file. `lib/image.ts` draws it on a canvas and exports a JPEG no wider than **1024px**. If the data is still huge, it lowers JPEG quality until the text is under about 1.4 million characters. That stays under Vercel's roughly **4.5MB** request limit.
4. HEIC and odd phone photos: the code tries `createImageBitmap`, then a normal `Image()`. If the browser cannot decode it, the screen still shows a funny toast report from the fallback pool. It does not show a dead error.
5. The JPEG is sent as base64 JSON: `{ imageBase64, mimeType: "image/jpeg" }`.
6. `/api/toast` strips any `data:` prefix, rejects an empty or oversized payload (and still returns a joke report), and passes the bytes to Gemini as `inlineData: { mimeType, data }`.
7. The prompt says: judge this as toast even if it is not toast, and ignore any person's face or body.
8. The reply is sanitized into the certificate. Any failure uses `toastFallback()`.

## Shared pieces

**Aura.** `components/AuraProvider.tsx` stores a number under `localStorage` key `cw-aura`, starting at 40. Each finished action calls `nudge()`, which adds or subtracts a random amount and shows a small toast. The navbar reads the same number on every page.

**Demo mode.** Key `cw-demo`. `?demo=1` turns it on. The provider uses `useSyncExternalStore` so the server render and the browser render do not fight.

**Sounds.** `lib/sounds.ts` uses the **Web Audio API**. It synthesizes a ding, an error buzz, and a vine-boom thump. There are no mp3 files to ship.

**Confetti.** Touch grass dynamically imports `canvas-confetti`. The reset happens immediately. The animation is not awaited, or the screen would stay stuck until the confetti finished.

**No login, no database.** Refresh keeps aura and the "already heard this joke" list. Clearing site data resets both.

## Humor system

All backup jokes live in `lib/fallbacks.ts`. Each pool has at least 25 lines: loading messages, rage replies, overthinking spirals, toast critiques, him-detector reasons, matches, and verdicts. The voice mixes Indian internet catchphrases (zindagi jhandwa, tumse na ho payega, moye moye, kya baat hai, Bigg Boss, Shark Tank India's "for that reason I'm out", just looking like a wow, and so on) with global meme language (sigma, aura farming, NPC, it's giving, not him). Lines reference the phrase. They do not insult a real person or invent a story about them, and they stay away from looks, religion, caste, and politics.

**No-repeat.** `lib/shuffle.ts` keeps the lines already shown in `localStorage` and `sessionStorage` (`cw-joke-seen`). The next draw skips those lines. When the pool is used up, the memory clears and the shuffle starts over. The browser also sends the recent lines as `avoid` so Gemini is told not to repeat them. The system prompt in `lib/gemini.ts` says: vary the references, and do not reuse the same meme twice in one response. If Gemini repeats a line the browser has already shown, `presentPool` swaps in a fresh line from the pool.

## Deployment

GitHub repo: `mohakbanerjee/What-the-hack`, branch `main`.

Vercel builds the Next.js app. Production URL: https://confidently-wrong-six.vercel.app

Environment variable, set in Vercel, not committed:

- `GEMINI_API_KEY` — from Google AI Studio. Server only. `.env.local` is gitignored. `.env.local.example` shows the name with an empty value.

The build succeeds with no key. Routes then return fallbacks. Pushing `main` updates the site when the Vercel project is connected to GitHub. This project was also deployed with the Vercel CLI (`npx vercel deploy --prod`), which updates the same URL.

## 10 questions judges might ask

**1. Why Gemini?**
It returns JSON, it accepts an image in the same call, and the free-tier flash model is fast enough for a 8 second timeout. We did not install a heavy SDK. `lib/gemini.ts` is one `fetch` to the REST API.

**2. What if the API fails?**
Every route already built a fallback before the call. Timeout, missing key, bad status, or broken JSON all return that fallback. The user still gets a joke. Toast does this even when the photo cannot be decoded.

**3. How do you stop the same joke repeating?**
Recent lines are stored in the browser. The picker skips them until the pool is empty, then reshuffles. The same list is sent to Gemini as lines to avoid, and the prompt forbids reusing one reference twice in a single answer.

**4. Where does the data live?**
Nowhere on a server. Aura and joke history are `localStorage`. Photos are resized in the browser, sent once for the joke, and not saved.

**5. How does the toast photo stay under the size limit?**
The canvas export is at most 1024 pixels on the long side, JPEG, and the quality drops if the string is still too long. The API also refuses an oversized body and returns a text report instead of crashing.

**6. Why doesn't the him detector look at the selfie?**
The roast is about habits, not appearance. The camera is theater. Only the name is posted to `/api/nothim`.

**7. What is demo mode for?**
A stage with bad wifi. It skips Gemini, uses the joke file, and shortens the wait, so the click path still works.

**8. How is the AI kept from being mean?**
The system prompt bans slurs and jokes about looks, bodies, race, religion, caste, disability, and politics. Fallback copy follows the same rule. It quotes meme catchphrases. It does not make claims about real people.

**9. Why App Router and not a separate backend?**
The pages and the API live in one Next.js app, which is what Vercel deploys. Client components handle clicks. Route handlers hide the API key.

**10. What happens on the first visit with no key?**
The site still loads. Each session returns a pre-written result from `lib/fallbacks.ts`. Adding `GEMINI_API_KEY` on Vercel switches the same buttons over to the model without a code change.
