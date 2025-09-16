export const runtime = "nodejs"; // ensure Node runtime
const BASE = process.env.API_BASE_URL; // e.g. http://localhost:3001

export async function GET(req) {
  try {
    const base = process.env.API_BASE_URL || "http://localhost:3001";
    const { search } = new URL(req.url);
    const r = await fetch(`${base}/tasks${search}`, { cache: "no-store" });
    const txt = await r.text();
    if (!r.ok) return Response.json({ error: "upstream", status: r.status, body: txt?.slice(0,500) }, { status: r.status });
    return Response.json(txt ? JSON.parse(txt) : []);
  } catch (e) {
    return Response.json({ error: "proxy_failed" }, { status: 500 });
  }
}

export async function POST(req) {
  const body = await req.json();
  const r = await fetch(`${BASE}/tasks`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await r.json();
  return Response.json(j, { status: r.ok ? 201 : 400 });
}
