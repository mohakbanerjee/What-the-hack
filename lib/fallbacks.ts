import { clamp, round1 } from "@/lib/random";
import { drawFresh, presentPool } from "@/lib/shuffle";
import type { NotHimResult, OverthinkResult, RagebaitResult, ToastResult } from "@/lib/types";

const LOADING = [
  "asking sharma ji ke beta for a second opinion. he is imaginary and still ahead.",
  "loading moye moye. the sad part is the loading bar.",
  "samay raina cleared his throat. this is now a latent roast.",
  "arpit bala started a verse. the verse is about your choices.",
  "ravi kishan whispered zindagi jhandwa and left the chat.",
  "rakhi sawant entered with drama. the drama is unpaid.",
  "kya baat hai. the baat is still buffering.",
  "tumse na ho payega, but the loading bar is trying.",
  "just looking like a wow. the wow has not arrived.",
  "so beautiful so elegant, just buffering.",
  "bhupendra jogi is in the other room. he is also loading.",
  "sigma posture detected. the posture is sitting on the floor.",
  "aura farming in progress. the crop is mostly weeds.",
  "npc walk cycle engaged. please do not bump the walls.",
  "it's giving loading screen. the screen is giving up.",
  "not him. also not done.",
  "bigg boss music started and nobody voted yet.",
  "shark tank india is leaning in. the lean is suspicious.",
  "for that reason i'm out, said the progress bar, then came back.",
  "checking if this is a main character moment. it is a loading moment.",
  "the group chat is typing. all four of them are you.",
  "delulu is being compiled. the compiler is also delulu.",
  "manifesting a result. the universe left you on seen.",
  "touching grass virtually. the grass filed a complaint.",
  "asking the brain cell on duty. it is on leave.",
  "running it through the aunty network. three aunties gasped.",
  "the algorithm is cooking. the kitchen is theoretical.",
  "one brain cell is doing payroll for the other zero.",
  "confidence at 100%. the download is at 4%.",
  "sir brainless adjusted his sunglasses. they are drawn on.",
] as const;

const RAGE_REPLIES = [
  "kya baat hai. the baat is that nobody asked.",
  "tumse na ho payega, and the group chat agrees in silence.",
  "this is giving npc dialogue. the quest was 'have a normal thought'.",
  "sigma move was staying quiet. you picked the cutscene.",
  "aura minus fifty. the farm is closed for the season.",
  "just looking like a wow. a wow nobody ordered.",
  "so beautiful so elegant, just wrong.",
  "moye moye started playing by itself.",
  "zindagi jhandwa, and this post is the jhandwa.",
  "bigg boss would give this a captaincy and then a eviction.",
  "for that reason i'm out. the reason is the post.",
  "samay would say 'next' and the 'next' would be kinder.",
  "arpit bala could rhyme this. he should not have to.",
  "rakhi sawant energy, but the drama budget was zero.",
  "bhupendra jogi has logged off. even the meme is tired.",
  "not him. not the take. not the moment.",
  "it's giving group project member who says 'i'll do the intro'.",
  "sharma ji ka beta did not do this, and he does not exist.",
  "main character energy with background character research.",
  "the ratio is already warming up in the parking lot.",
  "this take has student-of-the-year confidence and a blank answer sheet.",
  "touch grass is no longer a suggestion. it is the reply.",
  "the gc muted this notification out of love.",
  "low battery behavior from a full battery phone.",
  "you posted this like the algorithm owed you money.",
  "delulu with a publish button.",
  "the vibe check returned 'please try again never'.",
  "even the loading spinner looked away.",
  "certified 'who asked' by the ministry of minding your business.",
  "sir brainless has never been right, and he still knows this missed.",
] as const;

