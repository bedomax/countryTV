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

const PLAYLIST_URL = 'https://www.youtube.com/playlist?list=PLeDakahyfrO-XXf8riL8LLpO838tur7CQ';
const PLAYLIST_FILE = 'apps/web/public/playlist.json';

/**
 * Extract video ID from YouTube URL
 */
function extractVideoId(url: string): string | null {
  const match = url.match(/[?&]v=([^&]+)/);
  return match ? match[1] : null;
}

/**
 * Load existing playlist to check for duplicates
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
 * Scrape YouTube playlist
 */
async function scrapeYouTubePlaylist(): Promise<Song[]> {
  console.log('🚀 Starting YouTube playlist scraper...');
  console.log(`📋 Playlist: ${PLAYLIST_URL}`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    // Navigate to the playlist
    await page.goto(PLAYLIST_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    console.log('✅ Navigated to playlist');

    // Wait for videos to load
    await page.waitForTimeout(5000);

    // Scroll to load all videos
    console.log('📜 Scrolling to load all videos...');
    let previousHeight = 0;
    let currentHeight = await page.evaluate(() => document.body.scrollHeight);

    while (previousHeight !== currentHeight) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);
      previousHeight = currentHeight;
      currentHeight = await page.evaluate(() => document.body.scrollHeight);
    }

    console.log('✅ All videos loaded');

    // Extract video information
    const videos = await page.evaluate(() => {
      // Try multiple selectors for different YouTube layouts
      let videoElements = document.querySelectorAll('ytd-playlist-video-renderer');

      // If no videos found, try alternative selectors
      if (videoElements.length === 0) {
        videoElements = document.querySelectorAll('ytd-playlist-panel-video-renderer');
      }
      if (videoElements.length === 0) {
        videoElements = document.querySelectorAll('ytd-playlist-video-list-renderer ytd-playlist-video-renderer');
      }

      const videoData: Array<{ title: string; url: string; index: number }> = [];

      videoElements.forEach((video, index) => {
        // Try multiple selectors for title
        let titleElement = video.querySelector('#video-title');
        if (!titleElement) {
          titleElement = video.querySelector('a#wc-endpoint');
        }
        if (!titleElement) {
          titleElement = video.querySelector('a.yt-simple-endpoint');
        }

        const title = titleElement?.textContent?.trim() || '';
        const url = titleElement?.getAttribute('href') || '';

        if (title && url) {
          videoData.push({
            title: title,
            url: url,
            index: index + 1
          });
        }
      });

      return videoData;
    });

    await browser.close();

    console.log(`\n🎵 Found ${videos.length} videos in playlist\n`);

    // Process videos into songs
    const songs: Song[] = videos.map((video, index) => {
      const videoId = extractVideoId(video.url);

      // Try to parse artist and title
      // Common formats: "Artist - Title", "Title - Artist", "Artist: Title"
      let artist = 'Unknown Artist';
      let title = video.title;

      if (video.title.includes(' - ')) {
        const parts = video.title.split(' - ');
        artist = parts[0].trim();
        title = parts.slice(1).join(' - ').trim();
      } else if (video.title.includes(': ')) {
        const parts = video.title.split(': ');
        artist = parts[0].trim();
        title = parts.slice(1).join(': ').trim();
      }

      return {
        position: index + 1,
        title: title,
        artist: artist,
        youtubeId: videoId || '',
        addedDate: new Date().toISOString()
      };
    }).filter(song => song.youtubeId); // Only keep videos with valid IDs

    return songs;

  } catch (error) {
    console.error('❌ Error scraping playlist:', error);
    await browser.close();
    throw error;
  }
}

/**
 * Merge new songs with existing ones, marking duplicates and new songs
 */
function mergeSongs(existingSongs: Song[], newSongs: Song[]): Song[] {
  const existingIds = new Set(existingSongs.map(s => s.youtubeId));
  const mergedSongs: Song[] = [];

  // Add all new songs, marking which ones are new
  for (const song of newSongs) {
    if (!existingIds.has(song.youtubeId)) {
      // This is a new song
      console.log(`  ✨ NEW: "${song.title}" - ${song.artist}`);
      mergedSongs.push({
        ...song,
        isNew: true,
        addedDate: new Date().toISOString()
      });
    } else {
      // This song already exists
      const existingSong = existingSongs.find(s => s.youtubeId === song.youtubeId);
      if (existingSong) {
        mergedSongs.push({
          ...existingSong,
          position: song.position // Update position
        });
      }
    }
  }

  return mergedSongs;
}

/**
 * Remove 'isNew' flag from songs older than 7 days
 */
function cleanupNewFlags(songs: Song[]): Song[] {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return songs.map(song => {
    if (song.isNew && song.addedDate) {
      const addedDate = new Date(song.addedDate);
      if (addedDate < sevenDaysAgo) {
        // Remove isNew flag if song is older than 7 days
        const { isNew, ...songWithoutNew } = song;
        return songWithoutNew;
      }
    }
    return song;
  });
}

/**
 * Main function
 */
async function main() {
  try {
    // Load existing playlist
    const existingPlaylist = loadExistingPlaylist();

    // Scrape new songs from YouTube playlist
    const newSongs = await scrapeYouTubePlaylist();

    if (newSongs.length === 0) {
      console.log('⚠️  No songs found in playlist');
      return;
    }

    // Merge with existing songs
    let finalSongs: Song[];

    if (existingPlaylist && existingPlaylist.songs) {
      console.log('\n🔍 Checking for duplicates...\n');
      finalSongs = mergeSongs(existingPlaylist.songs, newSongs);
    } else {
      console.log('\n✨ Creating new playlist (no existing data found)\n');
      finalSongs = newSongs.map(song => ({ ...song, isNew: true }));
    }

    // Clean up old 'isNew' flags
    finalSongs = cleanupNewFlags(finalSongs);

    // Count new songs
    const newSongsCount = finalSongs.filter(s => s.isNew).length;

    // Create output data
    const outputData: Playlist = {
      lastUpdated: new Date().toISOString(),
      source: 'YouTube Playlist - Country Music 24/7',
      songs: finalSongs
    };

    // Save to JSON file
    fs.writeFileSync(PLAYLIST_FILE, JSON.stringify(outputData, null, 2));

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Playlist saved to ${PLAYLIST_FILE}`);
    console.log(`📊 Total songs: ${finalSongs.length}`);
    console.log(`✨ New songs: ${newSongsCount}`);
    console.log('='.repeat(60));
    console.log('\n🎉 Ready to launch the web app!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main().catch(console.error);
