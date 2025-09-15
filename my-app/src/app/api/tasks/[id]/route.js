export const runtime = "nodejs";
const BASE = process.env.API_BASE_URL;

export async function PUT(req, { params }) {
  const id = params.id;
  const body = await req.json();
  const r = await fetch(`${BASE}/tasks/${id}`, {
    method: "PUT", headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  const j = await r.json();
  return Response.json(j, { status: r.ok ? 200 : 400 });
}

export async function DELETE(_req, { params }) {
  const id = params.id;
  const r = await fetch(`${BASE}/tasks/${id}`, { method: "DELETE" });
  const j = await r.json();
  return Response.json(j, { status: r.ok ? 200 : 400 });
}
