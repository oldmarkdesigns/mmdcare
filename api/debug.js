// Local API endpoint for debugging
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    const { transferId } = req.query;
    
    console.log('=== LOCAL DEBUG GET REQUEST ===');
    console.log('Requested transfer ID:', transferId);
    
    // Get all transfers from global storage
    const transfers = global.__mmd_transfers || new Map();
    const transfersArray = Array.from(transfers.entries());
    console.log('All transfer IDs:', transfersArray.map(([id]) => id));
    console.log('Storage size:', transfersArray.length);
    
    if (transferId) {
      const transfer = transfers.get(transferId);
      console.log('Specific transfer:', transfer);
      
      res.status(200).json({
        transferId,
        transfer,
        allTransfers: transfersArray,
        globalStateSize: transfersArray.length
      });
    } else {
      res.status(200).json({
        allTransfers: transfersArray,
        globalStateSize: transfersArray.length,
        timestamp: new Date().toISOString()
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
