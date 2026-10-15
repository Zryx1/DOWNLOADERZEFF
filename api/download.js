const NEXRAY_BASE = "https://api.nexray.eu.cc";
const TIMEOUT_MS = 50000;

function detectPlatform(url) {
  const u = url.toLowerCase();
  if (u.includes("tiktok.com")) return "tiktok";
  if (u.includes("youtu.be") || u.includes("youtube.com")) return "youtube";
  if (u.includes("instagram.com")) return "instagram";
  if (u.includes("facebook.com") || u.includes("fb.watch") || u.includes("fb.com")) return "facebook";
  if (u.includes("pinterest.") || u.includes("pin.it")) return "pinterest";
  if (u.includes("spotify.com")) return "spotify";
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

function normalize(platform, data, extra = {}) {
  const r = data.result;
  if (!r) throw new Error("Response kosong dari server");

  switch (platform) {
    case "tiktok":
      return [
        {
          type: "video",
          url: r.data,
          thumbnail: r.cover,
          title: r.title,
          author: r.author?.nickname,
        },
        ...(r.music_info?.url
          ? [{
              type: "audio",
              url: r.music_info.url,
              title: r.title,
              author: r.author?.nickname,
            }]
          : []),
      ];

    case "youtube":
      if (extra.format === "mp3") {
        return [{ type: "audio", url: r.url, title: r.title }];
      }
      return [{
        type: "video",
        url: r.url,
        title: r.title,
        author: r.author,
        quality: r.quality || extra.resolusi,
      }];

    case "instagram": {
      const items = Array.isArray(r) ? r : [r];
      return items.map((item) => ({
        type: item.type === "video" ? "video" : "image",
        url: item.url,
        thumbnail: item.thumbnail,
      }));
    }

    case "facebook": {
      const items = [];
      if (r.video_hd) {
        items.push({
          type: "video",
          url: r.video_hd,
          title: r.title || "Facebook Video",
          quality: "HD",
          author: "Facebook",
        });
      }
      if (r.video_sd) {
        items.push({
          type: "video",
          url: r.video_sd,
          title: r.title || "Facebook Video",
          quality: "SD",
          author: "Facebook",
        });
      }
      if (r.audio) {
        items.push({
          type: "audio",
          url: r.audio,
          title: r.title || "Facebook Audio",
          author: "Facebook",
        });
      }
      return items;
    }

    case "pinterest":
      return [{
        type: r.video ? "video" : "image",
        url: r.video || r.thumbnail,
        thumbnail: r.thumbnail,
        title: r.title,
      }];

    case "spotify":
      return [{
        type: "audio",
        url: r.url,
        title: r.title,
        author: r.artist,
      }];

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
    const { url, format = "mp4", resolusi = "720" } = req.body || {};

    if (!url || typeof url !== "string") {
      return res.status(400).json({ ok: false, error: "URL tidak valid" });
    }

    const platform = detectPlatform(url);
    if (!platform) {
      return res.status(400).json({ ok: false, error: "Platform tidak didukung" });
    }

    let data;
    let extra = {};

    switch (platform) {
      case "tiktok":
        data = await fetchNexray("/downloader/tiktok", { url });
        break;
      case "youtube":
        if (format === "mp3") {
          data = await fetchNexray("/downloader/ytmp3", { url });
        } else {
          data = await fetchNexray("/downloader/v1/ytmp4", { url, resolusi });
          extra = { format: "mp4", resolusi };
        }
        break;
      case "instagram":
        data = await fetchNexray("/downloader/instagram", { url });
        break;
      case "facebook":
        data = await fetchNexray("/downloader/facebook", { url });
        break;
      case "pinterest":
        data = await fetchNexray("/downloader/pinterest", { url });
        break;
      case "spotify":
        data = await fetchNexray("/downloader/spotify", { url });
        break;
    }

    if (!data?.status) {
      return res.status(502).json({ ok: false, error: "Gagal mengambil data dari server" });
    }

    const items = normalize(platform, data, extra);
    return res.status(200).json({ ok: true, platform, items });
  } catch (err) {
    console.error("API error:", err);
    const msg = err.name === "AbortError"
      ? "Server timeout, coba lagi"
      : err.message || "Terjadi kesalahan";
    return res.status(500).json({ ok: false, error: msg });
  }
}