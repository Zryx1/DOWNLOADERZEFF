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
const typeModal = document.getElementById("typeModal");
const typeOptions = document.getElementById("typeOptions");
const typeModalSub = document.getElementById("typeModalSub");

let isAnimating = false;
let activeFilter = "all";

// ==================== TAB FILTER ====================
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    if (isAnimating) return;
    activeFilter = tab.dataset.filter;
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    cardWraps.forEach(wrap => {
      const cats = (wrap.dataset.category || "").split(" ");
      const match = activeFilter === "all" || cats.includes(activeFilter);
      wrap.classList.toggle("filtered", !match);
    });
  });
});

// ==================== ANIMASI HISAP ====================
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
    p.style.left = x + "px"; p.style.top = y + "px";
    p.style.setProperty("--tx", Math.cos(angle) * dist + "px");
    p.style.setProperty("--ty", Math.sin(angle) * dist + "px");
    const size = 2 + Math.random() * 3;
    p.style.width = size + "px"; p.style.height = size + "px";
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 750);
  }
}

function fireFlash() {
  const { x, y } = getHoleCenter();
  flash.style.left = x + "px"; flash.style.top = y + "px";
  flash.classList.remove("fire"); void flash.offsetWidth;
  flash.classList.add("fire");
}

// ==================== OPEN DOWNLOAD ====================
function openDownload(card, type) {
  const dlIcon = document.getElementById("dlIcon");
  const dlName = document.getElementById("dlName");
  const dlTag = document.getElementById("dlTag");
  const dlInput = document.getElementById("dlInput");
  const dlSubmit = document.getElementById("dlSubmit");
  const dlResult = document.getElementById("dlResult");

  dlIcon.innerHTML = card.querySelector(".vx-card-icon svg").outerHTML;
  dlName.textContent = card.dataset.label || "Platform";
  dlTag.textContent = type === "video" ? "Video" : type === "audio" ? "Audio" : "Auto";
  dlInput.value = "";
  dlSubmit.disabled = true;
  dlResult.innerHTML = "";

  // Save for logic
  window.currentPlatform = card.dataset.platform;
  window.currentType = type;

  vxTabs.classList.add("hidden-tabs");
  vxTitle.classList.add("hidden-title");
  menuPage.classList.add("hidden");
  downloadPage.classList.remove("hidden");
}

// ==================== CARD CLICK ====================
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

    setTimeout(() => {
      const typesRaw = card.dataset.types || "";
      const types = typesRaw.split(",").map(s => s.trim()).filter(Boolean);
      if (activeFilter === "video") openDownload(card, "video");
      else if (activeFilter === "audio") openDownload(card, "audio");
      else if (types.length > 1) showTypeModal(card, types);
      else openDownload(card, types[0] || "auto");
    }, 1100);

    setTimeout(() => {
      wrap.classList.remove("sucking");
      vxWrap.classList.remove("sucking");
      isAnimating = false;
    }, 1800);
  });
});

// ==================== TYPE MODAL ====================
const ICON_VIDEO = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>`;
const ICON_AUDIO = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`;
const ICON_AUTO = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;

const TYPE_META = {
  video: { icon: ICON_VIDEO, label: "Video", desc: "MP4 - kualitas HD" },
  audio: { icon: ICON_AUDIO, label: "Audio", desc: "MP3 - audio saja" },
  auto:  { icon: ICON_AUTO,  label: "Auto",  desc: "Deteksi otomatis" },
};

function showTypeModal(card, types) {
  typeModalSub.textContent = `Pilih format untuk ${card.dataset.label}`;
  typeOptions.innerHTML = types.map(t => {
    const m = TYPE_META[t] || { icon: ICON_AUTO, label: t, desc: "" };
    return `<button class="type-option" data-type="${t}"><div class="type-icon">${m.icon}</div><div class="type-text"><div class="type-label">${m.label}</div><div class="type-desc">${m.desc}</div></div><svg class="type-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button>`;
  }).join("");

  typeOptions.querySelectorAll(".type-option").forEach(btn => {
    btn.addEventListener("click", () => {
      typeModal.classList.remove("open");
      openDownload(card, btn.dataset.type);
    });
  });
  typeModal.classList.add("open");
}

typeModal.addEventListener("click", (e) => {
  if (e.target === typeModal) typeModal.classList.remove("open");
});