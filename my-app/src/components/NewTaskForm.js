"use client";

export default function NewTaskForm({ form, setForm, onSubmit }) {
  return (
    <form id="new" onSubmit={onSubmit} className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-4">
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
  );
}