const RAGE_POSTS: Array<(subject: string) => string> = [
  (s) => `just said "${s}" like the timeline was waiting.`,
  (s) => `breaking: local legend announces "${s}" and expects a parade.`,
  (s) => `"${s}". kya baat hai. the baat is doing too much.`,
  (s) => `posted "${s}" with sigma confidence and npc evidence.`,
  (s) => `"${s}". tumse na ho payega was written for this exact sentence.`,
  (s) => `said "${s}" and the group chat played moye moye.`,
  (s) => `"${s}". just looking like a wow. a wow with no witnesses.`,
  (s) => `announced "${s}" like bigg boss night and nobody had a mic.`,
  (s) => `"${s}". for that reason the timeline is out.`,
  (s) => `whispered "${s}" and called it a personality.`,
  (s) => `"${s}". it's giving main character in a tutorial level.`,
  (s) => `put "${s}" on the internet. zindagi jhandwa started humming.`,
  (s) => `"${s}". so beautiful so elegant, just unposted in my heart.`,
  (s) => `served "${s}" like a shark tank pitch with no numbers.`,
  (s) => `"${s}". bhupendra jogi would not claim this.`,
  (s) => `dropped "${s}" and waited for aura. the aura left a note.`,
  (s) => `"${s}". not him. not her. not the moment.`,
  (s) => `typed "${s}" like rakhi sawant was about to enter. she did not.`,
  (s) => `"${s}". samay said nothing, which was the roast.`,
  (s) => `made "${s}" everyone's problem before lunch.`,
  (s) => `"${s}". arpit bala could freestyle a better exit.`,
  (s) => `posted "${s}" and the algorithm marked it as fan fiction.`,
  (s) => `"${s}". sharma ji ka beta is shaking his imaginary head.`,
  (s) => `said "${s}" with the confidence of a drawn-on sunglasses emoji.`,
  (s) => `"${s}". the gc reacted with one skull and then muted you gently.`,
];

const RAGE_SPICE = [
  "the comments are already in bigg boss formation.",
  "aura farmers walked past without harvesting.",
  "even moye moye asked for a happier ending.",
  "shark tank would clap once, politely, and leave.",
  "this is a latent episode where the audience is your own reflection.",
  "zindagi jhandwa, remix edition.",
  "kya baat hai, said nobody, including the baat.",
  "sigma until the screenshot.",
] as const;

const SPIRALS = [
  "they typed ok. ok is a genre now. you are writing the sequel.",
  "the reply took four minutes. that is a court trial in your head.",
  "you reread 'haha' like it was a legal document.",
  "left on seen. the seen is doing a phd on your personality.",
  "they used a period. the period feels personal.",
  "no emoji. you have buried yourself over a missing emoji.",
  "they said 'lol'. which lol. the kind lol. the distance lol.",
  "double text energy is living in your drafts like a tenant.",
  "you zoomed a story screenshot until it became abstract art.",
  "the blue tick arrived and so did your villain origin.",
  "they replied with a sticker. the sticker has a lawyer.",
  "you checked who viewed it. the list is just your own anxiety.",
  "three dots appeared, vanished, and took your evening with them.",
  "you drafted twelve replies and sent 'haha same'.",
  "the voice note is 0:04. you have analyzed all four seconds twice.",
  "they said 'we should hang'. you have built a seating chart.",
  "a thumbs up. from a person. in this economy of feelings.",
  "you compared this reply to a reply from march. march is winning.",
  "the nickname was missing. the nickname was one letter.",
  "you asked a friend to read it. the friend is now also spiraling. sorry.",
  "it's giving detective, but the crime is a normal conversation.",
  "tumse na ho payega, said the part of you that wanted to sleep.",
  "moye moye is playing and you did not press play.",
  "kya baat hai. the baat is a two letter reply.",
  "sigma would not check again. you are on lap fourteen.",
  "not him behavior would be closing the app. you opened it.",
  "sharma ji ka beta would have replied and touched grass. he is fictional.",
  "bigg boss would narrate this as 'emotional damage, day one'.",
  "for that reason you're out of the calm category.",
  "the message is fine. your director's commentary is not.",
] as const;

const FORENSICS = [
  "exhibit a: a normal sentence you treated like a series finale.",
  "exhibit b: the time stamp. it proves nothing and you know that.",
  "exhibit c: your draft folder, which is longer than the actual chat.",
  "exhibit d: one emoji, cross-examined until it confessed to nothing.",
  "the punctuation has an alibi. you do not.",
  "witnesses include three group chats and a notes app apology.",
  "the blue ticks were at the scene. they refuse to testify.",
  "motive: wanting to be liked. method: rereading.",
  "the reply is short because people have lives, allegedly.",
  "no fingerprint on the sticker. you dusted it anyway.",
  "timeline reconstructed from a single 'hmm'.",
  "the story view was an accident. your essay was a choice.",
  "expert testimony from your 2am brain, which is not licensed.",
  "the case file is one text and forty interpretations.",
  "closing argument: it was probably nothing. objection sustained by you.",
  "chain of custody: phone, to pillow, to worse phone angle.",
  "the period at the end is not a threat. it is grammar.",
  "you highlighted 'ok' like it was a confession.",
  "background check on a meme they sent in 2023. irrelevant. included.",
  "the jury of one (you) has already reached fourteen verdicts.",
  "voice note waveform analyzed for hidden sigh. it was a breath.",
  "location data: your room. suspect: also your room.",
  "the delay was them boiling water. you built a conspiracy.",
  "character witness: the version of you that is normal at 11am.",
  "forensic result: the chat is fine. the spiral has footnotes.",
] as const;

