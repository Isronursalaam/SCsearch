# SCsearch — OSINT Intelligence Dashboard

A full-stack Open Source Intelligence (OSINT) dashboard for security researchers, journalists, and analysts.

## Features

- **⚠ Legal Warning Modal** — Red overlay requiring ethical agreement before access (persisted via localStorage)
- **🔍 Reverse Image Search** — Drag-and-drop or URL-based image analysis with EXIF metadata extraction
- **📁 OSINT Tool Directory** — 18+ curated tools across 3 categories with instant search and filtering
- **🎨 Minimalist Design** — Clean black-and-white editorial aesthetic, light mode only

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 |
| Backend | Node.js + Express + TypeScript |
| Image Processing | Sharp + exif-parser |
| Reverse Search | SerpApi (Google Lens) with mock fallback |

## Quick Start

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

Server starts at `http://localhost:4000`

### 2. Frontend

```bash
cd frontend
npm install  # already done if scaffolded
npm run dev
```

App opens at `http://localhost:3000`

### 3. (Optional) Enable Live Reverse Image Search

Set your SerpApi key as an environment variable:

```bash
# backend/.env or system env
SERPAPI_KEY=your_api_key_here
```

Get a free key at [serpapi.com](https://serpapi.com) (100 searches/month free tier).

Without a key, the app returns demo/mock results.

## Project Structure

```
SCsearch/
├── frontend/                 # Next.js app
│   ├── src/
│   │   ├── app/              # Pages + layout
│   │   ├── components/       # React components
│   │   ├── lib/              # API client
│   │   └── types/            # TypeScript types
│   └── package.json
│
├── backend/                  # Express API
│   ├── src/
│   │   ├── routes/           # API routes
│   │   ├── services/         # EXIF + search services
│   │   └── data/             # Tool registry
│   └── package.json
│
└── README.md
```

## OSINT Tool Categories

| Category | Tools | Examples |
|----------|-------|---------|
| Image Recon | 6 | TinEye, Yandex Images, FotoForensics |
| Domain & IP | 6 | Shodan, VirusTotal, SecurityTrails |
| Email & Username | 6 | Have I Been Pwned, Sherlock, Hunter.io |

## Legal Notice

This platform is designed **exclusively** for:
- Authorized security research
- Educational and academic purposes
- Lawful investigative journalism
- Compliance with applicable laws

**Unauthorized use for cybercrime, stalking, harassment, or doxing is strictly prohibited.**
