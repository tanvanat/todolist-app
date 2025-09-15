"use client";
import { useEffect, useState } from "react";

export default function Page() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const load = async () => {
    const r = await fetch("/api/tasks"); const j = await r.json();
    setItems(j);
  };
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title, description: desc })
    });
    setTitle(""); setDesc(""); load();
  };

  const setStatus = async (id, status) => {
    await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status })
    });
    load();
  };

  const remove = async (id) => {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" }); load();
  };

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Task Board</h1>

      <form onSubmit={add} className="space-y-3 bg-gray-900/30 p-4 rounded-xl">
        <input className="w-full p-2 rounded bg-gray-800" placeholder="Title"
          value={title} onChange={e=>setTitle(e.target.value)} />
        <textarea className="w-full p-2 rounded bg-gray-800" rows="3"
          placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)} />
        <button className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500">
          Add Task
        </button>
      </form>

      <ul className="space-y-3">
        {items.map(t => (
          <li key={t.id} className="p-4 rounded-xl bg-gray-900/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{t.title}</div>
                {t.description && <div className="text-sm text-gray-400">{t.description}</div>}
                <div className="text-xs mt-1 opacity-70">Status: {t.status}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>setStatus(t.id,"todo")}  className="px-2 py-1 rounded bg-gray-700">Todo</button>
                <button onClick={()=>setStatus(t.id,"doing")} className="px-2 py-1 rounded bg-blue-700">Doing</button>
                <button onClick={()=>setStatus(t.id,"done")}  className="px-2 py-1 rounded bg-green-700">Done</button>
                <button onClick={()=>remove(t.id)} className="px-2 py-1 rounded bg-red-700">Del</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