const OVERTHINK_VERDICTS = [
  "sir brainless verdict: it's probably fine. (it is not fine.)",
  "verdict: probably fine. your brain has filed an appeal anyway.",
  "verdict: it's giving fine. the giving is suspicious.",
  "verdict: kya baat hai, the baat is small, the spiral is a feature film.",
  "verdict: tumse na ho payega, specifically the part where you stop.",
  "verdict: not him, not a crisis, still a full documentary.",
  "verdict: for that reason you're in. the reason is one text.",
  "verdict: moye moye is optional. you made it compulsory.",
  "verdict: sigma would close the chat. you opened a second chat about the chat.",
  "verdict: probably fine, said nobody in your notes app.",
  "verdict: the message is npc. your reaction is the final boss.",
  "verdict: just looking like a wow, if wow means overthinking.",
  "verdict: so beautiful so elegant, just a normal reply.",
  "verdict: zindagi jhandwa, but only inside your head.",
  "verdict: bigg boss would stretch this for a week. you already did.",
  "verdict: aura was lost in the drafts folder.",
  "verdict: sharma ji ka beta would have said 'cool' and left. fictional, but free.",
  "verdict: it's probably fine. the footnotes disagree.",
  "verdict: seen is not a personality test. you sat the exam.",
  "verdict: the period is grammar. the spiral is extra credit you assigned yourself.",
  "verdict: touch grass is the only peer-reviewed solution.",
  "verdict: confidence 100%. the text was 'ok'.",
  "verdict: latent roast of the day is the one you are doing to yourself.",
  "verdict: bhupendra jogi is not in this chat. you checked.",
  "verdict: probably fine. please do not book a follow up with the blue ticks.",
  "verdict: main character hours over a side quest.",
  "verdict: the reply survives. the director's cut should not.",
  "verdict: it's fine. sir brainless has never been right, so maybe worry a little. no. stop.",
] as const;

const TOAST_CRITIQUES = [
  "this bread has bigg boss lighting and canteen confidence.",
  "golden brown index is a rumor. the bread heard the rumor and got shy.",
  "kya baat hai, the baat is pale.",
  "tumse na ho payega was whispered by the toaster.",
  "just looking like a wow, if wow means still bread.",
  "so beautiful so elegant, just undercooked.",
  "moye moye energy. soft in the middle, dramatic at the edges.",
  "zindagi jhandwa, breakfast edition.",
  "sigma toast would commit. this toast is still introducing itself.",
  "npc bread. it spawned and forgot its quest.",
  "it's giving dough that saw a screenshot of toast.",
  "not him. not toasted. not breakfast yet.",
  "shark tank india would say 'i love the vision' and then 'i'm out'.",
  "for that reason the butter is out. the reason is structural.",
  "samay raina would ask it to leave the stage and come back browner.",
  "arpit bala could rhyme 'bread' with 'fled'. the crust fled.",
  "rakhi sawant would enter, gasp, and ask who did this to the slice.",
  "bhupendra jogi sent this to the group and the group changed the subject.",
  "aura farming failed. the crop is white in the center.",
  "sharma ji ka beta's toast is golden. he is imaginary. still winning.",
  "the maillard reaction left you on seen.",
  "this is a bread that said 'i'll start the assignment tonight'.",
  "confidence of a burnt slice, color of a fresh slice. impressive range.",
  "the toaster tried. the toaster should be allowed to rest.",
  "delulu golden. the actual color is 'maybe later'.",
  "touch the bread. it touched back. that is not how toast works.",
  "main character crust, background character middle.",
  "the jam is carrying this team. the bread is in the group project.",
  "sir brainless rates it a twelve. the twelve is not out of ten. it is just twelve.",
  "breakfast looked at this and filed for a transfer.",
] as const;

