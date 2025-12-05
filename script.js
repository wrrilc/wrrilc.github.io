function loadComments() {
  const list = document.getElementById("commentsList");
  list.innerHTML = "";

  const saved = JSON.parse(localStorage.getItem("guestbook") || "[]");

  saved.forEach((c) => {
    const box = document.createElement("div");
    box.className = "comment-box";

    box.innerHTML = `
      <div class="comment-name">${c.name}</div>
      <div class="comment-text">${c.text}</div>
    `;

    list.appendChild(box);
  });
}

document.getElementById("postBtn").onclick = () => {
  const name = document.getElementById("usernameInput").value.trim();
  const text = document.getElementById("commentInput").value.trim();

  if (!name || !text) return alert("Enter name & message!");

  const saved = JSON.parse(localStorage.getItem("guestbook") || "[]");
  saved.push({ name, text });
  localStorage.setItem("guestbook", JSON.stringify(saved));

  document.getElementById("commentInput").value = "";
  loadComments();
};

document.getElementById("clearBtn").onclick = () => {
  if (confirm("Delete all messages?")) {
    localStorage.removeItem("guestbook");
    loadComments();
  }
};

loadComments();
