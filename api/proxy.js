export const config = { runtime: "edge" };

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url");
  const filename = searchParams.get("filename") || "vortex-media";

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: "URL required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const upstream = await fetch(decodeURIComponent(targetUrl), {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "*/*",
      },
    });

    if (!upstream.ok) {
      return new Response(
        JSON.stringify({ error: `Upstream ${upstream.status}` }),
        { status: upstream.status }
      );
    }

    const headers = new Headers();
    const ct = upstream.headers.get("content-type") || "application/octet-stream";
    headers.set("Content-Type", ct);
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    headers.set("Access-Control-Allow-Origin", "*");

    const cl = upstream.headers.get("content-length");
    if (cl) headers.set("Content-Length", cl);

    return new Response(upstream.body, { status: 200, headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}