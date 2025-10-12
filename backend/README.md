# ⚙️ Backend Services

Backend services for Country MTV including scrapers and web server.

## Structure

```
backend/
├── server/
│   └── server.ts           # Express web server
├── scrapers/
│   ├── scraper-with-youtube.ts    # Main scraper (AI + YouTube)
│   ├── simple-ai-scraper.ts       # Simple AI scraper
│   └── stagehand-scraper.ts       # Stagehand-based scraper
└── shared/                         # Shared utilities (future)
```

## Scrapers

### Main Scraper (Recommended)
```bash
npm run scrape
```
- Uses OpenAI to extract Billboard songs
- Searches YouTube for official videos
- Saves to `apps/web/public/playlist.json`

### Alternative Scrapers
```bash
npm run scrape:simple      # Simple AI scraper
npm run scrape:stagehand   # Stagehand-based scraper
```

## Server

```bash
npm run serve
```

Serves the web app on http://localhost:3000

## Environment Variables

Required:
- `OPENAI_API_KEY` - OpenAI API key for scraping

## Tech Stack

- Node.js + Express + TypeScript
- Playwright (browser automation)
- OpenAI GPT-3.5-turbo
- Stagehand (optional)
