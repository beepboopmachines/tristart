require('dotenv').config(); // Load env variables

const express = require('express');
const path = require('path');
const net = require('net');
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, onChildChanged } = require('firebase/database');

// Firebase setup
const firebaseConfig = {
  databaseURL: process.env.FIREBASE_DATABASE_URL,
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

let arduinoSocket = null;

// ---------- TCP SERVER (Port 4000) ----------
const tcpServer = net.createServer((socket) => {
  console.log("✅ Arduino connected");
  arduinoSocket = socket;

  socket.on('end', () => {
    console.log("❌ Arduino disconnected");
    arduinoSocket = null;
  });
});

tcpServer.listen(4000, () => {
  console.log("🚀 TCP Server for Arduino listening on port 4000");
});

// ---------- EXPRESS HTTP SERVER ----------
const app = express();
const PORT = 3000;

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start HTTP server
app.listen(PORT, () => {
  console.log(`🌐 HTTP Server running on port ${PORT}`);
});

// ---------- FIREBASE REALTIME LISTENER ----------
const ledsRef = ref(db, 'leds');

onChildChanged(ledsRef, (snapshot) => {
  if (!arduinoSocket) {
    console.log("⚠️ Arduino not connected. Skipping payload.");
    return;
  }

  const led = snapshot.key;
  const { r, g, b } = snapshot.val();
  const ledNumber = led.replace('led', '');
  const payload = `${ledNumber},${r},${g},${b}\n`;

  console.log("📤 Sending to Arduino:", payload);
  arduinoSocket.write(payload);
});
