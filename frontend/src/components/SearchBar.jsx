import React, { useState } from "react";

export default function SearchBar({ onSearch, loading }) {
  const [q, setQ] = useState("");

  function submit(e) {
    e?.preventDefault?.();
    if (!q.trim()) return;
    onSearch(q.trim());
  }

  return (
    <form className="searchbar" onSubmit={submit}>
      <div className="search-input-wrap">
        <span className="search-icon">🔍</span>
        <input
          className="input main"
          placeholder="Search by title, author, or ISBN..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <button className="btn primary" type="submit" disabled={loading}>
        {loading ? "Searching..." : "Search"}
      </button>
    </form>
  );
}
