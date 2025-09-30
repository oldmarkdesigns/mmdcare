// Vercel API route for file uploads
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

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
    // Handle mobile upload page
    const { transferId } = req.query;
    
    if (!global.transfers || !global.transfers.has(transferId)) {
      return res.status(410).type("html").send(`<!doctype html>
      <html><head>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta charset="utf-8" /><title>Transfer expired</title>
        <style>
          body{font-family:system-ui;padding:16px;text-align:center}
          .card{border:1px solid #e5e7eb;border-radius:16px;padding:16px;max-width:400px;margin:2rem auto}
          .error{color:#dc2626}
        </style></head><body>
        <div class="card">
          <h2 class="error">Transfer expired or invalid</h2>
          <p>This transfer session has expired or is invalid. Please scan the QR code again from your desktop.</p>
        </div>
      </body></html>`);
    }
    
    res.type("html").send(`<!doctype html>
    <html><head>
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <meta charset="utf-8" /><title>Share to MMDConnect</title>
      <style>
        body{font-family:system-ui;padding:16px;background:#f9fafb;min-height:100vh}
        .card{border:1px solid #e5e7eb;border-radius:16px;padding:24px;background:white;max-width:400px;margin:2rem auto}
        .header{text-align:center;margin-bottom:24px}
        .logo{width:40px;height:40px;margin-bottom:12px}
        h1{font-size:24px;font-weight:600;color:#1f2937;margin:0}
        .subtitle{color:#6b7280;font-size:14px;margin-top:8px}
        button{padding:12px 24px;border-radius:12px;border:none;background:#1d4ed8;color:white;font-weight:500;cursor:pointer;width:100%;margin-top:16px}
        button:disabled{background:#9ca3af;cursor:not-allowed}
        input[type=file]{display:block;margin:16px 0;padding:12px;border:2px dashed #d1d5db;border-radius:8px;width:100%;box-sizing:border-box}
        .hint{color:#6b7280;font-size:14px;text-align:center;margin-bottom:16px}
        .status{text-align:center;margin-top:16px;font-weight:500}
        .success{color:#059669}
        .error{color:#dc2626}
        .progress{color:#1d4ed8}
      </style></head><body>
      <div class="card">
        <div class="header">
          <img src="/Assets/mmdconnect.png" alt="MMDConnect" class="logo">
          <h1>Share health documents</h1>
          <p class="subtitle">Upload your health files to MMDConnect</p>
        </div>
        <p class="hint">Select PDF or Excel (XLSX) files. Maximum 100 MB each.</p>
        <input id="f" type="file" multiple accept=".pdf,application/pdf,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />
        <button id="send">Upload Files</button>
        <div id="msg" class="status"></div>
      </div>
      <script>
        const transferId = ${JSON.stringify(transferId)};
        const f = document.getElementById('f');
        const btn = document.getElementById('send');
        const msg = document.getElementById('msg');

        async function uploadOne(file) {
          const fd = new FormData();
          fd.append('file', file, file.name);
          const resp = await fetch('/api/upload/' + transferId, { method:'POST', body: fd });
          if (!resp.ok) throw new Error(await resp.text());
        }
        
        btn.onclick = async () => {
          const files = Array.from(f.files || []);
          if (!files.length) { 
            msg.textContent = "Please choose at least one file."; 
            msg.className = "status error";
            return; 
          }
          
          btn.disabled = true; 
          msg.textContent = "Uploading " + files.length + " file(s)...";
          msg.className = "status progress";
          
          try {
            for (const file of files) {
              await uploadOne(file);
            }
            await fetch('/api/complete/' + transferId, { method:'POST' });
            msg.textContent = "Upload completed! You can close this page.";
            msg.className = "status success";
          } catch (e) {
            msg.textContent = "Upload failed: " + e.message;
            msg.className = "status error";
          } finally {
            btn.disabled = false;
          }
        };
      </script>
    </body></html>`);
  }

  if (req.method === 'POST') {
    // Handle file upload
    const { transferId } = req.query;
    
    if (!global.transfers || !global.transfers.has(transferId)) {
      return res.status(410).json({ error: 'Transfer expired or invalid' });
    }

    try {
      const form = formidable({
        maxFileSize: 100 * 1024 * 1024, // 100MB
        filter: ({ mimetype }) => {
          return ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(mimetype);
        }
      });

      const [fields, files] = await form.parse(req);
      const file = files.file?.[0];

      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Store file metadata
      const transfer = global.transfers.get(transferId);
      const meta = {
        name: file.originalFilename,
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: new Date().toISOString()
      };
      
      transfer.files.push(meta);
      global.transfers.set(transferId, transfer);

      res.status(204).end();
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  }
}
