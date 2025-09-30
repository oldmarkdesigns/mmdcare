// Local API endpoint for transfer completion
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
    console.log('=== LOCAL COMPLETION GET REQUEST ===');
    console.log('Transfer ID:', transferId);
    
    if (!transferId) {
      return res.status(400).json({ error: 'No transfer ID provided' });
    }

    // Get transfer from global storage
    const transfer = global.__mmd_transfers?.get(transferId);
    console.log('Found transfer:', transfer);
    
    const closed = transfer && transfer.status === 'closed';
    const status = closed ? 'closed' : 'open';
    console.log('Returning status:', status);
    
    return res.status(200).json({ status });
  }

  if (req.method === 'POST') {
    const { transferId } = req.query;
    console.log('=== LOCAL COMPLETION POST REQUEST ===');
    console.log('Transfer ID:', transferId);
    
    if (!transferId) {
      return res.status(400).json({ error: 'No transfer ID provided' });
    }

    try {
      // Get or create transfer
      let transfer = global.__mmd_transfers?.get(transferId);
      if (!transfer) {
        console.log('Transfer not found for completion POST, creating new record and marking closed:', transferId);
        transfer = { status: 'closed', files: [], createdAt: Date.now() };
      } else {
        transfer.status = 'closed';
      }
      
      global.__mmd_transfers.set(transferId, transfer);
      console.log('Updated transfer status to closed for:', transferId);
      console.log('Final transfer object:', transfer);

      console.log('Sending 204 response for completion');
      res.status(204).end();
    } catch (error) {
      console.error('Completion error:', error);
      res.status(500).json({ error: 'Completion failed', message: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}