import "dotenv/config";
import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";

async function main() {
  const stagehand = new Stagehand({
    env: "LOCAL",
    modelName: "gpt-3.5-turbo",
    modelClientOptions: {
      apiKey: process.env.OPENAI_API_KEY,
    },
  });

  await stagehand.init();

  console.log(`Stagehand Session Started`);
  if (stagehand.browserbaseSessionID) {
    console.log(
      `Watch live: https://browserbase.com/sessions/${stagehand.browserbaseSessionID}`
    );
  }

  const page = stagehand.page;

  try {
    // Navigate to Billboard Country Charts
    await page.goto("https://www.billboard.com/charts/genre/country/", {
      waitUntil: "domcontentloaded",
      timeout: 60000
    });
    console.log("Navigated to Billboard Country Charts page");

    // Wait for the page to load completely
    await page.waitForTimeout(8000);

    // Extract the top 5 country songs using AI
    const topSongs = await page.extract({
      instruction: "Extract the top 5 country songs from the Hot Country Songs chart, including song title, artist name, and chart position",
      schema: z.object({
        songs: z.array(z.object({
          position: z.number().describe("the chart position (1-5)"),
          title: z.string().describe("the song title"),
          artist: z.string().describe("the artist name")
        })).length(5).describe("array of exactly 5 songs")
      })
    });

    console.log("\n🎵 TOP 5 COUNTRY SONGS ON BILLBOARD:\n");
    console.log("=" .repeat(50));
    
    topSongs.songs.forEach((song, index) => {
      console.log(`${song.position}. "${song.title}"`);
      console.log(`   Artist: ${song.artist}`);
      if (index < 4) console.log(""); // Add spacing between songs
    });
    
    console.log("=" .repeat(50));

  } catch (error) {
    console.error("Error extracting country songs:", error);
  } finally {
    await stagehand.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
