const menuPage = document.getElementById("menuPage");
const downloadPage = document.getElementById("downloadPage");
const flash = document.getElementById("flash");
const vxHole = document.getElementById("vxHole");
const vxWrap = document.getElementById("vxWrap");
const vxTabs = document.getElementById("vxTabs");
const vxTitle = document.getElementById("vxTitle");
const cards = document.querySelectorAll(".vx-card");
const cardWraps = document.querySelectorAll(".vx-card-wrap");
const tabs = document.querySelectorAll(".vx-tab");

let isAnimating = false;

// ==================== TAB FILTER ====================
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    if (isAnimating) return;
    const filter = tab.dataset.filter;
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    cardWraps.forEach(wrap => {
      const cats = (wrap.dataset.category || "").split(" ");
      const match = filter === "all" || cats.includes(filter);
      wrap.classList.toggle("filtered", !match);
    });
  });
});

// ==================== SUCK ANIMATION ====================
function getHoleCenter() {
  const r = vxHole.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function spawnShatter(x, y, count = 10) {
  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    p.className = "shatter-particle";
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const dist = 50 + Math.random() * 50;
    p.style.left = x + "px";
    p.style.top = y + "px";
    p.style.setProperty("--tx", Math.cos(angle) * dist + "px");
    p.style.setProperty("--ty", Math.sin(angle) * dist + "px");
    const size = 2 + Math.random() * 3;
    p.style.width = size + "px";
    p.style.height = size + "px";
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 750);
  }
}

function fireFlash() {
  const { x, y } = getHoleCenter();
  flash.style.left = x + "px";
  flash.style.top = y + "px";
  flash.classList.remove("fire");
  void flash.offsetWidth;
  flash.classList.add("fire");
}

cards.forEach(card => {
  card.addEventListener("click", () => {
    if (isAnimating) return;
    const wrap = card.closest(".vx-card-wrap");
    if (!wrap || wrap.classList.contains("filtered")) return;
    isAnimating = true;

    const hole = getHoleCenter();
    const rect = wrap.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    wrap.style.setProperty("--dx", (hole.x - cx) + "px");
    wrap.style.setProperty("--dy", (hole.y - cy) + "px");

    vxWrap.classList.add("sucking");
    requestAnimationFrame(() => wrap.classList.add("sucking"));

    setTimeout(() => spawnShatter(cx, cy, 12), 350);
    setTimeout(() => spawnShatter(hole.x, hole.y, 8), 800);
    setTimeout(() => fireFlash(), 800);
    setTimeout(() => openDownloadPage(card), 1100);

    setTimeout(() => {
      wrap.classList.remove("sucking");
      vxWrap.classList.remove("sucking");
      isAnimating = false;
    }, 1800);
  });
});

// ==================== DOWNLOAD PAGE ====================
const dlIcon = document.getElementById("dlIcon");
const dlName = document.getElementById("dlName");
const dlTag = document.getElementById("dlTag");
const dlInput = document.getElementById("dlInput");
const dlSubmit = document.getElementById("dlSubmit");
const dlBack = document.getElementById("dlBack");
const dlResult = document.getElementById("dlResult");

let currentPlatform = null;

function openDownloadPage(card) {
  dlIcon.innerHTML = card.querySelector(".vx-card-icon svg").outerHTML;
  dlName.textContent = card.dataset.label || "Platform";
  dlTag.textContent = card.dataset.tag || "";
  currentPlatform = card.dataset.platform;

  dlInput.value = "";
  dlSubmit.disabled = true;
  dlResult.innerHTML = "";

  vxTabs.classList.add("hidden-tabs");
  vxTitle.classList.add("hidden-title");

  menuPage.classList.add("hidden");
  downloadPage.classList.remove("hidden");

  setTimeout(() => dlInput.focus(), 500);
}

function backToMenu() {
  downloadPage.classList.add("hidden");
  menuPage.classList.remove("hidden");
  vxTabs.classList.remove("hidden-tabs");
  vxTitle.classList.remove("hidden-title");
}

dlBack.addEventListener("click", backToMenu);

dlInput.addEventListener("input", () => {
  dlSubmit.disabled = !dlInput.value.trim();
});

