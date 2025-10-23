# Country TV - Claude Project Context

## Project Overview

Country TV is a 24/7 live streaming country music platform that plays Billboard chart hits with real-time viewer counter and authentic TV broadcast effects. Built with vanilla JavaScript, Node.js, and deployed on Vercel.

**Live URL**: [Your Vercel deployment URL]
**Repository**: https://github.com/bedomax/countryTV

## Tech Stack

### Frontend
- **Vanilla JavaScript** - No frameworks, pure performance
- **YouTube IFrame API** - Video playback and controls
- **CSS3 Animations** - Live TV effects (scan lines, noise, vignette)
- **PWA Support** - Installable mobile app

### Backend
- **Node.js + Express** - Local development server
- **TypeScript** - Type-safe development
- **Vercel Serverless Functions** - Production API endpoints
- **Socket.IO** - Real-time WebSocket (local only)

### Data & Scraping
- **Playwright** - Billboard chart scraping
- **YouTube Search** - Video discovery
- **Wikipedia Scraping** - Additional country music data
- **Spotify API** - Song search and metadata

## Project Structure

```
countryTV/
├── apps/
│   ├── web/
│   │   └── public/           # Static web app
│   │       ├── index.html    # Main HTML with SEO meta tags
│   │       ├── app.js        # Frontend logic & YouTube player
│   │       ├── style.css     # Live TV effects & responsive design
│   │       └── playlist.json # Generated song data (38+ songs)
│   └── appletv/              # Future AppleTV app
├── api/
│   ├── viewer-count.js       # Vercel serverless viewer counter
│   └── test.js              # API testing endpoint
├── backend/
│   ├── server/
│   │   └── index.ts         # Express server (local dev)
│   └── scrapers/
│       ├── billboard.ts     # Billboard chart scraper
│       ├── wikipedia-scraper.ts  # Wikipedia scraper
│       └── spotify-search.ts     # Spotify integration
├── tools/
│   └── add-song.ts          # Manual song addition utility
└── vercel.json              # Vercel deployment config
```

## Key Features

### 🎵 Music & Playback
- **38+ Country Songs** from Billboard charts
- **Continuous autoplay** 24/7
- **Randomized playlist** on load
- **YouTube video integration** for each song
- **Smart audio handling** with "Yeehaw!" unmute button

### 📺 Live TV Experience
- **Fullscreen player** with immersive video
- **Live TV effects**: scan lines, TV noise, signal interference
- **LIVE indicator** with pulsing animation
- **Real viewer counter** using IP-based tracking
- **Country branding** with animated logo

### 🎮 Controls
- **Keyboard shortcuts**: Arrow keys, spacebar, P for playlist
- **Mouse/touch controls**: Click controls and sidebar
- **Playlist sidebar**: Browse and select songs
- **Always visible UI**: No auto-hiding controls

## Development History & Important Context

### Recent Major Features (Chronological)

1. **Spotify Playlist Integration** (commit: 66e8376)
   - Added Spotify search button to find user's favorite songs
   - Search Spotify playlists and save songs to Country TV
   - YouTube video search integration for found songs
   - Located in: `apps/web/public/index.html` (Spotify search modal)

2. **Auto-Update Service** (commit: 9862048)
   - Cron-based scheduling for automatic song updates
   - New songs notification system
   - Background service for playlist refresh
   - Located in: `backend/scrapers/` directory

3. **Manual Song Addition Tool** (commit: 86ec6ef)
   - Added 58 new country songs manually
   - CLI tool for adding songs without scraping
   - Located in: `tools/add-song.ts`
   - Run with: `npm run add-song`

4. **NPM Script for Manual Additions** (commit: 13a6637)
   - Added convenience script: `npm run add-song`
   - Simplifies manual song additions workflow

### Scraping Strategy

The project uses multiple scraping sources:

1. **Billboard Charts** (`backend/scrapers/billboard.ts`)
   - Hot Country Songs chart
   - Country Airplay chart
   - Uses Playwright for scraping

2. **Wikipedia** (`backend/scrapers/wikipedia-scraper.ts`)
   - List of Billboard Hot Country Songs number ones
   - List of number-one country songs (United States)
   - Historical chart data

3. **YouTube Search** (integrated in scrapers)
   - Automatic video ID lookup for each song
   - Fallback search if direct match fails

4. **Spotify API** (`backend/scrapers/spotify-search.ts`)
   - User playlist search
   - Song metadata enrichment
   - Cross-reference with YouTube

