# Todo List App – Next.js + Express + MySQL

A minimal, fast **To‑Do** app with:

* Board & List views
* Drag‑and‑drop (move between columns)
* Filters (status, assignee, search)
* Badges for status / assignee / due date

Built with **Next.js (App Router)** for the frontend, **Express** for the API, and **MySQL** for storage.

---

## Stack

* **Frontend:** Next.js (App Router), Tailwind CSS (utility classes in `globals.css`)
* **API:** Node.js + Express 4
* **DB:** MySQL 8 + `mysql2/promise`
* **DND:** `@hello-pangea/dnd`

> Note: Next.js 15 requires `await context.params` in dynamic API routes.

---

## Project Structure

```
CRUD/
├─ api/                      # Express API
│  ├─ index.js
│  └─ .env                   # DB connection variables (sample below)
├─ my-app/                   # Next.js (App Router)
│  └─ src/app/
│     ├─ api/
│     │  ├─ tasks/route.js            # /api/tasks → proxy to Express GET/POST
│     │  └─ tasks/[id]/route.js       # /api/tasks/:id → proxy to Express PUT/DELETE
│     ├─ page.js
│     └─ layout.js
└─ sql/
   └─ schema.sql
```

---

## Quick Start

1. **Create DB schema**

   ```bash
   # Windows PowerShell inside project root (CRUD/)
   mysql -u root -p < .\sql\schema.sql
   ```
2. **Run API**

   ```bash
   cd api
   npm i
   node index.js          # API on http://localhost:3001
   ```
3. **Run Next.js**

   ```bash
   cd ../my-app
   npm i
   npm run dev            # Web on http://localhost:3000
   ```
4. Open [http://localhost:3000](http://localhost:3000)

---

## Database

`sql/schema.sql` creates DB and table:

```sql
CREATE DATABASE IF NOT EXISTS todo_app CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE todo_app;

CREATE TABLE IF NOT EXISTS tasks (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  status ENUM('todo','in_progress','done') NOT NULL DEFAULT 'todo',
  assignee VARCHAR(80) NULL,
  due_date DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

Seed (optional):

```sql
INSERT INTO tasks (title, description, status, assignee, due_date) VALUES
('Plan content','Propose content and planning','todo','Fai','2025-08-13'),
('Prepare meeting presentation','Propose budget topic','todo','Best','2025-08-14'),
('Submit meeting report','Report on project progress','todo','Fai','2025-08-15'),
('Edit 3 clips to completion','Launch event clips','in_progress','Fai','2025-08-11'),
('Edit Zigmadey clip',NULL,'done','Team','2025-08-08');
```

> **Windows inside MySQL monitor** (instead of redirect):
>
> ```sql
> SOURCE C:/Users/<you>/Nipa/CRUD/sql/schema.sql;
> ```

---

## Environment Variables

### `api/.env` (Express → MySQL)

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=todo_app
PORT=3001
```

> The code also checks `DB_PASS` as a fallback.

### `my-app/.env.local` (optional; Next → Express)

```env
API_BASE_URL=http://localhost:3001
```

If not set, proxy falls back to `http://localhost:3001`.

---

## Run & Test

**API health & tasks**

```bash
curl -i http://localhost:3001/healthz
curl -i http://localhost:3001/tasks
```

**Next proxy**

```bash
curl -i http://localhost:3000/api/tasks
```

---
