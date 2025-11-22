const SERVER_URL = 'http://localhost:3000';

const adminKeyInput = document.getElementById('adminKey');
const loadBtn = document.getElementById('loadBtn');
const localList = document.getElementById('localList');
const serverList = document.getElementById('serverList');
const statusDiv = document.getElementById('status');
const clearLocal = document.getElementById('clearLocal');

function renderList(el, items) {
  el.innerHTML = "";
  if (!items || items.length === 0) {
    el.innerHTML = "<div class='muted'>No bookings</div>";
    return;
  }
  items.forEach(b => {
    const d = document.createElement("div");
    d.className = "item";
    d.innerHTML = `
      <div><b>${b.service}</b> — ${b.date} ${b.time}</div>
      <div>${b.name} • ${b.email || ''} • ${b.mobile || ''}</div>
      <div class="muted">${new Date(b.createdAt).toLocaleString()}</div>
    `;
    el.appendChild(d);
  });
}

function loadLocal() {
  const list = JSON.parse(localStorage.getItem('bookings_local') || '[]');
  renderList(localList, list);
}

clearLocal.addEventListener('click', () => {
  if (!confirm("Clear local bookings?")) return;
  localStorage.removeItem('bookings_local');
  loadLocal();
});

loadBtn.addEventListener('click', async () => {
  loadLocal();
  const key = adminKeyInput.value.trim();
  if (!key) {
    statusDiv.textContent = "Enter admin key.";
    return;
  }

  statusDiv.textContent = "Loading...";
  try {
    const r = await fetch(SERVER_URL + '/api/bookings', {
      headers: { 'x-admin-key': key }
    });

    if (r.status === 401) {
      statusDiv.textContent = "Unauthorized";
      serverList.innerHTML = "";
      return;
    }

    const data = await r.json();
    renderList(serverList, data);
    statusDiv.textContent = "Loaded " + data.length + " bookings.";
  } catch (err) {
    statusDiv.textContent = "Server offline";
  }
});

loadLocal();
