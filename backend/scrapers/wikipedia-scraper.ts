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
  const allSongs = new Map<string, { title: string; artist: string; year: string }>();

  // List of Wikipedia pages to scrape (2020-2025)
  const years = [2025, 2024, 2023, 2022, 2021, 2020];

  try {
    for (const year of years) {
      // Scrape multiple country music charts for more songs
      const urls = [
        { url: `https://en.wikipedia.org/wiki/List_of_Billboard_number-one_country_songs_of_${year}`, name: 'Hot Country Songs #1' },
        { url: `https://en.wikipedia.org/wiki/List_of_number-one_country_songs_of_${year}_(U.S.)`, name: 'Country Airplay #1' },
        { url: `https://en.wikipedia.org/wiki/Billboard_Hot_Country_Songs_${year}`, name: 'Hot Country Songs Top' },
        { url: `https://en.wikipedia.org/wiki/Billboard_Country_Airplay_${year}`, name: 'Country Airplay Top' }
      ];

      for (const { url, name } of urls) {
        console.log(`\n🔍 Fetching ${year} - ${name}...`);

        try {
          await page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: 60000
          });

          console.log(`✅ ${year} ${name} loaded`);
          await page.waitForTimeout(2000);

          // Extract songs from all tables on the page
          const songs = await page.evaluate((currentYear) => {
            const tables = document.querySelectorAll('table.wikitable');
            const yearSongs: { title: string; artist: string; year: string }[] = [];

            tables.forEach((table) => {
              const rows = table.querySelectorAll('tbody tr');

              rows.forEach((row) => {
                const cells = row.querySelectorAll('td');

                if (cells.length >= 2) {
                  // Look for song title in first cell (with quotes or link)
                  const titleCellText = cells[0].textContent || '';
                  const titleMatch = titleCellText.match(/"([^"]+)"/);
                  let title = titleMatch ? titleMatch[1] : '';

                  // If no quoted text, try to get from link
                  if (!title) {
                    const link = cells[0].querySelector('a');
                    if (link) {
                      title = link.textContent?.trim() || '';
                    }
                  }

                  // If still no title, try to get from any text in the cell
                  if (!title) {
                    title = titleCellText.trim();
                  }

                  // Get artist from second cell, removing reference numbers
                  let artistCellText = cells[1].textContent || '';
                  let artist = artistCellText
                    .replace(/\[\d+\]/g, '')  // Remove [2], [16], etc
                    .replace(/\(featuring.*?\)/gi, '')   // Keep main artist, remove featuring
                    .trim();

                  // If artist is empty, try third cell
                  if (!artist && cells.length >= 3) {
                    artistCellText = cells[2].textContent || '';
                    artist = artistCellText
                      .replace(/\[\d+\]/g, '')
                      .trim();
                  }

                  // Clean up title and artist
                  title = title.replace(/\[\d+\]/g, '').trim();

                  // More lenient filtering to get more songs
                  if (title && artist &&
                      title !== 'Song' && title !== 'Title' && title !== 'Date' &&
                      artist !== 'Artist' && artist !== 'Performer' && artist !== 'Weeks' &&
                      artist.length > 0 && title.length > 0 &&
                      !title.match(/^\d+$/) && // Skip pure numbers
                      !artist.match(/^\d+$/)) { // Skip pure numbers
                    yearSongs.push({
                      title: title,
                      artist: artist,
                      year: currentYear
                    });
                  }
                }
              });
            });

            return yearSongs;
          }, String(year));

          // Add to main collection
          songs.forEach(song => {
            const key = `${song.title}-${song.artist}`;
            if (!allSongs.has(key)) {
              allSongs.set(key, song);
            }
          });

          console.log(`   Found ${songs.length} songs from ${year} ${name}`);

        } catch (error) {
          console.log(`   ⚠️  Could not fetch ${year} ${name}, skipping...`);
        }
      }
    }

    await browser.close();

    // Convert to array and shuffle them randomly
    const uniqueSongs = Array.from(allSongs.values());
    
    // Shuffle the array using Fisher-Yates algorithm
    for (let i = uniqueSongs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [uniqueSongs[i], uniqueSongs[j]] = [uniqueSongs[j], uniqueSongs[i]];
    }
    
    // Number them after shuffling
    const shuffledSongs = uniqueSongs.map((song, index) => ({
      position: index + 1,
      title: song.title,
      artist: song.artist,
      date: song.year
    }));

    return shuffledSongs;

  } catch (error) {
    console.error('❌ Error scraping Wikipedia:', error);
    await browser.close();
    return [];
  }
}

async function main() {
  console.log('🚀 Starting Wikipedia Country Songs Scraper...');
  console.log('📅 Scraping Billboard Country songs from 2020-2025');
  console.log('📊 Sources: Hot Country Songs + Country Airplay (Top Charts)\n');

  // Scrape songs from Wikipedia
  const songs = await scrapeWikipedia();

  if (songs.length === 0) {
    console.error('❌ No songs found. Exiting...');
    return;
  }

  console.log(`\n🎵 FOUND ${songs.length} UNIQUE BILLBOARD COUNTRY SONGS (SHUFFLED):\n`);
  console.log('=' .repeat(60));

  songs.slice(0, 15).forEach(song => {
    console.log(`${song.position}. "${song.title}" - ${song.artist} (${song.date})`);
  });

  if (songs.length > 15) {
    console.log(`... and ${songs.length - 15} more songs`);
  }

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
  }

  console.log('\n' + '=' .repeat(60));

  // Save to JSON file for the web app
  const outputData = {
    lastUpdated: new Date().toISOString(),
    source: 'Wikipedia - Billboard Country Songs (2020-2025) - Hot Country Songs + Country Airplay (Top Charts)',
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
