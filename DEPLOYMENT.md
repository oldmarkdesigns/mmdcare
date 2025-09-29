# MMDConnect Platform Deployment Guide

## 🚨 Current Issue
The mobile upload functionality requires a Node.js backend server (`transfer-server.js`) which cannot run on GitHub Pages (static hosting only).

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)
1. **Sign up** at [vercel.com](https://vercel.com)
2. **Connect** your GitHub repository
3. **Configure** build settings:
   - Build Command: `npm install`
   - Output Directory: `.`
   - Install Command: `npm install`
4. **Deploy** - Vercel will automatically detect Node.js and deploy your server

### Option 2: Netlify Functions
1. **Sign up** at [netlify.com](https://netlify.com)
2. **Connect** your GitHub repository
3. **Configure** build settings:
   - Build Command: `npm install`
   - Publish Directory: `.`
4. **Deploy** - Netlify supports serverless functions

### Option 3: Railway
1. **Sign up** at [railway.app](https://railway.app)
2. **Connect** your GitHub repository
3. **Deploy** - Railway automatically detects Node.js applications

### Option 4: Heroku
1. **Sign up** at [heroku.com](https://heroku.com)
2. **Create** a new app
3. **Connect** your GitHub repository
4. **Deploy** from the main branch

## 🔧 Quick Fix for Testing

If you want to test the mobile functionality locally:

1. **Start the server**:
   ```bash
   npm start
   ```

2. **Access via your computer's IP**:
   - Find your IP: `ifconfig` (Mac/Linux) or `ipconfig` (Windows)
   - Use: `http://YOUR_IP:8000` on mobile devices

3. **Update the IP in code** if it changes:
   - Edit `index.html` lines 202, 213, 234
   - Replace `192.168.196.174` with your current IP

## 📱 Mobile Testing
- Ensure your mobile device is on the same WiFi network
- Use the QR code to access the upload page
- The server must be running for mobile uploads to work

## 🌐 Production Deployment
For production use, deploy to one of the hosting services above to get a public URL that works from any device.
