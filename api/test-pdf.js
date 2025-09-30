// Test endpoint for PDF parsing
import pdf from 'pdf-parse';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      // Create a simple test PDF content
      const testContent = {
        message: 'PDF parsing test endpoint is working',
        timestamp: new Date().toISOString(),
        status: 'ok'
      };
      
      res.status(200).json(testContent);
    } catch (error) {
      console.error('Test PDF error:', error);
      res.status(500).json({ error: 'Test failed', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
