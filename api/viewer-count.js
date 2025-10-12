// Real viewer count using Vercel KV or simple in-memory storage
// For now, using a simple approach with session tracking

// In-memory storage for active sessions (in production, use Vercel KV)
let activeSessions = new Map();
let sessionCounter = 0;

// Clean up old sessions every 30 seconds
setInterval(() => {
  const now = Date.now();
  const thirtySecondsAgo = now - 30000;
  
  for (const [sessionId, lastSeen] of activeSessions.entries()) {
    if (lastSeen < thirtySecondsAgo) {
      activeSessions.delete(sessionId);
    }
  }
}, 30000);

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'GET') {
    // Get or create session ID
    const sessionId = req.headers['x-session-id'] || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Update session timestamp
    activeSessions.set(sessionId, Date.now());
    
    // Count active sessions (viewers who have been active in last 30 seconds)
    const now = Date.now();
    const thirtySecondsAgo = now - 30000;
    const activeViewers = Array.from(activeSessions.values()).filter(lastSeen => lastSeen > thirtySecondsAgo).length;
    
    // Ensure minimum count of 1 (at least the current user)
    const viewerCount = Math.max(1, activeViewers);
    
    console.log(`📊 Real viewer count: ${viewerCount} (${activeSessions.size} total sessions)`);
    
    res.status(200).json({ 
      count: viewerCount,
      timestamp: new Date().toISOString(),
      source: 'real-count',
      sessions: activeSessions.size,
      active: activeViewers
    });
    
    // Send session ID back to client
    res.setHeader('X-Session-ID', sessionId);
    
  } else if (req.method === 'POST') {
    // Heartbeat endpoint to keep session alive
    const sessionId = req.headers['x-session-id'];
    if (sessionId) {
      activeSessions.set(sessionId, Date.now());
      res.status(200).json({ status: 'heartbeat received' });
    } else {
      res.status(400).json({ error: 'Session ID required' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
