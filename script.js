const chatContainer = document.getElementById("chatContainer");
const chatToggle = document.getElementById("chatToggle");
const closeChat = document.getElementById("closeChat");
const sendButton = document.getElementById("sendButton");
const userInput = document.getElementById("userInput");
const chatBox = document.getElementById("chatBox");

// === TOGGLE CHAT ===
chatToggle.addEventListener("click", () => {
  const isVisible = chatContainer.style.display === "flex";
  chatContainer.style.display = isVisible ? "none" : "flex";
  chatToggle.style.display = isVisible ? "block" : "none"; // Hide toggle when open
});

closeChat.addEventListener("click", () => {
  chatContainer.style.display = "none";
  chatToggle.style.display = "block"; // Show toggle again when closed
});

// === SANITIZE TEXT ===
function cleanText(text) {
  return text.replace(/\*\*/g, "").replace(/#/g, "").replace(/\*/g, "");
}

// === ADD MESSAGE TO CHAT ===
function addMessage(content, sender) {
  const messageWrapper = document.createElement("div");
  messageWrapper.classList.add(sender === "user" ? "user-message" : "bot-message");

  const avatar = document.createElement("div");
  avatar.classList.add(sender === "user" ? "user-avatar" : "bot-avatar");
  avatar.textContent = sender === "user" ? "🧠" : "🤖";

  const message = document.createElement("div");
  message.classList.add("message");
  message.innerHTML = cleanText(content);

  messageWrapper.appendChild(avatar);
  messageWrapper.appendChild(message);
  chatBox.appendChild(messageWrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// === TYPING INDICATOR ===
function showTyping() {
  const typing = document.createElement("div");
  typing.classList.add("typing");
  typing.textContent = "Somnex is thinking...";
  chatBox.appendChild(typing);
  chatBox.scrollTop = chatBox.scrollHeight;
  return typing;
}

// === SEND MESSAGE ===
async function sendMessage() {
  const message = userInput.value.trim();
  if (message === "") return;

  addMessage(message, "user");
  userInput.value = "";

  const typing = showTyping();

  try {
    // Replace with your actual webhook URL
    const response = await fetch("https://your-n8n-webhook-url/webhook/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();
    typing.remove();
    addMessage(data.reply || "Sorry, something went wrong.", "bot");
  } catch (error) {
    typing.remove();
    addMessage("⚠️ Unable to reach Somnex server.", "bot");
  }
}

// === EVENT LISTENERS ===
sendButton.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
