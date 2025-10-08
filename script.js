document.addEventListener("DOMContentLoaded", () => {
  // === Floating widget toggle ===
  const chatButton = document.getElementById("chatButton");
  const chatWidget = document.getElementById("chatWidget");
  const closeChat = document.getElementById("closeChat");

  chatButton.addEventListener("click", () => {
    chatWidget.classList.toggle("active");
  });

  closeChat.addEventListener("click", () => {
    chatWidget.classList.remove("active");
  });

  // === Chat logic ===
  const input = document.getElementById("chatInput");
  const sendBtn = document.getElementById("sendBtn");
  const chatBody = document.getElementById("chatBody");

  const WEBHOOK_URL = "https://g2u89k0h._
