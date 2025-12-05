/* ========== Full retro JS: decorations + player (cleaned: toolbox + bottom panel removed) ========== */

/* --------- Helpers --------- */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const rand = (a, b) => Math.random() * (b - a) + a;
const byId = (id) => document.getElementById(id);

/* --------- State --------- */
let sparklesOn = true;
let fallingOn = false;
let cursorOn = true;
let marqueeOn = true;
let pixelOn = false;
let bordersOn = false;

/* --------- Elements --------- */
const stickerLayer = byId("stickerLayer");
const sparkleLayer = byId("sparkles");
const fallingLayer = byId("falling");
const marqueeEl = byId("retroMarquee");
const playlistEl = byId("playlist");
const messagesEl = byId("messages");

/* --------- ASSETS --------- */
const STICKERS = [
  "https://i.imgur.com/c3ji33l.gif",
  "https://i.imgur.com/GIfzEak.gif",
  "https://i.imgur.com/RA2W8Ac.gif",
  "https://i.imgur.com/ExdKOOz.png",
  "https://i.imgur.com/1qkYQ3Y.png",
  "https://i.imgur.com/wx2c8QF.png",
];
const BACKGROUNDS = [
  "https://i.imgur.com/RA2W8Ac.gif",
  "https://i.imgur.com/0f2Kk1l.png",
  "https://i.imgur.com/7y5rG9X.gif",
];

/* cursor image */
const cursorURL = "https://i.imgur.com/7r7qv3b.png";
function enableCursor(flag) {
  document.body.style.cursor = flag ? `url(${cursorURL}) 8 8, auto` : "";
  cursorOn = !!flag;
}

/* --------- Sparkles (floating) --------- */
function spawnSparkles(count = 10) {
  if (!sparkleLayer) return;
  sparkleLayer.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const s = document.createElement("div");
    s.className = "sparkle";
    s.style.left = rand(0, 90) + "%";
    s.style.top = rand(-20, 10) + "vh";
    s.style.animationDelay = rand(0, 4) + "s";
    s.style.transform = `scale(${rand(0.7, 1.2)})`;
    sparkleLayer.appendChild(s);
  }
}
spawnSparkles(12);

/* --------- Falling sparkles --------- */
function spawnFalling(count = 12) {
  if (!fallingLayer) return;
  fallingLayer.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const f = document.createElement("div");
    f.className = "fall";
    f.style.left = rand(0, 95) + "%";
    f.style.top = rand(-40, -5) + "vh";
    f.style.animationDuration = rand(4, 10) + "s";
    fallingLayer.appendChild(f);
  }
}

/* --------- ACTIONS for tool buttons --------- */
const ACTIONS = {
  toggleSparkles() {
    sparklesOn = !sparklesOn;
    if (sparkleLayer)
      sparkleLayer.style.display = sparklesOn ? "block" : "none";
    if (sparklesOn) spawnSparkles(12);
  },
  toggleFalling() {
    fallingOn = !fallingOn;
    if (fallingLayer) fallingLayer.style.display = fallingOn ? "block" : "none";
    if (fallingOn) spawnFalling(16);
  },
  toggleCursor() {
    enableCursor(!cursorOn);
  },
  toggleMarquee() {
    marqueeOn = !marqueeOn;
    if (marqueeEl) marqueeEl.style.display = marqueeOn ? "block" : "none";
  },
  changeBg() {
    // cycle backgrounds
    const current = document.body.style.background || "";
    const idx = BACKGROUNDS.findIndex((u) => current.includes(u));
    const next = BACKGROUNDS[(idx + 1) % BACKGROUNDS.length] || BACKGROUNDS[0];
    document.body.style.background = `url("${next}") repeat`;
  },
  togglePixel() {
    pixelOn = !pixelOn;
    document.querySelector(".content")?.classList.toggle("pixelated", pixelOn);
  },
  toggleBorders() {
    bordersOn = !bordersOn;
    document.querySelector(".layout").style.borderStyle = bordersOn
      ? "solid"
      : "double";
  },
  placeBlinkie() {
    placeSticker("https://i.imgur.com/c3ji33l.gif", 120, 120);
  },
};

