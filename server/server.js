require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { sendEmail, sendSms } = require('./email-sms');
const { askOpenAI } = require('./chat-proxy');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || "secret123";

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "..", "frontend")));

let bookings = [];
const BOOKINGS_FILE = path.join(__dirname, "bookings.json");

// load old bookings
try {
  if (fs.existsSync(BOOKINGS_FILE))
    bookings = JSON.parse(fs.readFileSync(BOOKINGS_FILE));
} catch (e) {
  bookings = [];
}

function persist() {
  try {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
  } catch (e) {
    console.log("Persistence error", e);
  }
}

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

app.get("/api/bookings", (req, res) => {
  const key = req.headers["x-admin-key"];
  if (!key || key !== ADMIN_KEY)
    return res.status(401).json({ error: "Unauthorized" });

  res.json(bookings);
});

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.json({ reply: "Please send a message." });

  const reply = await askOpenAI(message);
  res.json({ reply });
});

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log("SERVER RUNNING ON http://localhost:" + PORT));
