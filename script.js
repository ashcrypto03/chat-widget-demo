// Floating widget toggle
const chatButton = document.getElementById("chatButton");
const chatWidget = document.getElementById("chatWidget");
const closeChat = document.getElementById("closeChat");

chatButton.addEventListener("click", () => {
  chatWidget.classList.toggle("active");
});

closeChat.addEventListener("click", () => {
  chatWidget.classList.remove("active");
});

const input = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const chatBody = document.getElementById("chatBody");

const WEBHOOK_URL = "https://g2u89k0h.rpcl.dev/webhook/chat"; // your n8n webhook
const BOT_AVATAR = "https://cdn-icons-png.flaticon.com/512/4712/4712109.png";
const USER_AVATAR = "https://cdn-icons-png.flaticon.com/512/4712/4712102.png";

function rowWithMessage(html, sender = "bot") {
  const row = document.createElement("div");
  row.classList.add("message-row", sender);

  const avatar = document.createElement("div");
  avatar.classList.add("avatar-small");
  const img = document.createElement("img");
  img.src = sender === "bot" ? BOT_AVATAR : USER_AVATAR;
  avatar.appendChild(img);

  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.innerHTML = html;

  row.appendChild(avatar);
  row.appendChild(msg);
  return row;
}

function appendMessage(html, sender = "bot") {
  chatBody.appendChild(rowWithMessage(html, sender));
  chatBody.scrollTop = chatBody.scrollHeight;
}

function showTyping() {
  const row = document.createElement("div");
  row.classList.add("message-row", "bot", "typing");
  row.innerHTML = `
    <div class="avatar-small"><img src="${BOT_AVATAR}" /></div>
    <div class="message bot">
      <div class="typing-dots"><span></span><span></span><span></span></div>
    </div>`;
  chatBody.appendChild(row);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function removeTyping() {
  const typing = chatBody.querySelector(".typing");
  if (typing) typing.remove();
}

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  appendMessage(text, "user");
  input.value = "";
  showTyping();

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatInput: text }),
    });

    const data = await res.json();
    removeTyping();

    // render line breaks nicely
    const safe = (data.reply ?? "No response received.").replace(/\n/g, "<br>");
    appendMessage(safe, "bot");
  } catch (err) {
    removeTyping();
    appendMessage("⚠️ Error connecting to the server.", "bot");
    console.error(err);
  }
}

// welcome message (optional)
appendMessage("Hi! Ask me anything.", "bot");

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});
