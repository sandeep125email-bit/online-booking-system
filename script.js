// frontend/script.js (updated)
(function () {
  // If server is at same origin (deployed with server), use location.origin.
  // Otherwise set to 'http://localhost:3000' for local dev.
  const DEFAULT_LOCAL = 'http://localhost:3000';
  // If your server is deployed at a different hostname, set DEPLOYED_SERVER_URL below.
  const DEPLOYED_SERVER_URL = ''; // e.g. 'https://online-booking-system-j7wh.onrender.com'

  const SERVER_URL = (function(){
    if (DEPLOYED_SERVER_URL && DEPLOYED_SERVER_URL.trim().length) return DEPLOYED_SERVER_URL;
    // if backend appears to be same origin and reachable, use origin; otherwise fallback to localhost
    try {
      return window.location.origin || DEFAULT_LOCAL;
    } catch (e) {
      return DEFAULT_LOCAL;
    }
  })();

  // Query-string version to bust cache when verifying updates
  const VER = Date.now();

  const form = document.getElementById('bookingForm');
  const result = document.getElementById('result');
  const saveLocal = document.getElementById('saveLocal');
  const submitBtn = document.getElementById('submitBtn');
  const themeToggle = document.getElementById('themeToggle');

  const chatLog = document.getElementById('chatLog');
  const chatInput = document.getElementById('chatInput');
  const sendChat = document.getElementById('sendChat');

  // Theme load
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
    if (themeToggle) themeToggle.textContent = 'Light Mode';
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const dark = document.body.classList.toggle('dark');
      themeToggle.textContent = dark ? 'Light Mode' : 'Dark Mode';
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    });
  }

  function showResult(html) {
    if (!result) return;
    result.classList.remove('hidden');
    result.innerHTML = html;
  }

  function saveLocalBooking(b) {
    const list = JSON.parse(localStorage.getItem('bookings_local') || '[]');
    list.unshift(b);
    localStorage.setItem('bookings_local', JSON.stringify(list));
  }

  async function postBooking(booking) {
    const url = `${SERVER_URL.replace(/\/$/,'')}/api/bookings?v=${VER}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking)
      });
      if (!res.ok) {
        const text = await res.text().catch(()=>null);
        throw new Error(`Server responded ${res.status} ${res.statusText} ${text?': '+text:''}`);
      }
      const json = await res.json().catch(()=>null);
      return { ok: true, json };
    } catch (err) {
      return { ok: false, error: err.message || err.toString() };
    }
  }

  if (form) {
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

      if (saveLocal && saveLocal.checked) saveLocalBooking(booking);

      showResult('<p>Sending booking to server…</p>');

      const resp = await postBooking(booking);

      if (resp.ok) {
        showResult(`
          <h3>Booking Confirmed!</h3>
          <p><b>Service:</b> ${booking.service}</p>
          <p><b>Date:</b> ${booking.date}</p>
          <p><b>Time:</b> ${booking.time}</p>
          <p><b>Name:</b> ${booking.name}</p>
          <p class="muted">Server accepted booking.</p>
        `);
      } else {
        showResult(`
          <h3>Booking Saved Locally</h3>
          <p><b>Service:</b> ${booking.service}</p>
          <p><b>Date:</b> ${booking.date}</p>
          <p><b>Time:</b> ${booking.time}</p>
          <p class="muted">Could not reach server: ${resp.error}. Booking kept in localStorage.</p>
        `);
        console.warn('Booking post error:', resp.error);
      }

      // quick browser notification
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('Booking confirmed', { body: `${booking.service} on ${booking.date} ${booking.time}` });
        } else {
          Notification.requestPermission().catch(()=>{});
        }
      }

      form.reset();
      submitBtn.disabled = false;
    });
  }

  // Chat
  async function postChat(message) {
    const url = `${SERVER_URL.replace(/\/$/,'')}/api/chat?v=${VER}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      if (!res.ok) {
        const t = await res.text().catch(()=>null);
        throw new Error(`Chat server ${res.status} ${res.statusText} ${t?': '+t:''}`);
      }
      const j = await res.json();
      return j.reply || j?.answer || 'No response';
    } catch (err) {
      return `Chat error: ${err.message || err.toString()}`;
    }
  }

  function appendChat(who, text) {
    if (!chatLog) return;
    const el = document.createElement('div');
    el.className = 'chat-line';
    el.innerHTML = `<b>${who}:</b> ${text}`;
    chatLog.appendChild(el);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  if (sendChat) {
    sendChat.addEventListener('click', async () => {
      const text = chatInput.value.trim();
      if (!text) return;
      appendChat('You', text);
      chatInput.value = '';
      appendChat('Bot', 'Thinking...');
      const reply = await postChat(text);
      // remove last 'Thinking...' line
      const lines = chatLog.querySelectorAll('.chat-line');
      if (lines.length) {
        const last = lines[lines.length-1];
        if (last.textContent.includes('Thinking...')) last.remove();
      }
      appendChat('Bot', reply);
    });
  }

  // Expose for debug
  window.OBS = window.OBS || {};
  window.OBS.SERVER_URL = SERVER_URL;
  window.OBS.VER = VER;
})();
