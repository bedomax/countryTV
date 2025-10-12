import { chromium } from 'playwright';
import OpenAI from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  console.log('🚀 Starting AI-powered Billboard scraper...');
  
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
    
    console.log('\n🎵 TOP 5 COUNTRY SONGS ON BILLBOARD:\n');
    console.log('=' .repeat(50));
    
    result.songs.forEach((song: any, index: number) => {
      console.log(`${song.position}. "${song.title}"`);
      console.log(`   Artist: ${song.artist}`);
      if (index < 4) console.log('');
    });
    
    console.log('=' .repeat(50));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
