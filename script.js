// Load saved comments
function loadComments() {
  const commentsList = document.getElementById("commentsList");
  commentsList.innerHTML = "";

  const saved = JSON.parse(localStorage.getItem("comments") || "[]");

  saved.forEach((c) => {
    const box = document.createElement("div");
    box.className = "comment-box";

    box.innerHTML = `
      <div class="comment-name">${c.name}</div>
      <div class="comment-text">${c.text}</div>
    `;

    commentsList.appendChild(box);
  });
}

// Save a new comment
document.getElementById("postBtn").onclick = () => {
  const name = document.getElementById("usernameInput").value.trim();
  const text = document.getElementById("commentInput").value.trim();

  if (!name || !text) return alert("Please enter a name and a message 💗");

  const saved = JSON.parse(localStorage.getItem("comments") || "[]");

  saved.push({ name, text });

  localStorage.setItem("comments", JSON.stringify(saved));

  document.getElementById("commentInput").value = "";
  loadComments();
};

// Clear all comments
document.getElementById("clearBtn").onclick = () => {
  if (confirm("Clear all comments?")) {
    localStorage.removeItem("comments");
    loadComments();
  }
};

// Status toggle (keeps your original function)
document.getElementById("statusToggle").onclick = () => {
  const status = document.getElementById("statusText");
  status.textContent = status.textContent.includes("melon")
    ? "status: daydreaming..."
    : "status: drinking melon soda";
};

// Load comments on page load
loadComments();