const TOAST_GRADES = [
  "emotionally golden",
  "technically bread",
  "almost breakfast",
  "confidently pale",
  "wow in theory",
  "moye moye medium",
  "npc crumb",
  "sigma attempt",
  "latent loaf",
  "jhandwa golden",
] as const;

const HIM_REASONS = [
  "the scan found main character subtitles and npc footwork.",
  "aura was detected, then it asked whose aura it was.",
  "kya baat hai. the baat did not survive peer review.",
  "tumse na ho payega is not a score. it is the whole report.",
  "sigma posture, tutorial-level execution.",
  "it's giving him from a distance and 'who is that' up close.",
  "not him. the scanner tried the dramatic zoom. still not him.",
  "just looking like a wow. the wow logged out.",
  "so beautiful so elegant, just not the guy.",
  "moye moye played during the scan. the scan felt that.",
  "zindagi jhandwa, identity edition.",
  "bigg boss music started. the eviction was procedural.",
  "for that reason you're out. the reason is the entire vibe check.",
  "shark tank clapped, then remembered they were investors.",
  "samay would say the set is nice and the bit needs work.",
  "arpit bala nodded in rhythm and still shook his head.",
  "rakhi sawant gasped, which is her greeting, not a verification.",
  "bhupendra jogi was in the database. you were in the waiting room.",
  "sharma ji ka beta remains unbeaten because he is a concept.",
  "the rizz was theoretical. the evidence was a username.",
  "delulu filed a claim. the claim was denied with love.",
  "you aura farmed on a plot you do not own.",
  "the algorithm said 'similar to him' the way maps says 'similar restaurants'.",
  "confidence 100%. him-ness refused to load.",
  "the group chat would hype you. the scanner is not the group chat.",
  "main character lighting, side character quest log.",
  "touch grass was recommended. the grass is neutral on him status.",
  "even the loading bar did not want this responsibility.",
  "sir brainless believes in you. sir brainless is always wrong, so.",
  "the final frame was a mirror. the mirror requested a retake.",
] as const;

const MATCHES = [
  "a loading screen with main character lighting",
  "the friend who says kya baat hai and then has no baat",
  "moye moye, but the dance is just standing there",
  "a sigma edit with the audio still buffering",
  "npc number four, the one with the repeated greeting",
  "it's giving group project leader on day one only",
  "not him, the extended version, with subtitles",
  "just looking like a wow in a very dim room",
  "so beautiful so elegant, just late to the plan",
  "bhupendra jogi energy if the energy stayed home",
  "a bigg boss entry with no theme music budget",
  "shark tank pitcher who brought vibes instead of slides",
  "for that reason i'm out, the remix, performed sincerely",
  "a latent audition where the joke is the confidence",
  "arpit bala's rhyme scheme if the rhyme went home early",
  "rakhi sawant drama club, rehearsal, not the finale",
  "ravi kishan's zindagi jhandwa as a morning alarm",
  "tumse na ho payega, whispered kindly by a toaster",
  "sharma ji ka beta's shadow, and the shadow is also imaginary",
  "an aura farm with one sad plant",
  "the blue tick that arrives and says nothing else",
  "a voice note that is 0:03 and still a speech",
  "the 'ok' text, expanded into a personality",
  "a story viewer who is also the story",
  "delulu with a student id",
  "the guy in the reel comment who types 'real'",
  "a captaincy speech before the task is explained",
  "touch-grass ambassador who has not been outside",
  "the final boss of almost",
  "sir brainless, if sir brainless had a roll number",
] as const;

const APPEALS = [
  "appeal denied. the form was a vibe and the vibe was late.",
  "appeal denied. kya baat hai is not evidence.",
  "appeal denied. tumse na ho payega remains the citation.",
  "appeal denied. sigma is not a legal strategy.",
  "appeal denied. the aura farm failed inspection.",
  "appeal denied. moye moye is a song, not a witness.",
  "appeal denied. bigg boss would have stretched it, we will not.",
  "appeal denied. for that reason, and also the other reasons.",
  "appeal denied. just looking like a wow is not a credential.",
  "appeal denied. sharma ji ka beta did not sign your form. he cannot.",
  "appeal denied. the scanner does not do sequels.",
  "appeal denied. not him, now with paperwork.",
  "appeal denied. it's giving the same result in a longer font.",
  "appeal denied. bhupendra jogi was not on the panel.",
  "appeal denied. the group chat is not a court.",
  "appeal denied. confidence was noted and then ignored.",
  "appeal denied. touch grass, then touch the decision.",
  "appeal denied. sir brainless double checked by guessing again.",
  "appeal denied. the remix is the same song.",
  "appeal denied. latent, but still no.",
  "appeal denied. zindagi jhandwa, appeal edition.",
  "appeal denied. npc dialogue cannot overrule the scan.",
  "appeal denied. so beautiful so elegant, just still no.",
  "appeal denied. the blue tick of justice has spoken.",
  "appeal denied. please do not book a follow up.",
] as const;

