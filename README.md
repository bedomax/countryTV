# 🎸 Country MTV

A minimalist fullscreen video player that automatically plays Top 5 Billboard Country songs from YouTube, MTV-style.

![Country MTV](https://img.shields.io/badge/Country-MTV-red)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)

## ✨ Features

- 🎵 AI-powered scraping of Billboard Hot Country Songs
- 🎬 Automatic YouTube video search
- 📺 Minimalist fullscreen experience
- 🔄 Continuous autoplay
- 👻 Auto-hiding UI (disappears after 3s)
- ⌨️ Keyboard controls

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/bedomax/countryTV.git
cd countryTV

# Install dependencies
npm install

# Set up environment variables
echo "OPENAI_API_KEY=your-key-here" > .env

# Scrape songs and start server
npm run dev
```

Open http://localhost:3000

## 📝 Commands

```bash
npm run scrape    # Fetch Billboard songs + YouTube videos
npm run serve     # Start web server
npm run dev       # Do both
npm run web       # Start web app
npm run appletv   # AppleTV app (coming soon)
```

## ⌨️ Controls

- **→** or **N**: Next song
- **←** or **B**: Previous song
- **Space**: Play/Pause
- **P**: Toggle playlist
- **Esc**: Close playlist

## 🛠️ Tech Stack

- Frontend: HTML5, CSS3, Vanilla JS
- Backend: Node.js, Express, TypeScript
- Scraping: Playwright
- AI: OpenAI GPT-3.5-turbo
- Video: YouTube IFrame API

## 📁 Project Structure

```
countryTV/
├── apps/
│   ├── web/              # Web application
│   │   ├── public/       # Static files (HTML, CSS, JS)
│   │   └── src/          # Future: build system
│   └── appletv/          # AppleTV app (coming soon)
│       └── src/
├── backend/
│   ├── server/           # Express web server
│   ├── scrapers/         # Billboard scrapers
│   └── shared/           # Shared utilities
├── docs/                 # Documentation
└── package.json
```

## 🎨 Customization

**Change song count** - Edit `backend/scrapers/scraper-with-youtube.ts`:
```typescript
minItems: 5,  // Change to 10, 20, etc.
maxItems: 5
```

**Update playlist** - Run `npm run scrape` and reload the page.

## 🔮 Roadmap

- [x] Web app with fullscreen player
- [x] AI-powered scraping
- [x] YouTube integration
- [ ] More songs (Top 10, 20, 50)
- [ ] Multiple genres (Rock, Pop, Hip-Hop)
- [ ] AppleTV native app
- [ ] User favorites
- [ ] Playlist sharing

## 🐛 Troubleshooting

**No videos showing?**
- Run `npm run scrape` first
- Check if `apps/web/public/playlist.json` exists

**OpenAI quota error?**
- Verify credits at https://platform.openai.com/account/billing

## 📄 License

MIT

## 👨‍💻 Author

**Bedomax** - [@bedomax](https://github.com/bedomax)

---

Built with ❤️ using Playwright, OpenAI, YouTube API & Express

⭐ Star this repo if you like it!
