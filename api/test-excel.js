// Test endpoint to verify Excel parsing works
import * as XLSX from 'xlsx';

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
    console.log('=== TEST EXCEL PARSING ===');
    
    // Create test data
    const testData = [
      ['Mätning', 'Värde'],
      ['Hjärtfrekvens', 75],
      ['Systoliskt', 130],
      ['Diastoliskt', 85],
      ['Kolesterol LDL', 3.5]
    ];
    
    console.log('Test data:', testData);
    
    // Create workbook
    const ws = XLSX.utils.aoa_to_sheet(testData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Test');
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    console.log('JSON data:', jsonData);
    
    // Test parsing
    const heartData = {
      heartRate: null,
      systolicBP: null,
      diastolicBP: null,
      cholesterolLDL: null
    };
    
    const patterns = {
      heartRate: /(?:hjärtfrekvens|heart[\s-]*rate|puls|pulse|hr\b|resting[\s-]*hr|heart[\s-]*beat|hjärtfrekvens|hjärtfrekvens)/i,
      systolic: /(?:systolisk|systolic|sys\b|övre[\s-]*blodtryck|upper[\s-]*bp|systolisk[\s-]*blodtryck)/i,
      diastolic: /(?:diastolisk|diastolic|dia\b|nedre[\s-]*blodtryck|lower[\s-]*bp|diastolisk[\s-]*blodtryck)/i,
      cholesterol: /(?:kolesterol|cholesterol|ldl[\s-]*cholesterol|ldl\b|kolesterol[\s-]*ldl)/i
    };
    
    // Parse data
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      for (let j = 0; j < row.length; j++) {
        const cell = String(row[j]).trim();
        if (!cell) continue;
        
        console.log(`Checking cell [${i},${j}]: "${cell}"`);
        
        if (patterns.heartRate.test(cell) && j + 1 < row.length) {
          const value = parseFloat(row[j + 1]);
          if (!isNaN(value) && value > 0 && value < 300) {
            heartData.heartRate = Math.round(value);
            console.log('✓ Found heart rate:', heartData.heartRate);
          }
        }
        
        if (patterns.systolic.test(cell) && j + 1 < row.length) {
          const value = parseFloat(row[j + 1]);
          if (!isNaN(value) && value > 0 && value < 300) {
            heartData.systolicBP = Math.round(value);
            console.log('✓ Found systolic BP:', heartData.systolicBP);
          }
        }
        
        if (patterns.diastolic.test(cell) && j + 1 < row.length) {
          const value = parseFloat(row[j + 1]);
          if (!isNaN(value) && value > 0 && value < 200) {
            heartData.diastolicBP = Math.round(value);
            console.log('✓ Found diastolic BP:', heartData.diastolicBP);
          }
        }
        
        if (patterns.cholesterol.test(cell) && j + 1 < row.length) {
          const value = parseFloat(row[j + 1]);
          if (!isNaN(value) && value > 0 && value < 20) {
            heartData.cholesterolLDL = value.toFixed(1);
            console.log('✓ Found cholesterol LDL:', heartData.cholesterolLDL);
          }
        }
      }
    }
    
    console.log('Final parsed data:', heartData);
    
    res.status(200).json({
      success: true,
      testData: testData,
      jsonData: jsonData,
      heartData: heartData,
      message: 'Excel parsing test completed'
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
