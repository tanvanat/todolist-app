"use client";

export default function Filters({ filters, setFilters, assignees, view, setView }) {
  return (
    <div className="flex flex-wrap gap-3 text-base">
      <select
        value={filters.status}
        onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
        className="rounded-xl border border-base bg-card text-base px-3 py-2"
      >
        <option value="all">All statuses</option>
        <option value="todo">To Do</option>
        <option value="in_progress">In Progress</option>
        <option value="done">Done</option>
      </select>

      <select
        value={filters.assignee}
        onChange={(e) => setFilters((f) => ({ ...f, assignee: e.target.value }))}
        className="rounded-xl border border-base bg-card text-base px-3 py-2"
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
        className="w-52 rounded-xl border border-base bg-card text-base px-3 py-2"
      />

      <button
        onClick={() => setFilters({ status: "all", assignee: "all", q: "" })}
        className="rounded-xl border border-base bg-card text-base px-3 py-2 hover:opacity-90"
      >
        Clear
      </button>

      <div className="ml-auto flex items-center gap-2 rounded-xl border border-base bg-card p-1">
        <button
          onClick={() => setView("board")}
          className={`rounded-lg px-3 py-1 ${view === "board" ? "bg-[var(--border)]/40" : ""}`}
        >
          Board
        </button>
        <button
          onClick={() => setView("list")}
          className={`rounded-lg px-3 py-1 ${view === "list" ? "bg-[var(--border)]/40" : ""}`}
        >
          List
        </button>
      </div>
    </div>
  );
}
