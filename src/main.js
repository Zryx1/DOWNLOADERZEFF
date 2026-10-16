import "./style.css";

// ==================== ENTRY GATE + SPLASH + AUDIO ====================
(function () {
  const SPLASH_DURATION = 15000;

  const entryGate = document.getElementById("entryGate");
  const entryBtn = document.getElementById("entryBtn");
  const splash = document.getElementById("splash");
  const splashSkip = document.getElementById("splashSkip");
  const splashLogo = document.querySelector(".splash-logo");
  const splashTitleLetters = document.querySelectorAll(".splash-title span");
  const splashBarWrap = document.querySelector(".splash-bar-wrap");
  const splashBarFill = document.getElementById("splashBarFill");
  const splashStatus = document.getElementById("splashStatus");
  const splashPath = document.getElementById("splashPath");
  const splashAudio = document.getElementById("splashAudio");

  if (!entryGate || !splash) return;

  let finished = false;
  let rafId = null;
  let startTime = null;

  // ---- STATUS ----
  const STATUS_STEPS = [
    { at: 0,  text: "Menyiapkan..." },
    { at: 15, text: "Memuat platform..." },
    { at: 40, text: "Menghubungkan API..." },
    { at: 65, text: "Menyiapkan antarmuka..." },
    { at: 85, text: "Hampir siap..." },
    { at: 99, text: "Selesai" },
  ];

  let lastStatus = "";

  function updateStatus(pct) {
    for (let i = STATUS_STEPS.length - 1; i >= 0; i--) {
      if (pct >= STATUS_STEPS[i].at) {
        const txt = STATUS_STEPS[i].text;
        if (txt !== lastStatus) {
          lastStatus = txt;
          splashStatus.style.opacity = "0";
          setTimeout(() => {
            splashStatus.textContent = txt;
            splashStatus.style.opacity = "1";
          }, 150);
        }
        break;
      }
    }
  }

  // ---- PROGRESS ----
  function tick(now) {
    if (finished) return;
    if (startTime === null) startTime = now;

    const elapsed = now - startTime;
    const pct = Math.min(100, (elapsed / SPLASH_DURATION) * 100);

    splashBarFill.style.width = pct + "%";
    updateStatus(pct);

    if (pct >= 100) {
      finishSplash();
      return;
    }
    rafId = requestAnimationFrame(tick);
  }

  function finishSplash() {
    if (finished) return;
    finished = true;
    if (rafId) cancelAnimationFrame(rafId);

    // Fade out audio
    if (splashAudio && !splashAudio.paused) {
      const fadeInterval = setInterval(() => {
        if (splashAudio.volume > 0.05) {
          splashAudio.volume = Math.max(0, splashAudio.volume - 0.05);
        } else {
          splashAudio.pause();
          splashAudio.currentTime = 0;
          clearInterval(fadeInterval);
        }
      }, 50);
    }

    splashBarFill.style.width = "100%";
    splashPath.classList.add("show");

    setTimeout(() => {
      splash.classList.add("splash-hide");
      document.body.classList.remove("splash-active");
      document.body.classList.remove("locked");

      setTimeout(() => {
        splash.style.display = "none";
      }, 700);
    }, 500);
  }

  // ---- START SPLASH ----
  function startSplash() {
    splash.classList.remove("hidden");
    document.body.classList.add("splash-active");

    // Play audio — akan berhasil karena dipicu oleh klik user
    if (splashAudio) {
      splashAudio.volume = 0.6;
      splashAudio.play().catch((err) => {
        console.log("Audio gagal play:", err);
      });
    }

    // Animasi reveal
    setTimeout(() => splashLogo.classList.add("show"), 300);
    splashTitleLetters.forEach((letter, i) => {
      setTimeout(() => letter.classList.add("show"), 800 + i * 80);
    });
    setTimeout(() => splashBarWrap.classList.add("show"), 1500);
    setTimeout(() => splashSkip.classList.add("show"), 2000);

    // Bar mulai bergerak
    setTimeout(() => {
      startTime = null;
      rafId = requestAnimationFrame(tick);
    }, 1500);
  }

  // ---- ENTRY BUTTON ----
  entryBtn.addEventListener("click", () => {
    entryGate.classList.add("hide");

    setTimeout(() => {
      entryGate.style.display = "none";
      startSplash();
    }, 500);
  });

  // ---- SKIP ----
  splashSkip.addEventListener("click", () => {
    if (finished) return;
    finishSplash();
  });
})();
// ==================== END ENTRY + SPLASH ====================


// ==================== STATE ====================
let platform = null;
let format = "mp4";
let resolusi = "720";

