// Local API endpoint for PDF content (placeholder)
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
    const { transferId, filename } = req.query;
    
    console.log('=== LOCAL PDF CONTENT GET REQUEST ===');
    console.log('Transfer ID:', transferId);
    console.log('Filename:', filename);
    
    // For now, return placeholder content
    // In a real implementation, you would parse the PDF file
    const placeholderContent = {
      filename: filename || 'unknown.pdf',
      content: 'PDF content parsing not implemented yet. This is placeholder content.',
      parsedAt: new Date().toISOString()
    };
    
    res.status(200).json(placeholderContent);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
