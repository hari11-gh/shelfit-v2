import React, { useEffect, useState } from "react";
import { useAuth } from "../state/AuthContext";
import SearchBar from "../components/SearchBar";
import ManualAddForm from "../components/ManualAddForm";
import BookList from "../components/BookList";
import NotesDrawer from "../components/NotesDrawer";
import CosmicFooter from "../components/CosmicFooter";

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_BOOKS_KEY;

export default function ShelfPage() {
  const { API, user, token, logout } = useAuth();

  // search + saved
  const [results, setResults] = useState([]);
  const [saved, setSaved] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // shelf filters
  const [shelfFilter, setShelfFilter] = useState("all");
  const [shelfSearch, setShelfSearch] = useState("");
  const [showManual, setShowManual] = useState(false);

  // notes
  const [activeBook, setActiveBook] = useState(null);
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    if (token) loadSaved();
  }, [token]);

  /** --------------------------------------------------
   * LOAD SAVED BOOKS
   * Backend route: GET /api/books
   * -------------------------------------------------- */
  async function loadSaved() {
    try {
      const res = await fetch(`${API}/api/books`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const text = await res.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        console.error("Books returned non-JSON:", text);
        data = [];
      }

      if (Array.isArray(data)) setSaved(data);
      else setSaved([]);
    } finally {
      setPageLoading(false);
    }
  }

  /** --------------------------------------------------
   * GOOGLE SEARCH
   * -------------------------------------------------- */
  async function onSearch(q) {
    if (!q.trim()) return;
    if (!GOOGLE_KEY) return alert("Missing Google Books key");

    setSearchLoading(true);

    try {
      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        q
      )}&maxResults=20&key=${GOOGLE_KEY}`;

      const res = await fetch(url);
      const data = await res.json();
      setResults(data.items || []);
    } finally {
      setSearchLoading(false);
    }
  }

  /** --------------------------------------------------
   * SAVE BOOK FROM GOOGLE
   * Backend route: POST /api/books
   * -------------------------------------------------- */
  async function addFromSearch(volume) {
    const res = await fetch(`${API}/api/books`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(volume),
    });

    const data = await res.json();
    if (data.ok) setSaved((prev) => [data.book, ...prev]);
  }

  /** --------------------------------------------------
   * MANUAL ADD
   * Backend route: POST /api/books/manual
   * -------------------------------------------------- */
  async function addManual(bookObj) {
    const res = await fetch(`${API}/api/books/manual`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookObj),
    });

    const data = await res.json();
    if (data.ok) {
      setSaved((prev) => [data.book, ...prev]);
      setShowManual(false);
    }
  }

  /** --------------------------------------------------
   * UPDATE STATUS
   * Backend route: PATCH /api/books/:id
   * -------------------------------------------------- */
  async function updateBook(id, patch) {
    const res = await fetch(`${API}/api/books/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patch),
    });

    const data = await res.json();
    if (data.ok) {
      setSaved((old) =>
        old.map((b) => (b.id === id ? { ...b, ...data.book } : b))
      );
    }
  }

  /** --------------------------------------------------
   * DELETE BOOK
   * Backend route: DELETE /api/books/:id
   * -------------------------------------------------- */
  async function deleteBook(id) {
    const res = await fetch(`${API}/api/books/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) setSaved((prev) => prev.filter((b) => b.id !== id));
  }

  /** --------------------------------------------------
   * OPEN NOTES
   * Backend route: GET /api/books/:id/comments
   * -------------------------------------------------- */
  async function openNotes(book) {
    setActiveBook(book);
    setNotes([]);
    setNotesLoading(true);

    const res = await fetch(`${API}/api/books/${book.id}/comments`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setNotes(Array.isArray(data) ? data : []);
    setNotesLoading(false);
  }

  /** --------------------------------------------------
   * ADD NOTE
   * Backend route: POST /api/books/:id/comments
   * -------------------------------------------------- */
  async function onAddNote(bookId) {
    if (!newNote.trim()) return;

    const res = await fetch(`${API}/api/books/${bookId}/comments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: newNote }),
    });

    const data = await res.json();
    if (data.ok) {
      setNotes((prev) => [data.comment, ...prev]);
      setNewNote("");
    }
  }

  /** --------------------------------------------------
   * DELETE NOTE
   * Backend route: DELETE /api/books/:id/comments/:commentId
   * -------------------------------------------------- */
  async function onDeleteNote(bookId, commentId) {
    const res = await fetch(
      `${API}/api/books/${bookId}/comments/${commentId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (res.ok) setNotes((prev) => prev.filter((n) => n.id !== commentId));
  }

  /** --------------------------------------------------
   * FILTER SHELF — now safe
   * -------------------------------------------------- */
  const filteredShelf = Array.isArray(saved)
    ? saved.filter((b) => {
        const q = shelfSearch.toLowerCase();
        const goodStatus = shelfFilter === "all" || b.status === shelfFilter;
        const goodSearch =
          b.title.toLowerCase().includes(q) ||
          (b.authors || "").toLowerCase().includes(q);
        return goodStatus && goodSearch;
      })
    : [];

  return (
    <div className="min-h-screen animate-fadeIn">
      {/* HEADER */}
      <header className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-indigo-300 text-transparent bg-clip-text">
          ShelfIt V2
        </h1>

        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-purple-200/80">{user.email}</span>
          )}
          <button
            onClick={logout}
            className="btn-cosmic px-4 py-2 text-sm rounded-xl"
          >
            Logout
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto mt-3 px-4 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr,1fr] gap-6">
          {/* DISCOVER */}
          <section className="glass-panel p-5 rounded-2xl animate-float">
            <h2 className="section-title">Discover</h2>
            <SearchBar onSearch={onSearch} loading={searchLoading} />
            <BookList books={results} mode="search" onAdd={addFromSearch} />
            {showManual && <ManualAddForm onAdd={addManual} />}
          </section>

          {/* SHELF */}
          <section className="glass-panel p-5 rounded-2xl animate-float-delayed">
            <h2 className="section-title">Your Shelf</h2>

            <div className="flex items-center gap-2 mb-4">
              <input
                className="cosmic-input flex-1"
                placeholder="Search shelf..."
                value={shelfSearch}
                onChange={(e) => setShelfSearch(e.target.value)}
              />

              <select
                className="px-3 py-2 rounded-lg 
                           bg-[rgba(45,25,75,0.7)]
                           border border-[rgba(180,140,255,0.35)]
                           text-purple-200
                           shadow-[0_0_8px_rgba(160,120,255,0.35)]
                           focus:outline-none 
                           focus:ring-2 focus:ring-purple-400/50
                           hover:bg-[rgba(55,35,85,0.8)]
                           transition-all text-sm"
                value={shelfFilter}
                onChange={(e) => setShelfFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="To Read">To Read</option>
                <option value="Reading">Reading</option>
                <option value="Completed">Completed</option>
              </select>

              <button
                onClick={() => setShowManual((v) => !v)}
                className="btn-cosmic px-3 py-2 text-xs rounded"
              >
                + Manual
              </button>
            </div>

            {pageLoading ? (
              <p className="text-purple-300">Loading...</p>
            ) : (
              <BookList
                books={filteredShelf}
                mode="saved"
                onUpdate={updateBook}
                onDelete={deleteBook}
                onOpenNotes={openNotes}
              />
            )}
          </section>
        </div>
      </main>

      {/* NOTES DRAWER */}
      <NotesDrawer
        book={activeBook}
        notes={notes}
        loading={notesLoading}
        newNote={newNote}
        setNewNote={setNewNote}
        onAddNote={onAddNote}
        onDeleteNote={onDeleteNote}
        onClose={() => setActiveBook(null)}
      />

      <CosmicFooter />
    </div>
  );
}