const SCAN_LINES = [
  "measuring aura. the aura is shy.",
  "comparing posture to a sigma edit. the edit was filtered.",
  "checking main character status. result: recurring guest.",
  "running kya baat hai detection.",
  "asking the group chat. the group chat is typing.",
  "cross referencing moye moye energy.",
  "shark tank is leaning back in the chair.",
  "bigg boss theme song almost started.",
  "searching for him. found a loading bar.",
  "the mirror requested a lawyer.",
  "aura farm soil test in progress.",
  "npc pathing looks familiar.",
  "tumse na ho payega is flashing, politely.",
  "just looking like a wow, pending review.",
  "bhupendra jogi is not a match. obviously. still checked.",
  "confidence 100%. the barcode will not scan.",
  "delulu levels are recreational, not professional.",
  "the rizz file is empty and well lit.",
  "touching virtual grass for a control sample.",
  "sir brainless cleaned his sunglasses. they are pixels.",
  "it's giving almost. almost is not him.",
  "the algorithm said 'people also scanned'.",
  "voice of the scanner: so beautiful so elegant, just unsure.",
  "for that reason the progress bar is sweating.",
  "final frame is buffering out of respect.",
] as const;

function spice(intensity: number) {
  if (intensity < 3) return "";
  return ` ${drawFresh("rage-spice", RAGE_SPICE, 1)[0]}`;
}

function pickPost(subject: string) {
  const index = Number(drawFresh("rage-posts", RAGE_POSTS.map((_, i) => String(i)), 1)[0] ?? 0);
  const template = RAGE_POSTS[index] ?? RAGE_POSTS[0];
  return template!(subject);
}

export const THINKING_STEPS = LOADING;
export const TOAST_STEPS = LOADING;
export const SCAN_STEPS = SCAN_LINES;

export const RAGE_ZONES = [
  { max: 20, label: "chill" },
  { max: 40, label: "mildly annoyed" },
  { max: 60, label: "typing in caps" },
  { max: 80, label: "quote tweeting" },
  { max: 100, label: "touch grass immediately" },
] as const;

export function rageZone(score: number) {
  return RAGE_ZONES.find((zone) => score <= zone.max)?.label ?? "touch grass immediately";
}

export function ragebaitFallback(text: string, intensity = 1, avoid: string[] = []): RagebaitResult {
  const subject = text.trim() || "having a normal opinion";
  const replies = drawFresh("rage-replies", RAGE_REPLIES, 5, avoid);
  return {
    post: `${pickPost(subject)}${spice(intensity)}`,
    rageScore: clamp(38 + intensity * 17 + subject.length, 22, 99),
    replies,
  };
}

const CRUNCH = [
  "theoretical",
  "npc crunch",
  "sigma crunch",
  "moye moye soft",
  "wow adjacent",
  "jhandwa crisp",
  "latent crunch",
  "group project crunch",
] as const;

const BUTTER = [
  "uneven confidence",
  "butter left on seen",
  "aura in one corner",
  "npc smear",
  "so elegant, missed",
  "kya baat hai, off center",
  "shark tank portion",
  "emotionally buttered",
] as const;

const TOAST_AURA = [
  "main character crust",
  "background crumb",
  "it's giving bread",
  "not him energy",
  "delulu golden",
  "touch grass warm",
  "bigg boss lighting",
  "loading screen beige",
] as const;

const INTEGRITY = [
  "structurally a rumor",
  "holds if you believe",
  "folds under eye contact",
  "group project stable",
  "one bite from collapse",
  "confidently floppy",
  "tutorial level firm",
  "appeal pending",
] as const;

