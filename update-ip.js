#!/usr/bin/env node

// Script to help update the IP address in the code
import { networkInterfaces } from 'os';

function getLocalIP() {
    const interfaces = networkInterfaces();
    
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Skip internal (loopback) and non-IPv4 addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return null;
}

const currentIP = getLocalIP();

if (currentIP) {
    console.log(`🌐 Your current IP address is: ${currentIP}`);
    console.log(`📱 Mobile upload URL: http://${currentIP}:8000/upload`);
    console.log(`🔗 QR code should point to: http://${currentIP}:8000/upload?transferId=YOUR_TRANSFER_ID`);
    console.log(`\n📝 To update the code:`);
    console.log(`1. Replace '192.168.196.174' with '${currentIP}' in index.html`);
    console.log(`2. Replace '192.168.196.174' with '${currentIP}' in dashboard.html`);
    console.log(`3. Restart your server: npm start`);
} else {
    console.log('❌ Could not determine your IP address');
}