/* delegate tool buttons */
document.addEventListener("click", (e) => {
  const action = e.target?.dataset?.action;
  if (action && ACTIONS[action]) ACTIONS[action]();
});

/* --------- Sticker thumbs attach & populate --------- */
function attachThumbs() {
  $$(
    "#stickerThumbs .thumb, #rightThumbs .thumb, #rightStampThumbs .thumb, #rightGifThumbs .thumb"
  ).forEach((img) => {
    if (img._attached) return;
    img.addEventListener("click", () =>
      placeSticker(img.dataset.src || img.src, 96, 96)
    );
    img._attached = true;
  });
}

function populateThumbs() {
  const lists = [
    "stickerThumbs",
    "rightThumbs",
    "rightStampThumbs",
    "rightGifThumbs",
  ];
  lists.forEach((id) => {
    const node = byId(id);
    if (!node) return;
    node.innerHTML = "";
    STICKERS.forEach((src) => {
      const im = document.createElement("img");
      im.className = "thumb";
      im.src = src;
      im.dataset.src = src;
      node.appendChild(im);
    });
  });
  attachThumbs();
}
populateThumbs();

/* --------- Place sticker (draggable) --------- */
function placeSticker(src, w = 96, h = 96) {
  if (!stickerLayer) return;
  stickerLayer.style.pointerEvents = "auto";
  const s = document.createElement("img");
  s.src = src;
  s.className = "sticker";
  s.style.width = w + "px";
  s.style.height = h + "px";
  s.style.left = window.innerWidth / 2 - 60 + rand(-120, 120) + "px";
  s.style.top = 200 + rand(-60, 120) + "px";
  makeDraggable(s);
  stickerLayer.appendChild(s);
}

/* draggable helper (mouse + touch) */
function makeDraggable(node) {
  node.draggable = false;
  let dragging = false,
    ox = 0,
    oy = 0;

  node.addEventListener("mousedown", (ev) => {
    ev.preventDefault();
    dragging = true;
    node.style.cursor = "grabbing";
    const rect = node.getBoundingClientRect();
    ox = ev.clientX - rect.left;
    oy = ev.clientY - rect.top;
    node.style.zIndex = Date.now() % 100000;
  });

  document.addEventListener("mousemove", (ev) => {
    if (!dragging) return;
    node.style.left = ev.clientX - ox + "px";
    node.style.top = ev.clientY - oy + "px";
  });

  document.addEventListener("mouseup", () => {
    if (dragging) {
      dragging = false;
      node.style.cursor = "grab";
    }
  });

  node.addEventListener(
    "touchstart",
    (ev) => {
      ev.preventDefault();
      dragging = true;
      const t = ev.touches[0];
      const rect = node.getBoundingClientRect();
      ox = t.clientX - rect.left;
      oy = t.clientY - rect.top;
      node.style.zIndex = Date.now() % 100000;
    },
    { passive: false }
  );

  document.addEventListener(
    "touchmove",
    (ev) => {
      if (!dragging) return;
      const t = ev.touches[0];
      node.style.left = t.clientX - ox + "px";
      node.style.top = t.clientY - oy + "px";
    },
    { passive: false }
  );

  document.addEventListener("touchend", () => {
    dragging = false;
  });

  node.addEventListener("dblclick", () => node.remove());
}

/* --------- Sparkles initial visibility --------- */
if (sparkleLayer) sparkleLayer.style.display = sparklesOn ? "block" : "none";
if (fallingLayer) fallingLayer.style.display = fallingOn ? "block" : "none";

