// ---------- Utilities ----------
const rand = (min, max) => Math.random() * (max - min) + min;
const el = (id) => document.getElementById(id);

// ---------- Sparkles (floating) ----------
let sparklesOn = true;
function spawnSparkles(count = 8) {
  const container = el("sparkles");
  container.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const s = document.createElement("div");
    s.className = "sparkle";
    // random start position within content area
    const left = rand(5, 85);
    s.style.left = left + "%";
    s.style.top = rand(-10, 10) + "vh";
    s.style.animationDelay = rand(0, 5).toFixed(2) + "s";
    s.style.transform = `scale(${rand(0.7, 1.2)})`;
    container.appendChild(s);
  }
}
spawnSparkles(10);

// toggle sparkles
el("toggleSparkles").addEventListener("click", () => {
  const container = el("sparkles");
  sparklesOn = !sparklesOn;
  container.style.display = sparklesOn ? "block" : "none";
});

// ---------- Cursor toggle ----------
let cursorOn = true;
const cursorImage = "images/heart_cursor.png"; // include in /images
function enableCursor(flag) {
  if (flag) {
    document.body.style.cursor = `url("${cursorImage}") 8 8, auto`;
  } else {
    document.body.style.cursor = "";
  }
}
el("changeCursor").addEventListener("click", () => {
  cursorOn = !cursorOn;
  enableCursor(cursorOn);
});
// set initial cursor (on)
enableCursor(true);

// ---------- Place blinkie on content (retro) ----------
el("placeBlinkie").addEventListener("click", () => {
  placeSticker("https://i.imgur.com/c3ji33l.gif", 120, 120);
});

// ---------- Stickers palette: click to place a draggable sticker ----------
document.querySelectorAll(".sticker-thumb").forEach((img) => {
  img.addEventListener("click", () => {
    const src = img.getAttribute("data-src") || img.src;
    placeSticker(src, 96, 96);
  });
});

function placeSticker(src, w = 96, h = 96) {
  const layer = el("stickerLayer");
  layer.style.pointerEvents = "auto";
  const s = document.createElement("img");
  s.src = src;
  s.className = "sticker";
  s.style.left = rand(200, 500) + "px";
  s.style.top = rand(50, 200) + "px";
  s.style.width = w + "px";
  s.style.height = h + "px";
  // make draggable
  makeDraggable(s);
  layer.appendChild(s);
}

// draggable helper
function makeDraggable(node) {
  node.draggable = false;
  let offsetX = 0,
    offsetY = 0,
    dragging = false;

  node.addEventListener("mousedown", (e) => {
    dragging = true;
    node.style.cursor = "grabbing";
    offsetX = e.clientX - node.getBoundingClientRect().left;
    offsetY = e.clientY - node.getBoundingClientRect().top;
    // bring to front
    node.style.zIndex = Math.floor(Date.now() / 1000);
  });

  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    node.style.left = e.clientX - offsetX + "px";
    node.style.top = e.clientY - offsetY + "px";
  });

  document.addEventListener("mouseup", () => {
    if (dragging) {
      dragging = false;
      node.style.cursor = "grab";
    }
  });

  // double-click to remove sticker
  node.addEventListener("dblclick", () => node.remove());
}

// ---------- Glitter text generator ----------
el("makeGlitter").addEventListener("click", () => {
  const txt = el("glitterInput").value.trim();
  if (!txt) return alert("type something to glitter!");
  const style = el("glitterStyle").value;
  const span = document.createElement("span");
  span.className = `glitter glitter-${style}`;
  span.textContent = txt;
  // add style classes for color / effect
  if (style === "pink") span.classList.add("glitter-pink");
  if (style === "blue") span.classList.add("glitter-blue");
  if (style === "gold") span.classList.add("glitter-gold");
  // append to output
  el("glitterOutput").appendChild(span);
  // clicking the generated span inserts it into the content as an H2
  span.addEventListener("click", () => {
    const h = document.createElement("h2");
    h.className = "page-header";
    h.textContent = txt;
    document
      .querySelector(".content")
      .insertBefore(h, document.querySelector(".panel"));
  });
  el("glitterInput").value = "";
});

