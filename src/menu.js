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

dlSubmit.addEventListener("click", async () => {
  const url = dlInput.value.trim();
  if (!url) return;

  dlSubmit.disabled = true;
  dlSubmit.innerHTML = '<span>Memproses...</span>';

  setTimeout(() => {
    dlResult.innerHTML = `
      <div class="media-card">
        <div class="preview-wrap">
          <div style="padding: 60px 20px; text-align: center; color: #525252; font-size: 13px;">
            Preview media akan muncul di sini<br>
            <span style="font-size: 11px; color: #3a3a3a; margin-top: 8px; display: block;">
              Platform: ${currentPlatform}<br>URL: ${url.slice(0, 40)}...
            </span>
          </div>
        </div>
        <div class="media-info">
          <div class="media-head">
            <div class="media-title">Contoh Media ${dlName.textContent}</div>
            <button class="dl-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Unduh
            </button>
          </div>
        </div>
      </div>
    `;
    dlSubmit.disabled = false;
    dlSubmit.innerHTML = `<span>Ambil Media</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;
  }, 1500);
});