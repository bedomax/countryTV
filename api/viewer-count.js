// Real viewer count using IP + User Agent to avoid counting same user multiple times
let activeViewers = new Map();

// Clean up old sessions every 15 seconds (shorter for more accuracy)
setInterval(() => {
  const now = Date.now();
  const fifteenSecondsAgo = now - 15000; // Reduced to 15 seconds
  
  for (const [viewerId, lastSeen] of activeViewers.entries()) {
    if (lastSeen < fifteenSecondsAgo) {
      activeViewers.delete(viewerId);
      console.log(`👋 Viewer disconnected: ${viewerId}`);
    }
  }
}, 15000);

// Function to generate unique viewer ID based on IP and User Agent
function getViewerId(req) {
  const ip = req.headers['x-forwarded-for'] || 
             req.headers['x-real-ip'] || 
             req.connection?.remoteAddress || 
             'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  
  // Create a hash-like ID from IP + User Agent (first 8 chars of each)
  const ipShort = ip.toString().substring(0, 8);
  const uaShort = userAgent.toString().substring(0, 8);
  
  return `${ipShort}_${uaShort}`;
}

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'GET') {
    // Get unique viewer ID based on IP + User Agent
    const viewerId = getViewerId(req);
    
    // Update viewer timestamp
    const wasNew = !activeViewers.has(viewerId);
    activeViewers.set(viewerId, Date.now());
    
    if (wasNew) {
      console.log(`👤 New viewer connected: ${viewerId}`);
    }
    
    // Count active viewers (viewers who have been active in last 15 seconds)
    const now = Date.now();
    const fifteenSecondsAgo = now - 15000;
    const realViewerCount = Array.from(activeViewers.values()).filter(lastSeen => lastSeen > fifteenSecondsAgo).length;
    
    console.log(`📊 Real viewer count: ${realViewerCount} (${activeViewers.size} total viewers)`);
    
    res.status(200).json({ 
      count: realViewerCount,
      timestamp: new Date().toISOString(),
      source: 'real-count',
      viewers: activeViewers.size,
      active: realViewerCount,
      viewerId: viewerId
    });
    
  } else if (req.method === 'POST') {
    // Heartbeat endpoint to keep viewer alive
    const viewerId = getViewerId(req);
    activeViewers.set(viewerId, Date.now());
    res.status(200).json({ status: 'heartbeat received' });
    
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
