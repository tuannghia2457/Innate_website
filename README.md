# Innate — Landing page + web demo

One site: the landing page guides visitors into the demo wallet, the guided story and the ops dashboard. Vite + React + TypeScript, static build, hash routing. Every score shown comes from the live Innate API (repository `Innate_Odylytics`, folder `backend/`).

## Run

```powershell
npm install
npm run dev        # http://localhost:5173
npm test           # synthetic sessions + reason texts
npm run build      # static site in dist/
```

Environment (`.env.local`, not committed):

| Variable | Default | Note |
|---|---|---|
| `VITE_API_URL` | `https://nhip-api-taupe.vercel.app` | Innate API |
| `VITE_SDK_KEY` | *(empty)* | The **SDK** key (`NHIP_API_KEYS`). It ships in the browser by design: it can only create sessions, enroll and score. The ops and ML keys are never bundled. |

## Deploy

Deploy this repository as one static site; nothing else is needed (the API is already hosted). Any static host works (Vercel, Netlify, GitHub Pages): hash routes, so no rewrites.

| Setting | Value |
|---|---|
| Root directory | repository root |
| Build command | `npm run build` |
| Output directory | `dist` |
| Env | `VITE_SDK_KEY` = the API's **SDK** key (ask the API owner), required for live scoring; `VITE_API_URL` only if the API moves. `VITE_*` values are baked in at build time: rebuild after changing them. |

After deploy, open `/#/demo` and enroll once to check that scoring works (without the SDK key the API answers 401).

## Pages

| Route | What it shows |
|---|---|
| `#/` | Landing in the Movora layout: INNATE wordmark with a phone lowered on a spring, threat strip, problem, the three outcomes as numbered rows, inside a score + KPIs, the Lime “How it works” band, under the hood, cast, FAQ. Intro: P·IN → IN·NATE. |
| `#/demo` | Demo wallet with the SDK inside. Enroll your rhythm (3 × PIN `1593`), then transfer; the attacker console replays malware or another person on the same keys. |
| `#/demo?story=1` | Guided story, 8 steps (~90 s): SDK, Hà enrolls, Hà pays her mum (allow), fake officer + Accessibility app, malware at 2 a.m. (hold), Bảo with the PIN (step-up), ops review, policy. Seeded sessions, scored live. Autoplay, sound, keyboard ← → K M, behind-the-scenes picture-in-picture. |
| `#/ops` | Fraud-ops dashboard: flagged sessions with reasons, label fraud / legit. Needs the **ops** key, typed by the analyst and kept in `sessionStorage` only. |

## What is live and what is simulated

| Part | In this demo |
|---|---|
| Touch capture (SDK) | Live: Pointer Events on the wallet keys and the swipe-to-confirm bar (`src/capture.ts`). Keyboard input is not counted, because it carries no touch position. |
| Scoring, enrollment lock, reasons | Live, from the API. |
| Attacker console, story sessions | Synthetic sessions (`src/synth.ts`) on the real key layout, scored live. Real attacks: `attacker/` (adb) in `Innate_Odylytics`. |
| Wallet, people, fake app dialog | Fictional. |
| KPIs on the landing page | Latency measured on the live API; catch rates simulated on synthetic sessions, labelled as such. |

## Pre-existing assets, libraries and tools (declared per contest rules)

| Asset | Source | Use |
|---|---|---|
| **Design system and frontend shell** | Movago web demo by team Odylytics (one of this team's members), reused: `styles.css`, `ui.tsx`, `smooth.ts`, `sound.ts`, `Intro.tsx`, `StoryBar.tsx`, `BehindScenes.tsx` engine, `DemoChoice.tsx`, nav/footer structure, colour tokens and type scale | Layout, components, motion, story player. All Innate content, wallet, SDK, API client, pages and line art are new. |
| Layout reference | Movora template (Framer Marketplace), via Movago's `DESIGN.md` | Grid, spacing, shapes only; no Movora images, logos or text |
| Avatars | Notionists by Zoish (CC0), pre-rendered with DiceBear | Fictional cast |
| Fonts | Archivo, Be Vietnam Pro, JetBrains Mono (OFL, Google Fonts); Hagrid (Adobe Fonts kit, wordmark only; falls back to Archivo if the kit does not serve this domain) | Typography |
| Libraries | React, React DOM, Lenis (MIT), Vite, TypeScript, Vitest | Build and runtime |
| AI tools | Claude (Anthropic) via Claude Code, used for code, copy and review | Development |
