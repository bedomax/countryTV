# 🌐 Country MTV Web App

Minimalist fullscreen video player for Billboard Country hits.

## Features

- Fullscreen video experience
- Auto-hiding UI (3s idle)
- Continuous autoplay
- Keyboard controls
- Playlist sidebar

## Development

```bash
# From project root
npm run web
```

## Structure

```
web/
├── public/
│   ├── index.html      # Main HTML
│   ├── style.css       # Styles
│   ├── app.js          # Player logic
│   └── playlist.json   # Song data (generated)
└── src/                # Future: Build system
```

## Tech Stack

- Vanilla JavaScript
- CSS3 (fullscreen, animations)
- YouTube IFrame API
