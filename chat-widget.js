/*
  Lightweight Chat Widget — Vanilla JS + Shadow DOM
  Works with an n8n Webhook endpoint that accepts JSON:
  { "message": "...", "history": [...], "sessionId": "..." }
  and responds with:
  { "reply": "..." }
*/

(function () {
  // --- Script tag detection ---
  const SCRIPT =
    document.currentScript ||
    document.querySelector('script[src$="chat-widget.js"]');
  if (!SCRIPT) {
    console.warn("[chat-widget] Could not find script tag.");
    return;
  }

  console.log("[chat-widget] Script loaded.");

  // --- Config ---
  const CFG = {
    webhook: SCRIPT.getAttribute("data-webhook") || "",
    title: SCRIPT.getAttribute("data-title") || "AI Assistant",
    primary: SCRIPT.getAttribute("data-primary") || "#0088cc",
    position: SCRIPT.getAttribute("data-position") || "bottom-right",
    welcome: SCRIPT.getAttribute("data-welcome") || "Hi there! How can I help?",
    avatar: SCRIPT.getAttribute("data-avatar") || "",
    zIndex: 2147483000,
    maxHistory: 24,
    requestTimeoutMs: 30000,
    locale: "en",
  };

  if (!CFG.webhook) {
    console.warn("[chat-widget] Missing data-webhook attribute.");
    return;
  }

  console.log("[chat-widget] Widget initialized with config:", CFG);

  // --- Build the widget UI inside a Shadow DOM ---
  const shadowHost = document.createElement("div");
  shadowHost.style.position = "fixed";
  shadowHost.style.zIndex = CFG.zIndex;
  shadowHost.style[CFG.position.split("-")[0]] = "20px";
  shadowHost.style[CFG.position.split("-")[1]] = "20px";
  document.body.appendChild(shadowHost);

  const shadow = shadowHost.attachShadow({ mode: "open" });

  shadow.innerHTML = `
    <style>
      :host {
        all: initial;
        font-family: sans-serif;
      }
      .bubble {
        background: ${CFG.primary};
        color: white;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        transition: transform 0.2s;
      }
      .bubble:hover {
        transform: scale(1.1);
      }
      .chat-box {
        position: absolute;
        bottom: 80px;
        right: 0;
        width: 320px;
        height: 400px;
        background: white;
        border-radius: 10px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        display: none;
        flex-direction: column;
        overflow: hidden;
      }
      header {
        background: ${CFG.primary};
        color: white;
        padding: 10px;
        text-align: center;
      }
      .messages {
        flex: 1;
        padding: 10px;
        overflow-y: auto;
        font-size: 14px;
      }
      .input {
        display: flex;
        border-top: 1px solid #ccc;
      }
      .input input {
        flex: 1;
        border: none;
        padding: 10px;
        font-size: 14px;
        outline: none;
      }
      .input button {
        background: ${CFG.primary};
        color: white;
        border: none;
        padding: 0 16px;
        cursor: pointer;
      }
      .msg {
        margin: 5px 0;
      }
      .msg.user {
        text-align: right;
        color: ${CFG.primary};
      }
      .msg.bot {
        text-align: left;
        color: #333;
      }
    </style>

    <div class="bubble">💬</div>
    <div class="chat-box">
      <header>${CFG.title}</header>
      <div class="messages"></div>
      <div class="input">
        <input type="text" placeholder="Type a message..." />
        <button>Send</button>
      </div>
    </div>
  `;

  const bubble = shadow.querySelector(".bubble");
  const chatBox = shadow.querySelector(".chat-box");
  const messages = shadow.querySelector(".messages");
  const input = shadow.querySelector("input");
  const sendBtn = shadow.querySelector("button");

  bubble.addEventListener("click", () => {
    chatBox.style.display =
      chatBox.style.display === "flex" ? "none" : "flex";
  });

  // --- Message logic ---
  const appendMessage = (text, sender = "bot") => {
    const msg = document.createElement("div");
    msg.className = `msg ${sender}`;
    msg.textContent = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  };

  appendMessage(CFG.welcome, "bot");

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    appendMessage(text, "user");
    input.value = "";

    try {
      const res = await fetch(CFG.webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatInput: text }),
      });

      const data = await res.json();
      const reply = data.reply || "No response received.";
      appendMessage(reply, "bot");
    } catch (err) {
      appendMessage("Error: unable to reach server.", "bot");
      console.error("[chat-widget] Error:", err);
    }
  }

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });
})();
