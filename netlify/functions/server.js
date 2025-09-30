// Netlify function wrapper for the transfer server
import express from "express";
import cors from "cors";
import { v4 as uuid } from "uuid";
import QRCode from "qrcode";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pdfParse from "pdf-parse";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the project root
app.use(express.static(path.join(__dirname, '../../')));

// Ephemeral state for demo
const transfers = new Map(); // transferId -> { status, files: [] }
const clients = new Map();   // transferId -> Set(res) for SSE

// Storage (local disk for pilot)
const uploadsRoot = path.join(__dirname, '../../uploads');
fs.mkdirSync(uploadsRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(uploadsRoot, req.params.transferId);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, file.originalname)
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB each
  fileFilter: (req, file, cb) => {
    const ok = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ].includes(file.mimetype);
    ok ? cb(null, true) : cb(new Error("Only PDF and XLSX allowed"));
  }
});

// 1) Create a new transfer session (desktop calls this)
app.post("/transfers", (req, res) => {
  const id = uuid();
  transfers.set(id, { status: "open", files: [], createdAt: Date.now() });
  res.status(201).json({ transferId: id, expiresInSec: 900 });
});

// 2) Mobile upload page (QR opens this)
app.get("/upload", (req, res) => {
  const { transferId } = req.query;
  const t = transfers.get(transferId);
  if (!t || t.status !== "open") {
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
        const resp = await fetch('/upload/' + transferId, { method:'POST', body: fd });
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
          await fetch('/complete/' + transferId, { method:'POST' });
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
});

// 3) Receive file (mobile → server)
app.post("/upload/:transferId", upload.single("file"), (req, res) => {
  const { transferId } = req.params;
  const t = transfers.get(transferId);
  if (!t || t.status !== "open") return res.status(410).send("Transfer expired or invalid");

  const meta = { 
    name: req.file.originalname, 
    size: req.file.size, 
    mimetype: req.file.mimetype,
    uploadedAt: new Date().toISOString()
  };
  t.files.push(meta);
  broadcast(transferId, { type: "file", file: meta });
  res.sendStatus(204);
});

// 4) Mark done
app.post("/complete/:transferId", (req, res) => {
  const { transferId } = req.params;
  const t = transfers.get(transferId);
  if (!t) return res.sendStatus(404);
  t.status = "closed";
  broadcast(transferId, { type: "status", status: "closed" });
  broadcast(transferId, { type: "closed" });
  endStream(transferId);
  res.sendStatus(204);
});

// 5) Desktop subscribes to events
app.get("/events/:transferId", (req, res) => {
  const { transferId } = req.params;
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders();

  const set = clients.get(transferId) || new Set();
  set.add(res);
  clients.set(transferId, set);

  const t = transfers.get(transferId);
  res.write(`data: ${JSON.stringify({ type:"status", status: t?.status || "unknown" })}\n\n`);
  
  req.on("close", () => { 
    set.delete(res); 
    if (set.size === 0) {
      clients.delete(transferId);
    }
  });
});

// 6) Get transfer status and files
app.get("/transfer/:transferId", (req, res) => {
  const { transferId } = req.params;
  const t = transfers.get(transferId);
  if (!t) return res.status(404).json({ error: "Transfer not found" });
  
  res.json({
    transferId,
    status: t.status,
    files: t.files
  });
});

// Utilities
function broadcast(transferId, payload) {
  const set = clients.get(transferId);
  if (!set) return;
  for (const r of set) {
    try {
      r.write(`data: ${JSON.stringify(payload)}\n\n`);
    } catch (e) {
      // Remove dead connections
      set.delete(r);
    }
  }
}

function endStream(transferId) {
  const set = clients.get(transferId);
  if (!set) return;
  for (const r of set) {
    try {
      r.end();
    } catch (e) {
      // Ignore errors when ending streams
    }
  }
  clients.delete(transferId);
}

// Clean up expired transfers every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, transfer] of transfers.entries()) {
    // Remove transfers older than 30 minutes
    if (now - transfer.createdAt > 30 * 60 * 1000) {
      transfers.delete(id);
      endStream(id);
    }
  }
}, 5 * 60 * 1000);

// Netlify function handler
export const handler = app;
