const SERVER_URL = 'http://localhost:3000';

const form = document.getElementById('bookingForm');
const result = document.getElementById('result');
const saveLocal = document.getElementById('saveLocal');
const submitBtn = document.getElementById('submitBtn');
const themeToggle = document.getElementById('themeToggle');

const chatLog = document.getElementById('chatLog');
const chatInput = document.getElementById('chatInput');
const sendChat = document.getElementById('sendChat');

/* --------------------
   THEME (Dark/Light)
---------------------*/
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
  themeToggle.textContent = 'Light Mode';
}

themeToggle.addEventListener('click', () => {
  const dark = document.body.classList.toggle('dark');
  themeToggle.textContent = dark ? 'Light Mode' : 'Dark Mode';
  localStorage.setItem('theme', dark ? 'dark' : 'light');
});

/* --------------------
   SHOW BOOKING RESULT
---------------------*/
function showResult(html) {
  result.classList.remove('hidden');
  result.innerHTML = html;
}

/* --------------------
   SAVE LOCAL STORAGE
---------------------*/
function saveLocalBooking(b) {
  const list = JSON.parse(localStorage.getItem('bookings_local') || '[]');
  list.unshift(b);
  localStorage.setItem('bookings_local', JSON.stringify(list));
}

/* --------------------
     FORM SUBMIT
---------------------*/
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  submitBtn.disabled = true;

  const booking = {
    id: 'b_' + Date.now(),
    service: document.getElementById('service').value,
    date: document.getElementById('date').value,
    time: document.getElementById('time').value,
    name: document.getElementById('name').value,
    email: document.getElementById('email').value || null,
    mobile: document.getElementById('mobile').value || null,
    createdAt: new Date().toISOString()
  };

  if (saveLocal.checked) saveLocalBooking(booking);

  let serverResp = null;
  try {
    const res = await fetch(SERVER_URL + '/api/bookings', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(booking)
    });
    if (res.ok) serverResp = await res.json();
  } catch (err) {
    console.warn("Server offline", err);
  }

  showResult(`
    <h3>Booking Confirmed!</h3>
    <p><b>Service:</b> ${booking.service}</p>
    <p><b>Date:</b> ${booking.date}</p>
    <p><b>Time:</b> ${booking.time}</p>
    <p><b>Name:</b> ${booking.name}</p>
    <p class="muted">${serverResp ? 'Server accepted booking.' : 'Saved locally (server offline).'}</p>
  `);

  // browser notification
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("Booking Confirmed!", {
      body: `${booking.service} on ${booking.date} ${booking.time}`
    });
  }

  form.reset();
  submitBtn.disabled = false;
});

/* --------------------
      CHATBOT
---------------------*/
sendChat.addEventListener('click', async () => {
  const text = chatInput.value.trim();
  if (!text) return;

  appendChat("You", text);
  chatInput.value = '';

  try {
    const res = await fetch(SERVER_URL + '/api/chat', {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ message: text })
    });
    const js = await res.json();
    appendChat("Bot", js.reply || "No response");
  } catch (err) {
    appendChat("Bot", "Server offline");
  }
});

function appendChat(who, text) {
  const el = document.createElement("div");
  el.className = "chat-line";
  el.innerHTML = `<b>${who}:</b> ${text}`;
  chatLog.appendChild(el);
  chatLog.scrollTop = chatLog.scrollHeight;
}
