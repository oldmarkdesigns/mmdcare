// Vercel API route for Server-Sent Events
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    const { transferId } = req.query;
    
    // Set up Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    // Send initial status
    const transfer = global.transfers?.get(transferId);
    res.write(`data: ${JSON.stringify({ type: "status", status: transfer?.status || "unknown" })}\n\n`);

    // Keep connection alive with periodic pings
    const interval = setInterval(() => {
      try {
        res.write(`data: ${JSON.stringify({ type: "ping", timestamp: Date.now() })}\n\n`);
      } catch (error) {
        clearInterval(interval);
      }
    }, 30000); // Ping every 30 seconds

    // Clean up on disconnect
    req.on('close', () => {
      clearInterval(interval);
    });

    // Note: In a real implementation, you'd want to use a more sophisticated
    // event system like Redis or WebSockets for real-time updates
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
