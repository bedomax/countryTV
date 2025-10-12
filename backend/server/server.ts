import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

// Only initialize Socket.IO if not in Vercel (Vercel doesn't support persistent WebSockets)
const isVercel = process.env.VERCEL === '1';
let io: SocketIOServer | null = null;

if (!isVercel) {
  io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
}

const PORT = process.env.PORT || 3000;

// Serve static files from web app public directory
app.use(express.static(path.join(__dirname, '../../apps/web/public')));

// Track connected users (only for local development)
let connectedUsers = new Set();
let viewerCount = 0;

// Socket.IO connection handling (only if Socket.IO is available)
if (io) {
  io.on('connection', (socket) => {
    console.log('👤 User connected:', socket.id);
    
    // Add user to connected set
    connectedUsers.add(socket.id);
    viewerCount = connectedUsers.size;
    
    // Broadcast updated viewer count
    io.emit('viewerCount', viewerCount);
    console.log(`📊 Current viewers: ${viewerCount}`);
    
    // Handle user disconnection
    socket.on('disconnect', () => {
      console.log('👋 User disconnected:', socket.id);
      
      // Remove user from connected set
      connectedUsers.delete(socket.id);
      viewerCount = connectedUsers.size;
      
      // Broadcast updated viewer count
      io.emit('viewerCount', viewerCount);
      console.log(`📊 Current viewers: ${viewerCount}`);
    });
  });
}

// API endpoint for viewer count (for Vercel compatibility)
app.get('/api/viewer-count', (req, res) => {
  if (isVercel) {
    // In Vercel, return a simulated count based on time
    const baseCount = 1200;
    const timeVariation = Math.floor(Date.now() / 10000) % 100;
    const viewerCount = baseCount + timeVariation;
    res.json({ count: viewerCount });
  } else {
    // In local development, return real count
    res.json({ count: viewerCount });
  }
});

// Start server
server.listen(PORT, () => {
  console.log('🎸 Country TV Server is running!');
  console.log('');
  console.log(`   🌐 Open in browser: http://localhost:${PORT}`);
  if (isVercel) {
    console.log('   📊 Simulated viewer counter (Vercel mode)');
  } else {
    console.log('   📊 Real-time viewer counter enabled');
  }
  console.log('');
  console.log('   Controls:');
  console.log('   - Click on playlist items to change songs');
  console.log('   - Arrow Right / N: Next song');
  console.log('   - Arrow Left / P: Previous song');
  console.log('   - Space: Play/Pause');
  console.log('');
  console.log('   Press Ctrl+C to stop the server');
});
