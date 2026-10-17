import { VORTEX_PLAYLIST } from "./playlist.js";

const PLAYLIST = VORTEX_PLAYLIST;

const audio       = document.getElementById('audioEl');
const miniBar     = document.getElementById('miniBar');
const miniIcon    = document.getElementById('miniIcon');
const miniText    = document.getElementById('miniText');
const miniEq      = document.getElementById('miniEq');
const musicPanel  = document.getElementById('musicPanel');
const mpOverlay   = document.getElementById('mpOverlay');
const mpClose     = document.getElementById('mpClose');
const mpPlay      = document.getElementById('mpPlay');
const mpPrev      = document.getElementById('mpPrev');
const mpNext      = document.getElementById('mpNext');
const mpIconPlay  = document.getElementById('mpIconPlay');
const mpIconPause = document.getElementById('mpIconPause');
const mpNowCover  = document.getElementById('mpNowCover');
const mpNowTitle  = document.getElementById('mpNowTitle');
const mpNowArtist = document.getElementById('mpNowArtist');
const mpList      = document.getElementById('mpList');

let currentIdx = 0;

// Render playlist
mpList.innerHTML = PLAYLIST.map((t, i) => `
  <button class="mp-track ${i === 0 ? 'active' : ''}" data-idx="${i}">
    <div class="mp-track-icon">
      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
    </div>
    <div class="mp-track-info">
      <div class="mp-track-title">${t.title}</div>
      <div class="mp-track-artist">${t.artist}</div>
    </div>
  </button>
`).join('');

function playTrack(idx) {
  currentIdx = idx;
  const track = PLAYLIST[idx];
  audio.src = track.url;
  mpNowTitle.textContent = track.title;
  mpNowArtist.textContent = track.artist;
  miniText.textContent = track.title;
  mpList.querySelectorAll('.mp-track').forEach((t, i) => {
    t.classList.toggle('active', i === idx);
  });
  audio.play().then(() => setPlaying(true)).catch(() => {});
}

function setPlaying(playing) {
  if (playing) {
    miniIcon.classList.add('playing');
    miniEq.classList.add('playing');
    mpNowCover.classList.add('playing');
    mpIconPlay.style.display = 'none';
    mpIconPause.style.display = 'block';
  } else {
    miniIcon.classList.remove('playing');
    miniEq.classList.remove('playing');
    mpNowCover.classList.remove('playing');
    mpIconPlay.style.display = 'block';
    mpIconPause.style.display = 'none';
  }
}

mpList.querySelectorAll('.mp-track').forEach(btn => {
  btn.addEventListener('click', () => playTrack(parseInt(btn.dataset.idx)));
});

mpPlay.addEventListener('click', () => {
  if (!audio.src) { playTrack(0); return; }
  if (audio.paused) audio.play().then(() => setPlaying(true)).catch(() => {});
  else audio.pause();
});

mpPrev.addEventListener('click', () => playTrack((currentIdx - 1 + PLAYLIST.length) % PLAYLIST.length));
mpNext.addEventListener('click', () => playTrack((currentIdx + 1) % PLAYLIST.length));

audio.addEventListener('play', () => setPlaying(true));
audio.addEventListener('pause', () => setPlaying(false));
audio.addEventListener('ended', () => playTrack((currentIdx + 1) % PLAYLIST.length));

function openPanel() {
  musicPanel.classList.add('open');
  mpOverlay.classList.add('open');
}
function closePanel() {
  musicPanel.classList.remove('open');
  mpOverlay.classList.remove('open');
}

miniBar.addEventListener('click', openPanel);
mpClose.addEventListener('click', closePanel);
mpOverlay.addEventListener('click', closePanel);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && musicPanel.classList.contains('open')) closePanel();
});