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
├── public/
│   ├── index.html           # Main page
│   ├── style.css            # Fullscreen styles
│   ├── app.js               # Player logic
│   └── playlist.json        # Song data (generated)
├── scraper-with-youtube.ts  # Main scraper
├── server.ts                # Express server
└── package.json
```

## 🎨 Customization

**Change song count** - Edit `scraper-with-youtube.ts`:
```typescript
minItems: 5,  // Change to 10, 20, etc.
maxItems: 5
```

**Update playlist** - Run `npm run scrape` and reload the page.

## 🐛 Troubleshooting

**No videos showing?**
- Run `npm run scrape` first
- Check if `public/playlist.json` exists

**OpenAI quota error?**
- Verify credits at https://platform.openai.com/account/billing

## 📄 License

MIT

## 👨‍💻 Author

**Bedomax** - [@bedomax](https://github.com/bedomax)

---

Built with ❤️ using Playwright, OpenAI, YouTube API & Express

⭐ Star this repo if you like it!
