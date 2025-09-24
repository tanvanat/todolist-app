"use client";
import { useState } from "react";

function IconButton({ title, onClick, children }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="rounded-md border border-base bg-card text-base p-1.5 hover:opacity-90"
    >
      {children}
    </button>
  );
}
const PencilIcon = (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>);
const TrashIcon  = (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" {...p}><path d="M3 6h18" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /></svg>);
const CheckIcon  = (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" {...p}><path d="M20 6L9 17l-5-5" /></svg>);
const XIcon      = (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" {...p}><path d="M18 6L6 18M6 6l12 12" /></svg>);

const statusLabel = { todo: "To Do", in_progress: "In Progress", done: "Done" };

function StatusButton({ variant, active, onClick, children }) {
  const base = "inline-flex h-9 w-full items-center justify-center rounded-lg border text-xs transition-colors";
  const normal = {
    todo: "status-todo",
    in_progress: "status-inprogress",
    done: "status-done",
  }[variant];

  const activeCls = {
    todo: "bg-[#3b82f6] text-white border-[#3b82f6]",
    in_progress: "bg-[#f59e0b] text-black border-[#f59e0b]",
    done: "bg-[#ef4444] text-white border-[#ef4444]",
  }[variant];

  return (
    <button
      type="button"
      disabled={active}
      aria-pressed={active}
      onClick={active ? undefined : onClick}
      className={`${base} ${active ? activeCls : normal}`}
    >
      {children}
    </button>
  );
}

export default function TaskCard({ t, onMove, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [etitle, setETitle] = useState(t.title);
  const [edesc, setEDesc] = useState(t.description || "");

  const date = t.due_date ? new Date(t.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : null;

  const startEdit = () => { setETitle(t.title); setEDesc(t.description || ""); setEditing(true); };
  const cancelEdit = () => { setEditing(false); setETitle(t.title); setEDesc(t.description || ""); };
  const saveEdit = async () => {
    const title = (etitle || "").trim(); if (!title) return;
    await onUpdate?.(t.id, { title, description: edesc }); setEditing(false);
  };
  const onKeyDown = (e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) saveEdit(); else if (e.key === "Escape") cancelEdit(); };

  return (
    <div className="relative rounded-2xl border border-base bg-card text-base p-4 backdrop-blur-sm">
      {/* action icons */}
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
          {t.description && <div className="mt-1 text-sm text-muted">{t.description}</div>}

          <div className="mt-2 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border border-base bg-card text-base/90 px-2.5 py-1 text-xs">
              👤 {t.assignee || "ไม่ระบุ"}
            </span>
            {date && (
              <span className="inline-flex items-center rounded-full border border-base bg-card text-base/90 px-2.5 py-1 text-xs">
                📅 {date}
              </span>
            )}
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {(["todo","in_progress","done"]).map(k => (
              <StatusButton
                key={k}
                variant={k}
                active={t.status === k}
                onClick={() => onMove(t.id, k)}
              >
                {statusLabel[k]}
              </StatusButton>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <input
            value={etitle}
            onChange={(e) => setETitle(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Title"
            className="w-full rounded-xl border border-base bg-card text-base px-3 py-2"
            autoFocus
          />
          <textarea
            rows={3}
            value={edesc}
            onChange={(e) => setEDesc(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Description"
            className="w-full rounded-xl border border-base bg-card text-base px-3 py-2"
          />
        </div>
      )}
    </div>
  );
}
