// Local API endpoint for creating new transfers
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
    console.log('=== LOCAL TRANSFERS POST REQUEST ===');
    
    // Generate a unique transfer ID
    const transferId = 'transfer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    console.log('Generated transfer ID:', transferId);
    
    // Initialize global storage if needed
    if (!global.__mmd_transfers) {
      global.__mmd_transfers = new Map();
    }
    
    // Create new transfer record
    const transfer = {
      status: 'open',
      files: [],
      createdAt: Date.now()
    };
    
    global.__mmd_transfers.set(transferId, transfer);
    console.log('Created new transfer:', transfer);
    
    res.status(200).json({ transferId });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}