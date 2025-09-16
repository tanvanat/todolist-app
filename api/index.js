// api/index.js
import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// โหลด .env ในโฟลเดอร์ api เสมอ (กันกรณีรันจากโฟลเดอร์อื่น)
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
app.use(cors());
app.use(express.json());

// logger ช่วยดีบัก
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`, req.body || "");
  next();
});

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || process.env.DB_PASS, // รองรับทั้งสองชื่อ
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

// health
app.get("/healthz", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    res.json({ ok: rows[0]?.ok === 1 });
  } catch (e) {
    console.error("healthz error:", e.code, e.message);
    res.status(500).json({ ok: false, code: e.code, message: e.message });
  }
});

// GET /tasks  (รองรับ filter)
app.get("/tasks", async (req, res) => {
  const { status, assignee, q } = req.query;
  const where = [];
  const params = [];

  if (status && status !== "all") { where.push("status = ?"); params.push(status); }
  if (assignee && assignee !== "all") { where.push("assignee = ?"); params.push(assignee); }
  if (q) { where.push("(title LIKE ? OR description LIKE ?)"); params.push(`%${q}%`, `%${q}%`); }

  // ไม่ใช้ COALESCE กับ string ที่อาจทำ type-cast พัง; ใช้เงื่อนไข boolean จัด null ให้อยู่ท้าย
  const sql = `
    SELECT id, title, description, status, assignee,
           DATE_FORMAT(due_date, '%Y-%m-%d') AS due_date,
           created_at
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

// POST /tasks  (แปลง "" → null)
app.post("/tasks", async (req, res) => {
  try {
    const { title, description = "", assignee = null, due_date = null } = req.body || {};
    const t = String(title || "").trim();
    if (!t) return res.status(400).json({ error: "title_required" });

    const cleanAssignee = assignee ? String(assignee).trim() : null;
    const cleanDate = due_date && /^\d{4}-\d{2}-\d{2}$/.test(due_date) ? due_date : null;

    const [r] = await pool.execute(
      "INSERT INTO tasks (title, description, assignee, due_date) VALUES (?,?,?,?)",
      [t, description || null, cleanAssignee, cleanDate]
    );
    res.status(201).json({ id: r.insertId });
  } catch (e) {
    console.error("POST /tasks error:", e.code, e.message);
    res.status(500).json({ error: "create_failed", code: e.code, message: e.message });
  }
});

// PUT /tasks/:id  (map doing → in_progress, แปลง "" → null)
app.put("/tasks/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    const body = req.body || {};
    if (body.status === "doing") body.status = "in_progress";

    const fields = [];
    const values = [];

    if (body.title !== undefined) { fields.push("title = ?"); values.push(String(body.title).trim()); }
    if (body.description !== undefined) { fields.push("description = ?"); values.push(String(body.description).trim() || null); }
    if (body.assignee !== undefined) { fields.push("assignee = ?"); values.push(String(body.assignee).trim() || null); }
    if (body.due_date !== undefined) {
      const cleanDate = body.due_date && /^\d{4}-\d{2}-\d{2}$/.test(body.due_date) ? body.due_date : null;
      fields.push("due_date = ?"); values.push(cleanDate);
    }
    if (body.status !== undefined) {
      if (!["todo","in_progress","done"].includes(body.status)) return res.status(400).json({ error: "bad_status" });
      fields.push("status = ?"); values.push(body.status);
    }

    if (!fields.length) return res.status(400).json({ error: "no_fields" });

    values.push(id);
    const [r] = await pool.execute(`UPDATE tasks SET ${fields.join(", ")} WHERE id = ?`, values);
    if (!r.affectedRows) return res.status(404).json({ error: "not_found" });
    res.json({ ok: true });
  } catch (e) {
    console.error("PUT /tasks/:id error:", e.code, e.message);
    res.status(500).json({ error: "update_failed", code: e.code, message: e.message });
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
    console.error("DELETE /tasks/:id error:", e.code, e.message);
    res.status(500).json({ error: "delete_failed", code: e.code, message: e.message });
  }
});

const port = Number(process.env.PORT || 3001);
app.listen(port, () => console.log(`API ready on http://localhost:${port}`));
