export const config = { runtime: "edge" };

export default async function handler(req) {
  // Simulasi stats global — bisa diganti pakai database nanti
  const now = new Date();
  const dayOfMonth = now.getDate();
  // Fake usage: ~2.5 GB per hari
  const usedBytes = dayOfMonth * 2_500_000_000 + Math.floor(Math.random() * 500_000_000);
  const limitBytes = 100 * 1024 * 1024 * 1024;

  return new Response(
    JSON.stringify({
      ok: true,
      timestamp: now.toISOString(),
      quota: {
        used: usedBytes,
        limit: limitBytes,
        usedGB: +(usedBytes / 1024 / 1024 / 1024).toFixed(2),
        limitGB: 100,
        percent: +((usedBytes / limitBytes) * 100).toFixed(1),
      },
      server: "vortex-web",
      version: "1.0.0",
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store",
      },
    }
  );
}