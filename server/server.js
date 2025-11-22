// server/server.js (FINAL UPDATED VERSION)
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { sendEmail, sendSms } = require('./email-sms');
const { askOpenAI } = require('./chat-proxy');

const app = express();

// -------------------------
// PORT SETTINGS (Render or Local)
// -------------------------
const PORT = process.env.PORT || 3000;

// -------------------------
// FRONTEND STATIC SERVE FIX
// -------------------------
//
// IMPORTANT: Your frontend files (index.html, admin.html, script.js, etc.)
// are now inside the ROOT folder (same level as server.js parent).
//
// So we must serve:
//   ../  (parent directory of server folder)
//
app.use(express.static(path.join(__dirname, '..')));

// This ensures "Cannot GET /" problem is fixed on Render + Locally.
// -------------------------

app.use(cors());
app.use(bodyParser.json());

// -------------------------
// BOOKING STORAGE
// -------------------------
let bookings = [];
const BOOKINGS_FILE = path.join(__dirname, 'bookings.json');

// Load stored bookings
try {
  if (fs.existsSync(BOOKINGS_FILE)) {
    bookings = JSON.parse(fs.readFileSync(BOOKINGS_FILE));
  }
} catch (e) {
  bookings = [];
}

// Save bookings to file
function persist() {
  try {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
  } catch (e) {
    console.log("Persistence error", e);
  }
}

// -------------------------
// API: CREATE BOOKING
// -------------------------
app.post("/api/bookings", async (req, res) => {
  const b = req.body;

  if (!b || !b.id || !b.service || !b.date || !b.time || !b.name) {
    return res.status(400).json({ error: "Missing fields" });
  }

  bookings.unshift(b);
  persist();

  try {
    if (b.email) await sendEmail(b.email, b);
    if (b.mobile) await sendSms(b.mobile, b);
  } catch (err) {
    console.log("Notification error", err);
  }

  res.json({ success: true });
});

// -------------------------
// API: GET BOOKINGS (Admin)
// -------------------------
app.get("/api/bookings", (req, res) => {
  const key = req.headers["x-admin-key"];
  if (!key || key !== (process.env.ADMIN_KEY || "changeme123")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  res.json(bookings);
});

// -------------------------
// API: CHATBOT
// -------------------------
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.json({ reply: "Please send a message." });

  const reply = await askOpenAI(message);
  res.json({ reply });
});

// -------------------------
// HEALTH CHECK
// -------------------------
app.get("/api/health", (req, res) => res.json({ ok: true }));

// -------------------------
// FALLBACK: return index.html for ALL OTHER ROUTES
// (Fixes: Cannot GET / )
// -------------------------
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// -------------------------
// START SERVER
// -------------------------
app.listen(PORT, () => {
  console.log(`SERVER RUNNING ON http://localhost:${PORT}`);
});
