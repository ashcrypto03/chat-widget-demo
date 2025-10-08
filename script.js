// === Somnex AI Chat Widget ===

// DOM Elements
const chatButton = document.getElementById("chatButton");
const chatWidget = document.getElementById("chatWidget");
const closeChat = document.getElementById("closeChat");
const sendButton = document.getElementById("sendButton");
const userInput = document.getElementById("userInput");
const chatBody = document.getElementById("chatBody");

// 🔄 Toggle chat visibility
chatButton.addEventListener("click", () => {
  chatWidget.classList.toggle("active");
});

closeChat.addEventListener("click", () => {
  chatWidget.classList.remove("active");
});

// ✅ Send message on button click or Enter key
sendButton.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// 🧠 Function to handle sending message
async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  appendMessage("user", message);
  userInput.value = "";
  chatBody.scrollTop = chatBody.scrollHeight;

  try {
    // 🌐 Replace this URL with your actual n8n webhook URL
    const response = await fetch("https://g2u89k0h.rpcl.dev/webhook/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) throw new Error("Network error");
    const data = await response.json();

    const reply = data.reply || "🤖 Sorry, I couldn’t get a response.";
    appendMessage("bot", reply);
  } catch (error) {
    appendMessage("bot", "⚠️ Unable to reach n8n webhook server.");
  }

  chatBody.scrollTop = chatBody.scrollHeight;
}

// 💬 Append messages to chat
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
