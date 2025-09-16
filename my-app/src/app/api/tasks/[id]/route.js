// item endpoint ของ “งานหนึ่งชิ้น”
export const runtime = "nodejs";

// มีค่า fallback เผื่อไม่ได้ตั้ง .env.local
const BASE = process.env.API_BASE_URL || "http://localhost:3001";

// ทุกฟังก์ชันที่ใช้ params ต้อง await context.params
// PUT อัปเดต task
export async function PUT(req, context) {
  const { id } = await context.params;         
  const body = await req.json();

  const r = await fetch(`${BASE}/tasks/${id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  const txt = await r.text();
  if (!r.ok) {
    return Response.json(
      { error: "upstream_error", status: r.status, body: txt?.slice(0, 500) },
      { status: r.status || 400 }
    );
  }
  return Response.json(txt ? JSON.parse(txt) : { ok: true });
}

export async function DELETE(_req, context) {
  const { id } = await context.params;           
  const r = await fetch(`${BASE}/tasks/${id}`, { method: "DELETE" });
  const txt = await r.text();
  if (!r.ok) {
    return Response.json(
      { error: "upstream_error", status: r.status, body: txt?.slice(0, 500) },
      { status: r.status || 400 }
    );
  }
  return Response.json(txt ? JSON.parse(txt) : { ok: true });
}
