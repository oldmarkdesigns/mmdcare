// Vercel API route for creating transfer sessions
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    // Generate a unique transfer ID
    const transferId = Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15);
    
    // Store transfer in memory (in production, use a database)
    if (!global.transfers) {
      global.transfers = new Map();
    }
    
    global.transfers.set(transferId, {
      status: 'open',
      files: [],
      createdAt: Date.now()
    });

    res.status(201).json({
      transferId: transferId,
      expiresInSec: 900
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