### Viewer Counter Implementation

**Local Development:**
- Uses Socket.IO WebSocket connections
- Real-time updates when users join/leave
- Located in: `backend/server/index.ts`

**Vercel Production:**
- Serverless API endpoint: `/api/viewer-count.js`
- IP + UserAgent based session tracking
- In-memory storage (resets on cold start)
- 15-second inactivity timeout
- No fake numbers - real viewer tracking

### Live TV Effects

Implemented in `apps/web/public/style.css`:
- **Scan lines**: Horizontal lines overlay
- **TV noise**: Static texture effect
- **Signal interference**: Random glitch animations
- **Vignette**: Dark edge framing
- **CRT curvature**: Optional vintage TV look

## Common Commands

```bash
# Development
npm run dev              # Scrape songs + start server
npm run scrape          # Run all scrapers (Billboard + Wikipedia)
npm run serve           # Start Express server only
npm run web             # Start web app only

# Manual song management
npm run add-song        # Add songs manually (interactive CLI)

# Deployment
npm run vercel-build    # Build for Vercel
vercel                  # Deploy to Vercel

# Future
npm run appletv         # AppleTV app (coming soon)
```

## Important Files to Know

### Core Application Files
- **[apps/web/public/index.html](apps/web/public/index.html)** - Main HTML, SEO meta tags, PWA manifest
- **[apps/web/public/app.js](apps/web/public/app.js)** - YouTube player logic, controls, playlist handling
- **[apps/web/public/style.css](apps/web/public/style.css)** - All styling including live TV effects
- **[apps/web/public/playlist.json](apps/web/public/playlist.json)** - Generated song database (38+ songs)

### Backend Files
- **[backend/server/index.ts](backend/server/index.ts)** - Express server with Socket.IO
- **[backend/scrapers/billboard.ts](backend/scrapers/billboard.ts)** - Billboard chart scraper
- **[backend/scrapers/wikipedia-scraper.ts](backend/scrapers/wikipedia-scraper.ts)** - Wikipedia scraper
- **[backend/scrapers/spotify-search.ts](backend/scrapers/spotify-search.ts)** - Spotify integration

### API Files (Vercel)
- **[api/viewer-count.js](api/viewer-count.js)** - Serverless viewer counter API
- **[api/test.js](api/test.js)** - API testing endpoint

### Configuration
- **[vercel.json](vercel.json)** - Vercel deployment settings
- **[package.json](package.json)** - Dependencies and scripts
- **[.vercelignore](.vercelignore)** - Files to ignore on deployment

## Data Flow

### Song Scraping Flow
1. Run `npm run scrape`
2. Playwright scrapes Billboard/Wikipedia URLs
3. For each song, search YouTube for video ID
4. Combine data into JSON format
5. Save to `apps/web/public/playlist.json`
6. Frontend loads playlist on page load

### Viewer Counting Flow (Production)
1. User loads page
2. Frontend calls `/api/viewer-count?action=join`
3. API stores IP+UserAgent with timestamp
4. API returns current count
5. Frontend displays count
6. Periodic heartbeat every 10 seconds
7. Inactive sessions cleaned after 15 seconds

### Video Playback Flow
1. Load `playlist.json` on page load
2. Shuffle songs randomly
3. Load first video in YouTube IFrame
4. User clicks "Yeehaw!" to unmute
5. Video plays automatically
6. On video end, load next song
7. Update "Now Playing" display
8. Update playlist UI highlighting

## SEO & Marketing

### Meta Tags (in index.html)
- **Title**: "🤠 Country TV - Live 24/7 Country Music Stream"
- **Description**: Optimized for country music keywords
- **Keywords**: country music, live stream, billboard, etc.
- **Open Graph**: Facebook/LinkedIn sharing
- **Twitter Cards**: Twitter sharing preview

### PWA Configuration
- **[manifest.json](apps/web/public/manifest.json)** - App manifest
- **Icons**: 192x192 and 512x512 PNG icons needed
- **Service Worker**: Not yet implemented (future feature)

### SEO Files
- **[sitemap.xml](apps/web/public/sitemap.xml)** - Search engine sitemap
- **[robots.txt](apps/web/public/robots.txt)** - Search engine directives

## Deployment

### Vercel Configuration
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `apps/web/public`
- **API Routes**: Automatically detected in `/api/` directory
- **Auto-deploy**: Enabled on main branch push