// ==================== SUBMIT — CALL API ====================
dlSubmit.addEventListener("click", async () => {
  const url = dlInput.value.trim();
  if (!url) return;

  dlSubmit.disabled = true;
  dlSubmit.innerHTML = '<span>Memproses...</span>';

  dlResult.innerHTML = `
    <div class="media-card" style="padding: 40px; text-align: center;">
      <div class="loading-spinner"></div>
      <p style="margin-top: 16px; color: #8a8a8a; font-size: 13px;">
        Mengambil data dari server...
      </p>
    </div>`;

  try {
    const res = await fetch("/api/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, format: "mp4", resolusi: "720" }),
    });

    const data = await res.json();

    if (!data.ok) {
      dlResult.innerHTML = `
        <div class="media-card" style="padding: 20px; color: #fca5a5; font-size: 13px;">
          <strong>Gagal:</strong> ${escapeHtml(data.error || "Unknown error")}
        </div>`;
      return;
    }

    if (!data.items || data.items.length === 0) {
      dlResult.innerHTML = `
        <div class="media-card" style="padding: 20px; color: #fca5a5; font-size: 13px;">
          Tidak ada media ditemukan.
        </div>`;
      return;
    }

    dlResult.innerHTML = "";
    data.items.forEach((item, idx) => {
      dlResult.appendChild(buildMediaCard(item, idx));
    });
  } catch (err) {
    dlResult.innerHTML = `
      <div class="media-card" style="padding: 20px; color: #fca5a5; font-size: 13px;">
        <strong>Error:</strong> ${escapeHtml(err.message)}
      </div>`;
  } finally {
    dlSubmit.disabled = false;
    dlSubmit.innerHTML = `<span>Ambil Media</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;
  }
});

// ==================== BUILD MEDIA CARD ====================
function buildMediaCard(item, idx) {
  const card = document.createElement("div");
  card.className = "media-card";

  // Preview
  const preview = document.createElement("div");
  preview.className = "preview-wrap";

  if (item.type === "video" && item.url) {
    const v = document.createElement("video");
    v.src = item.url;
    v.controls = true;
    v.preload = "metadata";
    v.playsInline = true;
    if (item.thumbnail) v.poster = item.thumbnail;
    v.addEventListener("error", () => {
      if (item.thumbnail) {
        preview.innerHTML = "";
        const img = document.createElement("img");
        img.src = item.thumbnail;
        img.alt = "Thumbnail";
        preview.appendChild(img);
      }
    });
    preview.appendChild(v);
  } else if (item.type === "audio" && item.url) {
    preview.classList.add("audio");
    const audioIcon = document.createElement("div");
    audioIcon.className = "audio-icon";
    audioIcon.textContent = "♪";
    preview.appendChild(audioIcon);

    const a = document.createElement("audio");
    a.src = item.url;
    a.controls = true;
    a.preload = "metadata";
    preview.appendChild(a);
  } else if (item.type === "image" && (item.url || item.thumbnail)) {
    const img = document.createElement("img");
    img.src = item.url || item.thumbnail;
    img.alt = item.title || "Media";
    img.loading = "lazy";
    preview.appendChild(img);
  }

  card.appendChild(preview);

  // Info + Button
  const info = document.createElement("div");
  info.className = "media-info";

  const head = document.createElement("div");
  head.className = "media-head";

  const title = document.createElement("div");
  title.className = "media-title";
  title.textContent = item.title || `Media ${idx + 1}`;
  head.appendChild(title);

  const btn = document.createElement("button");
  btn.className = "dl-btn";
  btn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
    Unduh`;
  head.appendChild(btn);

  info.appendChild(head);

  if (item.author || item.quality) {
    const meta = document.createElement("div");
    meta.style.fontSize = "11px";
    meta.style.color = "#8a8a8a";
    meta.style.marginTop = "4px";
    meta.textContent = [item.author, item.quality].filter(Boolean).join(" · ");
    info.appendChild(meta);
  }

  card.appendChild(info);

  // Download handler
  btn.addEventListener("click", () => {
    if (!item.url) return;
    const filename = buildFilename(item);
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(item.url)}&filename=${encodeURIComponent(filename)}`;
    window.open(proxyUrl, "_blank");
  });

  return card;
}

// ==================== HELPERS ====================
function buildFilename(item) {
  const base = (item.title || "vortex-media")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .slice(0, 60) || "vortex-media";

  const ext =
    item.type === "audio" ? "mp3" :
    item.type === "video" ? "mp4" :
    item.type === "image" ? "jpg" : "bin";

  return `${base}.${ext}`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}