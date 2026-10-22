/**
 * Generated stand-in images for the home slider — presentation builds only, client-approved (TDL, 2026-10-17;
 * AGENTS.md, Placeholders rule 1 and its exception). Calls OpenAI's Images API (gpt-image-2, 1536x1024) directly;
 * no MCP, no SDK.
 *
 *   node scripts/generate-slider-images.mjs <max-images> [--quality medium|high] [--only id,id,...] [--round N]
 *
 * <max-images> is a hard ceiling: if the run would make more images than that, it refuses and makes none.
 * Scenes are the eight below; --only narrows them (round 2 regenerates only the picks, same prompts).
 *
 * The key is read from .env.local (OPENAI_API_KEY) and never printed, logged or written anywhere. Output goes to
 * photo-picks/generated/ (gitignored) with a manifest of prompts, token usage and cost; only optimised AVIF/WebP of
 * the chosen images are ever committed, by hand, under public/placeholders/.
 *
 * No retries, on purpose: every request costs money. An organisation-verification error stops the run at once.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const MODEL = "gpt-image-2";
const SIZE = "1536x1024";
// OpenAI pricing page, 2026-10-17, gpt-image-2 standard: text input $5.00 / 1M, image input $8.00 / 1M,
// image output $30.00 / 1M tokens. Cost is computed from each response's own usage, not estimated.
const PRICE = { textIn: 5 / 1e6, imageIn: 8 / 1e6, imageOut: 30 / 1e6 };

export const BASE_PROMPT =
  "Photorealistic candid photo of Nigerian professionals at work in a modern Lagos office, natural window light, " +
  "warm tones, people engaged in real tasks, nobody looking at the camera, no visible logos, no readable text on " +
  "screens or documents, landscape.";
// Round 1 (2026-10-18) used "Keep the people and the main action in the middle horizontal band of the frame, with
// plain space above and below, so a very wide crop still shows them." The model painted flat letterbox bars into five
// of eight images; that sentence was replaced for the re-run (owner's wording, 2026-10-22), and the equipment line
// added after a monitor came back with brand-like lettering. Each image's exact prompt is in the manifest.
const FRAMING =
  "Wide landscape composition with the people in the middle third of the frame; a full-bleed photograph with no " +
  "borders, bars or blank bands.";
const EQUIPMENT = "No lettering, logos or brand marks on any equipment, including the backs of monitors and laptop lids.";

export const SCENES = [
  { id: "meeting-table", scene: "Four colleagues in a meeting around a wooden table, one speaking and gesturing while the others listen and take notes." },
  { id: "meeting-standup", scene: "Three colleagues standing by a window in a short working discussion, one holding a folder, another pointing at it." },
  { id: "documents-review", scene: "A woman at her desk reviewing a stack of printed documents with a pen, focused, papers seen at an angle so nothing is legible." },
  { id: "documents-records", scene: "A man filing folders into a shelf of labelled box files in a records room, labels blank or out of focus." },
  { id: "laptop-pair", scene: "Two colleagues side by side at one laptop, one explaining something on the screen to the other, screen angled away from the camera." },
  { id: "hr-interview", scene: "An HR interview across a desk: the interviewer listening and taking notes, the candidate in profile mid-answer." },
  { id: "payroll-desk", scene: "A payroll officer at an admin desk with a calculator and a monitor turned away from the camera, checking figures on a printed sheet seen edge-on." },
  { id: "admin-open-plan", scene: "An open-plan administration office: two people at adjacent desks working on computers, a third walking past carrying files, slightly out of focus." },
];

export const promptFor = (s) => `${BASE_PROMPT} Scene: ${s.scene} ${FRAMING} ${EQUIPMENT}`;

function readKey() {
  const file = join(process.cwd(), ".env.local");
  if (!existsSync(file)) throw new Error(".env.local not found");
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*OPENAI_API_KEY\s*=\s*(.*)\s*$/);
    if (m) return m[1].replace(/^["']|["']$/g, "").trim();
  }
  throw new Error("OPENAI_API_KEY is not set in .env.local");
}

function args(argv) {
  const out = { max: Number.NaN, quality: "medium", only: null, round: 1 };
  const rest = [...argv];
  out.max = Number(rest.shift());
  while (rest.length) {
    const a = rest.shift();
    if (a === "--quality") out.quality = rest.shift();
    else if (a === "--only") out.only = rest.shift().split(",").map((s) => s.trim()).filter(Boolean);
    else if (a === "--round") out.round = Number(rest.shift());
    else throw new Error(`unknown argument ${a}`);
  }
  if (!Number.isInteger(out.max) || out.max < 1) throw new Error("first argument must be the maximum number of images, e.g. 8");
  if (!["low", "medium", "high"].includes(out.quality)) throw new Error("--quality must be low, medium or high");
  return out;
}

async function main() {
  const opt = args(process.argv.slice(2));
  const scenes = opt.only ? SCENES.filter((s) => opt.only.includes(s.id)) : SCENES;
  if (opt.only && scenes.length !== opt.only.length) {
    const known = new Set(SCENES.map((s) => s.id));
    throw new Error(`unknown scene id(s): ${opt.only.filter((i) => !known.has(i)).join(", ")}`);
  }
  if (scenes.length > opt.max) {
    console.error(`Refusing: this run would make ${scenes.length} images and the limit you gave is ${opt.max}. Nothing generated.`);
    process.exit(2);
  }
  const key = readKey();
  const dir = join(process.cwd(), "photo-picks", "generated");
  mkdirSync(dir, { recursive: true });
  const manifestPath = join(dir, "manifest.json");
  const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : { images: [] };

  let runCost = 0;
  for (const s of scenes) {
    const prompt = promptFor(s);
    const started = Date.now();
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ model: MODEL, prompt, size: SIZE, quality: opt.quality, n: 1, output_format: "png" }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = String(body?.error?.message ?? res.statusText);
      if (/verif/i.test(msg)) {
        console.error(`STOPPED: OpenAI requires organisation verification for ${MODEL}. Message: ${msg}`);
        process.exit(3);
      }
      console.error(`STOPPED on ${s.id}: HTTP ${res.status}: ${msg}`);
      process.exit(1);
    }
    const b64 = body?.data?.[0]?.b64_json;
    if (!b64) { console.error(`STOPPED on ${s.id}: no image in the response`); process.exit(1); }
    const file = `r${opt.round}-${s.id}-${opt.quality}.png`;
    writeFileSync(join(dir, file), Buffer.from(b64, "base64"));
    const u = body.usage ?? {};
    const textIn = u.input_tokens_details?.text_tokens ?? u.input_tokens ?? 0;
    const imageIn = u.input_tokens_details?.image_tokens ?? 0;
    const imageOut = u.output_tokens ?? 0;
    const cost = textIn * PRICE.textIn + imageIn * PRICE.imageIn + imageOut * PRICE.imageOut;
    runCost += cost;
    manifest.images.push({ file, id: s.id, round: opt.round, quality: opt.quality, model: MODEL, size: SIZE, prompt,
      usage: u, costUsd: Number(cost.toFixed(5)), seconds: Math.round((Date.now() - started) / 1000), at: new Date().toISOString() });
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`${file}  ${imageOut} output tokens  $${cost.toFixed(4)}  ${Math.round((Date.now() - started) / 1000)} s`);
  }
  const total = manifest.images.reduce((a, i) => a + (i.costUsd ?? 0), 0);
  console.log(`This run: ${scenes.length} images, $${runCost.toFixed(4)}. All runs so far: ${manifest.images.length} images, $${total.toFixed(4)}.`);
}

main().catch((e) => { console.error(String(e?.message ?? e)); process.exit(1); });