/* --------- Guestbook (localStorage) --------- */
function escapeHtml(s) {
  return (s + "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
function renderMessages() {
  if (!messagesEl) return;
  messagesEl.innerHTML = "";
  const arr = JSON.parse(localStorage.getItem("guestbook_v2") || "[]");
  arr
    .slice()
    .reverse()
    .forEach((it) => {
      const d = document.createElement("div");
      d.className = "message";
      const date = new Date(it.time).toLocaleString();
      d.innerHTML = `<div><span class="msg-name">${escapeHtml(
        it.name
      )}</span> <span class="msg-time">${date}</span></div>
                   <div class="msg-text">${escapeHtml(it.text)}</div>`;
      messagesEl.appendChild(d);
    });
}
byId("postBtn")?.addEventListener("click", () => {
  const name = (byId("nameInput")?.value || "anon").trim();
  const text = (byId("msgInput")?.value || "").trim();
  if (!text) return alert("write a message!");
  const arr = JSON.parse(localStorage.getItem("guestbook_v2") || "[]");
  arr.push({ name, text, time: Date.now() });
  localStorage.setItem("guestbook_v2", JSON.stringify(arr));
  byId("msgInput").value = "";
  renderMessages();
});
byId("clearBtn")?.addEventListener("click", () => {
  if (confirm("Clear guestbook?")) {
    localStorage.removeItem("guestbook_v2");
    renderMessages();
  }
});
renderMessages();

/* --------- Mirror/populate right panes (thumbs) --------- */
function mirrorThumbs() {
  const ids = ["rightThumbs", "rightStampThumbs", "rightGifThumbs"];
  ids.forEach((id) => {
    const node = byId(id);
    if (!node) return;
    node.innerHTML = "";
    STICKERS.forEach((s) => {
      const im = document.createElement("img");
      im.className = "thumb";
      im.src = s;
      im.dataset.src = s;
      node.appendChild(im);
    });
  });
  attachThumbs();
}
mirrorThumbs();

/* --------- Player (Winamp-like XP-B) --------- */
const player = {
  audio: new Audio(),
  playlist: [
    {
      title: "Retro Loop (demo)",
      src: "https://cdn.pixabay.com/download/audio/2023/03/15/audio_c8a8d3f7a6.mp3?filename=sleepy-loop-ambient-14031.mp3",
    },
    {
      title: "Chill Y2K (demo)",
      src: "https://cdn.pixabay.com/download/audio/2021/11/17/audio_9d2d8a95ad.mp3?filename=relaxing-ambient-127657.mp3",
    },
  ],
  idx: 0,
  playing: false,
};
function loadTrack(i) {
  player.idx = (i + player.playlist.length) % player.playlist.length;
  player.audio.src = player.playlist[player.idx].src;
  byId("trackTitle").textContent = player.playlist[player.idx].title;
  highlightPlaylist();
}
function highlightPlaylist() {
  if (!playlistEl) return;
  playlistEl.innerHTML = "";
  player.playlist.forEach((t, i) => {
    const d = document.createElement("div");
    d.className = "pl-item";
    d.textContent = `${i + 1}. ${t.title}`;
    d.style.cursor = "pointer";
    d.style.fontSize = "12px";
    d.style.padding = "4px";
    if (i === player.idx) d.style.background = "#dbeeff";
    d.addEventListener("click", () => {
      loadTrack(i);
      player.audio.play();
    });
    playlistEl.appendChild(d);
  });
}
/* controls */
byId("playBtn")?.addEventListener("click", () => {
  player.audio.play();
});
byId("pauseBtn")?.addEventListener("click", () => {
  player.audio.pause();
});
byId("stopBtn")?.addEventListener("click", () => {
  player.audio.pause();
  player.audio.currentTime = 0;
});
byId("prevBtn")?.addEventListener("click", () => {
  loadTrack(player.idx - 1);
  player.audio.play();
});
byId("nextBtn")?.addEventListener("click", () => {
  loadTrack(player.idx + 1);
  player.audio.play();
});

/* seek & volume */
byId("seek")?.addEventListener("input", (e) => {
  const pct = e.target.value / 100;
  if (player.audio.duration)
    player.audio.currentTime = player.audio.duration * pct;
});
byId("volume")?.addEventListener(
  "input",
  (e) => (player.audio.volume = e.target.value)
);

/* update seek slider during playback */
player.audio.addEventListener("timeupdate", () => {
  if (player.audio.duration) {
    byId("seek").value = Math.round(
      (player.audio.currentTime / player.audio.duration) * 100
    );
  }
});

/* autoplay on first user interaction to satisfy modern browsers */
function enablePlayOnInteraction() {
  function tryPlay() {
    player.audio.play().catch(() => {});
    document.removeEventListener("click", tryPlay);
  }
  document.addEventListener("click", tryPlay);
}
enablePlayOnInteraction();
loadTrack(0);

/* --------- init: cursors, sparkles, attach thumbs --------- */
enableCursor(true);
spawnSparkles(12);
attachThumbs();
