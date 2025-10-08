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
    chatWidget.classList.toggle("active");
  });

  closeChat?.addEventListener("click", () => {
    chatWidget.classList.remove("active");
  });

  // --- Chat message avatars ---
  const BOT = "https://cdn-icons-png.flaticon.com/512/4712/4712109.png";
  const USER = "https://cdn-icons-png.flaticon.com/512/4712/4712102.png";

  // --- Add message bubble ---
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

  // --- Send message to webhook ---
  const WEBHOOK_URL = "https://g2u89k0h.rpcl.dev/webhook/chat"; // your n8n webhook URL

  async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    addMessage(text, "user");
    chatInput.value = "";

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatInput: text }), // match your n8n field name
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();

      // Extract reply text from webhook response
      let reply = data.reply || "⚠️ No reply received from AI.";
      reply = reply.replace(/\n/g, "<br>"); // convert line breaks

      addMessage(reply, "bot");
    } catch (err) {
      console.error("Webhook error:", err);
      addMessage("⚠️ Unable to reach n8n webhook server.", "bot");
    }
  }

  // --- Event listeners ---
  sendBtn?.addEventListener("click", sendMessage);
  chatInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  // --- Greeting message ---
  addMessage("Hi! Click the green bubble to open/close me 🤖");
});
