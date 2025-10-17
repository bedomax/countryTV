import cron from 'node-cron';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

type PlaylistSource = 'youtube' | 'spotify' | 'both';

/**
 * Service to automatically update playlist every 24 hours
 */
class AutoUpdateService {
  private isRunning: boolean = false;
  private lastUpdate: Date | null = null;
  private source: PlaylistSource = 'both'; // Default to update from both sources

  /**
   * Start the auto-update service
   * Runs every day at 3 AM
   * @param source - Which playlist source to update from ('youtube', 'spotify', or 'both')
   */
  start(source: PlaylistSource = 'both') {
    this.source = source;
    console.log('🚀 Starting Auto-Update Service...');
    console.log('⏰ Schedule: Every 24 hours at 3:00 AM');
    console.log(`📋 Sources: ${source}`);

    // Schedule task to run every day at 3:00 AM
    cron.schedule('0 3 * * *', async () => {
      await this.updatePlaylist();
    });

    // Also run immediately on startup if no recent update
    this.checkAndRunInitialUpdate();

    console.log('✅ Auto-Update Service started successfully');
  }

  /**
   * Check if we need to run an initial update
   */
  private async checkAndRunInitialUpdate() {
    const fs = await import('fs');
    const PLAYLIST_FILE = 'apps/web/public/playlist.json';

    try {
      if (fs.existsSync(PLAYLIST_FILE)) {
        const data = fs.readFileSync(PLAYLIST_FILE, 'utf-8');
        const playlist = JSON.parse(data);
        const lastUpdated = new Date(playlist.lastUpdated);
        const now = new Date();
        const hoursSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);

        if (hoursSinceUpdate >= 24) {
          console.log('⚠️  Playlist is more than 24 hours old. Running update now...');
          await this.updatePlaylist();
        } else {
          console.log(`✅ Playlist is up to date (last update: ${hoursSinceUpdate.toFixed(1)} hours ago)`);
        }
      } else {
        console.log('⚠️  No playlist found. Running initial update...');
        await this.updatePlaylist();
      }
    } catch (error) {
      console.error('Error checking for initial update:', error);
    }
  }

  /**
   * Update the playlist by running the scraper(s)
   */
  private async updatePlaylist() {
    if (this.isRunning) {
      console.log('⚠️  Update already in progress, skipping...');
      return;
    }

    this.isRunning = true;

    try {
      console.log('\n' + '='.repeat(60));
      console.log('🔄 Starting playlist update...');
      console.log('⏰ Time:', new Date().toLocaleString());
      console.log(`📋 Source(s): ${this.source}`);
      console.log('='.repeat(60) + '\n');

      // Run scraper(s) based on source configuration
      if (this.source === 'youtube' || this.source === 'both') {
        console.log('▶️  Running YouTube scraper...\n');
        const { stdout: youtubeOut, stderr: youtubeErr } = await execAsync('npm run scrape:youtube');

        if (youtubeOut) {
          console.log(youtubeOut);
        }
        if (youtubeErr) {
          console.error('YouTube scraper stderr:', youtubeErr);
        }
      }

      if (this.source === 'spotify' || this.source === 'both') {
        console.log('\n🎵 Running Spotify scraper...\n');
        const { stdout: spotifyOut, stderr: spotifyErr } = await execAsync('npm run scrape:spotify');

        if (spotifyOut) {
          console.log(spotifyOut);
        }
        if (spotifyErr) {
          console.error('Spotify scraper stderr:', spotifyErr);
        }
      }

      this.lastUpdate = new Date();

      console.log('\n' + '='.repeat(60));
      console.log('✅ Playlist update completed successfully');
      console.log('⏰ Time:', this.lastUpdate.toLocaleString());
      console.log('='.repeat(60) + '\n');

    } catch (error) {
      console.error('\n' + '='.repeat(60));
      console.error('❌ Error updating playlist:', error);
      console.error('='.repeat(60) + '\n');
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Manually trigger an update
   */
  async triggerUpdate() {
    console.log('🔄 Manual update triggered');
    await this.updatePlaylist();
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastUpdate: this.lastUpdate,
      nextUpdate: this.getNextScheduledUpdate()
    };
  }

  /**
   * Calculate next scheduled update time (3 AM next day)
   */
  private getNextScheduledUpdate(): Date {
    const now = new Date();
    const next = new Date();
    next.setHours(3, 0, 0, 0);

    if (now.getHours() >= 3) {
      next.setDate(next.getDate() + 1);
    }

    return next;
  }
}

// Export singleton instance
export const autoUpdateService = new AutoUpdateService();
