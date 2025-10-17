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

const SPOTIFY_PLAYLIST_URL = 'https://open.spotify.com/playlist/2Hi4RV1DJHHiSDcwYFFKeR';
const PLAYLIST_FILE = 'apps/web/public/playlist.json';

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
 * Search for a song on YouTube and get the video ID
 */
async function searchYouTubeForSong(
  page: any,
  artist: string,
  title: string
): Promise<string | null> {
  try {
    const searchQuery = `${artist} ${title} official`;
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;

    await page.goto(searchUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    await page.waitForTimeout(2000);

    // Extract the first video result
    const videoId = await page.evaluate(() => {
      // Try to find the first video renderer
      const videoRenderer = document.querySelector('ytd-video-renderer');
      if (videoRenderer) {
        const link = videoRenderer.querySelector('a#video-title');
        const href = link?.getAttribute('href');
        if (href) {
          const match = href.match(/[?&]v=([^&]+)/);
          return match ? match[1] : null;
        }
      }
      return null;
    });

    if (videoId) {
      console.log(`  ✅ Found: ${artist} - ${title} (${videoId})`);
      return videoId;
    } else {
      console.log(`  ⚠️  Not found: ${artist} - ${title}`);
      return null;
    }
  } catch (error) {
    console.error(`  ❌ Error searching for ${artist} - ${title}:`, error);
    return null;
  }
}

/**
 * Scrape Spotify playlist and get YouTube IDs for each song
 */
async function scrapeSpotifyPlaylist(): Promise<Song[]> {
  console.log('🚀 Starting Spotify playlist scraper...');
  console.log(`📋 Playlist: ${SPOTIFY_PLAYLIST_URL}`);

  const browser = await chromium.launch({
    headless: false, // Set to false to see what's happening
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  try {
    // Navigate to the Spotify playlist
    console.log('📱 Navigating to Spotify playlist...');
    await page.goto(SPOTIFY_PLAYLIST_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    console.log('✅ Navigated to Spotify playlist');

    // Wait for content to load
    await page.waitForTimeout(5000);

    // Scroll to load all tracks
    console.log('📜 Scrolling to load all tracks...');
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await page.waitForTimeout(1000);
    }

    console.log('✅ Content loaded');

    // Extract track information from Spotify
    const spotifyTracks = await page.evaluate(() => {
      const tracks: Array<{ title: string; artist: string; index: number }> = [];

      // Try different selectors for Spotify's track list
      // Spotify uses different selectors depending on the layout
      const trackElements = document.querySelectorAll('[data-testid="tracklist-row"]');

      trackElements.forEach((track, index) => {
        try {
          // Try to find song title
          const titleElement = track.querySelector('[data-testid="internal-track-link"]') ||
                              track.querySelector('a[href*="/track/"]');
          const title = titleElement?.textContent?.trim() || '';

          // Try to find artist name
          const artistElement = track.querySelector('[data-testid="internal-track-link"] + span a') ||
                               track.querySelector('a[href*="/artist/"]');
          const artist = artistElement?.textContent?.trim() || '';

          if (title && artist) {
            tracks.push({
              title,
              artist,
              index: index + 1
            });
          }
        } catch (err) {
          console.error('Error parsing track:', err);
        }
      });

      return tracks;
    });

    console.log(`\n🎵 Found ${spotifyTracks.length} tracks in Spotify playlist\n`);

    if (spotifyTracks.length === 0) {
      console.log('⚠️  No tracks found. Spotify might have changed its layout.');
      console.log('📸 Taking screenshot for debugging...');
      await page.screenshot({ path: 'spotify-debug.png', fullPage: true });
      await browser.close();
      return [];
    }

    // Now search each track on YouTube
    console.log('🔍 Searching for songs on YouTube...\n');
    const songs: Song[] = [];

    for (const track of spotifyTracks) {
      const youtubeId = await searchYouTubeForSong(page, track.artist, track.title);

      if (youtubeId) {
        songs.push({
          position: track.index,
          title: track.title,
          artist: track.artist,
          youtubeId: youtubeId,
          addedDate: new Date().toISOString()
        });
      }

      // Add a small delay to avoid rate limiting
      await page.waitForTimeout(1500);
    }

    await browser.close();

    console.log(`\n✅ Successfully found ${songs.length}/${spotifyTracks.length} songs on YouTube\n`);
    return songs;

  } catch (error) {
    console.error('❌ Error scraping Spotify playlist:', error);
    await page.screenshot({ path: 'spotify-error.png', fullPage: true });
    await browser.close();
    throw error;
  }
}

/**
 * Merge new songs with existing ones, marking duplicates and new songs
 */
function mergeSongs(existingSongs: Song[], newSongs: Song[]): Song[] {
  const existingIds = new Set(existingSongs.map(s => s.youtubeId));
  const mergedSongs: Song[] = [...existingSongs]; // Start with existing songs

  // Add only new songs that don't exist
  for (const song of newSongs) {
    if (!existingIds.has(song.youtubeId)) {
      // This is a new song
      console.log(`  ✨ NEW: "${song.title}" - ${song.artist}`);
      mergedSongs.push({
        ...song,
        position: mergedSongs.length + 1, // Append at the end
        isNew: true,
        addedDate: new Date().toISOString()
      });
    } else {
      console.log(`  ⏭️  SKIP (duplicate): "${song.title}" - ${song.artist}`);
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

    // Scrape new songs from Spotify playlist
    const newSongs = await scrapeSpotifyPlaylist();

    if (newSongs.length === 0) {
      console.log('⚠️  No songs found or matched on YouTube');
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
      source: 'Spotify Playlist + YouTube - Country Music Collection',
      songs: finalSongs
    };

    // Save to JSON file
    fs.writeFileSync(PLAYLIST_FILE, JSON.stringify(outputData, null, 2));

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Playlist saved to ${PLAYLIST_FILE}`);
    console.log(`📊 Total songs: ${finalSongs.length}`);
    console.log(`✨ New songs added: ${newSongsCount}`);
    console.log('='.repeat(60));
    console.log('\n🎉 Ready to launch the web app!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main().catch(console.error);
