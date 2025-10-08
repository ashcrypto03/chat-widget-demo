/*
  Embeddable Chat Widget — Vanilla JS, Shadow DOM, zero deps
  Drop this file somewhere public and include it on any page:

  <script
    src="/path/to/chat-widget.js"
    data-webhook="https://your-n8n-host/webhook/production-chat"
    data-title="Apollo"
    data-primary="#10b981"
    data-position="bottom-right"   /* bottom-right | bottom-left */
    data-welcome="Ask me anything!"
    data-avatar="https://yourcdn/avatar.png"
    defer
  ></script>

  The script injects a floating button + chat panel in a Shadow DOM so it won't clash with your CSS.
  It POSTs messages to your n8n webhook with JSON: { message, history, sessionId, meta }.
  Expected response JSON: { reply: string } (optionally { reply, sources: [...]} ).
*/
(function () {
  const SCRIPT = document.currentScript;
  if (!SCRIPT) return;

  // --- Config ---
  const CFG = {
    webhook: SCRIPT.getAttribute('data-webhook') || '',
    title: SCRIPT.getAttribute('data-title') || 'Chat',
    primary: SCRIPT.getAttribute('data-primary') || '#16a34a',
    position: SCRIPT.getAttribute('data-position') || 'bottom-right',
    welcome: SCRIPT.getAttribute('data-welcome') || 'Hi! How can I help?',
    avatar: SCRIPT.getAttribute('data-avatar') || '',
    zIndex: 2147483000,
    maxHistory: 24,            // messages kept per session
    requestTimeoutMs: 30000,   // 30s timeout
    locale: 'en',
  };
  if (!CFG.webhook) {
    console.warn('[chat-widget] Missing data-webhook attribute.');
  }

  // --- Utilities ---
  const uid = () => Math.random().toString(36).slice(2);
  const sessionId = (() => {
    const KEY = 'cw_session_id';
    let id = sessionStorage.getItem(KEY);
    if (!id) { id = uid(); sessionStorage.setItem(KEY, id); }
    return id;
  })();

  const store = {
    key: 'cw_history',
    get() {
      try { return JSON.parse(localStorage.getItem(this.key) || '[]'); }
      catch { return []; }
    },
    set(v) { localStorage.setItem(this.key, JSON.stringify(v.slice(-CFG.maxHistory))); }
  };

  const escapeHTML = (s) => s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const linkify = (text) => {
    // Very small linkifier
    const urlRe = /(https?:\/\/[^\s)]+)|(www\.[^\s)]+)/g;
    return text.replace(urlRe, (m) => {
      const url = m.startsWith('http') ? m : 'http://' + m;
      const safe = escapeHTML(m);
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${safe}</a>`;
    });
  };

  const renderMarkdownLite = (text) => {
    // minimal markdown: **bold**, *italic*, `code`, links via linkify
    let html = escapeHTML(text)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
    html = linkify(html);
    return html.replace(/\n/g, '<br>');
  };

  const fetchWithTimeout = (url, options = {}, timeout = CFG.requestTimeoutMs) => {
    return new Promise((resolve, reject) => {
      const id = setTimeout(() => reject(new Error('timeout')), timeout);
      fetch(url, options).then((res) => {
        clearTimeout(id);
        resolve(res);
      }).catch((err) => { clearTimeout(id); reject(err); });
    });
  };

  // --- Shadow root & DOM ---
  const container = document.createElement('div');
  container.style.all = 'initial';
  container.style.position = 'fixed';
  container.style[CFG.position.includes('right') ? 'right' : 'left'] = '20px';
  container.style.bottom = '20px';
  container.style.zIndex = String(CFG.zIndex);
  const shadow = container.attachShadow({ mode: 'open' });
  document.body.appendChild(container);

  shadow.innerHTML = `
    <style>
      :host { all: initial; }
      @media (max-width: 480px) { .panel { width: 92vw; height: 72vh; } }
      .button { display:flex; align-items:center; justify-content:center; width:56px; height:56px; border-radius:50%;
        background:${CFG.primary}; color:#fff; box-shadow:0 10px 20px rgba(0,0,0,.15); cursor:pointer; border:none; }
      .badge { position:absolute; top:-4px; right:-4px; background:#ef4444; color:#fff; font: 600 10px/1 ui-sans-serif,system-ui; padding:3px 6px; border-radius:999px; }
      .panel { display:none; position:fixed; inset:auto auto 88px ${CFG.position.includes('right') ? 'auto' : '20px'}; ${CFG.position.includes('right') ? 'right:20px' : ''};
        width:360px; height:520px; border-radius:16px; overflow:hidden; background:#fff; color:#0f172a; box-shadow:0 24px 60px rgba(2,6,23,.35); }
      .header { display:flex; align-items:center; gap:10px; padding:12px 14px; background:linear-gradient(180deg, ${CFG.primary}, #0ea5e9); color:#fff; }
      .title { font: 700 14px ui-sans-serif,system-ui; letter-spacing:.3px; }
      .sub { font: 400 11px ui-sans-serif,system-ui; opacity:.9 }
      .grow { flex:1 }
      .xbtn, .minbtn { background:transparent; border:none; color:#fff; cursor:pointer; font-size:18px }
      .messages { height: calc(100% - 120px); overflow:auto; padding:14px; background:#f8fafc }
      .row { display:flex; margin:10px 0; gap:10px; align-items:flex-end; }
      .row.user { justify-content:flex-end; }
      .bubble { max-width:78%; padding:10px 12px; border-radius:14px; font: 400 13px ui-sans-serif,system-ui; line-height:1.35; }
      .user .bubble { background:#dcfce7; color:#052e16; border-bottom-right-radius:4px }
      .bot .bubble { background:#ffffff; color:#0f172a; border:1px solid #e2e8f0; border-bottom-left-radius:4px }
      .footer { display:flex; align-items:center; gap:8px; padding:12px; border-top:1px solid #e5e7eb; background:#fff }
      .input { flex:1; border:1px solid #cbd5e1; border-radius:12px; padding:10px 12px; font: 400 13px ui-sans-serif,system-ui; outline:none }
      .send { border:none; background:${CFG.primary}; color:#fff; border-radius:10px; padding:10px 12px; cursor:pointer; font:600 13px ui-sans-serif,system-ui }
      .avatar { width:28px; height:28px; border-radius:50%; background:#e2e8f0; }
      .typing { font: 400 12px ui-sans-serif,system-ui; color:#475569 }
      .hidden { display:none }
      .open { display:block }
      .sr { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0 }
      .link { color:#2563eb; text-decoration:none; }
      .sources { margin-top:6px; font: 400 11px ui-sans-serif,system-ui; color:#475569 }
      .sources a { color:#2563eb; text-decoration:none }
    </style>

    <button class="button" aria-label="Open chat">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M21 12c0 3.866-4.03 7-9 7-.986 0-1.93-.117-2.804-.333L3 20l1.64-3.28C4.237 15.516 3 13.86 3 12c0-3.866 4.03-7 9-7s9 3.134 9 7Z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>

    <div class="panel" role="dialog" aria-modal="true" aria-label="${CFG.title} chat">
      <div class="header">
        ${CFG.avatar ? `<img class="avatar" src="${CFG.avatar}" alt="">` : `<div class="avatar"></div>`}
        <div>
          <div class="title">${CFG.title}</div>
          <div class="sub">${CFG.welcome}</div>
        </div>
        <div class="grow"></div>
        <button class="minbtn" title="Minimize" aria-label="Minimize">–</button>
        <button class="xbtn" title="Close" aria-label="Close">×</button>
      </div>
      <div class="messages" aria-live="polite"></div>
      <div class="footer">
        <label class="sr" for="cw-input">Type your message</label>
        <input id="cw-input" class="input" type="text" placeholder="Type a message…" maxlength="2000" />
        <button class="send">Send</button>
      </div>
    </div>
  `;

  const $ = (sel) => shadow.querySelector(sel);
  const btn = $('.button');
  const panel = $('.panel');
  const messages = $('.messages');
  const input = $('.input');
  const sendBtn = $('.send');
  const xbtn = $('.xbtn');
  const minbtn = $('.minbtn');

  // --- State ---
  let history = store.get();
  const pushHistory = (role, content) => {
    history.push({ role, content, t: Date.now() });
    history = history.slice(-CFG.maxHistory);
    store.set(history);
  };

  // --- UI helpers ---
  const scrollToBottom = () => { messages.scrollTop = messages.scrollHeight; };
  const addRow = (role, content, sources) => {
    const row = document.createElement('div');
    row.className = `row ${role}`;
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerHTML = renderMarkdownLite(content);
    row.appendChild(bubble);
    if (role === 'bot' && Array.isArray(sources) && sources.length) {
      const src = document.createElement('div');
      src.className = 'sources';
      src.innerHTML = 'Sources: ' + sources.map(s => `<a href="${escapeHTML(s.url || s)}" target="_blank" rel="noopener noreferrer">${escapeHTML(s.title || 'link')}</a>`).join(' · ');
      row.appendChild(src);
    }
    messages.appendChild(row);
    scrollToBottom();
    return row;
  };

  const addTyping = () => {
    const row = document.createElement('div');
    row.className = 'row bot typing';
    row.innerHTML = '<div class="bubble">Typing…</div>';
    messages.appendChild(row);
    scrollToBottom();
    return row;
  };

  const setOpen = (v) => { panel.classList.toggle('open', v); };

  // --- Restore previous history to UI ---
  if (history.length === 0) {
    addRow('bot', CFG.welcome);
  } else {
    history.forEach(m => addRow(m.role === 'user' ? 'user' : 'bot', m.content));
  }

  // --- Events ---
  const send = async () => {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    addRow('user', text);
    pushHistory('user', text);
    const typing = addTyping();

    try {
      const res = await fetchWithTimeout(CFG.webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: history.map(({ role, content }) => ({ role, content })),
          sessionId,
          meta: { url: location.href, userAgent: navigator.userAgent, tz: Intl.DateTimeFormat().resolvedOptions().timeZone }
        }),
        credentials: 'omit',
        mode: 'cors',
      });

      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const reply = (data && (data.reply || data.text)) || 'No reply received.';
      messages.removeChild(typing);
      addRow('bot', reply, data && data.sources);
      pushHistory('bot', reply);
    } catch (err) {
      messages.removeChild(typing);
      const msg = err && err.message === 'timeout' ?
        'The server took too long to respond. Please try again.' :
        'There was an error reaching the server.';
      addRow('bot', msg);
      pushHistory('bot', msg);
      console.error('[chat-widget]', err);
    }
  };

  btn.addEventListener('click', () => setOpen(true));
  xbtn.addEventListener('click', () => setOpen(false));
  minbtn.addEventListener('click', () => setOpen(false));
  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
})();
