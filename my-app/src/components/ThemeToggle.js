"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mode, setMode] = useState("light");

  // ตั้งค่าเริ่มต้นจาก localStorage หรือ system preference
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    const shouldDark =
      saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", shouldDark);
    setMode(shouldDark ? "dark" : "light");
  }, []);

  const toggle = () => {
    const next = mode === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
    setMode(next);
  };

  return (
    <button
      onClick={toggle}
      className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-[var(--fg)] hover:opacity-90"
      title="Toggle theme"
    >
      {mode === "dark" ? "🌞 Light" : "🌙 Dark"}
    </button>
  );
}
