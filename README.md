# CEOLDIER

Matrix cyberpunk AI laboratory — generate images and video from a single neon terminal. Built with Next.js 15 (App Router), React 19, TypeScript, and Tailwind CSS.

## Features

- Full-screen animated Matrix rain (canvas, ~20fps, battery-friendly, respects `prefers-reduced-motion`)
- CEOLDIER particle logo that glitches, dissolves, and reforms on a loop
- Glassmorphism panels, CRT scanlines, neon glow, fully responsive
- Image and video generation with live status polling
- Gallery with download buttons, generation history, and saved prompts (persisted in localStorage)
- API key stays server-side: the browser only talks to internal `/api` routes, which proxy upstream with `Authorization: Bearer ${API_KEY}`

## Quick start

```bash
npm install
cp .env.example .env.local   # then fill in your values
npm run dev
```

Open http://localhost:3000.

## Environment variables

| Variable       | Description                                       |
| -------------- | ------------------------------------------------- |
| `API_BASE_URL` | Base URL of your generation API, no trailing slash |
| `API_KEY`      | Bearer token, used server-side only                |

## Expected upstream API contract

- `POST {API_BASE_URL}/api/v1/images/generate` — body `{ "prompt": "..." }` → `{ "id": "job_id" }`
- `GET {API_BASE_URL}/api/v1/images/status?id=job_id` → `{ "id", "status": "queued|processing|completed|failed", "url"?, "error"? }`
- `POST {API_BASE_URL}/api/v1/videos/generate` — same shape as images
- `GET {API_BASE_URL}/api/v1/videos/status?id=job_id` — same shape as images

If your provider uses different field names, adjust `lib/api.ts` (client) and the route handlers in `app/api/`.

## Deploy to Vercel

```bash
npm i -g vercel
vercel login
vercel                      # first deploy (preview)
vercel env add API_BASE_URL # paste value, select all environments
vercel env add API_KEY
vercel --prod               # production deploy
```

Or via the dashboard: push to GitHub → vercel.com → Add New Project → import the repo → add `API_BASE_URL` and `API_KEY` under Settings → Environment Variables → Deploy.

## Project structure

```
ceoldier/
├── app/
│   ├── api/
│   │   ├── images/
│   │   │   ├── generate/route.ts   # POST proxy → /api/v1/images/generate
│   │   │   └── status/route.ts     # GET proxy → /api/v1/images/status
│   │   └── videos/
│   │       ├── generate/route.ts   # POST proxy → /api/v1/videos/generate
│   │       └── status/route.ts     # GET proxy → /api/v1/videos/status
│   ├── globals.css                 # theme, glass, neon, glitch, scanlines
│   ├── layout.tsx                  # fonts + metadata
│   └── page.tsx                    # app shell, state, generation flow
├── components/
│   ├── MatrixRain.tsx              # full-screen canvas rain
│   ├── GlitchLogo.tsx              # particle dissolve/reform logo
│   ├── PromptPanel.tsx             # input + image/video toggle
│   ├── Gallery.tsx                 # results grid
│   ├── GenerationCard.tsx          # media card + download
│   ├── HistoryPanel.tsx            # past generations
│   └── SavedPrompts.tsx            # saved prompt library
├── lib/
│   ├── api.ts                      # client fetch + polling helpers
│   ├── proxy.ts                    # server-side upstream proxy
│   └── store.ts                    # localStorage persistence
├── types/index.ts
├── tailwind.config.ts
├── next.config.mjs
├── postcss.config.mjs
├── tsconfig.json
├── .env.example
└── package.json
```