// ---------- Guestbook (messages) ----------
function renderMessages() {
  const list = el("messages");
  list.innerHTML = "";
  const saved = JSON.parse(localStorage.getItem("guestbook_v2") || "[]");
  saved
    .slice()
    .reverse()
    .forEach((item) => {
      const m = document.createElement("div");
      m.className = "message";
      const when = new Date(item.time);
      const t = when.toLocaleString();
      m.innerHTML = `<div><span class="msg-name">${escapeHtml(
        item.name
      )}</span> <span class="msg-time">${t}</span></div>
                   <div class="msg-text">${escapeHtml(item.text)}</div>`;
      list.appendChild(m);
    });
}
function escapeHtml(s) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

el("postBtn").addEventListener("click", () => {
  const name = (el("nameInput").value || "anon").trim();
  const email = (el("emailInput").value || "").trim();
  const text = (el("msgInput").value || "").trim();
  if (!text) return alert("write a message!");
  const saved = JSON.parse(localStorage.getItem("guestbook_v2") || "[]");
  saved.push({ name, email, text, time: Date.now() });
  localStorage.setItem("guestbook_v2", JSON.stringify(saved));
  el("msgInput").value = "";
  renderMessages();
});
el("clearBtn").addEventListener("click", () => {
  if (confirm("Clear guestbook?")) {
    localStorage.removeItem("guestbook_v2");
    renderMessages();
  }
});
el("exportBtn").addEventListener("click", () => {
  const saved = localStorage.getItem("guestbook_v2") || "[]";
  const blob = new Blob([saved], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "guestbook.json";
  a.click();
  URL.revokeObjectURL(url);
});

// initial render
renderMessages();

// ---------- Tagboard (mini live) ----------
function renderTagboard() {
  const area = el("tagboardArea");
  area.innerHTML = "";
  const arr = JSON.parse(localStorage.getItem("tagboard_v1") || "[]");
  arr
    .slice()
    .reverse()
    .forEach((e) => {
      const d = document.createElement("div");
      d.innerHTML = `<b style="color:#b3005c">${escapeHtml(
        e.name
      )}</b> : ${escapeHtml(e.msg)}`;
      area.appendChild(d);
    });
}
el("tagPost").addEventListener("click", () => {
  const name = (el("tagName").value || "anon").trim();
  const msg = (el("tagMsg").value || "").trim();
  if (!msg) return alert("type a short message");
  const arr = JSON.parse(localStorage.getItem("tagboard_v1") || "[]");
  arr.push({ name, msg, t: Date.now() });
  localStorage.setItem("tagboard_v1", JSON.stringify(arr));
  el("tagMsg").value = "";
  renderTagboard();
});
renderTagboard();

// ---------- Marquee toggle ----------
let marqueeOn = true;
const marquee = document.querySelector(".retro-marquee");
el("marqueeToggle").addEventListener("click", () => {
  marqueeOn = !marqueeOn;
  marquee.style.display = marqueeOn ? "block" : "none";
});

// ---------- Music: try play on first user interaction for autoplay blocked browsers ----------
const audio = document.getElementById("bgMusic");
function enableMusicOnInteraction() {
  function tryPlay() {
    if (!audio) return;
    audio.play().catch(() => {}); // browsers may block; that's OK
    document.removeEventListener("click", tryPlay);
  }
  document.addEventListener("click", tryPlay);
}
enableMusicOnInteraction();

// ---------- small helper: clear sticker layer on double-click content -->
document.querySelector(".content").addEventListener("dblclick", (e) => {
  // if user double-clicks empty content, remove any sticker under pointer only
  // (we allow double-click on sticker to remove; this is a safety net)
});

// ---------- On load: set defaults ----------
enableCursor(true);
spawnSparkles(12);
renderMessages();
renderTagboard();
