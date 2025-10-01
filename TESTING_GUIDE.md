# Testing Guide - Excel Data in Hjärta Page

## What Was Changed

### ✅ All Mock Data Removed
- **Metric Cards**: No more fake values (72 bpm, 120/80, etc.)
- **Charts**: All charts now show empty state by default
- **Message**: Shows "Ingen data tillänglig" when no data exists

### ✅ Enhanced Excel Parser
The parser is now much more advanced and can handle various Excel formats:

1. **Flexible Value Location**: 
   - Looks for values to the right of labels
   - Checks the row below if not found
   - Checks diagonally (below and to the right)

2. **More Pattern Matching**:
   - Swedish: `hjärtfrekvens`, `systolisk`, `diastolisk`, `kolesterol`
   - English: `heart rate`, `systolic`, `diastolic`, `cholesterol`, `LDL`
   - Abbreviations: `hr`, `sys`, `dia`, `bp`
   - Variants: `heart-rate`, `heart beat`, `resting hr`

3. **Special Format Support**:
   - Blood pressure in format: `120/80`
   - Blood pressure in format: `120-80`
   - Automatically splits and assigns to systolic/diastolic

4. **Better Logging**:
   - Shows which patterns are found
   - Shows which values are extracted
   - Displays final summary of all data found

## How to Test

### Step 1: Check Empty State (No Excel File)

1. Open the platform
2. Navigate to Heart (Hjärta) page WITHOUT uploading any files
3. **Expected Result**:
   - All 4 metric cards show: `-` and "Ingen data tillänglig"
   - All 4 charts show: "Ingen data tillänglig" centered in gray text
   - No mock data visible anywhere

### Step 2: Upload Excel File

#### Create a Test Excel File

Create an Excel file with this structure:

**Option A: Simple Format** (Recommended)
```
| Mätning          | Värde |
|------------------|-------|
| Hjärtfrekvens    | 75    |
| Systoliskt       | 130   |
| Diastoliskt      | 85    |
| Kolesterol LDL   | 3.5   |
```

**Option B: Vertical Format**
```
Hjärtfrekvens
75

Systoliskt blodtryck
130

Diastoliskt blodtryck
85

Kolesterol LDL
3.5
```

**Option C: Blood Pressure Combined**
```
| Mätning          | Värde |
|------------------|-------|
| Hjärtfrekvens    | 75    |
| Blodtryck        | 130/85|
| Kolesterol LDL   | 3.5   |
```

**Option D: English Format**
```
| Measurement      | Value |
|------------------|-------|
| Heart Rate       | 75    |
| Systolic         | 130   |
| Diastolic        | 85    |
| LDL Cholesterol  | 3.5   |
```

### Step 3: Test Upload Flow

1. **Desktop**: Open the platform
2. **Desktop**: Log in (this creates a transfer ID)
3. **Mobile**: Scan the QR code
4. **Mobile**: Upload your Excel file (.xlsx)
5. **Mobile**: Wait for "Uppladdningen slutförd!" message
6. **Desktop**: Navigate to Heart (Hjärta) page

### Step 4: Verify Data Display

**Expected Results:**

✅ **Metric Cards**:
- **Hjärtfrekvens**: Shows value (e.g., "75") with status (Normal/Något hög/etc.)
- **Systoliskt blodtryck**: Shows value (e.g., "130") with status
- **Diastoliskt blodtryck**: Shows value (e.g., "85") with status  
- **Kolesterol (LDL)**: Shows value (e.g., "3.5") with status
- If any value is missing: Shows "-" and "Ingen data tillänglig"

✅ **Charts**:
- **Hjärtfrekvens över tid**: Shows "Ingen data tillänglig" (no time series in basic Excel)
- **Blodtryck**: Shows bars for systolic (orange) and diastolic (green)
- **EKG-data**: Always shows "Ingen data tillänglig"
- **Hjärtfrekvensvariabilitet**: Always shows "Ingen data tillänglig"

### Step 5: Check Browser Console

Open browser console (F12) and look for logs:

