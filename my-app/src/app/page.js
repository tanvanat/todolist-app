"use client";
import { useEffect, useMemo, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const statusLabel = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

function Badge({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs ${className}`} >
      {children}
    </span>
  );
}

function TaskCard({ t, onMove, onDelete }) {
  const date = t.due_date
    ? new Date(t.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : null;

  const statusColor = {
    todo: "bg-slate-800/60 border-slate-600 text-slate-200",
    in_progress: "bg-amber-800/40 border-amber-600 text-amber-100",
    done: "bg-emerald-900/40 border-emerald-600 text-emerald-100",
  }[t.status];

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="font-medium">{t.title}</div>
      {t.description && <div className="mt-1 text-sm text-slate-300/80">{t.description}</div>}

      <div className="mt-2 flex flex-wrap gap-2">
        <Badge className="bg-slate-800/70 border-slate-600 text-slate-100">👤 {t.assignee || "ไม่ระบุ"}</Badge>
        {date && <Badge className="bg-slate-800/70 border-slate-600 text-slate-100">📅 {date}</Badge>}
        <Badge className={statusColor}>{statusLabel[t.status]}</Badge>
      </div>

      <div className="mt-3 flex gap-2">
        {t.status !== "todo" && <button onClick={() => onMove(t.id, "todo")} className="rounded-lg border border-slate-600 bg-slate-800/60 px-2 py-1 text-xs">To Do</button>}
        {t.status !== "in_progress" && <button onClick={() => onMove(t.id, "in_progress")} className="rounded-lg border border-amber-600 bg-amber-900/40 px-2 py-1 text-xs">In Progress</button>}
        {t.status !== "done" && <button onClick={() => onMove(t.id, "done")} className="rounded-lg border border-emerald-600 bg-emerald-900/40 px-2 py-1 text-xs">Done</button>}
        <button onClick={() => onDelete(t.id)} className="rounded-lg border border-rose-700 bg-rose-900/40 px-2 py-1 text-xs text-rose-100">Delete</button>
      </div>
    </div>
  );
}

export default function Page() {
  const [items, setItems] = useState([]);
  // filters + UI
  const [filters, setFilters] = useState({ status: "all", assignee: "all", q: "" });
  const [view, setView] = useState("board"); // "board" | "list"

  // new task form
  const [form, setForm] = useState({ title: "", description: "", assignee: "", due_date: "" });

  const load = async () => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v && v !== "all"))
    ).toString();

    // ✅ ต้องเป็น `?${qs}` (backtick ทั้งอัน) ไม่ใช่ '?${qs}'
    const url = `/api/tasks${qs ? `?${qs}` : ""}`;

    const r = await fetch(url, { cache: "no-store" });

    // กันพังถ้าไม่ได้ JSON
    const txt = await r.text();
    if (!r.ok) {
      console.error("GET /api/tasks failed:", r.status, txt);
      setItems([]);
      return;
    }
    try {
      const j = txt ? JSON.parse(txt) : [];
      setItems(Array.isArray(j) ? j : []);
    } catch (e) {
      console.error("Invalid JSON from /api/tasks:", txt);
      setItems([]);
    }
  };

  useEffect(() => { load(); }, [filters]);
  // actions
  const createTask = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ title: "", description: "", assignee: "", due_date: "" });
    await load();
  };
  const move = async (id, status) => {
    await fetch(`/api/tasks/${id}`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ status }) });
    await load();
  };
  const remove = async (id) => {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    await load();
  };

  // derived
  const assignees = useMemo(() => {
    const s = new Set(items.map(i => i.assignee).filter(Boolean));
    return Array.from(s);
  }, [items]);

  // group for board
  const group = (status) => items.filter(i => i.status === status);
  const counts = { todo: group("todo").length, in_progress: group("in_progress").length, done: group("done").length };

  // drag & drop
  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result || {};
    if (!destination) return;
    if (destination.droppableId !== source.droppableId) {
      move(Number(draggableId), destination.droppableId);
    }
  };

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      {/* hero */}
      <div className="flex items-center justify-between rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 p-6 shadow-2xl">
        <div>
          <h1 className="text-2xl font-semibold">Todo List App</h1>
          <p className="text-slate-300">Simplifies tasks for individuals and teams</p>
        </div>
      </div>

      {/* filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filters.status}
          onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
          className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2"
        >
          <option value="all">All statuses</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <select
          value={filters.assignee}
          onChange={(e) => setFilters(f => ({ ...f, assignee: e.target.value }))}
          className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2"
        >
          <option value="all">All assignees</option>
          {assignees.map(a => <option key={a} value={a}>{a}</option>)}
        </select>

        <input
          value={filters.q}
          onChange={(e) => setFilters(f => ({ ...f, q: e.target.value }))}
          placeholder="Find…"
          className="w-52 rounded-xl border border-slate-600 bg-slate-900 px-3 py-2"
        />

        <button onClick={() => setFilters({ status: "all", assignee: "all", q: "" })}
          className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2">
          Clear
        </button>

        <div className="ml-auto flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-900 p-1">
          <button onClick={() => setView("board")} className={`rounded-lg px-3 py-1 ${view === 'board' ? 'bg-slate-700' : ''}`}>Board</button>
          <button onClick={() => setView("list")} className={`rounded-lg px-3 py-1 ${view === 'list' ? 'bg-slate-700' : ''}`}>List</button>
        </div>
      </div>

      {/* new task */}
      <form id="new" onSubmit={createTask} className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <input
            required
            value={form.title}
            onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Title"
            className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2"
          />
          <input
            value={form.assignee}
            onChange={(e) => setForm(f => ({ ...f, assignee: e.target.value }))}
            placeholder="Assignee"
            className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2"
          />
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr,180px,auto]">
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Description"
            className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2"
          />
          <input
            type="date"
            value={form.due_date}
            onChange={(e) => setForm(f => ({ ...f, due_date: e.target.value }))}
            className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2"
          />
          <button className="rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-500">Add Task</button>
        </div>
      </form>

      {/* content */}
      {view === "board" ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {["todo", "in_progress", "done"].map(col => (
              <Droppable droppableId={col} key={col}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}
                    className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="font-semibold">{statusLabel[col]}</div>
                      <div className="rounded-full border border-slate-600 bg-slate-800/60 px-2 py-0.5 text-xs">{counts[col]}</div>
                    </div>
                    <div className="flex flex-col gap-3">
                      {group(col).map((t, idx) => (
                        <Draggable draggableId={String(t.id)} index={idx} key={t.id}>
                          {(p) => (
                            <div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps}>
                              <TaskCard t={t} onMove={move} onDelete={remove} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      ) : (
        <ul className="grid gap-3">
          {items.map(t => (
            <li key={t.id}><TaskCard t={t} onMove={move} onDelete={remove} /></li>
          ))}
        </ul>
      )}
    </main>
  );
}
