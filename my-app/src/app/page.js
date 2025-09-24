"use client";
import { useEffect, useMemo, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import TaskCard from "@/components/TaskCard";           // ของคุณ (หรือจากที่ผมให้แยกก่อนหน้า)
import Filters from "@/components/Filters";
import NewTaskForm from "@/components/NewTaskForm";

const statusLabel = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

export default function Page() {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ status: "all", assignee: "all", q: "" });
  const [view, setView] = useState("board");
  const [form, setForm] = useState({ title: "", description: "", assignee: "", due_date: "" });

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
    } catch {
      console.error("Invalid JSON from /api/tasks:", txt);
      setItems([]);
    }
  };
  useEffect(() => { load(); }, [filters]);

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

  const assignees = useMemo(() => {
    const s = new Set(items.map((i) => i.assignee).filter(Boolean));
    return Array.from(s);
  }, [items]);

  const group = (status) => items.filter((i) => i.status === status);
  const counts = {
    todo: group("todo").length,
    in_progress: group("in_progress").length,
    done: group("done").length,
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result || {};
    if (!destination) return;
    if (destination.droppableId !== source.droppableId) {
      move(Number(draggableId), destination.droppableId);
    }
  };

  return (
    <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 p-4 sm:p-6 shadow-2xl">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold truncate">Todo List App</h1>
          <p className="text-slate-300 text-sm sm:text-base">Simplifies tasks for individuals and teams</p>
        </div>
      </div>

      {/* Filters (กลับมาแล้ว) */}
      <Filters
        filters={filters}
        setFilters={setFilters}
        assignees={assignees}
        view={view}
        setView={setView}
      />

      {/* New Task Form (กลับมาแล้ว) */}
      <NewTaskForm form={form} setForm={setForm} onSubmit={createTask} />

      {/* Board / List */}
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
