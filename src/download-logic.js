const dlInput = document.getElementById("dlInput");
const dlSubmit = document.getElementById("dlSubmit");
const dlBack = document.getElementById("dlBack");
const dlResult = document.getElementById("dlResult");

// Tombol Back (kembali ke Blackhole Menu, BUKAN ke halaman utama)
if (dlBack) {
  dlBack.addEventListener("click", () => {
    const menuPage = document.getElementById("menuPage");
    const downloadPage = document.getElementById("downloadPage");
    const vxTabs = document.getElementById("vxTabs");
    const vxTitle = document.getElementById("vxTitle");

    downloadPage.classList.add("hidden");
    menuPage.classList.remove("hidden");
    vxTabs.classList.remove("hidden-tabs");
    vxTitle.classList.remove("hidden-title");

    dlInput.value = "";
    dlSubmit.disabled = true;
    dlResult.innerHTML = "";

    window.currentPlatform = null;
    window.currentType = null;
  });
}

if (dlInput) {
  dlInput.addEventListener("input", () => {
    dlSubmit.disabled = !dlInput.value.trim();
  });
}

if (dlSubmit) {
  dlSubmit.addEventListener("click", async () => {
    const url = dlInput.value.trim();
    if (!url) return;

    const currentType = window.currentType || "";
    dlSubmit.disabled = true;
    dlSubmit.innerHTML = '<span>Memproses...</span>';
    dlResult.innerHTML = `<div class="media-card" style="padding: 40px; text-align: center;"><div class="loading-spinner"></div><p style="margin-top: 16px; color: #8a8a8a; font-size: 13px;">Mengambil data dari server...</p></div>`;

    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          type: currentType === "auto" ? "" : currentType,
          format: currentType === "audio" ? "mp3" : "mp4",
          resolusi: "720",
        }),
      });

      if (!res.ok) {
        throw new Error(`Server error (${res.status})`);
      }

      const data = await res.json();

      if (!data.ok) {
        dlResult.innerHTML = `<div class="media-card" style="padding: 20px; color: #fca5a5; font-size: 13px;"><strong>Gagal:</strong> ${escapeHtml(data.error || "Unknown error")}</div>`;
        return;
      }

      if (!data.items || data.items.length === 0) {
        dlResult.innerHTML = `<div class="media-card" style="padding: 20px; color: #fca5a5; font-size: 13px;">Tidak ada media ditemukan.</div>`;
        return;
      }

      dlResult.innerHTML = "";
      data.items.forEach((item, idx) => {
        dlResult.appendChild(buildMediaCard(item, idx));
      });
    } catch (err) {
      dlResult.innerHTML = `<div class="media-card" style="padding: 20px; color: #fca5a5; font-size: 13px;"><strong>Error:</strong> ${escapeHtml(err.message)}</div>`;
    } finally {
      dlSubmit.disabled = false;
      dlSubmit.innerHTML = `<span>Ambil Media</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;
    }
  });
}

function buildMediaCard(item, idx) {
  const card = document.createElement("div");
  card.className = "media-card";
  const preview = document.createElement("div");
  preview.className = "preview-wrap";

  if (item.type === "video" && item.url) {
    const v = document.createElement("video");
    v.src = item.url; v.controls = true; v.preload = "metadata"; v.playsInline = true;
    if (item.thumbnail) v.poster = item.thumbnail;
    preview.appendChild(v);
  } else if (item.type === "audio" && item.url) {
    preview.classList.add("audio");
    const audioIcon = document.createElement("div");
    audioIcon.className = "audio-icon";
    audioIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`;
    preview.appendChild(audioIcon);
    const a = document.createElement("audio");
    a.src = item.url; a.controls = true; a.preload = "metadata";
    preview.appendChild(a);
  } else if (item.type === "image" && (item.url || item.thumbnail)) {
    const img = document.createElement("img");
    img.src = item.url || item.thumbnail; img.loading = "lazy";
    preview.appendChild(img);
  } else if (item.type === "file" && item.url) {
    // ===== FILE PREVIEW =====
    preview.classList.add("audio");
    const fileIcon = document.createElement("div");
    fileIcon.className = "audio-icon";
    fileIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>`;
    preview.appendChild(fileIcon);
    const meta = document.createElement("div");
    meta.style.cssText = "font-size: 12px; color: #8a8a8a; text-align: center; word-break: break-all; padding: 0 12px;";
    meta.textContent = [item.filesize, item.filename].filter(Boolean).join(" · ");
    preview.appendChild(meta);
  }

  card.appendChild(preview);
  const info = document.createElement("div"); info.className = "media-info";
  const head = document.createElement("div"); head.className = "media-head";
  const title = document.createElement("div"); title.className = "media-title";
  title.textContent = item.title || item.filename || `Media ${idx + 1}`;
  head.appendChild(title);

  const btn = document.createElement("button");
  btn.className = "dl-btn";
  btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Unduh`;
  head.appendChild(btn);
  info.appendChild(head);

  const metaParts = [item.author, item.quality, item.filesize].filter(Boolean);
  if (metaParts.length) {
    const meta = document.createElement("div");
    meta.style.cssText = "font-size: 11px; color: #8a8a8a; margin-top: 4px;";
    meta.textContent = metaParts.join(" · ");
    info.appendChild(meta);
  }
  card.appendChild(info);

  btn.addEventListener("click", () => {
    if (!item.url) return;
    const base = (item.title || item.filename || "vortex-media").replace(/[^\w\s-]/g, "").trim().slice(0, 60);
    let ext = "bin";
    if (item.type === "audio") ext = "mp3";
    else if (item.type === "video") ext = "mp4";
    else if (item.type === "image") ext = "jpg";
    else if (item.type === "file" && item.filename && item.filename.includes(".")) {
      ext = item.filename.split(".").pop();
    }
    window.open(`/api/proxy?url=${encodeURIComponent(item.url)}&filename=${encodeURIComponent(`${base}.${ext}`)}`, "_blank");
  });
  return card;
}

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}