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
    setTimeout(() => addMessage("This is a demo reply 🎉", "bot"), 400);
  }

  sendBtn?.addEventListener("click", sendMessage);
  chatInput?.addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
  });

  addMessage("Hi! Click the green bubble to open/close me 🤖");
});
