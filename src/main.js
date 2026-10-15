import "./style.css";

// ==================== DOM ====================
const urlInput = document.getElementById("url");
const submitBtn = document.getElementById("submitBtn");
const ytOptions = document.getElementById("ytOptions");
const resWrapper = document.getElementById("resWrapper");
const result = document.getElementById("result");

let format = "mp4";
let resolusi = "720";

// ==================== BUTTON HELPERS ====================
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

// ==================== INPUT DETECT ====================
urlInput.addEventListener("input", () => {
  const u = urlInput.value.toLowerCase();
  const isYT = u.includes("youtu.be") || u.includes("youtube.com");
  ytOptions.classList.toggle("hidden", !isYT);
  submitBtn.disabled = !urlInput.value.trim();
});

// ==================== SUBMIT ====================
submitBtn.addEventListener("click", async () => {
  const url = urlInput.value.trim();
  if (!url) return;

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
    const data = await res.json();
    render(data);
  } catch (e) {
    result.innerHTML = `<div class="error"><strong>Gagal:</strong> ${e.message}</div>`;
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

  result.innerHTML = html + `<p class="hint">File diunduh langsung dari server sumber</p>`;

  // Attach event ke tombol unduh
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