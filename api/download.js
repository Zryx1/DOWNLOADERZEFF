const NEXRAY_BASE = "https://api.nexray.eu.cc";
const TIMEOUT_MS = 50000;

function detectPlatform(url) {
  const u = url.toLowerCase();
  if (u.includes("tiktok.com")) return "tiktok";
  if (u.includes("youtu.be") || u.includes("youtube.com")) return "youtube";
  if (u.includes("instagram.com")) return "instagram";
  if (u.includes("facebook.com") || u.includes("fb.watch") || u.includes("fb.com")) return "facebook";
  if (u.includes("capcut.com")) return "capcut";
  if (u.includes("spotify.com")) return "spotify";
  if (u.includes("mediafire.com")) return "mediafire";
  if (u.includes("sfile.co")) return "sfile";
  if (u.includes("mega.nz")) return "mega";
  if (u.includes("github.com")) return "github";
  if (u.includes("drive.google.com")) return "googledrive";
  if (u.includes("twitter.com") || u.includes("x.com")) return "twitter";
  if (u.includes("videy.co")) return "videy";
  return null;
}

async function fetchNexray(path, params) {
  const qs = new URLSearchParams(params).toString();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${NEXRAY_BASE}${path}?${qs}`, {
      signal: controller.signal,
      headers: { "User-Agent": "VortexWeb/1.0" },
    });
    if (!res.ok) throw new Error(`NexRay HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function normalizeFile(platform, r) {
  switch (platform) {
    case "mediafire":
      return [{ type: "file", url: r.download_url, filename: r.filename, filesize: r.filesize, title: r.filename }];
    case "sfile":
      return [{ type: "file", url: r.url, filename: r.file_name, filesize: r.size, title: r.file_name }];
    case "mega":
      return [{ type: "file", url: r.download_url, filename: r.filename, filesize: r.filesize, title: r.filename }];
    case "github":
      return [{ type: "file", url: r.url, filename: r.filename, filesize: null, title: r.filename, author: r.repo }];
    case "googledrive":
      return [{ type: "file", url: r.url, filename: r.name, filesize: null, title: r.name }];
    default:
      return [];
  }
}

function normalize(platform, data, extra = {}) {
  const r = data.result;
  if (!r && r !== "") throw new Error("Response kosong dari server");

  const type = extra.type || "";

  switch (platform) {
    case "tiktok": {
      const items = [];
      if (r.data && (type === "video" || !type)) {
        items.push({ type: "video", url: r.data, thumbnail: r.cover, title: r.title, author: r.author?.nickname, quality: "HD" });
      }
      if (r.music_info?.url && (type === "audio" || !type)) {
        items.push({ type: "audio", url: r.music_info.url, title: r.title, author: r.author?.nickname });
      }
      return items;
    }
    case "youtube": {
      if (type === "audio" || extra.format === "mp3") {
        return [{ type: "audio", url: r.url, title: r.title, author: r.author || "YouTube" }];
      }
      return [{ type: "video", url: r.url, title: r.title, author: r.author, quality: r.quality || extra.resolusi }];
    }
    case "instagram": {
      const items = Array.isArray(r) ? r : [r];
      return items.map(item => ({ type: item.type === "video" ? "video" : "image", url: item.url, thumbnail: item.thumbnail }));
    }
    case "facebook": {
      const items = [];
      if (r.video_hd && (type === "video" || !type)) items.push({ type: "video", url: r.video_hd, title: r.title, quality: "HD" });
      if (r.audio && (type === "audio" || !type)) items.push({ type: "audio", url: r.audio, title: r.title });
      return items;
    }
    case "capcut":
      return [{ type: "video", url: r.url, thumbnail: r.thumbnail, title: r.title, author: r.author?.name }];
    case "spotify":
      return [{ type: "audio", url: r.url, title: r.title, author: r.artist }];

    case "mediafire":
    case "sfile":
    case "mega":
    case "github":
    case "googledrive":
      return normalizeFile(platform, r);

    case "twitter": {
      if (!Array.isArray(r.download_url)) return [];
      return r.download_url.map(item => ({
        type: item.type === "mp4" ? "video" : item.type === "mp3" ? "audio" : "image",
        url: item.url,
        thumbnail: r.thumbnail,
        title: r.title ? r.title.slice(0, 80) : "Twitter Media",
        quality: item.name || item.resolusi || null,
        duration: r.duration,
      }));
    }

    case "videy": {
      if (typeof r !== "string") return [];
      return [{ type: "video", url: r, title: "Videy Video", quality: "HD" }];
    }

    default:
      return [];
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    let body = req.body;
    if (typeof body === "string") {
      try { body = JSON.parse(body); } catch { body = {}; }
    }
    const { url, format = "mp4", resolusi = "720", type = "" } = body || {};

    if (!url || typeof url !== "string") {
      return res.status(400).json({ ok: false, error: "URL tidak valid" });
    }

    const platform = detectPlatform(url);
    if (!platform) {
      return res.status(400).json({ ok: false, error: "Platform tidak didukung" });
    }

    let data;
    let extra = { type };

    switch (platform) {
      case "tiktok": data = await fetchNexray("/downloader/tiktok", { url }); break;
      case "youtube":
        if (type === "audio" || format === "mp3") {
          data = await fetchNexray("/downloader/ytmp3", { url });
          extra.type = "audio"; extra.format = "mp3";
        } else {
          data = await fetchNexray("/downloader/v1/ytmp4", { url, resolusi });
          extra.type = "video"; extra.format = "mp4"; extra.resolusi = resolusi;
        }
        break;
      case "instagram": data = await fetchNexray("/downloader/instagram", { url }); break;
      case "facebook": data = await fetchNexray("/downloader/facebook", { url }); break;
      case "capcut": data = await fetchNexray("/downloader/v1/capcut", { url }); break;
      case "spotify": data = await fetchNexray("/downloader/spotify", { url }); break;
      case "mediafire": data = await fetchNexray("/downloader/mediafire", { url }); break;
      case "sfile": data = await fetchNexray("/downloader/sfile", { url }); break;
      case "mega": data = await fetchNexray("/downloader/mega", { url }); break;
      case "github": data = await fetchNexray("/downloader/github", { url }); break;
      case "googledrive": data = await fetchNexray("/downloader/googledrive", { url }); break;
      case "twitter": data = await fetchNexray("/downloader/twitter", { url }); break;
      case "videy": data = await fetchNexray("/downloader/videy", { url }); break;
    }

    if (!data?.status) {
      return res.status(502).json({ ok: false, error: "Gagal mengambil data dari server" });
    }

    const items = normalize(platform, data, extra);
    return res.status(200).json({ ok: true, platform, items });
  } catch (err) {
    console.error("API error:", err);
    const msg = err.name === "AbortError" ? "Server timeout, coba lagi" : err.message || "Terjadi kesalahan";
    return res.status(500).json({ ok: false, error: msg });
  }
}