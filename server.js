require('dotenv').config(); // Load env variables

const http = require('http');
const fs = require('fs');
const path = require('path');
const net = require('net');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, onChildChanged } = require('firebase/database');

const firebaseConfig = {
    databaseURL: process.env.FIREBASE_DATABASE_URL
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

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

// HTTP server to serve your webpage
const httpServer = http.createServer((req, res) => {
    let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);

    // Make sure we're not trying to access files outside of public directory
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
            }
            else {
                console.error(`Server error: ${error.code} for ${filePath}`);
                res.writeHead(500);
                res.end("Server Error: " + error.code);
            }
        }
        else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

httpServer.listen(3000, () => {
    console.log("HTTP Server running on port 3000");
});

// Firebase listener: watch individual LED changes and send immediately
const ledsRef = ref(db, 'leds');
onChildChanged(ledsRef, (snapshot) => {
    if (!arduinoSocket) return;

    const led = snapshot.key; // e.g., "led1"
    const { r, g, b } = snapshot.val();

    const ledNumber = led.replace('led', ''); // extract number from key
    const payload = `${ledNumber},${r},${g},${b}\n`;

    console.log("Sending to Arduino:", payload);
    arduinoSocket.write(payload);
});