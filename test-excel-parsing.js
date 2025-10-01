// Test script to verify Excel parsing works
const XLSX = require('xlsx');

// Create a simple test Excel file
const testData = [
  ['Mätning', 'Värde'],
  ['Hjärtfrekvens', 75],
  ['Systoliskt', 130],
  ['Diastoliskt', 85],
  ['Kolesterol LDL', 3.5]
];

console.log('Creating test Excel data...');
const ws = XLSX.utils.aoa_to_sheet(testData);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Test');

// Convert to JSON like the API does
const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
console.log('Test Excel data:', JSON.stringify(jsonData, null, 2));

// Test the parsing patterns
const patterns = {
  heartRate: /(?:hjärtfrekvens|heart[\s-]*rate|puls|pulse|hr\b|resting[\s-]*hr|heart[\s-]*beat|hjärtfrekvens|hjärtfrekvens)/i,
  systolic: /(?:systolisk|systolic|sys\b|övre[\s-]*blodtryck|upper[\s-]*bp|systolisk[\s-]*blodtryck)/i,
  diastolic: /(?:diastolisk|diastolic|dia\b|nedre[\s-]*blodtryck|lower[\s-]*bp|diastolisk[\s-]*blodtryck)/i,
  cholesterol: /(?:kolesterol|cholesterol|ldl[\s-]*cholesterol|ldl\b|kolesterol[\s-]*ldl)/i
};

console.log('\nTesting pattern matching...');
for (let i = 0; i < jsonData.length; i++) {
  const row = jsonData[i];
  for (let j = 0; j < row.length; j++) {
    const cell = String(row[j]).trim();
    if (!cell) continue;
    
    console.log(`Cell [${i},${j}]: "${cell}"`);
    
    if (patterns.heartRate.test(cell)) {
      console.log('  ✓ Matches heart rate pattern');
      if (j + 1 < row.length) {
        console.log('  ✓ Next cell value:', row[j + 1]);
      }
    }
    if (patterns.systolic.test(cell)) {
      console.log('  ✓ Matches systolic pattern');
      if (j + 1 < row.length) {
        console.log('  ✓ Next cell value:', row[j + 1]);
      }
    }
    if (patterns.diastolic.test(cell)) {
      console.log('  ✓ Matches diastolic pattern');
      if (j + 1 < row.length) {
        console.log('  ✓ Next cell value:', row[j + 1]);
      }
    }
    if (patterns.cholesterol.test(cell)) {
      console.log('  ✓ Matches cholesterol pattern');
      if (j + 1 < row.length) {
        console.log('  ✓ Next cell value:', row[j + 1]);
      }
    }
  }
}

console.log('\nTest completed. If you see pattern matches above, the parsing should work.');
