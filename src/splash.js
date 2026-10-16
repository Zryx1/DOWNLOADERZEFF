import { VORTEX_SPLASH_MUSIC } from "./playlist.js";

const SPLASH_DURATION = 5000;

const splashScreen = document.getElementById("splashScreen");
const splashAudio = document.getElementById("splashAudio");
const splashLogo = document.getElementById("splashLogo");
const splashTitle = document.getElementById("splashTitle");
const splashSubtitle = document.getElementById("splashSubtitle");
const splashBar = document.getElementById("splashBar");
const splashBarFill = document.getElementById("splashBarFill");
const menuPage = document.getElementById("menuPage");

let splashFinished = false;
let rafId = null;
let startFill = null;

function startSplash() {
  splashScreen.classList.add("show");

  if (VORTEX_SPLASH_MUSIC && splashAudio) {
    splashAudio.src = VORTEX_SPLASH_MUSIC;
    splashAudio.volume = 0.5;
    splashAudio.play().catch(err => console.log("Splash audio gagal:", err));
  }

  setTimeout(() => splashLogo.classList.add("show"), 100);
  setTimeout(() => splashTitle.classList.add("show"), 500);
  setTimeout(() => splashSubtitle.classList.add("show"), 900);
  setTimeout(() => splashBar.classList.add("show"), 1200);

  startFill = null;
  rafId = requestAnimationFrame(tick);
}

function tick(now) {
  if (splashFinished) return;
  if (startFill === null) startFill = now + 1200;
  const elapsed = now - startFill;
  if (elapsed < 0) { rafId = requestAnimationFrame(tick); return; }

  const pct = Math.min(100, (elapsed / (SPLASH_DURATION - 1200)) * 100);
  splashBarFill.style.width = pct + "%";

  if (pct < 100) rafId = requestAnimationFrame(tick);
  else finishSplash();
}

function finishSplash() {
  if (splashFinished) return;
  splashFinished = true;
  if (rafId) cancelAnimationFrame(rafId);

  if (splashAudio && !splashAudio.paused) {
    const fade = setInterval(() => {
      if (splashAudio.volume > 0.05) {
        splashAudio.volume = Math.max(0, splashAudio.volume - 0.06);
      } else {
        splashAudio.pause();
        splashAudio.currentTime = 0;
        clearInterval(fade);
      }
    }, 50);
  }

  setTimeout(() => {
    splashScreen.classList.add("hide");
    splashScreen.classList.remove("show");
    menuPage.classList.remove("hidden");
    document.body.classList.remove("locked");
    setTimeout(() => { splashScreen.style.display = "none"; }, 700);
  }, 400);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startSplash);
} else {
  startSplash();
}