### Environment Variables
```bash
# Optional: Enhanced scraping with AI
OPENAI_API_KEY=your-key-here

# Optional: YouTube API (if quota exceeded)
YOUTUBE_API_KEY=your-key-here

# Optional: Spotify API
SPOTIFY_CLIENT_ID=your-id
SPOTIFY_CLIENT_SECRET=your-secret
```

## Known Issues & Limitations

1. **Autoplay Restrictions**
   - Modern browsers block autoplay with sound
   - Solution: "Yeehaw!" button to unmute

2. **Vercel Cold Starts**
   - Viewer counter resets on API cold start
   - In-memory storage not persistent
   - Future: Consider Vercel KV or Redis

3. **YouTube API Quota**
   - Free tier: 10,000 units/day
   - Search costs 100 units per request
   - Current usage: ~40 searches per scrape run

4. **Scraping Reliability**
   - Billboard may change HTML structure
   - Playwright requires Chromium download
   - Wikipedia URLs may change

## Future Roadmap

### Planned Features
- [ ] Multiple genre channels (Rock, Pop, Hip-Hop)
- [ ] User favorites and playlists
- [ ] Real-time chat system
- [ ] AppleTV native app
- [ ] Playlist sharing
- [ ] Artist information panels
- [ ] iOS/Android native apps
- [ ] Service worker for offline support

### Technical Improvements
- [ ] Persistent viewer counter (Redis/Vercel KV)
- [ ] Service worker for PWA
- [ ] Automated testing (Jest/Playwright)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Performance monitoring
- [ ] Error logging (Sentry)

## Troubleshooting

### "No videos showing"
1. Check if `playlist.json` exists
2. Run `npm run scrape` to generate playlist
3. Check browser console for YouTube API errors

### "Viewer counter stuck at 0"
1. Check Vercel function logs
2. Verify `/api/viewer-count` is accessible
3. Check browser network tab for API errors

### "Scraping fails"
1. Verify internet connection
2. Check if Billboard/Wikipedia URLs changed
3. Run with `DEBUG=true npm run scrape`

### "Deployment fails"
1. Check `vercel.json` configuration
2. Verify build command runs locally
3. Check Vercel build logs in dashboard

## Code Patterns to Follow

### Adding New Songs
```typescript
// Use the CLI tool
npm run add-song

// Or add manually to playlist.json
{
  "title": "Song Title",
  "artist": "Artist Name",
  "videoId": "YouTube_Video_ID",
  "chart": "Manual Addition"
}
```

### Adding New Scrapers
```typescript
// backend/scrapers/your-scraper.ts
import { chromium } from 'playwright';

export async function scrapeYourSource() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  // ... scraping logic
  await browser.close();
  return songs;
}
```

### Adding TV Effects
```css
/* apps/web/public/style.css */
.your-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  /* effect styles */
}
```

## Testing

### Local Testing
```bash
# Start local server
npm run dev

# Open browser
open http://localhost:3000

# Check viewer counter
# Open multiple browser windows/tabs
```

### Production Testing
```bash
# Deploy to Vercel preview
vercel

# Test viewer counter API
curl https://your-app.vercel.app/api/viewer-count?action=join

# Check SEO
curl https://your-app.vercel.app | grep -i "meta"
```

## Useful Context for Claude

When working on this project:

1. **Always preserve the live TV aesthetic** - scan lines, effects are core to the experience
2. **Viewer counter must be real** - no fake numbers, IP-based tracking only
3. **Mobile-first responsive design** - many users watch on phones
4. **SEO is critical** - country music keywords, meta tags, social sharing
5. **Vanilla JS preferred** - keep it framework-free for performance
6. **YouTube API quota awareness** - batch operations, cache results
7. **Vercel serverless constraints** - in-memory storage resets, cold starts
8. **Country music authenticity** - Billboard charts, real artists only

## Related Documentation

- [README.md](README.md) - User-facing documentation
- [Vercel Documentation](https://vercel.com/docs)
- [YouTube IFrame API](https://developers.google.com/youtube/iframe_api_reference)
- [Playwright Documentation](https://playwright.dev/)
- [Billboard Charts](https://www.billboard.com/charts/country-songs/)

---

**Last Updated**: 2025-10-22
**Current Song Count**: 38+
**Deployment Status**: Live on Vercel
**Maintenance**: Active development