```
=== EXTRACTING HEART DATA ===
Total rows to process: 5
Sample data: [...]
Found heart rate pattern in cell "Hjärtfrekvens", value found: 75
✓ Heart rate set to: 75
Found systolic pattern in cell "Systoliskt", value found: 130
✓ Systolic BP set to: 130
Found diastolic pattern in cell "Diastoliskt", value found: 85
✓ Diastolic BP set to: 85
Found cholesterol pattern in cell "Kolesterol LDL", value found: 3.5
✓ Cholesterol LDL set to: 3.5
=== EXTRACTION COMPLETE ===
Heart Rate: 75
Systolic BP: 130
Diastolic BP: 85
Cholesterol LDL: 3.5
```

## Troubleshooting

### Issue: Data Not Showing

**Check 1: Transfer ID**
- Open console
- Look for: `Loading files for transfer: transfer_xxxxx`
- If you see: `No transfer ID found` → You need to log in first

**Check 2: Excel File Found**
- Look for: `Loading Excel data from file: YourFile.xlsx`
- If you see: `No Excel files found` → File didn't upload or wrong format

**Check 3: Data Extraction**
- Look for: `Found heart rate pattern...`
- If NO matches found → Check your Excel column headers
- Try using the exact words from the testing examples above

**Check 4: API Response**
- Look for: `Excel data loaded successfully:`
- If you see errors → Check if file is too large (max 100MB)

### Issue: Wrong Values Displayed

**Possible Causes:**
1. Excel has multiple sheets → Parser only reads first sheet
2. Multiple values in same sheet → Parser takes first match
3. Values in wrong format → Check that numbers are actual numbers, not text

**Solution:**
- Put data in first sheet of Excel file
- Use clear, distinct labels for each metric
- Ensure values are numbers, not text with formatting

### Issue: "Ingen data tillänglig" for Specific Card

This is **CORRECT** if:
- That specific value isn't in your Excel file
- The label doesn't match any of the patterns

**To Fix:**
- Add that data to your Excel file
- Use one of the recognized labels (see pattern list above)
- Check spelling (Swedish or English)

## Status Indicators

The system shows colored status based on medical guidelines:

### Hjärtfrekvens (Heart Rate)
- 🟢 **Normal** (green): 60-100 bpm
- 🟡 **Något låg** (yellow): 50-59 bpm
- 🟡 **Något hög** (yellow): 101-120 bpm
- 🔴 **Avvikande** (red): <50 or >120 bpm

### Systoliskt Blodtryck
- 🟢 **Optimalt** (green): <120 mmHg
- 🟢 **Normal** (green): 120-129 mmHg
- 🟡 **Förhöjd** (yellow): 130-139 mmHg
- 🔴 **Högt** (red): ≥140 mmHg

### Diastoliskt Blodtryck
- 🟢 **Optimalt** (green): <80 mmHg
- 🟢 **Normal** (green): 80-84 mmHg
- 🟡 **Förhöjd** (yellow): 85-89 mmHg
- 🔴 **Högt** (red): ≥90 mmHg

### Kolesterol LDL
- 🟢 **Optimalt** (green): <3.0 mmol/L
- 🟢 **Normal** (green): 3.0-4.0 mmol/L
- 🟡 **Förhöjd** (yellow): 4.1-5.0 mmol/L
- 🔴 **Högt** (red): >5.0 mmol/L

## Advanced: Time Series Data

To show data in "Hjärtfrekvens över tid" chart, add this to your Excel:

```
| Tid   | Hjärtfrekvens |
|-------|---------------|
| 00:00 | 65            |
| 04:00 | 72            |
| 08:00 | 78            |
| 12:00 | 85            |
| 16:00 | 82            |
| 20:00 | 70            |
```

Or use header "Time | Value" or "Tid | Värde"

## Support

If data is still not showing:
1. Check the browser console for detailed logs
2. Verify Excel file format matches examples
3. Ensure file uploaded successfully (check mobile page)
4. Try with a simpler Excel file first
5. Check that you're logged in before uploading

## File Locations

- **Excel Parser**: `api/excel-content.js`
- **Heart Page**: `public/heart.html`
- **Format Guide**: `EXCEL_FORMAT_GUIDE.md`

