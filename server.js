const http = require('http');
const fs = require('fs');
const path = require('path');
const net = require('net');
const admin = require('firebase-admin');
require('dotenv').config();
console.log("FIREBASE_DATABASE_URL:", process.env.FIREBASE_DATABASE_URL);

// Load Firebase service account key
const serviceAccount = JSON.parse(fs.readFileSync(__dirname + '/serviceAccountKey.json', 'utf8'));

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

const db = admin.database();

let arduinoSocket = null;

// TCP server for Arduino
const tcpServer = net.createServer((socket) => {
  console.log("Arduino connected");
  arduinoSocket = socket;

  socket.on('end', () => {
    console.log("Arduino disconnected");
    arduinoSocket = null;
  });
});

tcpServer.listen(4000, () => {
  console.log("TCP Server for Arduino listening on port 4000");
});

// HTTP server to serve the web interface
const httpServer = http.createServer((req, res) => {
  let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);

  if (!filePath.startsWith(path.join(__dirname, 'public'))) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
  };

  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        console.error(`File not found: ${filePath}`);
        res.writeHead(404);
        res.end("404 Not Found");
      } else {
        console.error(`Server error: ${error.code} for ${filePath}`);
        res.writeHead(500);
        res.end("Server Error: " + error.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

httpServer.listen(3000, () => {
  console.log("HTTP Server running on port 3000");
});

// Firebase listener to send LED changes to Arduino
const ledsRef = db.ref('leds');

// Initial read (for diagnostics)
ledsRef.once('value').then(snapshot => {
  console.log("Initial read of /leds:", snapshot.val());
});

// Real-time updates: trigger when a specific LED is changed
ledsRef.on('child_changed', (snapshot) => {
  console.log("child_changed triggered");

  if (!arduinoSocket) {
    console.log("Arduino not connected.");
    return;
  }

  const led = snapshot.key; // e.g., "led3"
  const { r, g, b } = snapshot.val();

  if (r == null || g == null || b == null) {
    console.log("Invalid payload received:", snapshot.val());
    return;
  }

  const ledNumber = led.replace('led', '');
  const payload = `${ledNumber},${r},${g},${b}\n`;

  console.log("Sending to Arduino:", payload);
  arduinoSocket.write(payload);
});

// Optional: fallback listener to confirm that something is firing
// You can remove this later if child_changed works fine
ledsRef.on('value', (snapshot) => {
  console.log("on('value') update detected.");
});
