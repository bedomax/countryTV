import { chromium } from 'playwright';
import * as fs from 'fs';

interface Song {
  position: number;
  title: string;
  artist: string;
  youtubeId: string;
  isNew?: boolean;
  addedDate?: string;
}

interface Playlist {
  lastUpdated: string;
  source: string;
  songs: Song[];
}

const PLAYLIST_FILE = 'apps/web/public/playlist.json';

// Manual video IDs to add
const MANUAL_VIDEO_IDS = [
  'JfXo8VYTfT4',
  'xnLwAiY7_PE',
  'fRw0n87shW4',
  'FjBp30kjzTc',
  '77qc4ZtufzM',
  'mKnQXaIlrMo'
];

// Playlist to scrape
const PLAYLIST_TO_SCRAPE = 'PLF-qYr2hPBv1_WLmZkV5EWtalulirESrz';

/**
 * Load existing playlist
 */
function loadExistingPlaylist(): Playlist | null {
  try {
    if (fs.existsSync(PLAYLIST_FILE)) {
      const data = fs.readFileSync(PLAYLIST_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading existing playlist:', error);
  }
  return null;
}

/**
 * Parse video title to extract artist and song name
 */
function parseVideoTitle(title: string): { artist: string; title: string } {
  // Common formats: "Artist - Title", "Title - Artist", "Artist: Title"
  let artist = 'Unknown Artist';
  let songTitle = title;

  if (title.includes(' - ')) {
    const parts = title.split(' - ');
    artist = parts[0].trim();
    songTitle = parts.slice(1).join(' - ').trim();
  } else if (title.includes(': ')) {
    const parts = title.split(': ');
    artist = parts[0].trim();
    songTitle = parts.slice(1).join(': ').trim();
  }

  return { artist, title: songTitle };
}

/**
 * Fetch video info from YouTube
 */
async function fetchVideoInfo(page: any, videoId: string): Promise<Song | null> {
  try {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    console.log(`📹 Fetching: ${videoUrl}`);

    await page.goto(videoUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await page.waitForTimeout(2000);

    const videoInfo = await page.evaluate(() => {
      const titleElement = document.querySelector('h1.ytd-watch-metadata yt-formatted-string') ||
                          document.querySelector('h1.title');
      const title = titleElement?.textContent?.trim() || '';
      return { title };
    });

    if (!videoInfo.title) {
      console.log(`  ⚠️  Could not get title for ${videoId}`);
      return null;
    }

    const { artist, title } = parseVideoTitle(videoInfo.title);
    console.log(`  ✅ ${artist} - ${title}`);

    return {
      position: 0, // Will be set later
      title,
      artist,
      youtubeId: videoId,
      addedDate: new Date().toISOString(),
      isNew: true
    };
  } catch (error) {
    console.error(`  ❌ Error fetching video ${videoId}:`, error);
    return null;
  }
}

/**
 * Scrape YouTube playlist
 */
async function scrapePlaylist(page: any, playlistId: string): Promise<Song[]> {
  console.log(`\n📋 Scraping playlist: ${playlistId}`);

  const playlistUrl = `https://www.youtube.com/playlist?list=${playlistId}`;

  try {
    await page.goto(playlistUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    console.log('✅ Navigated to playlist');
    await page.waitForTimeout(3000);

    // Scroll to load all videos
    console.log('📜 Scrolling to load all videos...');
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);
    }

    // Extract video information
    const videos = await page.evaluate(() => {
      const videoElements = document.querySelectorAll('ytd-playlist-video-renderer');
      const videoData: Array<{ title: string; url: string; index: number }> = [];

      videoElements.forEach((video, index) => {
        const titleElement = video.querySelector('#video-title');
        const title = titleElement?.textContent?.trim() || '';
        const url = titleElement?.getAttribute('href') || '';

        if (title && url) {
          videoData.push({ title, url, index: index + 1 });
        }
      });

      return videoData;
    });

    console.log(`🎵 Found ${videos.length} videos in playlist\n`);

    // Process videos into songs
    const songs: Song[] = videos
      .map((video, index) => {
        const match = video.url.match(/[?&]v=([^&]+)/);
        const videoId = match ? match[1] : null;

        if (!videoId) return null;

        const { artist, title } = parseVideoTitle(video.title);

        return {
          position: index + 1,
          title,
          artist,
          youtubeId: videoId,
          addedDate: new Date().toISOString(),
          isNew: true
        };
      })
      .filter((song): song is Song => song !== null);

    return songs;
  } catch (error) {
    console.error(`❌ Error scraping playlist:`, error);
    return [];
  }
}

/**
 * Merge new songs with existing ones
 */
function mergeSongs(existingSongs: Song[], newSongs: Song[]): Song[] {
  const existingIds = new Set(existingSongs.map(s => s.youtubeId));
  const mergedSongs: Song[] = [...existingSongs];

  let addedCount = 0;

  for (const song of newSongs) {
    if (!existingIds.has(song.youtubeId)) {
      console.log(`  ✨ NEW: "${song.title}" - ${song.artist}`);
      mergedSongs.push({
        ...song,
        position: mergedSongs.length + 1,
        isNew: true,
        addedDate: new Date().toISOString()
      });
      addedCount++;
    } else {
      console.log(`  ⏭️  SKIP (duplicate): "${song.title}" - ${song.artist}`);
    }
  }

  console.log(`\n📊 Added ${addedCount} new songs`);
  return mergedSongs;
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting manual song addition...\n');

  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    // Load existing playlist
    const existingPlaylist = loadExistingPlaylist();
    if (!existingPlaylist) {
      console.error('❌ Could not load existing playlist');
      process.exit(1);
    }

    console.log(`📚 Current playlist has ${existingPlaylist.songs.length} songs\n`);

    const allNewSongs: Song[] = [];

    // Fetch manual videos
    console.log('📹 Fetching manual videos...\n');
    for (const videoId of MANUAL_VIDEO_IDS) {
      const song = await fetchVideoInfo(page, videoId);
      if (song) {
        allNewSongs.push(song);
      }
      await page.waitForTimeout(1500); // Delay to avoid rate limiting
    }

    // Scrape playlist
    const playlistSongs = await scrapePlaylist(page, PLAYLIST_TO_SCRAPE);
    allNewSongs.push(...playlistSongs);

    await browser.close();

    console.log(`\n🎵 Total songs fetched: ${allNewSongs.length}`);

    // Merge with existing
    console.log('\n🔍 Merging with existing playlist...\n');
    const finalSongs = mergeSongs(existingPlaylist.songs, allNewSongs);

    // Update playlist
    const outputData: Playlist = {
      lastUpdated: new Date().toISOString(),
      source: existingPlaylist.source + ' + Manual additions',
      songs: finalSongs
    };

    // Save to JSON file
    fs.writeFileSync(PLAYLIST_FILE, JSON.stringify(outputData, null, 2));

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Playlist updated: ${PLAYLIST_FILE}`);
    console.log(`📊 Total songs: ${finalSongs.length}`);
    console.log(`✨ New songs: ${finalSongs.filter(s => s.isNew).length}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error);
    await browser.close();
    process.exit(1);
  }
}

main().catch(console.error);
