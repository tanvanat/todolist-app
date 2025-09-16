export const runtime = "nodejs";
const BASE = process.env.API_BASE_URL || "http://localhost:3001";

// ดึงลิสต์งาน
export async function GET(req) {
  const { search } = new URL(req.url);
  const r = await fetch(`${BASE}/tasks${search}`, { cache: "no-store" });
  const txt = await r.text();
  if (!r.ok) return Response.json({ error:"upstream", status:r.status, body:txt?.slice(0,500) }, { status:r.status });
  return Response.json(txt ? JSON.parse(txt) : []);
}
// สร้าง task ใหม่
export async function POST(req) {
  const body = await req.json();
  const r = await fetch(`${BASE}/tasks`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body)
  });
  const txt = await r.text();
  if (!r.ok) return Response.json({ error:"upstream", status:r.status, body:txt?.slice(0,500) }, { status:r.status });
  return Response.json(txt ? JSON.parse(txt) : {});
}
