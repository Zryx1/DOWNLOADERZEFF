// ============================================================
// PLATFORMS DATA
// ============================================================
const PLATFORMS = [
  { id:'tiktok', label:'TikTok', desc:'Video HD & audio', types:['video','audio'], icon:'M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z' },
  { id:'instagram', label:'Instagram', desc:'Foto & video', types:['video'], icon:'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z' },
  { id:'facebook', label:'Facebook', desc:'Video & audio', types:['video','audio'], icon:'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
  { id:'youtube', label:'YouTube', desc:'MP4 & MP3', types:['video','audio'], icon:'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
  { id:'capcut', label:'CapCut', desc:'Video template', types:['video'], icon:'M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm-6.94 9.59a.5.5 0 0 1-.71.71L12 13.94V18a1 1 0 1 1-2 0v-4.06l-.35.36a.5.5 0 0 1-.71-.71l1.77-1.76a.5.5 0 0 1 .58-.1.5.5 0 0 1 .58.1l1.77 1.76zM7 10a1 1 0 0 1 0-2h4a1 1 0 1 1 0 2H7zm10 0a1 1 0 0 1-1 1h-1a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1zm0 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0z' },
  { id:'spotify', label:'Spotify', desc:'Audio track', types:['audio'], icon:'M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z' },
  { id:'mediafire', label:'MediaFire', desc:'File sharing', types:['file'], icon:'M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z' },
  { id:'sfile', label:'SFile', desc:'File hosting', types:['file'], icon:'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z' },
  { id:'mega', label:'Mega', desc:'Cloud storage', types:['file'], icon:'M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v16h12V4H6zm2 3h8v2H8V7zm0 4h8v2H8v-2zm0 4h5v2H8v-2z' },
  { id:'github', label:'GitHub', desc:'Repo download', types:['file'], icon:'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12' },
  { id:'googledrive', label:'Google Drive', desc:'Cloud files', types:['file'], icon:'M7.71 3.5L1.15 15l3.43 6 6.55-11.5L7.71 3.5zm1.14 0l6.56 11.5h7.43l-3.43-6-3.14-5.5H8.85zM23 15H9.86l-3.43 6h13.14l3.43-6z' },
  { id:'twitter', label:'Twitter', desc:'Video & audio', types:['video','audio'], icon:'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z' },
  { id:'videy', label:'Videy', desc:'Video hosting', types:['video'], icon:'M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z' },
];

const TYPE_META = {
  video: { label:'Video', desc:'MP4 - kualitas HD', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>' },
  audio: { label:'Audio', desc:'MP3 - audio saja', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>' },
  file:  { label:'File',  desc:'Unduh file langsung', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>' },
};

const iconSVG = (path, size = 16) => `<svg viewBox="0 0 24 24" fill="currentColor" width="${size}" height="${size}"><path d="${path}"/></svg>`;

// ============================================================
// DOM
// ============================================================
const grid        = document.getElementById('vxGrid');
const innerRing   = document.getElementById('innerRing');
const outerRing   = document.getElementById('outerRing');
const tabs        = document.querySelectorAll('.vx-tab');
const typeModal   = document.getElementById('typeModal');
const typeModalSub = document.getElementById('typeModalSub');
const typeOptions = document.getElementById('typeOptions');

let activeTab = 'all';
let lastSuckedBtn = null;

// ============================================================
// BUILD GRID
// ============================================================
PLATFORMS.forEach(p => {
  const wrap = document.createElement('div');
  wrap.className = 'vx-card-wrap';
  wrap.dataset.category = p.types.join(' ');
  wrap.dataset.platform = p.id;
  wrap.innerHTML = `
    <button class="vx-card" data-label="${p.label}">
      <div class="vx-card-icon">${iconSVG(p.icon)}</div>
      <div>
        <div class="vx-card-name">${p.label}</div>
        <div class="vx-card-desc">${p.desc}</div>
      </div>
    </button>
  `;
  grid.appendChild(wrap);
});

// ============================================================
// BUILD ORBIT
// ============================================================
const innerAngles = [0, 72, 144, 216, 288];
const outerAngles = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5];

PLATFORMS.forEach((p, i) => {
  const isInner = i < 5;
  const angle = isInner ? innerAngles[i] : outerAngles[i - 5];
  const item = document.createElement('div');
  item.className = 'orbit-item';
  item.style.setProperty('--angle', angle + 'deg');
  item.innerHTML = `
    <div class="orbit-upright">
      <button class="orbit-card" data-label="${p.label}">${iconSVG(p.icon, 22)}</button>
    </div>
  `;
  (isInner ? innerRing : outerRing).appendChild(item);
});

// ============================================================
// SUCK EFFECT
// ============================================================
function spawnShatter(x, y, count = 10) {
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'shatter-particle';
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.6;
    const dist = 40 + Math.random() * 60;
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    p.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
    p.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
    const s = 2 + Math.random() * 3;
    p.style.width = s + 'px';
    p.style.height = s + 'px';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 800);
  }
}

function fireBHFlash(x, y) {
  const flash = document.createElement('div');
  flash.className = 'bh-flash';
  flash.style.left = x + 'px';
  flash.style.top = y + 'px';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 700);
}

function suckToBlackhole(sourceEl, callback) {
  const rect = sourceEl.getBoundingClientRect();
  const bhEl = document.getElementById('vxHole');
  const bhRect = bhEl.getBoundingClientRect();
  const bhX = bhRect.left + bhRect.width / 2;
  const bhY = bhRect.top + bhRect.height / 2;
  const srcX = rect.left + rect.width / 2;
  const srcY = rect.top + rect.height / 2;

  const clone = sourceEl.cloneNode(true);
  clone.classList.add('suck-clone');
  clone.style.position = 'fixed';
  clone.style.left = rect.left + 'px';
  clone.style.top = rect.top + 'px';
  clone.style.width = rect.width + 'px';
  clone.style.height = rect.height + 'px';
  clone.style.margin = '0';
  clone.style.zIndex = '9998';
  clone.style.pointerEvents = 'none';
  clone.style.setProperty('--dx', (bhX - srcX) + 'px');
  clone.style.setProperty('--dy', (bhY - srcY) + 'px');
  document.body.appendChild(clone);

  sourceEl.style.transition = 'opacity 0.3s';
  sourceEl.style.opacity = '0';
  lastSuckedBtn = sourceEl;

  spawnShatter(srcX, srcY, 8);

  setTimeout(() => {
    spawnShatter(bhX, bhY, 14);
    fireBHFlash(bhX, bhY);
  }, 700);

  setTimeout(() => {
    clone.remove();
    callback && callback();
  }, 950);
}

function restoreSuckedCard() {
  if (lastSuckedBtn) {
    lastSuckedBtn.style.opacity = '';
    lastSuckedBtn = null;
  }
}

// ============================================================
// CARD DESCRIPTIONS
// ============================================================
function updateCardDescriptions(filter) {
  document.querySelectorAll('.vx-card-wrap').forEach(wrap => {
    const platform = PLATFORMS.find(p => p.id === wrap.dataset.platform);
    if (!platform) return;
    const descEl = wrap.querySelector('.vx-card-desc');
    if (!descEl) return;

    if (filter === 'all') {
      descEl.textContent = platform.desc;
    } else if (filter === 'video') {
      descEl.textContent = platform.types.includes('video') ? 'Video Version' : platform.desc;
    } else if (filter === 'audio') {
      descEl.textContent = platform.types.includes('audio') ? 'Audio Version' : platform.desc;
    } else if (filter === 'file') {
      descEl.textContent = platform.types.includes('file') ? 'File Version' : platform.desc;
    }
  });
}

// ============================================================
// HANDLE PLATFORM CLICK
// ============================================================
function handlePlatformClick(btn) {
  const platform = PLATFORMS.find(p => p.label === btn.dataset.label);
  if (!platform) return;
  const types = platform.types;

  suckToBlackhole(btn, () => {
    if (activeTab !== 'all' && types.includes(activeTab)) {
      window.openDownloadView && window.openDownloadView(platform.id, activeTab);
    } else if (types.length === 1) {
      window.openDownloadView && window.openDownloadView(platform.id, types[0]);
    } else {
      showTypeModal(platform, types);
    }
  });
}

function showTypeModal(platform, types) {
  typeModalSub.textContent = `Pilih format untuk ${platform.label}`;
  typeOptions.innerHTML = types.map(t => {
    const m = TYPE_META[t];
    return `<button class="type-option" data-type="${t}">
      <div class="type-icon">${m.icon}</div>
      <div class="type-text">
        <div class="type-label">${m.label}</div>
        <div class="type-desc">${m.desc}</div>
      </div>
    </button>`;
  }).join('');

  typeOptions.querySelectorAll('.type-option').forEach(b => {
    b.addEventListener('click', () => {
      typeModal.classList.remove('open');
      window.openDownloadView && window.openDownloadView(platform.id, b.dataset.type);
    });
  });

  typeModal.classList.add('open');
}

typeModal.addEventListener('click', (e) => {
  if (e.target === typeModal) {
    typeModal.classList.remove('open');
    restoreSuckedCard();
  }
});

// ============================================================
// ATTACH HANDLERS
// ============================================================
document.querySelectorAll('.orbit-card').forEach(btn => {
  btn.addEventListener('click', () => handlePlatformClick(btn));
});
document.querySelectorAll('.vx-card').forEach(btn => {
  btn.addEventListener('click', () => handlePlatformClick(btn));
});

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const filter = tab.dataset.filter;
    activeTab = filter;
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const wraps = document.querySelectorAll('.vx-card-wrap');
    wraps.forEach(w => w.classList.remove('filtered'));

    if (filter === 'all') {
      document.body.classList.add('mode-orbit');
    } else {
      document.body.classList.remove('mode-orbit');
      wraps.forEach(w => {
        const cats = (w.dataset.category || '').split(' ');
        if (!cats.includes(filter)) w.classList.add('filtered');
      });
      grid.scrollTop = 0;
    }

    updateCardDescriptions(filter);
  });
});

window.VORTEX_PLATFORMS = PLATFORMS;
window.VORTEX_RESTORE = restoreSuckedCard;
window.VORTEX_ICON_SVG = iconSVG;

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && typeModal.classList.contains('open')) {
    typeModal.classList.remove('open');
    restoreSuckedCard();
  }
});