# Todo List App – Next.js + Express + MySQL

A minimal, fast **To‑Do** app with:

* Board & List views
* Drag‑and‑drop (move between columns)
* Filters (status, assignee, search)
* Badges for status / assignee / due date

Built with **Next.js (App Router)** for the frontend, **Express** for the API, and **MySQL** for storage.

## Stack

* **Frontend:** Next.js (App Router), Tailwind CSS
* **API:** Node.js + Express 4
* **DB:** MySQL 8 in Docker (host port 3307 → container 3306)
* **DND:** `@hello-pangea/dnd`

> Note: Next.js 15 requires `await context.params` in dynamic API routes.

## Project Structure

```
CRUD/
├─ api/                      # Express API
│  ├─ index.js
│  └─ .env                   # DB connection variables
├─ my-app/                   # Next.js (App Router)
│  └─ src/app/
│     ├─ api/
│     │  ├─ tasks/route.js            # /api/tasks → proxy to Express GET/POST
│     │  └─ tasks/[id]/route.js       # /api/tasks/:id → proxy to Express PUT/DELETE
│     ├─ page.js
│     └─ layout.js
└─ docker-compose.yml        # runs only MySQL (dev)

```
## Quick Start

1. Start MySQL (Docker)
```
docker compose up -d mysql 
#compose ควร map พอร์ตเป็น: 3307:3306

#ทดสอบ: 
mysql -h 127.0.0.1 -P 3307 -u root -p
```
2. Run API (Express)
```
cd api
npm i
node index.js       # http://localhost:5000
# ทดสอบ:
curl -i http://localhost:5000/health || curl -i http://localhost:5000/tasks
```

3. Run Web (Next.js)
```
cd ../my-app
npm i
npm run dev -p 3001   # http://localhost:3001
```

---
