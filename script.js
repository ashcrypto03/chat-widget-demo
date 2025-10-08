// This runs after DOM because of `defer` in index.html
console.log('[chat] script loaded');

const chatButton = document.getElementById('chatButton');
const chatWidget = document.getElementById('chatWidget');
const closeChat  = document.getElementById('closeChat');
const chatBody   = document.getElementById('chatBody');
const input      = document.getElementById('chatInput');
const sendBtn    = document.getElementById('sendBtn');

// Debug: verify we actually found the elements
console.log('[chat] elements', { chatButton, chatWidget, closeChat, chatBody, input, sendBtn });

if (!chatButton || !chatWidget) {
  console.error('[chat] Missing required DOM nodes. Check IDs in index.html.');
}

// Toggle open/close
chatButton?.addEventListener('click', () => {
  console.log('[chat] open toggle');
  chatWidget.classList.toggle('active');
});

closeChat?.addEventListener('click', () => {
  console.log('[chat] close clicked');
  chatWidget.classList.remove('active');
});

// --- Minimal chat demo (works without backend) ---
const BOT_AVATAR  = 'https://cdn-icons-png.flaticon.com/512/4712/4712109.png';
const USER_AVATAR = 'https://cdn-icons-png.flaticon.com/512/4712/4712102.png';
// const WEBHOOK_URL = 'https://g2u89k0h.rpcl.dev/webhook/chat'; // your webhook (uncomment to enable)

function rowWithMessage(html, sender='bot') {
  const row = document.createElement('div');
  row.className = `message-row ${sender}`;
  row.innerHTML = `
    <div class="avatar-small"><img src="${sender==='bot'?BOT_AVATAR:USER_AVATAR}" alt=""></div>
    <div class="message ${sender}">${html}</div>
  `;
  return row;
}

function appendMessage(html, sender='bot') {
  chatBody.appendChild(rowWithMessage(html, sender));
  chatBody.scrollTop = chatBody.scrollHeight;
}

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;
  appendMessage(text, 'user');
  input.value = '';

  // --- Demo reply (remove when using webhook) ---
  setTimeout(() => {
    appendMessage("This is a demo reply. Your widget is working! 🎉", 'bot');
  }, 400);

  // --- Real webhook call ---
  // try {
  //   const res = await fetch(WEBHOOK_URL, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ chatInput: text }),
  //   });
  //   const data = await res.json();
  //   appendMessage((data.reply || 'No reply').replace(/\n/g,'<br>'), 'bot');
  // } catch (e) {
  //   console.error(e);
  //   appendMessage('⚠️ Error connecting to server.', 'bot');
  // }
}

sendBtn?.addEventListener('click', sendMessage);
input?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendMessage();
});

// Optional welcome
appendMessage('Hi! Click the green bubble to open/close me 🤖', 'bot');
