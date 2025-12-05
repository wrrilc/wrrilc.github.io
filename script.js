/* ========== Full retro JS: decorations + player ========== */

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

/* --------- EXTERNAL ASSET LIST (editable) --------- */
const STICKERS = [
  "https://i.imgur.com/c3ji33l.gif",
  "https://i.imgur.com/GIfzEak.gif",
  "https://i.imgur.com/RA2W8Ac.gif",
  "https://i.imgur.com/ExdKOOz.png",
  "https://i.imgur.com/1qkYQ3Y.png",
  "https://i.imgur.com/wx2c8QF.png",
];
const BACKGROUNDS = [
  "https://i.imgur.com/RA2W8Ac.gif", // hearts tile
  "https://i.imgur.com/0f2Kk1l.png", // pastel dots (example)
  "https://i.imgur.com/7y5rG9X.gif", // generic pattern
];

/* --------- Cursor (external tiny image) --------- */
const cursorURL = "https://i.imgur.com/7r7qv3b.png"; // tiny heart (external) - change if you want

function enableCursor(flag) {
  document.body.style.cursor = flag ? `url(${cursorURL}) 8 8, auto` : "";
  cursorOn = !!flag;
}

/* --------- Sparkles (floating) --------- */
function spawnSparkles(count = 10) {
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
let fallingInterval = null;
function spawnFalling(count = 12) {
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

/* --------- Toggle functions mapped to buttons --------- */
const ACTIONS = {
  toggleSparkles() {
    sparklesOn = !sparklesOn;
    sparkleLayer.style.display = sparklesOn ? "block" : "none";
    if (sparklesOn) spawnSparkles(12);
  },
  toggleFalling() {
    fallingOn = !fallingOn;
    fallingLayer.style.display = fallingOn ? "block" : "none";
    if (fallingOn) spawnFalling(16);
  },
  toggleCursor() {
    enableCursor(!cursorOn);
  },
  toggleMarquee() {
    marqueeOn = !marqueeOn;
    marqueeEl.style.display = marqueeOn ? "block" : "none";
  },
  changeBg() {
    // cycle backgrounds
    const current = document.body.style.background || "";
    const next =
      BACKGROUNDS[
        (BACKGROUNDS.indexOf(current.match(/https?:\/\/\S+\.gif/)?.[0]) + 1) %
          BACKGROUNDS.length
      ] || BACKGROUNDS[0];
    document.body.style.background = `url("${next}") repeat`;
  },
  togglePixel() {
    pixelOn = !pixelOn;
    document.querySelector(".content").classList.toggle("pixelated", pixelOn);
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

/* wire sidebar / panel / toolbox buttons (delegation) */
document.addEventListener("click", (e) => {
  const action = e.target.dataset && e.target.dataset.action;
  if (action && ACTIONS[action]) ACTIONS[action]();
});

/* --------- Thumb click: place stickers from thumb rows --------- */
function attachThumbs() {
  $$(
    "#stickerThumbs .thumb, #rightThumbs .thumb, #bottomThumbs .thumb, #toolThumbs .thumb"
  ).forEach((img) => {
    img.addEventListener("click", () => placeStickerFromThumb(img));
  });
}
function placeStickerFromThumb(img) {
  const src = img.dataset.src || img.src;
  placeSticker(src, 96, 96);
}

/* create thumbnails from STICKERS for the panels */
function populateThumbs() {
  const lists = [
    "stickerThumbs",
    "rightThumbs",
    "bottomThumbs",
    "toolThumbs",
    "rightStampThumbs",
    "rightGifThumbs",
  ];
  lists.forEach((id) => {
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
populateThumbs();

/* --------- Place sticker (draggable) --------- */
function placeSticker(src, w = 96, h = 96) {
  stickerLayer.style.pointerEvents = "auto";
  const s = document.createElement("img");
  s.src = src;
  s.className = "sticker";
  s.style.width = w + "px";
  s.style.height = h + "px";
  // random start near center
  s.style.left = window.innerWidth / 2 - 60 + rand(-120, 120) + "px";
  s.style.top = 200 + rand(-60, 120) + "px";
  makeDraggable(s);
  stickerLayer.appendChild(s);
}

/* draggable helper: works for mouse + simple touch */
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

  // touch support
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

  // double-click/double-tap to remove
  node.addEventListener("dblclick", () => node.remove());
}

/* --------- Sparkles initial visibility --------- */
sparkleLayer.style.display = sparklesOn ? "block" : "none";
fallingLayer.style.display = fallingOn ? "block" : "none";

/* --------- Guestbook: localStorage --------- */
function renderMessages() {
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
function escapeHtml(s) {
  return (s + "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

byId("postBtn").addEventListener("click", () => {
  const name = (byId("nameInput").value || "anon").trim();
  const text = (byId("msgInput").value || "").trim();
  if (!text) return alert("write a message!");
  const arr = JSON.parse(localStorage.getItem("guestbook_v2") || "[]");
  arr.push({ name, text, time: Date.now() });
  localStorage.setItem("guestbook_v2", JSON.stringify(arr));
  byId("msgInput").value = "";
  renderMessages();
});
byId("clearBtn").addEventListener("click", () => {
  if (confirm("Clear guestbook?")) {
    localStorage.removeItem("guestbook_v2");
    renderMessages();
  }
});
renderMessages();

/* --------- Populate right & bottom panes with same sticker thumbs --------- */
function mirrorThumbs() {
  const ids = [
    "rightThumbs",
    "bottomThumbs",
    "rightStampThumbs",
    "rightGifThumbs",
  ];
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

/* attach thumbs (again) */
function attachThumbs() {
  $$(".thumb").forEach((t) => {
    if (t._attached) return;
    t.addEventListener("click", () =>
      placeSticker(t.dataset.src || t.src, 96, 96)
    );
    t._attached = true;
  });
}

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
byId("playBtn").addEventListener("click", () => {
  player.audio.play();
});
byId("pauseBtn").addEventListener("click", () => {
  player.audio.pause();
});
byId("stopBtn").addEventListener("click", () => {
  player.audio.pause();
  player.audio.currentTime = 0;
});
byId("prevBtn").addEventListener("click", () => {
  loadTrack(player.idx - 1);
  player.audio.play();
});
byId("nextBtn").addEventListener("click", () => {
  loadTrack(player.idx + 1);
  player.audio.play();
});

/* seek & volume */
byId("seek").addEventListener("input", (e) => {
  const pct = e.target.value / 100;
  if (player.audio.duration)
    player.audio.currentTime = player.audio.duration * pct;
});
byId("volume").addEventListener(
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

/* load initial track & UI */
loadTrack(0);

/* --------- Marquee button already wired (data-action) above via delegation. */

/* --------- init: enable cursor, show sparkles, attach thumbs, spawn falling if needed --------- */
enableCursor(true);
spawnSparkles(12);
attachThumbs();

/* Optional: cleanup on page unload to avoid memory leaks with many intervals (none used heavily) */
window.addEventListener("unload", () => {
  /* nothing heavy to cleanup */
});

/* ---------- end script.js ---------- */
