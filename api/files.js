// Local API endpoint for retrieving uploaded files
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
    
    console.log('=== LOCAL FILES GET REQUEST ===');
    console.log('Transfer ID:', transferId);
    
    if (!transferId) {
      return res.status(400).json({ error: 'No transfer ID provided' });
    }

    // Get transfer from global storage
    let transfer = global.__mmd_transfers?.get(transferId);
    console.log('Found transfer:', transfer);
    
    if (!transfer) {
      console.log('Transfer not found for ID:', transferId, '- creating new transfer record');
      // Create a new transfer record if it doesn't exist
      transfer = {
        status: 'open',
        files: [],
        createdAt: Date.now()
      };
      global.__mmd_transfers.set(transferId, transfer);
      console.log('Created new transfer record for ID:', transferId);
    }

    const response = {
      transferId,
      status: transfer.status,
      files: transfer.files || []
    };
    
    console.log('Returning files response:', response);
    res.status(200).json(response);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
