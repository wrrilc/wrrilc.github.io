// Comment + status logic

const postBtn = document.getElementById("postBtn");
const clearBtn = document.getElementById("clearBtn");
const list = document.getElementById("commentsList");
const input = document.getElementById("commentInput");
const statusText = document.getElementById("statusText");
const statusToggle = document.getElementById("statusToggle");

// Load comments
let comments = JSON.parse(localStorage.getItem("cute_comments") || "[]");

function renderComments() {
  list.innerHTML = "";

  if (comments.length === 0) {
    list.innerHTML = `<div style="color:#7b6b7b;font-size:13px">no comments yet — be the first! ♡</div>`;
    return;
  }

  comments
    .slice()
    .reverse()
    .forEach((text) => {
      const div = document.createElement("div");
      div.className = "comment";
      div.textContent = text;
      list.appendChild(div);
    });
}

postBtn.addEventListener("click", () => {
  const text = input.value.trim();
  if (!text) return alert("write something cute!");
  comments.push(text);
  localStorage.setItem("cute_comments", JSON.stringify(comments));
  input.value = "";
  renderComments();
});

clearBtn.addEventListener("click", () => {
  if (!confirm("Clear all comments?")) return;
  comments = [];
  localStorage.removeItem("cute_comments");
  renderComments();
});

statusToggle.addEventListener("click", () => {
  statusText.style.display =
    statusText.style.display === "none" ? "inline" : "none";
});

// Fake navigation
window.navSample = function (page) {
  alert("Navigate to: " + page + " (demo only!)");
};

// initial load
renderComments();
