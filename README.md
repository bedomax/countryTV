# 🤠 Country TV

A live streaming country music platform that plays 24/7 country hits from Billboard charts with real-time viewer counter and TV broadcast effects.

![Country TV](https://img.shields.io/badge/Country-TV-red)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![Vercel](https://img.shields.io/badge/deployed%20on-Vercel-black)

## ✨ Features

### 🎵 **Music & Playback**
- 🎸 **38+ Country Songs** - Billboard Hot Country Songs + Country Airplay charts
- 🎬 **YouTube Integration** - Automatic video search and embedding
- 🔄 **Continuous Autoplay** - 24/7 streaming experience
- 🎲 **Randomized Playlist** - Shuffled songs for variety
- 🔊 **Smart Audio** - Auto-unmute with "Yeehaw!" button

### 📺 **Live TV Experience**
- 🎥 **Fullscreen Player** - Immersive video experience
- 📡 **Live TV Effects** - Scan lines, TV noise, signal interference
- 🔴 **LIVE Indicator** - Pulsing red indicator with glow effects
- 👥 **Real Viewer Counter** - IP-based tracking (no fake numbers)
- 🤠 **Country Branding** - Animated logo with cowboy hat and guitar

### 🎮 **Controls & Navigation**
- ⌨️ **Keyboard Controls** - Arrow keys, spacebar, playlist toggle
- 🖱️ **Click Controls** - Next/Previous/Play/Pause buttons
- 📋 **Playlist Sidebar** - Browse all available songs
- 👁️ **Always Visible UI** - No auto-hiding, controls always accessible
- 📱 **Mobile Responsive** - Works on all devices

### 🚀 **Deployment & SEO**
- ☁️ **Vercel Ready** - One-click deployment to Vercel
- 🔍 **SEO Optimized** - Meta tags, Open Graph, Twitter Cards
- 📊 **Analytics Ready** - Google Analytics integration
- 📱 **PWA Support** - Installable as mobile app
- 🌐 **Multi-language** - English + Spanish keywords

## 🚀 Quick Start

### Local Development
```bash
# Clone the repo
git clone https://github.com/bedomax/countryTV.git
cd countryTV

# Install dependencies
npm install

# Set up environment variables (optional)
echo "OPENAI_API_KEY=your-key-here" > .env

# Scrape songs and start server
npm run dev
```

Open http://localhost:3000

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
vercel

# Follow prompts and your app will be live!
```

## 📝 Commands

```bash
npm run scrape        # Fetch Billboard songs + YouTube videos
npm run serve         # Start web server (local development)
npm run dev           # Scrape + serve (full local setup)
npm run web           # Start web app only
npm run vercel-build  # Build for Vercel deployment
npm run appletv       # AppleTV app (coming soon)
```

## ⌨️ Controls

### Keyboard Shortcuts
- **→** or **N**: Next song
- **←** or **B**: Previous song
- **Space**: Play/Pause
- **P**: Toggle playlist
- **Esc**: Close playlist

### Mouse/Touch Controls
- **Click anywhere**: Unmute audio
- **🤠 Yeehaw button**: Unmute and start playback
- **Control buttons**: Next, Previous, Play/Pause
- **Playlist sidebar**: Browse and select songs

## 🛠️ Tech Stack

### Frontend
- **HTML5, CSS3, Vanilla JS** - No frameworks, pure performance
- **YouTube IFrame API** - Video playback and controls
- **CSS Animations** - Live TV effects and transitions
- **PWA Support** - Installable mobile app

### Backend
- **Node.js + Express** - Web server
- **TypeScript** - Type-safe development
- **Socket.IO** - Real-time WebSocket connections (local)
- **Vercel Functions** - Serverless API endpoints

### Data & Scraping
- **Playwright** - Web scraping Billboard charts
- **YouTube API** - Video search and metadata
- **Wikipedia Scraping** - Additional country music data

### Deployment
- **Vercel** - Serverless hosting platform
- **Real-time APIs** - IP-based viewer tracking
- **CDN** - Global content delivery

## 📁 Project Structure

```
countryTV/
├── apps/
│   ├── web/              # Web application
│   │   └── public/       # Static files (HTML, CSS, JS)
│   │       ├── index.html    # Main HTML with SEO meta tags
│   │       ├── app.js        # Frontend logic & YouTube player
│   │       ├── style.css     # Live TV effects & responsive design
│   │       ├── playlist.json # Generated song data
│   │       ├── manifest.json # PWA configuration
│   │       ├── sitemap.xml   # SEO sitemap
│   │       └── robots.txt    # Search engine directives
│   └── appletv/          # AppleTV app (coming soon)
├── api/                  # Vercel serverless functions
│   ├── viewer-count.js   # Real-time viewer counter API
│   └── test.js          # API testing endpoint
├── backend/
│   ├── server/           # Express web server (local dev)
│   └── scrapers/         # Billboard & Wikipedia scrapers
├── docs/                 # Documentation
├── vercel.json          # Vercel deployment configuration
├── .vercelignore        # Vercel ignore patterns
└── package.json         # Dependencies & scripts
```

## 🎨 Customization

### Song Collection
**Expand playlist** - Edit `backend/scrapers/wikipedia-scraper.ts`:
```typescript
// Add more chart URLs for more songs
const urls = [
  'https://en.wikipedia.org/wiki/List_of_Billboard_Hot_Country_Songs_number_ones',
  'https://en.wikipedia.org/wiki/List_of_number-one_country_songs_(United_States)',
  // Add more URLs here
];
```

**Update playlist** - Run `npm run scrape` and reload the page.

### Styling
**Modify TV effects** - Edit `apps/web/public/style.css`:
```css
/* Adjust scan lines intensity */
.scan-lines {
  opacity: 0.1; /* Change from 0.05 to 0.2 for more/less effect */
}
```

**Change colors** - Update CSS variables in `style.css`:
```css
:root {
  --live-color: #ff0000; /* Red LIVE indicator */
  --viewer-color: #00bfff; /* Blue viewer counter */
}
```

### SEO & Branding
**Update meta tags** - Edit `apps/web/public/index.html`:
- Change title, description, and keywords
- Update Open Graph images and URLs
- Modify structured data for your brand

## 📊 Real-time Features

### Viewer Counter
- **Local Development**: WebSocket-based real-time counting
- **Vercel Production**: IP-based session tracking
- **Accuracy**: Each unique IP+UserAgent = 1 viewer
- **Cleanup**: Inactive sessions removed after 15 seconds

### Live TV Effects
- **Scan Lines**: Horizontal lines across screen
- **TV Noise**: Static overlay effect
- **Signal Interference**: Random glitch effects
- **Vignette**: Dark edges for authentic TV look

## 🔮 Roadmap

### Completed ✅
- [x] **38+ Country Songs** - Billboard charts integration
- [x] **Live TV Effects** - Authentic broadcast look
- [x] **Real Viewer Counter** - IP-based tracking
- [x] **Vercel Deployment** - One-click hosting
- [x] **SEO Optimization** - Meta tags, Open Graph, PWA
- [x] **Mobile Responsive** - Works on all devices
- [x] **Randomized Playlist** - Shuffled song order

### Planned 🚀
- [ ] **Multiple Genres** - Rock, Pop, Hip-Hop channels
- [ ] **User Favorites** - Save preferred songs
- [ ] **Chat System** - Real-time viewer chat
- [ ] **AppleTV App** - Native tvOS application
- [ ] **Playlist Sharing** - Share custom playlists
- [ ] **Artist Information** - Song details and bios
- [ ] **Mobile App** - iOS/Android native apps

## 🐛 Troubleshooting

### Common Issues

**No videos showing?**
- Run `npm run scrape` first to generate playlist
- Check if `apps/web/public/playlist.json` exists
- Verify YouTube API quota and keys

**Viewer counter not working?**
- **Local**: Check WebSocket connection in browser console
- **Vercel**: Verify API endpoints are accessible (`/api/viewer-count`)
- Check browser console for API errors

**Autoplay not working?**
- Modern browsers block autoplay with sound
- Click the "🤠 Yeehaw!" button to enable audio
- Ensure browser allows autoplay for your domain

**Vercel deployment issues?**
- Check `vercel.json` configuration
- Verify API files are in `/api/` directory
- Check Vercel function logs in dashboard

### Performance Tips

**Reduce TV effects for better performance:**
```css
/* Disable effects on mobile */
@media (max-width: 768px) {
  .live-effects { display: none; }
}
```

**Optimize for slower connections:**
- Reduce playlist size in scraper configuration
- Enable YouTube's lower quality settings
- Use CDN for static assets

## 🚀 Deployment Guide

### Vercel Deployment
1. **Connect GitHub repo** to Vercel
2. **Set build command**: `npm run vercel-build`
3. **Set output directory**: `apps/web/public`
4. **Deploy automatically** on every push

### Custom Domain
1. **Add domain** in Vercel dashboard
2. **Update URLs** in `index.html` meta tags
3. **Configure DNS** records as instructed
4. **Update sitemap.xml** with new domain

### Environment Variables
```bash
# Optional: For enhanced scraping
OPENAI_API_KEY=your-openai-key

# Optional: For YouTube API (if needed)
YOUTUBE_API_KEY=your-youtube-key
```

## 📄 License

MIT License - feel free to use this project for your own country music streaming platform!

## 👨‍💻 Author

**Bedomax** - [@bedomax](https://github.com/bedomax)

---

## 🎵 About Country TV

Country TV is a passion project that brings the authentic feel of live country music broadcasting to the web. Built with modern technologies but designed to feel like classic TV, it combines the best of Billboard's country charts with the immersive experience of live television.

**Key Features:**
- 🤠 **Authentic Country Experience** - Real Billboard charts, not algorithms
- 📺 **Live TV Feel** - Scan lines, noise, and broadcast effects
- 👥 **Real Community** - Actual viewer count, not fake numbers
- 🎸 **Quality Music** - Hand-picked country hits from official charts

Built with ❤️ using Playwright, YouTube API, Vercel & modern web technologies

⭐ **Star this repo if you love country music and live TV!** ⭐
