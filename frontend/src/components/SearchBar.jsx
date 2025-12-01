import React, { useState } from "react";

export default function SearchBar({ onSearch, loading }) {
  const [q, setQ] = useState("");

  function submit(e) {
    e?.preventDefault?.();
    if (!q.trim()) return;
    onSearch(q.trim());
  }

  return (
    <form onSubmit={submit} className="flex gap-2 items-center">
      <div className="flex-1 relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm opacity-70">
          🔍
        </span>

        <input
          className="w-full bg-slate-900/40 border border-purple-400/20 rounded-xl pl-8 pr-3 py-2 text-sm
                     focus:outline-none focus:border-purple-400/50 focus:ring-2 focus:ring-purple-500/40
                     backdrop-blur-xl transition"
          placeholder="Search by title, author, or ISBN..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-cosmic px-5 py-2 rounded-xl"
      >
        {loading ? "Searching..." : "Search"}
      </button>
    </form>
  );
}
