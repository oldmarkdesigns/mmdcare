# MMDConnect Mobile Upload Platform

A secure mobile file upload system for healthcare documents, allowing patients to easily share PDF and Excel files with healthcare providers through QR code scanning.

## 🚀 Features

- **QR Code Upload**: Scan QR code with mobile device to access upload page
- **Secure File Transfer**: Real-time file transfer with progress monitoring
- **Multiple File Types**: Support for PDF and Excel (XLSX) files
- **Real-time Updates**: Server-sent events for live upload status
- **Mobile-Optimized**: Responsive design for mobile devices
- **Healthcare Focus**: Designed specifically for medical document sharing

## 📱 How It Works

1. **Desktop/Provider**: Opens the main page which generates a unique QR code
2. **Mobile/Patient**: Scans QR code to access the upload page
3. **Upload**: Patient selects and uploads health documents
4. **Real-time Sync**: Desktop receives files instantly with live updates
5. **Dashboard**: Files are processed and displayed in the healthcare dashboard

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js with Vercel Serverless Functions
- **File Upload**: Formidable for handling multipart/form-data
- **Storage**: Vercel Blob for file storage
- **Real-time**: Server-Sent Events (SSE) and polling
- **QR Codes**: QuickChart.io API
- **PDF Processing**: pdf-parse for document analysis
- **Excel Processing**: xlsx (SheetJS) for spreadsheet parsing
- **Charts**: Chart.js for data visualization

## 🚀 Quick Deployment

### Option 1: Vercel (Recommended)

1. **Fork this repository** to your GitHub account
2. **Sign up** at [vercel.com](https://vercel.com)
3. **Import project** from GitHub
4. **Deploy** - Vercel will automatically detect the Node.js configuration

The app will be available at: `https://your-project-name.vercel.app`

### Option 2: Netlify

1. **Fork this repository** to your GitHub account
2. **Sign up** at [netlify.com](https://netlify.com)
3. **New site from Git** → Connect GitHub repository
4. **Deploy** - Netlify will use the `netlify.toml` configuration

The app will be available at: `https://your-project-name.netlify.app`

### Option 3: Railway

1. **Fork this repository** to your GitHub account
2. **Sign up** at [railway.app](https://railway.app)
3. **New Project** → Deploy from GitHub repo
4. **Deploy** - Railway automatically detects Node.js

## 🏃‍♂️ Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/oldmarkdesigns/mmdcaremobile.git
   cd mmdcaremobile
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Access the application**:
   - Main page: `http://localhost:3000`
   - Test page: `http://localhost:3000/receive`

## 📁 Project Structure

```
mmdcaremobile/
├── Assets/                 # Static assets (images, icons)
├── netlify/               # Netlify deployment configuration
│   └── functions/         # Serverless functions
├── uploads/               # Uploaded files (excluded from git)
├── index.html            # Main login/QR page
├── dashboard.html        # Healthcare provider dashboard
├── transfer-server.js    # Main Node.js server
├── package.json          # Dependencies and scripts
├── vercel.json          # Vercel deployment config
├── netlify.toml         # Netlify deployment config
└── README.md            # This file
```

## 🔧 Configuration

### Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

### File Upload Limits

- **Maximum file size**: 100 MB per file
- **Supported formats**: PDF, XLSX
- **Storage**: Local filesystem (uploads directory)

## 🔒 Security Features

- **File type validation**: Only PDF and XLSX files allowed
- **Size limits**: 100 MB maximum per file
- **Temporary storage**: Files are stored temporarily and cleaned up
- **CORS enabled**: Cross-origin requests properly handled
- **Input sanitization**: File names and metadata sanitized

## 📱 Mobile Compatibility

- **Responsive design**: Works on all mobile devices
- **Touch-friendly**: Large buttons and touch targets
- **Camera integration**: QR code scanning via device camera
- **File picker**: Native file selection on mobile devices

## 🏥 Healthcare Integration

### PDF Parsing
- **Automatic extraction**: Parses medical document content automatically
- **Structured data**: Organizes Swedish medical documents into sections
- **Metadata extraction**: Extracts doctor names, dates, and document types
- **Dashboard integration**: Seamlessly displays documents in the healthcare dashboard

### Excel (XLSX) Parsing for Heart Data
- **Heart metrics extraction**: Automatically identifies and extracts:
  - Heart rate (Hjärtfrekvens / Heart Rate)
  - Systolic blood pressure (Systoliskt blodtryck)
  - Diastolic blood pressure (Diastoliskt blodtryck)
  - Cholesterol LDL (Kolesterol)
- **Time series data**: Supports heart rate measurements over time for trend analysis
- **Visual display**: Replaces mock data in the Heart (Hjärta) page with actual patient data
- **Smart fallback**: Shows "Ingen data finns" for missing data points while displaying available information
- **Flexible format**: Supports both Swedish and English column headers
- **Multi-sheet support**: Reads data from multiple sheets in the same Excel file

For detailed information on Excel file format requirements, see [EXCEL_FORMAT_GUIDE.md](EXCEL_FORMAT_GUIDE.md)

## 🐛 Troubleshooting

### Common Issues

1. **QR code not working**: Ensure the server is running and accessible
2. **File upload fails**: Check file size and format (PDF/XLSX only)
3. **Connection issues**: Verify network connectivity and server status

### Development Issues

1. **Port conflicts**: Change the PORT environment variable
2. **File permissions**: Ensure write permissions for uploads directory
3. **Dependencies**: Run `npm install` to install all required packages

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue in this repository
- Contact: [Your contact information]

---

**MMDConnect** - Secure healthcare document sharing made simple.