const IDENTIFIED = [
  "toast, allegedly",
  "a bread still introducing itself",
  "cardboard with a dream",
  "breakfast npc",
  "a wow that stayed pale",
  "moye moye on a plate",
  "latent loaf",
  "sharma ji ka beta's leftover, fictional",
] as const;

export function overthinkFallback(
  text: string,
  context = "friend",
  level = 1,
  avoid: string[] = [],
): OverthinkResult {
  const subject = `${context} ${text}`.trim();
  const spirals = drawFresh("spirals", SPIRALS, Math.min(7, 5 + Math.max(0, level - 1)), avoid);
  const forensics = drawFresh("forensics", FORENSICS, 4, avoid);
  const verdict = drawFresh("verdicts", OVERTHINK_VERDICTS, 1, avoid)[0] ?? OVERTHINK_VERDICTS[0];
  const raw = level <= 1 ? 91 + (subject.length % 8) : 108 + level * 9;
  return {
    overthinkPercent: level <= 1 ? round1(clamp(raw, 87, 99.9)) : clamp(raw, 101, 180),
    spirals,
    forensics,
    verdict,
  };
}

export function toastFallback(avoid: string[] = []): ToastResult {
  const seed = avoid.join("").length;
  return {
    goldenBrownIndex: 11 + ((seed * 17 + 29) % 78),
    crunch: drawFresh("toast-crunch", CRUNCH, 1, avoid)[0] ?? CRUNCH[0],
    butter: drawFresh("toast-butter", BUTTER, 1, avoid)[0] ?? BUTTER[0],
    aura: drawFresh("toast-aura", TOAST_AURA, 1, avoid)[0] ?? TOAST_AURA[0],
    integrity: drawFresh("toast-integrity", INTEGRITY, 1, avoid)[0] ?? INTEGRITY[0],
    grade: drawFresh("toast-grades", TOAST_GRADES, 1, avoid)[0] ?? TOAST_GRADES[0],
    identifiedAs: drawFresh("toast-identified", IDENTIFIED, 1, avoid)[0] ?? IDENTIFIED[0],
    critique: drawFresh("toast-critiques", TOAST_CRITIQUES, 1, avoid)[0] ?? TOAST_CRITIQUES[0],
  };
}

export function notHimFallback(name: string, appeal: boolean | string[] = false, avoid: string[] = []): NotHimResult {
  const extra = Array.isArray(appeal) ? appeal : avoid;
  const appealing = appeal === true;
  const safeName = name.trim() || "this user";
  const picked =
    drawFresh(appealing ? "appeals" : "him-reasons", appealing ? APPEALS : HIM_REASONS, 1, extra)[0] ??
    "the scan finished. the scan regrets being here.";
  const reason = appealing ? picked : picked.replaceAll("{name}", safeName);
  const celebrityMatch = drawFresh("matches", MATCHES, 1, extra)[0] ?? MATCHES[0];
  return {
    himScore: round1(0.4 + (safeName.length % 7) * 0.5),
    celebrityMatch,
    reason: appealing && !reason.toLowerCase().startsWith("appeal denied") ? `appeal denied. ${reason}` : reason,
  };
}

export function presentRageReplies(lines: string[]) {
  return presentPool("rage-replies", RAGE_REPLIES, lines);
}

export function presentSpirals(lines: string[]) {
  return presentPool("spirals", SPIRALS, lines);
}

export function presentForensics(lines: string[]) {
  return presentPool("forensics", FORENSICS, lines);
}

export function presentVerdict(line: string) {
  return presentPool("verdicts", OVERTHINK_VERDICTS, [line])[0] ?? line;
}

export function presentToast(critique: string, grade: string) {
  return {
    critique: presentPool("toast-critiques", TOAST_CRITIQUES, [critique])[0] ?? critique,
    grade: presentPool("toast-grades", TOAST_GRADES, [grade])[0] ?? grade,
  };
}

export function presentHim(reason: string, celebrityMatch: string) {
  return {
    reason: presentPool("him-reasons", HIM_REASONS, [reason])[0] ?? reason,
    celebrityMatch: presentPool("matches", MATCHES, [celebrityMatch])[0] ?? celebrityMatch,
  };
}

export function presentAppeal(reason: string, celebrityMatch: string) {
  return {
    reason: presentPool("appeals", APPEALS, [reason])[0] ?? reason,
    celebrityMatch: presentPool("matches", MATCHES, [celebrityMatch])[0] ?? celebrityMatch,
  };
}
