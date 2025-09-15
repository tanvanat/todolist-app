export const runtime = "nodejs"; // ensure Node runtime
const BASE = process.env.API_BASE_URL; // e.g. http://api:3001

export async function GET() {
  const r = await fetch(`${BASE}/tasks`, { cache: "no-store" });
  const j = await r.json();
  return Response.json(j);
}

export async function POST(req) {
  const body = await req.json();
  const r = await fetch(`${BASE}/tasks`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await r.json();
  return Response.json(j, { status: r.ok ? 200 : 400 });
}
