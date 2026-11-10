/**
 * SỔ GIÁ ẮC QUY - Production & Development Node.js Server
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { readStore, writeStore } from './dbService.js';
import { processImagesWithGemini } from './ocrService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');

// Load environment variables from .env
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    for (const line of envContent.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  } catch (err) {
    console.warn('Could not parse .env file:', err.message);
  }
}

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // 1. Health check
  if (req.url === '/api/health') {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'ok', time: new Date().toISOString() }));
    return;
  }

  // 1b. Public client config (Supabase URL & Anon Key for automatic client connection)
  if (req.url === '/api/config' && req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      supabaseUrl: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
    }));
    return;
  }

  // 2. Fetch full store data
  if (req.url === '/api/data' && req.method === 'GET') {
    const store = readStore();
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(store || {}));
    return;
  }

  // 3. Sync full store data
  if (req.url === '/api/sync' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const ok = writeStore(payload);
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = ok ? 200 : 500;
        res.end(JSON.stringify({ success: ok }));
      } catch (err) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 4. OCR AI Vision endpoint
  if (req.url === '/api/ocr' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { images, supplierId, apiKey } = JSON.parse(body || '{}');
        if (!images || !Array.isArray(images) || images.length === 0) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'NO_IMAGES_PROVIDED' }));
          return;
        }

        const result = await processImagesWithGemini(images, supplierId, apiKey);
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = result.success ? 200 : 400;
        res.end(JSON.stringify(result));
      } catch (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 5. Static file serving (when Vite is built into dist/)
  if (fs.existsSync(DIST_DIR)) {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';
    
    let filePath = path.join(DIST_DIR, reqPath);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(DIST_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    try {
      const data = fs.readFileSync(filePath);
      res.setHeader('Content-Type', contentType);
      res.end(data);
      return;
    } catch {
      // Pass through
    }
  }

  res.statusCode = 404;
  res.end('Not Found');
});

server.listen(PORT, HOST, () => {
  console.log(`\n=============================================================`);
  console.log(`  SỔ GIÁ ẮC QUY - ĐANG CHẠY TRÊN MẠNG WI-FI NỘI BỘ`);
  console.log(`=============================================================`);
  console.log(`  📱 Trên Điện thoại (cùng Wi-Fi):  http://192.168.2.6:${PORT}`);
  console.log(`  💻 Trên Máy tính này:             http://localhost:${PORT}`);
  console.log(`=============================================================\n`);
});
