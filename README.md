# MMDConnect Platform - Camera→Safari Upload Flow

This implementation provides a complete camera→Safari upload flow for the MMDConnect healthcare platform, allowing patients to share health documents directly from their mobile devices to the desktop platform.

## Features

- **Dynamic QR Code Generation**: Login page generates unique QR codes for each transfer session
- **Mobile Upload Interface**: Clean, responsive upload page optimized for mobile Safari/Chrome
- **Real-time File Transfer**: Server-Sent Events (SSE) provide live updates to the desktop
- **Smart File Categorization**: Automatically categorizes uploaded files into health categories:
  - ❤️ Hjärta (Heart/ECG files)
  - 🩸 Blodtryck (Blood pressure)
  - 🍯 Glukos (Glucose/blood sugar)
  - 🏃 Aktivitet (Activity/fitness)
  - 📝 Journalanteckningar (Medical notes)
  - 📄 Övrigt (Other files)
- **Live Dashboard Updates**: Desktop dashboard shows incoming files in real-time with notifications

## Architecture

### Transfer Broker (Node.js + Express)
- **Port**: 3000
- **Endpoints**:
  - `POST /transfers` - Create new transfer session
  - `GET /upload?transferId=...` - Mobile upload page
  - `POST /upload/:transferId` - File upload endpoint
  - `GET /events/:transferId` - SSE stream for live updates
  - `GET /transfer/:transferId` - Get transfer status and files
  - `POST /complete/:transferId` - Mark transfer as complete
  - `POST /cancel/:transferId` - Cancel transfer

### Desktop Platform (Static HTML/CSS/JS)
- **Port**: 8000 (Python HTTP server)
- **Pages**:
  - `index.html` - Login page with dynamic QR code
  - `dashboard.html` - Main dashboard with file categorization
  - Other existing pages (heart.html, gpt-chat.html, etc.)

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Transfer Server
```bash
npm start
# or
node transfer-server.js
```

### 3. Start the Desktop Platform
```bash
# In a new terminal
python3 -m http.server 8000
```

### 4. Test the Flow

1. **Desktop**: Open http://localhost:8000 (or http://192.168.35.169:8000)
   - Login page shows dynamic QR code
   - Click QR to go to dashboard

2. **Mobile**: Scan QR code with phone camera
   - Opens upload page in Safari/Chrome
   - Select PDF/XLSX files from Files app
   - Upload files

3. **Desktop**: Watch dashboard update in real-time
   - Files appear in categorized sections
   - Live notifications for new files

**Note**: Make sure both your computer and phone are on the same WiFi network for the mobile upload to work.

## File Types Supported

- **PDF**: Medical reports, lab results, imaging reports
- **XLSX**: Excel spreadsheets with health data

## File Categorization Logic

Files are automatically categorized based on filename patterns:

- **Heart**: `ecg`, `ekg`, `heart`, `cardio`, `pulse`, `hjärta`
- **Blood Pressure**: `bp`, `blood pressure`, `systolic`, `diastolic`, `blodtryck`
- **Glucose**: `glucose`, `bg`, `cgm`, `hba1c`, `a1c`, `glukos`, `blodsocker`
- **Activity**: `steps`, `activity`, `workout`, `hrv`, `vo2`, `fitness`, `aktivitet`, `träning`
- **Notes**: `note`, `journal`, `anteckning`, `journalanteckningar`, `notat`
- **Other**: Files that don't match any category

## Security Notes (Pilot Implementation)

⚠️ **This is a pilot implementation for demonstration purposes:**

- Uses HTTP (not HTTPS)
- Stores files locally on disk
- No authentication/authorization
- No file validation beyond MIME type
- Transfer sessions expire after 15 minutes

## Production Considerations

For production deployment, consider:

1. **HTTPS**: Enable SSL/TLS encryption
2. **Cloud Storage**: Use S3/Azure/GCS instead of local disk
3. **Authentication**: Add proper user authentication
4. **File Validation**: Implement malware scanning and content validation
5. **Audit Logging**: Track all file transfers and access
6. **Rate Limiting**: Prevent abuse
7. **Data Retention**: Implement automatic cleanup policies

## API Reference

### Create Transfer Session
```bash
curl -X POST http://localhost:3000/transfers
# Response: {"transferId": "uuid", "expiresInSec": 900}
```

### Get Transfer Status
```bash
curl http://localhost:3000/transfer/{transferId}
# Response: {"transferId": "uuid", "status": "open", "files": [...]}
```

### Cancel Transfer
```bash
curl -X POST http://localhost:3000/cancel/{transferId}
```

## Troubleshooting

### Server Won't Start
- Check if port 3000 is already in use
- Ensure Node.js 18+ is installed
- Run `npm install` to install dependencies

### QR Code Not Working
- Check browser console for errors
- Ensure transfer server is running on port 3000
- Verify CORS settings if accessing from different domain

### Files Not Uploading
- Check file size (max 100MB per file)
- Ensure file type is PDF or XLSX
- Check mobile browser console for errors

### Dashboard Not Updating
- Check if EventSource connection is established
- Verify transfer ID is stored in localStorage
- Check browser console for SSE errors

## Development

### Adding New File Categories
1. Update `categorizeFiles()` function in `dashboard.html`
2. Add new category to `categoryConfigs` array
3. Update CSS styles if needed

### Customizing Upload Page
Edit the HTML template in the `/upload` endpoint of `transfer-server.js`

### Adding File Processing
Extend the upload endpoint to process files after upload (e.g., extract text from PDFs, parse Excel data)
