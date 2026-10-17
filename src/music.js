import { VORTEX_PLAYLIST } from "./playlist.js";

const PLAYLIST = VORTEX_PLAYLIST;
const STORAGE_KEY = "vortex_music_state";

// Element DOM (Menggunakan null check agar tidak error)
const miniBar = document.getElementById("miniBar");
const miniIcon = document.getElementById("miniIcon");
const miniEq = document.getElementById("miniEq");
const miniText = document.getElementById("miniText");

const musicPanel = document.getElementById("musicPanel");
const mpOverlay = document.getElementById("mpOverlay");
const mpClose = document.getElementById("mpClose");
const mpList = document.getElementById("mpList");
const mpPlay = document.getElementById("mpPlay");
const mpPrev = document.getElementById("mpPrev");
const mpNext = document.getElementById("mpNext");
const mpIconPlay = document.getElementById("mpIconPlay");
const mpIconPause = document.getElementById("mpIconPause");
const mpNowCover = document.getElementById("mpNowCover");
const mpNowTitle = document.getElementById("mpNowTitle");
const mpNowArtist = document.getElementById("mpNowArtist");
const mpProgressFill = document.getElementById("mpProgressFill");
const mpProgressTrack = document.getElementById("mpProgressTrack");
const mpCurTime = document.getElementById("mpCurTime");
const mpDurTime = document.getElementById("mpDurTime");
const audio = document.getElementById("audioEl");

let currentIdx = 0;
let hasSelectedTrack = false;

// ==================== HELPERS ====================
function fmtTime(t) {
  if (!t || !isFinite(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return m + ":" + (s < 10 ? "0" : "") + s;
}

function saveMusicState() {
  if (!audio || !audio.src) return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      idx: currentIdx,
      time: audio.currentTime,
      playing: !audio.paused,
    }));
  } catch (e) {}
}

function loadMusicState() {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

// ==================== RENDER ====================
function renderPlaylist() {
  if (!mpList) return;
  if (!PLAYLIST.length) {
    mpList.innerHTML = `<div style="padding: 20px; text-align: center; color: #525252; font-size: 12px;">Playlist kosong</div>`;
    return;
  }

  mpList.innerHTML = PLAYLIST.map((track, i) => `
    <button class="mp-track ${i === currentIdx ? "active" : ""}" data-idx="${i}">
      <div class="mp-track-num">${String(i + 1).padStart(2, "0")}</div>
      <div class="mp-track-icon"><span>${track.icon || "♪"}</span></div>
      <div class="mp-track-info">
        <div class="mp-track-title">${track.title}</div>
        <div class="mp-track-artist">${track.artist}</div>
      </div>
      <div class="mp-track-dur">--:--</div>
    </button>
  `).join("");

  mpList.querySelectorAll(".mp-track").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.idx);
      playTrack(idx, true);
    });
  });
}

// ==================== PLAY ====================
function playTrack(idx, autoplay = false, startTime = 0) {
  if (!PLAYLIST[idx] || !audio) return;
  currentIdx = idx;
  const track = PLAYLIST[idx];

  audio.src = track.url;
  if (startTime > 0) audio.currentTime = startTime;

  if (mpNowTitle) mpNowTitle.textContent = track.title;
  if (mpNowArtist) mpNowArtist.textContent = track.artist;
  if (mpNowCover) mpNowCover.querySelector("span").textContent = track.icon || "♪";
  if (miniText) miniText.textContent = track.title;
  
  hasSelectedTrack = true;

  if (mpList) {
    mpList.querySelectorAll(".mp-track").forEach((t, i) => {
      t.classList.toggle("active", i === idx);
    });
  }

  if (autoplay) {
    audio.play().then(() => setPlayingUI(true)).catch(err => console.log("Autoplay blocked:", err));
  }
}

function setPlayingUI(playing) {
  if (!audio) return;
  
  if (playing) {
    if (mpIconPlay) mpIconPlay.style.display = "none";
    if (mpIconPause) mpIconPause.style.display = "block";
    if (mpNowCover) mpNowCover.classList.add("playing");
    if (miniIcon) miniIcon.classList.add("playing");
    if (miniEq) miniEq.classList.add("playing");
  } else {
    if (mpIconPlay) mpIconPlay.style.display = "block";
    if (mpIconPause) mpIconPause.style.display = "none";
    if (mpNowCover) mpNowCover.classList.remove("playing");
    if (miniIcon) miniIcon.classList.remove("playing");
    if (miniEq) miniEq.classList.remove("playing");
  }
}

// ==================== EVENTS ====================
if (mpPlay) {
  mpPlay.addEventListener("click", () => {
    if (!audio.src) { playTrack(0, true); return; }
    if (audio.paused) {
      audio.play().then(() => setPlayingUI(true)).catch(() => {});
    } else {
      audio.pause();
      setPlayingUI(false);
    }
  });
}

if (mpPrev) {
  mpPrev.addEventListener("click", () => {
    if (!PLAYLIST.length) return;
    playTrack((currentIdx - 1 + PLAYLIST.length) % PLAYLIST.length, true);
  });
}

if (mpNext) {
  mpNext.addEventListener("click", () => {
    if (!PLAYLIST.length) return;
    playTrack((currentIdx + 1) % PLAYLIST.length, true);
  });
}

if (audio) {
  audio.addEventListener("timeupdate", () => {
    if (audio.duration && mpProgressFill && mpCurTime) {
      const pct = (audio.currentTime / audio.duration) * 100;
      mpProgressFill.style.width = pct + "%";
      mpCurTime.textContent = fmtTime(audio.currentTime);
    }
  });

  audio.addEventListener("loadedmetadata", () => {
    if (mpDurTime) mpDurTime.textContent = fmtTime(audio.duration);
    if (mpList) {
      const durEl = mpList.querySelectorAll(".mp-track-dur")[currentIdx];
      if (durEl) durEl.textContent = fmtTime(audio.duration);
    }
  });

  audio.addEventListener("play", () => { setPlayingUI(true); saveMusicState(); });
  audio.addEventListener("pause", () => { setPlayingUI(false); saveMusicState(); });
  audio.addEventListener("ended", () => {
    if (!PLAYLIST.length) return;
    playTrack((currentIdx + 1) % PLAYLIST.length, true);
  });
}

if (mpProgressTrack && audio) {
  mpProgressTrack.addEventListener("click", (e) => {
    if (!audio.duration) return;
    const rect = mpProgressTrack.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * audio.duration;
  });
}

// ==================== PANEL ====================
function openPanel() {
  if (musicPanel) musicPanel.classList.add("open");
  if (mpOverlay) mpOverlay.classList.add("open");
}

function closePanel() {
  if (musicPanel) musicPanel.classList.remove("open");
  if (mpOverlay) mpOverlay.classList.remove("open");
}

if (miniBar) miniBar.addEventListener("click", openPanel);
if (mpClose) mpClose.addEventListener("click", closePanel);
if (mpOverlay) mpOverlay.addEventListener("click", closePanel);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && musicPanel && musicPanel.classList.contains("open")) closePanel();
});

setInterval(() => { if (audio && !audio.paused) saveMusicState(); }, 3000);
window.addEventListener("pagehide", saveMusicState);

// ==================== INIT ====================
renderPlaylist();
const savedState = loadMusicState();
if (savedState && PLAYLIST[savedState.idx]) {
  currentIdx = savedState.idx;
  playTrack(savedState.idx, false, savedState.time || 0);
  if (savedState.playing) {
    setTimeout(() => {
      audio.play().then(() => setPlayingUI(true)).catch(() => setPlayingUI(false));
    }, 300);
  }
}