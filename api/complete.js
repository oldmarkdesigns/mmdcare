// Vercel API route for completing transfers
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    const { transferId } = req.query;
    
    if (!global.transfers || !global.transfers.has(transferId)) {
      return res.status(404).json({ error: 'Transfer not found' });
    }

    const transfer = global.transfers.get(transferId);
    transfer.status = 'closed';
    global.transfers.set(transferId, transfer);

    res.status(204).end();
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
