import { VORTEX_PLAYLIST } from "./playlist.js";

const PLAYLIST = VORTEX_PLAYLIST;

const musicFab = document.getElementById("musicFab");
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

function fmtTime(t) {
  if (!t || !isFinite(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return m + ":" + (s < 10 ? "0" : "") + s;
}

function renderPlaylist() {
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

function playTrack(idx, autoplay = false) {
  if (!PLAYLIST[idx]) return;
  currentIdx = idx;
  const track = PLAYLIST[idx];

  audio.src = track.url;
  mpNowTitle.textContent = track.title;
  mpNowArtist.textContent = track.artist;
  mpNowCover.querySelector("span").textContent = track.icon || "♪";

  mpList.querySelectorAll(".mp-track").forEach((t, i) => {
    t.classList.toggle("active", i === idx);
  });

  if (autoplay) {
    audio.play().then(() => setPlayingUI(true))
      .catch(err => console.log("Autoplay blocked:", err));
  }
}

function setPlayingUI(playing) {
  if (playing) {
    mpIconPlay.style.display = "none";
    mpIconPause.style.display = "block";
    mpNowCover.classList.add("playing");
    musicFab.classList.add("playing");
  } else {
    mpIconPlay.style.display = "block";
    mpIconPause.style.display = "none";
    mpNowCover.classList.remove("playing");
    musicFab.classList.remove("playing");
  }
}

mpPlay.addEventListener("click", () => {
  if (!audio.src) { playTrack(0, true); return; }
  if (audio.paused) {
    audio.play();
    setPlayingUI(true);
  } else {
    audio.pause();
    setPlayingUI(false);
  }
});

mpPrev.addEventListener("click", () => {
  if (!PLAYLIST.length) return;
  playTrack((currentIdx - 1 + PLAYLIST.length) % PLAYLIST.length, true);
});

mpNext.addEventListener("click", () => {
  if (!PLAYLIST.length) return;
  playTrack((currentIdx + 1) % PLAYLIST.length, true);
});

audio.addEventListener("timeupdate", () => {
  if (audio.duration) {
    const pct = (audio.currentTime / audio.duration) * 100;
    mpProgressFill.style.width = pct + "%";
    mpCurTime.textContent = fmtTime(audio.currentTime);
  }
});

audio.addEventListener("loadedmetadata", () => {
  mpDurTime.textContent = fmtTime(audio.duration);
  const durEl = mpList.querySelectorAll(".mp-track-dur")[currentIdx];
  if (durEl) durEl.textContent = fmtTime(audio.duration);
});

audio.addEventListener("ended", () => {
  if (!PLAYLIST.length) return;
  playTrack((currentIdx + 1) % PLAYLIST.length, true);
});

mpProgressTrack.addEventListener("click", (e) => {
  if (!audio.duration) return;
  const rect = mpProgressTrack.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  audio.currentTime = pct * audio.duration;
});

musicFab.addEventListener("click", () => {
  musicPanel.classList.add("open");
  mpOverlay.classList.add("open");
});

function closePanel() {
  musicPanel.classList.remove("open");
  mpOverlay.classList.remove("open");
}

mpClose.addEventListener("click", closePanel);
mpOverlay.addEventListener("click", closePanel);

renderPlaylist();