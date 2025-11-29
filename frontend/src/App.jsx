import React, { useEffect, useState } from "react";
import SearchBar from "./components/SearchBar";
import ManualAddForm from "./components/ManualAddForm";
import BookList from "./components/BookList";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default function App() {
  const [results, setResults] = useState([]);
  const [saved, setSaved] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [shelfFilter, setShelfFilter] = useState("all");
  const [shelfSearch, setShelfSearch] = useState("");
  const [showManualModal, setShowManualModal] = useState(false);

  useEffect(() => {
    loadSaved();
  }, []);

  async function loadSaved() {
    try {
      const res = await fetch(`${API}/api/books`);
      if (!res.ok) {
        console.error("Failed to load saved", res.status);
        return;
      }
      const data = await res.json();
      setSaved(data);
    } catch (err) {
      console.error("Load saved error", err);
    }
  }

  async function onSearch(q) {
    if (!q || !q.trim()) return;
    setSearchLoading(true);
    try {
      const res = await fetch(
        `${API}/api/books/search?q=${encodeURIComponent(q.trim())}`
      );
      if (!res.ok) {
        console.warn("Search failed status", res.status);
        setResults([]);
        return;
      }
      const data = await res.json();
      setResults(data.items || []);
    } catch (err) {
      console.error("Search error", err);
      setResults([]);
    } finally {
      setSearchLoading(false);
    }
  }

  async function addFromSearch(volume) {
    try {
      const res = await fetch(`${API}/api/books`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(volume),
      });
      const data = await res.json();
      if (data.ok) {
        setSaved((prev) => [data.book, ...prev]);
      } else {
        console.warn("Add failed", data);
      }
    } catch (err) {
      console.error("Add error", err);
    }
  }

  async function addManual(bookObj) {
    try {
      const res = await fetch(`${API}/api/books/manual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookObj),
      });
      const data = await res.json();
      if (data.ok) {
        setSaved((prev) => [data.book, ...prev]);
        setShowManualModal(false);
      } else {
        console.warn("Manual add failed", data);
      }
    } catch (err) {
      console.error("Manual add error", err);
    }
  }

  async function updateBook(id, patch) {
    try {
      const res = await fetch(`${API}/api/books/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) {
        console.warn("Update failed", data);
        return;
      }
      setSaved((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...data.book } : b))
      );
    } catch (err) {
      console.error("Update error", err);
    }
  }

  async function deleteBook(id) {
    try {
      const res = await fetch(`${API}/api/books/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        console.warn("Delete failed", data);
        return;
      }
      setSaved((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Delete error", err);
    }
  }

  const filteredShelf = saved.filter((b) => {
    const statusMatch =
      shelfFilter === "all" || (b.status || "To Read") === shelfFilter;
    const q = shelfSearch.toLowerCase();
    const title = (b.title || "").toLowerCase();
    const authors = (b.authors || "").toLowerCase();
    const searchMatch = !q || title.includes(q) || authors.includes(q);
    return statusMatch && searchMatch;
  });

  return (
    <div className="app-root">
      <header className="topbar">
        <div className="logo-area">
          <div className="logo-mark">📚</div>
          <div>
            <div className="logo-title">ShelfIt V2</div>
            <div className="logo-sub">
              Track, organise and revisit your reading.
            </div>
          </div>
        </div>
        <div className="top-actions">
          <button
            className="pill-button"
            onClick={() => setShowManualModal(true)}
          >
            + Add book manually
          </button>
        </div>
      </header>

      <main className="layout">
        {/* LEFT: Discover / search */}
        <section className="panel left">
          <div className="panel-header">
            <h2>Discover & Add</h2>
            <p>Search Google Books and add titles straight to your shelf.</p>
          </div>

          <SearchBar onSearch={onSearch} loading={searchLoading} />

          <div className="panel-section">
            <div className="section-title">Search results</div>
            <BookList
              books={results}
              mode="search"
              onAdd={addFromSearch}
              onUpdate={updateBook}
              onDelete={deleteBook}
            />
          </div>
        </section>

        {/* RIGHT: Your shelf */}
        <section className="panel right">
          <div className="panel-header">
            <h2>Your Shelf</h2>
            <p>Update status, add notes, and keep everything in one place.</p>
          </div>

          <div className="shelf-filters">
            <input
              className="input subtle"
              placeholder="Search your shelf..."
              value={shelfSearch}
              onChange={(e) => setShelfSearch(e.target.value)}
            />
            <select
              className="select subtle"
              value={shelfFilter}
              onChange={(e) => setShelfFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="To Read">To Read</option>
              <option value="Reading">Reading</option>
              <option value="Finished">Finished</option>
            </select>
          </div>

          <div className="panel-section">
            <BookList
              books={filteredShelf}
              mode="saved"
              onUpdate={updateBook}
              onDelete={deleteBook}
            />
          </div>
        </section>
      </main>

      {showManualModal && (
        <div className="modal-backdrop" onClick={() => setShowManualModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add a book manually</h3>
              <button
                className="icon-button"
                onClick={() => setShowManualModal(false)}
              >
                ✕
              </button>
            </div>
            <ManualAddForm onAdd={addManual} />
          </div>
        </div>
      )}
    </div>
  );
}
