// === Somnex AI Chat Widget ===

// DOM Elements
const chatButton = document.getElementById("chatButton");
const chatWidget = document.getElementById("chatWidget");
const closeChat = document.getElementById("closeChat");
const sendButton = document.getElementById("sendButton");
const userInput = document.getElementById("userInput");
const chatBody = document.getElementById("chatBody");

// 🌐 Replace with your actual n8n webhook URL
const WEBHOOK_URL = "https://g2u89k0h.rpcl.dev/webhook/chat";

// === TOGGLE CHAT ===
chatButton.addEventListener("click", () => {
  chatWidget.classList.toggle("active");
});

closeChat.addEventListener("click", () => {
  chatWidget.classList.remove("active");
});

// === SEND MESSAGE ON CLICK OR ENTER ===
sendButton.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// === SEND MESSAGE FUNCTION ===
async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  appendMessage("user", message);
  userInput.value = "";
  chatBody.scrollTop = chatBody.scrollHeight;

  // 🕒 Show typing animation
  const typingId = showTypingAnimation();

  try {
    // Send message to n8n webhook
    const response = await fetch("https://g2u89k0h.rpcl.dev/webhook/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }), // ✅ matches your n8n “message” field
    });

    if (!response.ok) throw new Error("Network error");
    const data = await response.json();

    // 🧠 Remove typing animation
    removeTypingAnimation(typingId);

    const reply = data.reply || data.output || "🤖 Sorry, I couldn’t get a response.";
    appendMessage("bot", reply);
  } catch (error) {
    removeTypingAnimation(typingId);
    appendMessage("bot", "⚠️ Unable to reach n8n webhook server.");
  }

  chatBody.scrollTop = chatBody.scrollHeight;
}

// === APPEND MESSAGE TO CHAT ===
function appendMessage(sender, text) {
  const messageRow = document.createElement("div");
  messageRow.classList.add("message-row", sender);

  const avatar = document.createElement("div");
  avatar.classList.add("avatar-small");
  const img = document.createElement("img");
  img.src =
    sender === "user"
      ? "https://cdn-icons-png.flaticon.com/512/4712/4712035.png"
      : "https://cdn-icons-png.flaticon.com/512/4712/4712027.png";
  avatar.appendChild(img);

  const message = document.createElement("div");
  message.classList.add("message", sender);
  message.innerHTML = text.replace(/\n/g, "<br>");

  if (sender === "user") {
    messageRow.appendChild(message);
    messageRow.appendChild(avatar);
  } else {
    messageRow.appendChild(avatar);
    messageRow.appendChild(message);
  }

  chatBody.appendChild(messageRow);
  chatBody.scrollTop = chatBody.scrollHeight;
}

// === TYPING ANIMATION ===
function showTypingAnimation() {
  const typingRow = document.createElement("div");
  typingRow.classList.add("message-row", "bot", "typing");
  typingRow.setAttribute("id", "typing-indicator");

  const avatar = document.createElement("div");
  avatar.classList.add("avatar-small");
  const img = document.createElement("img");
  img.src = "https://cdn-icons-png.flaticon.com/512/4712/4712027.png";
  avatar.appendChild(img);

  const typingDots = document.createElement("div");
  typingDots.classList.add("message", "bot");
  typingDots.innerHTML = `
    <div class="typing-animation">
      <span></span><span></span><span></span>
    </div>
    <div style="font-size:12px;color:#888;margin-top:4px;">Somnex is thinking...</div>
  `;

  typingRow.appendChild(avatar);
  typingRow.appendChild(typingDots);

  chatBody.appendChild(typingRow);
  chatBody.scrollTop = chatBody.scrollHeight;

  return typingRow.id;
}

// Remove typing animation
function removeTypingAnimation(id) {
  const typingRow = document.getElementById(id);
  if (typingRow) typingRow.remove();
}
