import 'dotenv/config';
import { chromium } from 'playwright';
import * as fs from 'fs';

interface Song {
  position: number;
  title: string;
  artist: string;
  date?: string;
  youtubeId?: string;
}

async function searchYouTubeVideo(songTitle: string, artistName: string): Promise<string | null> {
  const searchQuery = `${songTitle} ${artistName} official video`;
  const encodedQuery = encodeURIComponent(searchQuery);
  const searchUrl = `https://www.youtube.com/results?search_query=${encodedQuery}`;

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Find the first video link
    const videoLink = await page.evaluate(() => {
      const videoElement = document.querySelector('a#video-title[href^="/watch?v="]');
      return videoElement ? videoElement.getAttribute('href') : null;
    });

    await browser.close();

    if (videoLink) {
      const videoId = videoLink.split('v=')[1]?.split('&')[0];
      return videoId || null;
    }

    return null;
  } catch (error) {
    console.error(`Error searching for ${songTitle}:`, error);
    await browser.close();
    return null;
  }
}

async function scrapeWikipedia(): Promise<Song[]> {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('🔍 Fetching Wikipedia page...');
    await page.goto('https://en.wikipedia.org/wiki/List_of_Billboard_number-one_country_songs_of_2025', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    console.log('✅ Page loaded successfully');
    await page.waitForTimeout(3000);

    // Extract songs from the table
    const songs = await page.evaluate(() => {
      const rows = document.querySelectorAll('table.wikitable tbody tr');
      const songMap = new Map<string, { title: string; artist: string; date: string }>();

      rows.forEach((row) => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 2) {
          // Get all text from first cell and look for quoted song title
          const titleCellText = cells[0].textContent || '';
          const titleMatch = titleCellText.match(/"([^"]+)"/);
          const title = titleMatch ? titleMatch[1] : '';

          // Get artist from second cell, removing reference numbers
          const artistCellText = cells[1].textContent || '';
          const artist = artistCellText
            .replace(/\[\d+\]/g, '')  // Remove [2], [16], etc
            .replace(/\(.*?\)/g, '')   // Remove parentheses content
            .trim();

          if (title && artist && title !== 'Song' && artist !== 'Artist' && artist.length > 0) {
            const key = `${title}-${artist}`;
            if (!songMap.has(key)) {
              songMap.set(key, {
                title: title,
                artist: artist,
                date: new Date().toISOString().split('T')[0]
              });
            }
          }
        }
      });

      return Array.from(songMap.values());
    });

    await browser.close();

    // Take top 10 unique songs
    const uniqueSongs = songs.slice(0, 10).map((song, index) => ({
      position: index + 1,
      title: song.title,
      artist: song.artist,
      date: song.date
    }));

    return uniqueSongs;

  } catch (error) {
    console.error('❌ Error scraping Wikipedia:', error);
    await browser.close();
    return [];
  }
}

async function main() {
  console.log('🚀 Starting Wikipedia Country Songs Scraper...\n');

  // Scrape songs from Wikipedia
  const songs = await scrapeWikipedia();

  if (songs.length === 0) {
    console.error('❌ No songs found. Exiting...');
    return;
  }

  console.log(`\n🎵 FOUND ${songs.length} BILLBOARD #1 COUNTRY SONGS FROM 2025:\n`);
  console.log('=' .repeat(60));

  songs.forEach(song => {
    console.log(`${song.position}. "${song.title}" - ${song.artist}`);
    if (song.date) console.log(`   Date: ${song.date}`);
  });

  console.log('=' .repeat(60));

  // Search for YouTube videos
  console.log('\n🔍 Searching for YouTube videos...\n');

  for (const song of songs) {
    console.log(`${song.position}. "${song.title}" - ${song.artist}`);
    const youtubeId = await searchYouTubeVideo(song.title, song.artist);

    if (youtubeId) {
      song.youtubeId = youtubeId;
      console.log(`   ✅ Found: https://youtube.com/watch?v=${youtubeId}`);
    } else {
      console.log(`   ❌ Video not found`);
    }
    console.log('');
  }

  console.log('=' .repeat(60));

  // Save to JSON file for the web app
  const outputData = {
    lastUpdated: new Date().toISOString(),
    source: 'Wikipedia - List of Billboard number-one country songs of 2025',
    songs: songs.filter(song => song.youtubeId) // Only include songs with videos
  };

  fs.writeFileSync(
    'apps/web/public/playlist.json',
    JSON.stringify(outputData, null, 2)
  );

  console.log(`\n✅ Playlist saved to apps/web/public/playlist.json`);
  console.log(`📊 Total songs with videos: ${outputData.songs.length}/${songs.length}`);
  console.log('🎉 Ready to launch the web app!\n');
}

main().catch(console.error);
