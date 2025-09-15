import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";

const app = express();
app.use(cors());
app.use(express.json());

const {
  DB_HOST, DB_PORT = "3306", DB_USER, DB_PASSWORD, DB_NAME,
  PORT = 3001
} = process.env;

const pool = mysql.createPool({
  host: DB_HOST, port: Number(DB_PORT), user: DB_USER,
  password: DB_PASSWORD, database: DB_NAME,
  connectionLimit: 5
});

// health
app.get("/healthz", async (_, res) => {
  try { await pool.query("SELECT 1"); res.json({ ok: true }); }
  catch (e) { res.status(500).json({ ok:false, error: e.message }); }
});

// list
app.get("/tasks", async (_, res) => {
  const [rows] = await pool.query(
    "SELECT id,title,description,status,created_at FROM tasks ORDER BY id DESC"
  );
  res.json(rows);
});

// create
app.post("/tasks", async (req, res) => {
  const { title, description = "" } = req.body || {};
  if (!title) return res.status(400).json({ error: "title required" });
  const [r] = await pool.query(
    "INSERT INTO tasks(title,description,status) VALUES(?,?, 'todo')",
    [title, description]
  );
  res.json({ id: r.insertId });
});

// update (title/description/status)
app.put("/tasks/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { title, description, status } = req.body || {};
  const fields = [], vals = [];
  if (title !== undefined) { fields.push("title=?"); vals.push(title); }
  if (description !== undefined) { fields.push("description=?"); vals.push(description); }
  if (status !== undefined) { fields.push("status=?"); vals.push(status); }
  if (!fields.length) return res.status(400).json({ error: "no fields" });
  vals.push(id);
  await pool.query(`UPDATE tasks SET ${fields.join(",")} WHERE id=?`, vals);
  res.json({ ok: true });
});

// delete
app.delete("/tasks/:id", async (req, res) => {
  await pool.query("DELETE FROM tasks WHERE id=?", [Number(req.params.id)]);
  res.json({ ok: true });
});

app.listen(Number(PORT), () => console.log(`API on :${PORT}`));
