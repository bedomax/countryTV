import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Serve static files from web app public directory
app.use(express.static(path.join(__dirname, '../../apps/web/public')));

// Start server
app.listen(PORT, () => {
  console.log('🎸 Country MTV Server is running!');
  console.log('');
  console.log(`   🌐 Open in browser: http://localhost:${PORT}`);
  console.log('');
  console.log('   Controls:');
  console.log('   - Click on playlist items to change songs');
  console.log('   - Arrow Right / N: Next song');
  console.log('   - Arrow Left / P: Previous song');
  console.log('   - Space: Play/Pause');
  console.log('');
  console.log('   Press Ctrl+C to stop the server');
});
