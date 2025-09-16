import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// ✅ โหลด .env ที่อยู่ในโฟลเดอร์ api เสมอ
dotenv.config({ path: path.join(__dirname, ".env") });


const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || process.env.DB_PASS, // ✅
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

// health
app.get("/healthz", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 as ok");
    res.json({ ok: rows[0].ok === 1 });
  } catch (e) {
    console.error("healthz error:", e.code, e.message);
    res.status(500).json({ ok: false, error: e.code, message: e.message });
  }
});

app.get("/tasks", async (req, res) => {
  const { status, assignee, q } = req.query;
  const where = [];
  const params = [];

  if (status && status !== "all") { where.push("status = ?"); params.push(status); }
  if (assignee && assignee !== "all") { where.push("assignee = ?"); params.push(assignee); }
  if (q) { where.push("(title LIKE ? OR description LIKE ?)"); params.push(`%${q}%`, `%${q}%`); }

  // ใช้ sort แบบปลอดภัยกับ DATE
  const sql = `
    SELECT id,title,description,status,assignee,due_date,created_at
    FROM tasks
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY (due_date IS NULL), due_date ASC, id DESC
  `;

  try {
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    console.error("GET /tasks error:", e.code, e.message);
    res.status(500).json({ error: "list_failed", code: e.code, message: e.message });
  }
});


// POST /tasks
app.post("/tasks", async (req, res) => {
  try {
    const { title, description = "", assignee = null, due_date = null } = req.body || {};
    if (!title || !String(title).trim()) return res.status(400).json({ error: "title_required" });
    const [r] = await pool.execute(
      "INSERT INTO tasks (title, description, assignee, due_date) VALUES (?,?,?,?)",
      [String(title).trim(), description || null, assignee || null, due_date || null]
    );
    res.status(201).json({ id: r.insertId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "create_failed" });
  }
});

// PUT /tasks/:id
app.put("/tasks/:id", async (req, res) => {
  const id = Number(req.params.id);
  const allowed = ["title","description","status","assignee","due_date"];
  const fields = [];
  const values = [];
  for (const k of allowed) {
    if (k in req.body) {
      if (k === "status" && !["todo","in_progress","done"].includes(req.body[k])) {
        return res.status(400).json({ error: "bad_status" });
      }
      fields.push(`${k} = ?`);
      values.push(req.body[k]);
    }
  }
  if (!fields.length) return res.status(400).json({ error: "no_fields" });
  values.push(id);
  try {
    const [r] = await pool.execute(`UPDATE tasks SET ${fields.join(", ")} WHERE id = ?`, values);
    if (!r.affectedRows) return res.status(404).json({ error: "not_found" });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "update_failed" });
  }
});

// DELETE /tasks/:id
app.delete("/tasks/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    const [r] = await pool.execute("DELETE FROM tasks WHERE id = ?", [id]);
    if (!r.affectedRows) return res.status(404).json({ error: "not_found" });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "delete_failed" });
  }
});

const port = Number(process.env.PORT || 3001);
app.listen(port, () => console.log(`API ready on http://localhost:${port}`));
