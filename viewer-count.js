// Vercel API endpoint for viewer count
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'GET') {
    // Simulate realistic viewer count that changes over time
    const baseCount = 1200;
    const timeVariation = Math.floor(Date.now() / 10000) % 100; // Changes every 10 seconds
    const randomVariation = Math.floor(Math.random() * 20) - 10; // -10 to +10
    const viewerCount = Math.max(800, Math.min(2500, baseCount + timeVariation + randomVariation));
    
    console.log(`📊 Vercel API viewer count: ${viewerCount}`);
    
    res.status(200).json({ 
      count: viewerCount,
      timestamp: new Date().toISOString(),
      source: 'vercel-api'
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
