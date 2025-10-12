# Deploy to Vercel

## 🚀 Quick Deploy

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Follow the prompts**:
   - Set up and deploy? **Y**
   - Which scope? Choose your account
   - Link to existing project? **N**
   - Project name: `country-tv` (or your preferred name)
   - Directory: `./`
   - Override settings? **N**

## 🔧 Configuration

The app is already configured for Vercel with:
- ✅ `vercel.json` configuration file
- ✅ Static file serving from `apps/web/public`
- ✅ API endpoint for viewer count
- ✅ Fallback from WebSockets to API polling

## 📊 Features

### Local Development
- **Real-time viewer counter** with WebSockets
- **Live connections tracking**

### Vercel Production
- **Simulated viewer counter** (changes every 10 seconds)
- **API polling** every 5 seconds
- **No WebSocket dependencies**

## 🎵 Usage

1. **Generate playlist** (run locally):
   ```bash
   npm run scrape
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

3. **Your app will be live** at your Vercel URL!

## 🔄 Updates

To update the playlist:
1. Run `npm run scrape` locally
2. Commit changes
3. Run `vercel --prod` to redeploy

## 📝 Notes

- Vercel doesn't support persistent WebSockets
- Viewer count is simulated in production
- All other features work perfectly on Vercel
- Static files are served efficiently
