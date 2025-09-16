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
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs ${className}`}>
      {children}
    </span>
  );
}

/* ---------- Small Icon Buttons (no extra libs) ---------- */
function IconButton({ title, onClick, children }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="rounded-md border border-slate-600/70 bg-slate-800/60 p-1.5 text-slate-200 hover:bg-slate-700/60"
    >
      {children}
    </button>
  );
}
const PencilIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" {...props}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);
const TrashIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" {...props}>
    <path d="M3 6h18" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
  </svg>
);
const CheckIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" {...props}>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);
const XIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" {...props}>
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

/* ---------- Task Card ---------- */
function TaskCard({ t, onMove, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [etitle, setETitle] = useState(t.title);
  const [edesc, setEDesc] = useState(t.description || "");

  const date = t.due_date
    ? new Date(t.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : null;

  const statusColor =
    {
      todo: "bg-slate-800/60 border-slate-600 text-slate-200",
      in_progress: "bg-amber-800/40 border-amber-600 text-amber-100",
      done: "bg-emerald-900/40 border-emerald-600 text-emerald-100",
    }[t.status] || "bg-slate-800/60 border-slate-600 text-slate-200";

  const startEdit = () => {
    setETitle(t.title);
    setEDesc(t.description || "");
    setEditing(true);
  };
  const cancelEdit = () => {
    setEditing(false);
    setETitle(t.title);
    setEDesc(t.description || "");
  };
  const saveEdit = async () => {
    const title = (etitle || "").trim();
    if (!title) return;
    await onUpdate?.(t.id, { title, description: edesc });
    setEditing(false);
  };
  const onKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) saveEdit();
    else if (e.key === "Escape") cancelEdit();
  };

  return (
    <div className="relative rounded-2xl border border-slate-700/60 bg-slate-900/40 p-4 backdrop-blur-sm">
      {/* top-right icons */}
      <div className="absolute right-2 top-2 flex gap-1 opacity-80 hover:opacity-100">
        {editing ? (
          <>
            <IconButton title="Save" onClick={saveEdit}><CheckIcon /></IconButton>
            <IconButton title="Cancel" onClick={cancelEdit}><XIcon /></IconButton>
          </>
        ) : (
          <>
            <IconButton title="Edit" onClick={startEdit}><PencilIcon /></IconButton>
            <IconButton title="Delete" onClick={() => onDelete(t.id)}><TrashIcon /></IconButton>
          </>
        )}
      </div>

      {!editing ? (
        <>
          <div className="font-medium">{t.title}</div>
          {t.description && <div className="mt-1 text-sm text-slate-300/80">{t.description}</div>}

          <div className="mt-2 flex flex-wrap gap-2">
            <Badge className="bg-slate-800/70 border-slate-600 text-slate-100">👤 {t.assignee || "ไม่ระบุ"}</Badge>
            {date && <Badge className="bg-slate-800/70 border-slate-600 text-slate-100">📅 {date}</Badge>}
            <Badge className={statusColor}>{statusLabel[t.status]}</Badge>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {t.status !== "todo" && (
              <button
                onClick={() => onMove(t.id, "todo")}
                className="rounded-lg border border-slate-600 bg-slate-800/60 px-2 py-1 text-xs"
              >
                To Do
              </button>
            )}
            {t.status !== "in_progress" && (
              <button
                onClick={() => onMove(t.id, "in_progress")}
                className="rounded-lg border border-amber-600 bg-amber-900/40 px-2 py-1 text-xs"
              >
                In Progress
              </button>
            )}
            {t.status !== "done" && (
              <button
                onClick={() => onMove(t.id, "done")}
                className="rounded-lg border border-emerald-600 bg-emerald-900/40 px-2 py-1 text-xs"
              >
                Done
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <input
            value={etitle}
            onChange={(e) => setETitle(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Title"
            className="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2"
            autoFocus
          />
          <textarea
            rows={3}
            value={edesc}
            onChange={(e) => setEDesc(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Description"
            className="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2"
          />
        </div>
      )}
    </div>
  );
}

/* ---------- Page ---------- */
export default function Page() {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ status: "all", assignee: "all", q: "" });
  const [view, setView] = useState("board");
  const [form, setForm] = useState({ title: "", description: "", assignee: "", due_date: "" });

  // load with filters (server-side filtering via Next API -> Express)
  const load = async () => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v && v !== "all"))
    ).toString();

    const url = `/api/tasks${qs ? `?${qs}` : ""}`;
    const r = await fetch(url, { cache: "no-store" });

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

  const updateTask = async (id, payload) => {
    await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    await load();
  };

  const move = async (id, status) => {
    await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
  };

  const remove = async (id) => {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    await load();
  };

  // derived
  const assignees = useMemo(() => {
    const s = new Set(items.map((i) => i.assignee).filter(Boolean));
    return Array.from(s);
  }, [items]);

  // grouping
  const group = (status) => items.filter((i) => i.status === status);
  const counts = {
    todo: group("todo").length,
    in_progress: group("in_progress").length,
    done: group("done").length,
  };

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
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2"
        >
          <option value="all">All statuses</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <select
          value={filters.assignee}
          onChange={(e) => setFilters((f) => ({ ...f, assignee: e.target.value }))}
          className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2"
        >
          <option value="all">All assignees</option>
          {assignees.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        <input
          value={filters.q}
          onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
          placeholder="Find…"
          className="w-52 rounded-xl border border-slate-600 bg-slate-900 px-3 py-2"
        />

        <button
          onClick={() => setFilters({ status: "all", assignee: "all", q: "" })}
          className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2"
        >
          Clear
        </button>

        <div className="ml-auto flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-900 p-1">
          <button
            onClick={() => setView("board")}
            className={`rounded-lg px-3 py-1 ${view === "board" ? "bg-slate-700" : ""}`}
          >
            Board
          </button>
          <button
            onClick={() => setView("list")}
            className={`rounded-lg px-3 py-1 ${view === "list" ? "bg-slate-700" : ""}`}
          >
            List
          </button>
        </div>
      </div>

      {/* new task */}
      <form id="new" onSubmit={createTask} className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <input
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Title"
            className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2"
          />
          <input
            value={form.assignee}
            onChange={(e) => setForm((f) => ({ ...f, assignee: e.target.value }))}
            placeholder="Assignee"
            className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2"
          />
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr,180px,auto]">
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Description"
            className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2"
          />
          <input
            type="date"
            value={form.due_date}
            onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
            className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2"
          />
          <button className="rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-500">
            Add Task
          </button>
        </div>
      </form>

      {/* content */}
      {view === "board" ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {["todo", "in_progress", "done"].map((col) => (
              <Droppable droppableId={col} key={col}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="font-semibold">{statusLabel[col]}</div>
                      <div className="rounded-full border border-slate-600 bg-slate-800/60 px-2 py-0.5 text-xs">
                        {counts[col]}
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      {group(col).map((t, idx) => (
                        <Draggable draggableId={String(t.id)} index={idx} key={t.id}>
                          {(p) => (
                            <div ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps}>
                              <TaskCard t={t} onMove={move} onDelete={remove} onUpdate={updateTask} />
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
          {items.map((t) => (
            <li key={t.id}>
              <TaskCard t={t} onMove={move} onDelete={remove} onUpdate={updateTask} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