// ==================== DOM ====================
const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const result = document.getElementById("result");
const urlInput = document.getElementById("url");
const submitBtn = document.getElementById("submitBtn");
const ytOptions = document.getElementById("ytOptions");
const resWrapper = document.getElementById("resWrapper");
const platformBadge = document.getElementById("platformBadge");
const step2Title = document.getElementById("step2Title");
const backBtn = document.getElementById("backBtn");

const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");
const quotaFill = document.getElementById("quotaFill");
const quotaText = document.getElementById("quotaText");

// ==================== PLATFORM META ====================
const PLATFORM_META = {
  tiktok:    { label: "TikTok",    placeholder: "https://vt.tiktok.com/..." },
  youtube:   { label: "YouTube",   placeholder: "https://youtu.be/..." },
  instagram: { label: "Instagram", placeholder: "https://www.instagram.com/reel/..." },
  facebook:  { label: "Facebook",  placeholder: "https://www.facebook.com/share/v/..." },
  capcut:    { label: "CapCut",    placeholder: "https://www.capcut.com/tv2/..." },
  pinterest: { label: "Pinterest", placeholder: "https://pin.it/..." },
  spotify:   { label: "Spotify",   placeholder: "https://open.spotify.com/track/..." },
};

// ==================== STATUS & QUOTA ====================
async function checkStatus() {
  try {
    const res = await fetch("/api/health", { cache: "no-store" });
    if (!res.ok) throw new Error("offline");
    const data = await res.json();

    statusDot.classList.remove("offline");
    statusDot.classList.add("online");
    statusText.textContent = "Online";

    if (data.quota) {
      const pct = Math.min(100, data.quota.percent || 0);
      quotaFill.style.width = pct + "%";
      quotaFill.classList.toggle("warn", pct > 75);
      quotaText.textContent = `${data.quota.usedGB} / ${data.quota.limitGB} GB`;
    }
  } catch {
    statusDot.classList.remove("online");
    statusDot.classList.add("offline");
    statusText.textContent = "Offline";
  }
}

checkStatus();
setInterval(checkStatus, 60_000);

// ==================== STEP 1 — Pilih Platform ====================
document.querySelectorAll(".platform-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const p = btn.dataset.platform;
    if (!p) return;

    platform = p;
    const meta = PLATFORM_META[p];

    platformBadge.textContent = meta.label;
    step2Title.textContent = `Masukkan Link ${meta.label}`;
    urlInput.placeholder = meta.placeholder;
    urlInput.value = "";

    ytOptions.classList.toggle("hidden", p !== "youtube");
    submitBtn.disabled = true;
    result.innerHTML = "";

    step1.classList.add("hidden");
    step2.classList.remove("hidden");
    urlInput.focus();
  });
});

// ==================== BACK ====================
backBtn.addEventListener("click", () => {
  platform = null;
  urlInput.value = "";
  step2.classList.add("hidden");
  step1.classList.remove("hidden");
  result.innerHTML = "";
});

// ==================== FORMAT & RESOLUSI ====================
function setupButtons(containerId, onSelect) {
  document.querySelectorAll(`#${containerId} button`).forEach((b) => {
    b.addEventListener("click", () => {
      document
        .querySelectorAll(`#${containerId} button`)
        .forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      onSelect(b.dataset.val);
    });
  });
}

setupButtons("formatBtns", (val) => {
  format = val;
  resWrapper.classList.toggle("hidden", format !== "mp4");
});

setupButtons("resBtns", (val) => { resolusi = val; });

// ==================== INPUT ====================
urlInput.addEventListener("input", () => {
  submitBtn.disabled = !urlInput.value.trim();
});

// ==================== SUBMIT ====================
submitBtn.addEventListener("click", async () => {
  const url = urlInput.value.trim();
  if (!url || !platform) return;

  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span>Memproses...</span>`;
  result.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p style="margin-top:16px;color:#8a8a8a;font-size:13px;">
        Mengambil data dari server...
      </p>
    </div>`;

  try {
    const res = await fetch("/api/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, format, resolusi }),
    });

    const raw = await res.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error(`Server error (${res.status}): ${raw.slice(0, 150)}`);
    }

    render(data);
  } catch (e) {
    result.innerHTML = `<div class="error"><strong>Gagal:</strong> ${escapeHtml(e.message)}</div>`;
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<span>Ambil Media</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;
  }
});

// ==================== RENDER ====================
function render(data) {
  if (!data.ok) {
    result.innerHTML = `<div class="error"><strong>Gagal:</strong> ${escapeHtml(data.error || "Unknown")}</div>`;
    return;
  }
  if (!data.items || data.items.length === 0) {
    result.innerHTML = `<div class="error">Tidak ada media ditemukan.</div>`;
    return;
  }

  result.innerHTML = "";

  data.items.forEach((item, idx) => {
    const card = buildCard(item, idx);
    result.appendChild(card);
  });

  const hint = document.createElement("p");
  hint.className = "hint";
  hint.style.textAlign = "center";
  hint.style.fontSize = "11px";
  hint.style.color = "#525252";
  hint.style.padding = "8px 0";
  hint.textContent = "File diunduh langsung dari server sumber";
  result.appendChild(hint);
}

