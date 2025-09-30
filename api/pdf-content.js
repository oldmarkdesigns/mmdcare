// Local API endpoint for PDF content parsing
import { loadTransferFromBlob } from './blobStore.js';
import { get } from '@vercel/blob';
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
    const { transferId, filename } = req.query;
    
    console.log('=== PDF CONTENT GET REQUEST ===');
    console.log('Transfer ID:', transferId);
    console.log('Filename:', filename);
    
    if (!transferId || !filename) {
      return res.status(400).json({ error: 'Missing transferId or filename' });
    }

    try {
      // Get transfer data from Blob storage
      const transfer = await loadTransferFromBlob(transferId);
      if (!transfer) {
        return res.status(404).json({ error: 'Transfer not found' });
      }

      // Find the PDF file in the transfer
      const pdfFile = transfer.files.find(file => 
        file.name === filename && 
        (file.mimetype === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))
      );

      if (!pdfFile) {
        return res.status(404).json({ error: 'PDF file not found in transfer' });
      }

      // Get the actual PDF file from Blob storage
      const pdfBlobKey = `files/${transferId}/${filename}`;
      console.log('Looking for PDF file at key:', pdfBlobKey);
      
      let pdfBlob;
      try {
        pdfBlob = await get(pdfBlobKey);
        console.log('PDF blob found:', !!pdfBlob);
      } catch (error) {
        console.error('Error getting PDF blob:', error);
        return res.status(404).json({ error: 'PDF file not found in storage' });
      }
      
      if (!pdfBlob) {
        console.log('PDF blob is null/undefined');
        return res.status(404).json({ error: 'PDF file not found in storage' });
      }

      // Download the PDF content
      console.log('Downloading PDF content from URL:', pdfBlob.url);
      const pdfResponse = await fetch(pdfBlob.url);
      
      if (!pdfResponse.ok) {
        console.error('Failed to download PDF, status:', pdfResponse.status);
        return res.status(500).json({ error: 'Failed to download PDF file' });
      }
      
      const pdfBuffer = await pdfResponse.arrayBuffer();
      console.log('PDF buffer size:', pdfBuffer.byteLength);
      
      // Parse the PDF content
      console.log('Parsing PDF content...');
      const pdfData = await pdf(Buffer.from(pdfBuffer));
      console.log('PDF parsed successfully, text length:', pdfData.text.length);
      console.log('PDF text preview:', pdfData.text.substring(0, 200));
      
      if (!pdfData.text || pdfData.text.trim().length === 0) {
        console.log('PDF text is empty, creating fallback content');
        const fallbackContent = createFallbackContent(pdfFile);
        return res.status(200).json(fallbackContent);
      }
      
      const structuredContent = await parsePDFContent(pdfFile, pdfData.text);
      
      res.status(200).json(structuredContent);
    } catch (error) {
      console.error('Error processing PDF content:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ error: 'Failed to process PDF content', details: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

async function parsePDFContent(pdfFile, pdfText) {
  const filename = pdfFile.name;
  const uploadedAt = new Date(pdfFile.uploadedAt);
  
  // Extract title from PDF content or filename
  const title = extractTitle(pdfText, filename);
  
  // Extract doctor name from PDF content
  const doctor = extractDoctor(pdfText);
  
  // Extract date from PDF content or use upload date
  const date = extractDate(pdfText) || uploadedAt.toLocaleDateString('sv-SE');
  
  // Generate summary from PDF content
  const summary = generateSummary(pdfText);
  
  // Parse content into sections
  const sections = parseIntoSections(pdfText);
  
  // Create structured content
  const content = {
    title: title,
    doctor: doctor,
    date: date,
    summary: summary,
    sections: sections
  };

  return {
    filename: filename,
    title: title,
    doctor: doctor,
    date: date,
    summary: summary,
    content: content,
    parsedAt: new Date().toISOString()
  };
}

function extractTitle(pdfText, filename) {
  // Clean the text first
  const cleanText = pdfText.replace(/\s+/g, ' ').trim();
  
  // Look for common title patterns in the PDF
  const titlePatterns = [
    /(?:titel|title|rubrik|heading):\s*(.+?)(?:\n|$)/i,
    /(?:dokument|document|rapport|report):\s*(.+?)(?:\n|$)/i,
    /(?:undersökning|examination|analysis):\s*(.+?)(?:\n|$)/i,
    /(?:journal|anteckning|note):\s*(.+?)(?:\n|$)/i,
    /^([A-ZÅÄÖ][A-ZÅÄÖa-zåäö\s]{10,50}?)(?:\n|$)/m, // First line with proper case
    /^(.{10,100}?)(?:\n|$)/m // First line as fallback
  ];
  
  for (const pattern of titlePatterns) {
    const match = cleanText.match(pattern);
    if (match && match[1]) {
      const title = match[1].trim();
      if (title.length > 3 && title.length < 100 && !title.includes('http')) {
        return title;
      }
    }
  }
  
  // Fallback to filename
  return filename
    .replace(/\.pdf$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

function extractDoctor(pdfText) {
  // Look for doctor patterns
  const doctorPatterns = [
    /(?:dr\.?|doctor|doktor|läkare|physician)\s+([a-zA-ZåäöÅÄÖ\s]+)/i,
    /(?:undersökande|examining|attending)\s+(?:läkare|doctor|physician):\s*([a-zA-ZåäöÅÄÖ\s]+)/i,
    /(?:signerat|signed|signature):\s*([a-zA-ZåäöÅÄÖ\s]+)/i
  ];
  
  for (const pattern of doctorPatterns) {
    const match = pdfText.match(pattern);
    if (match && match[1] && match[1].trim().length > 2) {
      return `Dr. ${match[1].trim()}`;
    }
  }
  
  return 'Dr. Importerad';
}

function extractDate(pdfText) {
  // Look for date patterns
  const datePatterns = [
    /(?:datum|date):\s*(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\d{2}\.\d{2}\.\d{4})/i,
    /(?:undersökt|examined|date):\s*(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\d{2}\.\d{2}\.\d{4})/i,
    /(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\d{2}\.\d{2}\.\d{4})/
  ];
  
  for (const pattern of datePatterns) {
    const match = pdfText.match(pattern);
    if (match && match[1]) {
      try {
        const date = new Date(match[1]);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('sv-SE');
        }
      } catch (e) {
        // Continue to next pattern
      }
    }
  }
  
  return null;
}

function generateSummary(pdfText) {
  // Clean the text
  const cleanText = pdfText.replace(/\s+/g, ' ').trim();
  
  if (cleanText.length === 0) {
    return 'PDF-dokument importerat och analyserat.';
  }
  
  // Extract first few sentences or key information
  const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  if (sentences.length === 0) {
    // If no sentences found, take first 200 characters
    const preview = cleanText.substring(0, 200);
    return preview + (cleanText.length > 200 ? '...' : '');
  }
  
  // Take first 2-3 meaningful sentences
  const summarySentences = sentences.slice(0, 3).map(s => s.trim()).filter(s => s.length > 0);
  
  if (summarySentences.length === 0) {
    const preview = cleanText.substring(0, 200);
    return preview + (cleanText.length > 200 ? '...' : '');
  }
  
  return summarySentences.join('. ') + '.';
}

function parseIntoSections(pdfText) {
  const sections = [];
  const lines = pdfText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let currentSection = null;
  let currentContent = [];
  
  for (const line of lines) {
    // Check if line looks like a section header
    if (isSectionHeader(line)) {
      // Save previous section
      if (currentSection && currentContent.length > 0) {
        sections.push({
          heading: currentSection,
          content: currentContent.join('\n')
        });
      }
      
      // Start new section
      currentSection = line;
      currentContent = [];
    } else {
      // Add to current section content
      currentContent.push(line);
    }
  }
  
  // Save last section
  if (currentSection && currentContent.length > 0) {
    sections.push({
      heading: currentSection,
      content: currentContent.join('\n')
    });
  }
  
  // If no sections found, try to create logical sections from the content
  if (sections.length === 0) {
    const cleanText = pdfText.replace(/\s+/g, ' ').trim();
    
    // Try to split by common medical document patterns
    const medicalPatterns = [
      /(?:anamnes|history|bakgrund|background)/i,
      /(?:status|fynd|findings|undersökning|examination)/i,
      /(?:diagnos|diagnosis|bedömning|assessment)/i,
      /(?:behandling|treatment|rekommendation|recommendation)/i
    ];
    
    let lastIndex = 0;
    for (const pattern of medicalPatterns) {
      const match = cleanText.search(pattern);
      if (match > lastIndex && match < cleanText.length - 50) {
        // Found a section
        const sectionText = cleanText.substring(lastIndex, match).trim();
        if (sectionText.length > 20) {
          sections.push({
            heading: 'Innehåll',
            content: sectionText
          });
        }
        lastIndex = match;
      }
    }
    
    // Add remaining content
    if (lastIndex < cleanText.length - 20) {
      const remainingText = cleanText.substring(lastIndex).trim();
      if (remainingText.length > 20) {
        sections.push({
          heading: 'Innehåll',
          content: remainingText
        });
      }
    }
    
    // If still no sections, create a single content section
    if (sections.length === 0) {
      sections.push({
        heading: 'Innehåll',
        content: cleanText
      });
    }
  }
  
  return sections;
}

function isSectionHeader(line) {
  // Check if line looks like a section header
  const headerPatterns = [
    /^[A-ZÅÄÖ][A-ZÅÄÖ\s]+:$/, // All caps with colon
    /^\d+\.\s+[A-ZÅÄÖ]/, // Numbered sections
    /^(?:sammanfattning|summary|resultat|result|fynd|findings|slutsats|conclusion|rekommendation|recommendation)/i,
    /^(?:anamnes|history|symptom|symptoms|undersökning|examination|diagnos|diagnosis|behandling|treatment)/i
  ];
  
  return headerPatterns.some(pattern => pattern.test(line)) && line.length < 100;
}

function createFallbackContent(pdfFile) {
  const filename = pdfFile.name;
  const uploadedAt = new Date(pdfFile.uploadedAt);
  
  // Extract title from filename
  const title = filename
    .replace(/\.pdf$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
  
  return {
    filename: filename,
    title: title,
    doctor: 'Dr. Importerad',
    date: uploadedAt.toLocaleDateString('sv-SE'),
    summary: 'PDF-dokument importerat. Innehållet kunde inte analyseras automatiskt.',
    content: {
      title: title,
      doctor: 'Dr. Importerad',
      date: uploadedAt.toLocaleDateString('sv-SE'),
      summary: 'PDF-dokument importerat. Innehållet kunde inte analyseras automatiskt.',
      sections: [
        {
          heading: 'Dokumentinformation',
          content: `Dokument: ${filename}\nUppladdad: ${uploadedAt.toLocaleString('sv-SE')}\nTyp: PDF-dokument\nStatus: Innehållet kunde inte analyseras automatiskt.`
        },
        {
          heading: 'Anteckning',
          content: 'Detta PDF-dokument har importerats från mobilen men innehållet kunde inte analyseras automatiskt. Du kan använda "Summera med Hälsa+GPT" för att få hjälp med att analysera innehållet.'
        }
      ]
    },
    parsedAt: new Date().toISOString()
  };
}

