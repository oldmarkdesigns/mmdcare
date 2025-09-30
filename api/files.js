// Local API endpoint for retrieving uploaded files
import { loadTransferFromBlob, saveTransferToBlob, createEmptyTransfer } from './blobStore.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Initialize global storage if it doesn't exist
  if (!global.__mmd_transfers) {
    global.__mmd_transfers = new Map();
    console.log('Initialized global.__mmd_transfers in files.js');
  }

  if (req.method === 'GET') {
    const { transferId } = req.query;
    
    console.log('=== LOCAL FILES GET REQUEST ===');
    console.log('Transfer ID:', transferId);
    
    if (!transferId) {
      return res.status(400).json({ error: 'No transfer ID provided' });
    }

    // Get transfer from Blob storage
    let transfer = await loadTransferFromBlob(transferId);
    console.log('Found transfer:', transfer);
    
    if (!transfer) {
      console.log('Transfer not found for ID (Blob):', transferId, '- creating new transfer record');
      transfer = createEmptyTransfer();
      await saveTransferToBlob(transferId, transfer);
      console.log('Created new transfer record in Blob for ID:', transferId);
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