// ==================== BUILD CARD ====================
function buildCard(item, idx) {
  const card = document.createElement("div");
  card.className = "media-card";

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
        preview.innerHTML = `<img src="${item.thumbnail}" alt="">`;
      }
    });
    preview.appendChild(v);
  } else if (item.type === "audio" && item.url) {
    preview.classList.add("audio");
    preview.innerHTML = `
      <div class="audio-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 18V5l12-2v13"/>
          <circle cx="6" cy="18" r="3"/>
          <circle cx="18" cy="16" r="3"/>
        </svg>
      </div>`;
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
  } else {
    preview.innerHTML = `<div style="padding:40px;color:#525252;font-size:13px;">Preview tidak tersedia</div>`;
  }

  card.appendChild(preview);

  const info = document.createElement("div");
  info.className = "media-info";

  const head = document.createElement("div");
  head.className = "media-head";

  const titleWrap = document.createElement("div");
  titleWrap.style.flex = "1";
  titleWrap.style.minWidth = "0";

  const title = document.createElement("div");
  title.className = "media-title";
  title.textContent = item.title || `Media ${idx + 1}`;
  titleWrap.appendChild(title);

  const tags = document.createElement("div");
  tags.className = "media-tags";

  const typeLabel = item.type.toUpperCase();
  const typeClass = `tag type-${item.type}`;
  tags.innerHTML = `
    <span class="${typeClass}">${typeLabel}</span>
    ${item.isHd ? `<span class="tag hd-tag">HD</span>` : ""}
    ${item.quality && !item.isHd ? `<span class="tag">${escapeHtml(item.quality)}</span>` : ""}
    ${item.author ? `<span class="tag">${escapeHtml(item.author)}</span>` : ""}
  `;
  titleWrap.appendChild(tags);
  head.appendChild(titleWrap);

  const btn = document.createElement("button");
  btn.className = "dl-btn";
  btn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
    <span>Unduh</span>`;

  head.appendChild(btn);
  info.appendChild(head);

  const prog = document.createElement("div");
  prog.className = "dl-progress";
  prog.innerHTML = `
    <div class="progress-bar">
      <div class="progress-fill"></div>
    </div>
    <div class="progress-info">
      <span class="prog-status">Menunggu...</span>
      <span class="prog-percent">0%</span>
    </div>`;

  info.appendChild(prog);
  card.appendChild(info);

  const fill = prog.querySelector(".progress-fill");
  const status = prog.querySelector(".prog-status");
  const percent = prog.querySelector(".prog-percent");

  btn.addEventListener("click", () => {
    downloadItem(item, btn, prog, fill, status, percent);
  });

  return card;
}

// ==================== DOWNLOAD ====================
async function downloadItem(item, btn, prog, fill, status, percent) {
  if (!item.url) return;

  const filename = buildFilename(item);
  prog.classList.add("active");
  btn.disabled = true;
  fill.classList.remove("done", "fail");
  fill.style.width = "0%";
  status.textContent = "Menghubungkan...";
  percent.textContent = "0%";

  try {
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(item.url)}&filename=${encodeURIComponent(filename)}`;
    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const reader = res.body.getReader();
    const total = +res.headers.get("content-length") || 0;
    const chunks = [];
    let received = 0;

    status.textContent = "Mengunduh...";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      received += value.length;

      const pct = total > 0 ? Math.round((received / total) * 100) : 0;
      fill.style.width = pct + "%";
      percent.textContent = pct + "%";
      status.textContent = `${formatBytes(received)}${total > 0 ? " / " + formatBytes(total) : ""}`;
    }

    const blob = new Blob(chunks);
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);

    fill.style.width = "100%";
    fill.classList.add("done");
    status.textContent = `Selesai · ${formatBytes(received)}`;
    percent.textContent = "100%";
    btn.classList.add("done");
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <span>Selesai</span>`;

    bumpLocalUsage(received);
  } catch (err) {
    fill.classList.add("fail");
    status.textContent = "Gagal: " + err.message;
    percent.textContent = "—";
  } finally {
    btn.disabled = false;
    setTimeout(() => {
      prog.classList.remove("active");
      btn.classList.remove("done");
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        <span>Unduh</span>`;
    }, 3500);
  }
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

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(i > 1 ? 2 : 0) + " " + sizes[i];
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function bumpLocalUsage(bytes) {
  try {
    const key = "vortex_usage";
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    let data = JSON.parse(localStorage.getItem(key) || "{}");
    if (data.month !== month) data = { month, bytes: 0 };
    data.bytes = (data.bytes || 0) + bytes;
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}