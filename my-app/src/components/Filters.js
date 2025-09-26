"use client"; //บอก Next.js ว่า component นี้ต้องรันฝั่ง client (React)

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

      {/* dropdown สำหรับเลือกคน */}
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

      {/* ช่องกรอกข้อความเวลาพิมพ์จะอัปเดตค่า q ในfilters */}
      <input
        value={filters.q}
        onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
        placeholder="Find…"
        className="w-52 rounded-xl border border-base bg-card text-base px-3 py-2"
      />

      {/* ปุ่ม Clear */}
      <button
        onClick={() => setFilters({ status: "all", assignee: "all", q: "" })}
        className="rounded-xl border border-base bg-card text-base px-3 py-2 hover:opacity-90"
      >
        Clear
      </button>

      {/* ปุ่มเลือกมุมมอง (Board / List) */}
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

/*จากfunction Filters
filters → object เก็บค่าฟิลเตอร์ {status, assignee, q}
setFilters → ฟังก์ชันสำหรับอัปเดตค่า filters
assignees → รายชื่อผู้รับผิดชอบ (array ของ string)
view → state ที่บอกว่ามุมมองปัจจุบันคือ "board" หรือ "list"
setView → ฟังก์ชันสำหรับเปลี่ยนค่า view
*/