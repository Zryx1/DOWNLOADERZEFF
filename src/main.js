import "./style.css";

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

// ==================== PLATFORM META ====================
const PLATFORM_META = {
  tiktok:    { label: "TikTok",    placeholder: "https://vt.tiktok.com/..." },
  youtube:   { label: "YouTube",   placeholder: "https://youtu.be/..." },
  instagram: { label: "Instagram", placeholder: "https://www.instagram.com/reel/..." },
  pinterest: { label: "Pinterest", placeholder: "https://pin.it/..." },
  spotify:   { label: "Spotify",   placeholder: "https://open.spotify.com/track/..." },
};

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

setupButtons("resBtns", (val) => {
  resolusi = val;
});

// ==================== INPUT ENABLE ====================
urlInput.addEventListener("input", () => {
  submitBtn.disabled = !urlInput.value.trim();
});

// ==================== SUBMIT ====================
submitBtn.addEventListener("click", async () => {
  const url = urlInput.value.trim();
  if (!url || !platform) return;

  submitBtn.disabled = true;
  submitBtn.textContent = "Memproses...";
  result.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p style="margin-top:12px;color:#737373;font-size:14px;">
        Mengambil data dari server...
      </p>
    </div>`;

  try {
    const res = await fetch("/api/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, format, resolusi }),
    });

    // Baca raw text dulu
    const raw = await res.text();

    // Coba parse JSON
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error(
        `Server error (${res.status}): ${raw.slice(0, 200)}`
      );
    }

    render(data);
  } catch (e) {
    result.innerHTML = `<div class="error"><strong>Gagal:</strong> ${escapeHtml(e.message)}</div>`;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Ambil Media";
  }
});

// ==================== RENDER ====================
function render(data) {
  if (!data.ok) {
    result.innerHTML = `<div class="error"><strong>Gagal:</strong> ${escapeHtml(data.error || "Unknown error")}</div>`;
    return;
  }

  if (!data.items || data.items.length === 0) {
    result.innerHTML = `<div class="error">Tidak ada media ditemukan.</div>`;
    return;
  }

  const html = data.items
    .map((item, i) => {
      const meta = [item.type.toUpperCase(), item.quality, item.author]
        .filter(Boolean)
        .join(" · ");

      const thumb = item.thumbnail
        ? `<img src="${escapeHtml(item.thumbnail)}" onerror="this.style.display='none'">`
        : "";

      return `
        <div class="item">
          ${thumb}
          <div class="info">
            <div class="title">${escapeHtml(item.title || "Media " + (i + 1))}</div>
            <div class="meta">${escapeHtml(meta)}</div>
          </div>
          <button class="dl" data-url="${escapeHtml(item.url)}">Unduh</button>
        </div>`;
    })
    .join("");

  result.innerHTML =
    html + `<p class="hint">File diunduh langsung dari server sumber</p>`;

  result.querySelectorAll(".dl").forEach((btn) => {
    btn.addEventListener("click", () => {
      const url = btn.dataset.url;
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  });
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}