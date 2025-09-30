// Local API endpoint for file uploads
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Global storage for transfers (in-memory for local development)
if (!global.__mmd_transfers) {
  global.__mmd_transfers = new Map();
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    const { transferId } = req.query;
    
    console.log('=== LOCAL UPLOAD POST REQUEST ===');
    console.log('Transfer ID:', transferId);
    
    if (!transferId) {
      console.log('No transfer ID provided');
      return res.status(400).json({ error: 'No transfer ID provided' });
    }

    try {
      console.log('Parsing form data...');
      const form = formidable({
        maxFileSize: 100 * 1024 * 1024, // 100MB
        filter: ({ mimetype }) => {
          console.log('File mimetype:', mimetype);
          return true; // Accept all file types
        }
      });

      const [fields, files] = await form.parse(req);
      console.log('Parsed fields:', fields);
      console.log('Parsed files:', files);
      
      const file = files.file?.[0];
      console.log('Selected file:', file);

      if (!file) {
        console.log('No file found in request');
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Get or create transfer
      let transfer = global.__mmd_transfers.get(transferId);
      if (!transfer) {
        console.log('Transfer not found, creating new transfer for ID:', transferId);
        transfer = { status: 'open', files: [], createdAt: Date.now() };
        global.__mmd_transfers.set(transferId, transfer);
        console.log('Created new transfer for ID:', transferId);
      }

      // Store file metadata
      const meta = {
        name: file.originalFilename,
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: new Date().toISOString(),
        transferId: transferId
      };
      
      // Add file to transfer
      transfer.files.push(meta);
      global.__mmd_transfers.set(transferId, transfer);
      
      console.log('File uploaded successfully:', meta);
      console.log('Transfer now has', transfer.files.length, 'files');
      console.log('Updated transfer object:', transfer);

      console.log('Upload completed successfully, sending 204 response');
      res.status(204).end();
    } catch (error) {
      console.error('Upload error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ error: 'Upload failed', message: error?.message || 'Unknown error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}