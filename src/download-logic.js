const downloadView = document.getElementById('downloadView');
const dlBack  = document.getElementById('dlBack');
const dlIcon  = document.getElementById('dlIcon');
const dlName  = document.getElementById('dlName');
const dlTag   = document.getElementById('dlTag');
const dlInput = document.getElementById('dlInput');
const dlSubmit = document.getElementById('dlSubmit');
const dlResult = document.getElementById('dlResult');

let currentPlatformId = null;
let currentType = null;

window.openDownloadView = function (platformId, type) {
  const platforms = window.VORTEX_PLATFORMS || [];
  const platform = platforms.find(p => p.id === platformId);
  if (!platform) return;

  currentPlatformId = platformId;
  currentType = type;

  dlIcon.innerHTML = window.VORTEX_ICON_SVG(platform.icon, 20);
  dlName.textContent = platform.label;
  dlTag.textContent = type.charAt(0).toUpperCase() + type.slice(1) + ' Version';
  dlInput.value = '';
  dlSubmit.disabled = true;
  dlResult.innerHTML = '';

  document.body.classList.add('view-download');
};

function closeDownloadView() {
  document.body.classList.remove('view-download');
  dlInput.value = '';
  dlSubmit.disabled = true;
  dlResult.innerHTML = '';
  currentPlatformId = null;
  currentType = null;
  if (window.VORTEX_RESTORE) window.VORTEX_RESTORE();
}

dlBack.addEventListener('click', closeDownloadView);

dlInput.addEventListener('input', () => {
  dlSubmit.disabled = !dlInput.value.trim();
});

dlSubmit.addEventListener('click', async () => {
  const url = dlInput.value.trim();
  if (!url) return;

  dlSubmit.disabled = true;
  dlSubmit.innerHTML = '<span>Memproses...</span>';
  dlResult.innerHTML = `<div class="media-card" style="padding:40px;text-align:center;">
    <div class="loading-spinner"></div>
    <p style="margin-top:16px;color:#8a8a8a;font-size:13px;">Mengambil data dari server...</p>
  </div>`;

  try {
    const res = await fetch('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        type: currentType === 'video' ? 'video' : currentType === 'audio' ? 'audio' : '',
        format: currentType === 'audio' ? 'mp3' : 'mp4',
        resolusi: '720',
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || 'Gagal');
    renderResults(data.items);
  } catch (err) {
    console.error('API error:', err);
    renderError(err.message || 'Terjadi kesalahan');
  } finally {
    dlSubmit.disabled = false;
    dlSubmit.innerHTML = `<span>Ambil Media</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;
  }
});

function renderResults(items) {
  if (!items || !items.length) {
    renderError('Tidak ada media ditemukan');
    return;
  }
  dlResult.innerHTML = '';
  items.forEach((item, i) => dlResult.appendChild(buildMediaCard(item, i)));
}

function renderError(msg) {
  dlResult.innerHTML = `<div class="media-card" style="padding:20px;color:#fca5a5;font-size:13px;">
    <strong>Gagal:</strong> ${escapeHtml(msg)}
  </div>`;
}

function buildMediaCard(item, idx) {
  const card = document.createElement('div');
  card.className = 'media-card';
  const preview = document.createElement('div');
  preview.className = 'preview-wrap';

  if (item.type === 'video' && item.url) {
    const v = document.createElement('video');
    v.src = item.url;
    v.controls = true;
    v.preload = 'metadata';
    v.playsInline = true;
    v.style.cssText = 'width:100%;max-height:340px;border-radius:0;';
    if (item.thumbnail) v.poster = item.thumbnail;
    preview.appendChild(v);
  } else if (item.type === 'audio' && item.url) {
    const a = document.createElement('audio');
    a.src = item.url;
    a.controls = true;
    a.preload = 'metadata';
    a.style.cssText = 'width:100%;max-width:400px;';
    preview.appendChild(a);
  } else if (item.type === 'image' && (item.url || item.thumbnail)) {
    const img = document.createElement('img');
    img.src = item.url || item.thumbnail;
    img.loading = 'lazy';
    img.style.cssText = 'width:100%;max-height:340px;object-fit:contain;';
    preview.appendChild(img);
  } else {
    preview.innerHTML = '<div class="media-icon-big"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="52" height="52"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg></div>';
  }

  card.appendChild(preview);

  const info = document.createElement('div');
  info.className = 'media-info';

  const head = document.createElement('div');
  head.className = 'media-head';
  const title = document.createElement('div');
  title.className = 'media-title';
  title.textContent = item.title || item.filename || `Media ${idx + 1}`;
  head.appendChild(title);

  const btn = document.createElement('button');
  btn.className = 'dl-btn';
  btn.textContent = 'Unduh';
  btn.addEventListener('click', () => {
    if (!item.url) return;
    window.open(`/api/proxy?url=${encodeURIComponent(item.url)}&filename=${encodeURIComponent(item.filename || 'media')}`, '_blank');
  });
  head.appendChild(btn);
  info.appendChild(head);

  if (item.author || item.quality || item.filesize) {
    const meta = document.createElement('div');
    meta.className = 'media-meta';
    meta.textContent = [item.author, item.quality, item.filesize].filter(Boolean).join(' · ');
    info.appendChild(meta);
  }

  card.appendChild(info);
  return card;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}