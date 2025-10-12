import { chromium } from 'playwright';
import OpenAI from 'openai';
import { z } from 'zod';
import * as fs from 'fs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Song {
  position: number;
  title: string;
  artist: string;
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

async function main() {
  console.log('🚀 Starting Country MTV scraper...');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Navigate to Billboard Country Charts
    await page.goto('https://www.billboard.com/charts/genre/country/', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });
    console.log('✅ Navigated to Billboard Country Charts page');

    // Wait for the page to load
    await page.waitForTimeout(8000);

    // Get the page content
    const content = await page.content();

    // Use AI to extract the top 5 songs
    console.log('🤖 Using AI to extract songs...');

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a web scraper that extracts music chart data. Extract the top 5 country songs from the Billboard Hot Country Songs chart.'
        },
        {
          role: 'user',
          content: `Extract the top 5 country songs from this HTML content. Return only the song title and artist name for each song:

${content.substring(0, 8000)}` // Limit content size
        }
      ],
      functions: [
        {
          name: 'extract_songs',
          description: 'Extract the top 5 country songs',
          parameters: {
            type: 'object',
            properties: {
              songs: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    position: { type: 'number', description: 'Chart position (1-5)' },
                    title: { type: 'string', description: 'Song title' },
                    artist: { type: 'string', description: 'Artist name' }
                  },
                  required: ['position', 'title', 'artist']
                },
                minItems: 5,
                maxItems: 5
              }
            },
            required: ['songs']
          }
        }
      ],
      function_call: { name: 'extract_songs' }
    });

    const result = JSON.parse(completion.choices[0].message.function_call?.arguments || '{}');
    const songs: Song[] = result.songs;

    console.log('\n🎵 TOP 5 COUNTRY SONGS ON BILLBOARD:\n');
    console.log('=' .repeat(50));

    // Search for YouTube videos for each song
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

    console.log('=' .repeat(50));

    // Save to JSON file for the web app
    const outputData = {
      lastUpdated: new Date().toISOString(),
      songs: songs
    };

    fs.writeFileSync(
      'public/playlist.json',
      JSON.stringify(outputData, null, 2)
    );

    console.log('\n✅ Playlist saved to public/playlist.json');
    console.log('🎉 Ready to launch the web app!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
