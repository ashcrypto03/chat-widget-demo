// Simple floating chat widget
document.addEventListener("DOMContentLoaded", () => {
  console.log("[chat] script loaded");

  const chatButton = document.getElementById("chatButton");
  const chatWidget = document.getElementById("chatWidget");
  const closeChat  = document.getElementById("closeChat");
  const chatBody   = document.getElementById("chatBody");
  const chatInput  = document.getElementById("chatInput");
  const sendBtn    = document.getElementById("sendBtn");

  if (!chatButton || !chatWidget) {
    console.error("[chat] Missing required DOM nodes. Check IDs in index.html.");
    return;
  }

  // --- Toggle chat open/close ---
  chatButton.addEventListener("click", () => {
    console.log("[chat] toggle open");
    chatWidget.classList.toggle("active");
  });

  closeChat?.addEventListener("click", () => {
    console.log("[chat] close");
    chatWidget.classList.remove("active");
  });

  // --- Demo messages ---
  const BOT = "https://cdn-icons-png.flaticon.com/512/4712/4712109.png";
  const USER = "https://cdn-icons-png.flaticon.com/512/4712/4712102.png";

  function addMessage(text, who = "bot") {
    const row = document.createElement("div");
    row.className = `message-row ${who}`;
    row.innerHTML = `
      <div class="avatar-small"><img src="${who === "bot" ? BOT : USER}" alt="" /></div>
      <div class="message ${who}">${text}</div>
    `;
    chatBody.appendChild(row);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    addMessage(text, "user");
    chatInput.value = "";
    // --- Webhook call to n8n ---
const WEBHOOK_URL = "https://YOUR_N8N_WEBHOOK_URL_HERE"; // <-- paste your n8n webhook URL

async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;
  addMessage(text, "user");
  chatInput.value = "";

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatInput: text }), // match the variable name expected by your n8n webhook
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();

    // Handle reply text from n8n
    let reply = data.reply || "⚠️ No reply received.";
    reply = reply.replace(/\n/g, "<br>"); // handle new lines

    addMessage(reply, "bot");
  } catch (err) {
    console.error("Webhook error:", err);
    addMessage("⚠️ Unable to reach server.", "bot");
  }
}

  }

  sendBtn?.addEventListener("click", sendMessage);
  chatInput?.addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
  });

  addMessage("Hi! Click the green bubble to open/close me 🤖");
});
