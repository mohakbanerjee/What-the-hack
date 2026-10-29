# ConfidentlyWrong.ai

Sir Brainless, the AI therapist for life's 4 biggest problems: ragebait, overthinking, undercooked toast, and not knowing if you're him.

**100% confident. 0% qualified.**

Live site: [https://confidently-wrong-six.vercel.app](https://confidently-wrong-six.vercel.app)

A hackathon app for the track **Artificial Super Unintelligence**. There is no database. Aura and joke memory live in the browser. If the Gemini key is missing, the wifi dies, or the API errors, every session still answers from `lib/fallbacks.ts`.

## Setup

```bash
npm i
```

Copy the env example and add a Gemini key (optional — the app runs without one):

```bash
# macOS / Linux
cp .env.local.example .env.local

# Windows PowerShell
Copy-Item .env.local.example .env.local
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`GEMINI_API_KEY` is read only on the server. The model is `gemini-2.5-flash`.

## Demo mode

Add `?demo=1` or press **demo mode** in the navbar. Demo mode skips the API, uses the pre-written fallbacks, and shortens the fake thinking loaders. Useful when the wifi is a prop.

## The four sessions

| Problem | Route | What Sir Brainless does |
| --- | --- | --- |
| Ragebait | `/ragebait` | Turns a mild opinion into a post and quote-tweets it |
| Overthinking | `/overthink` | Reads one message like a court case, then tells you to touch grass |
| Undercooked toast | `/toast` | Takes a photo, calls it toast, and prints a certificate |
| Not knowing if you're him | `/not-him` | Scans a name and rules that you are not him |

## Scripts

```bash
npm run dev
npm run build
npm start
```

Deploy on Vercel with `GEMINI_API_KEY` set in the project env. The build does not need a key.

How the app is wired, including judge questions, is in [HOW_IT_WAS_BUILT.md](HOW_IT_WAS_BUILT.md).

## Team

Team ConfidentlyWrong.
