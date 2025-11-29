import React, { useEffect, useState } from "react";
import CommentsList from "./CommentsList";

const API = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default function BookCard({
  book,
  mode = "search",
  onAdd,
  onUpdate,
  onDelete,
}) {
  const vi = book.volumeInfo || {};
  const title = book.title || vi.title || "Untitled";
  const authors =
    book.authors || (vi.authors && vi.authors.join?.(", ")) || "";
  const thumb =
    book.thumbnail || vi.imageLinks?.thumbnail || vi.imageLinks?.smallThumbnail || "";

  const [status, setStatus] = useState(book.status || "To Read");
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    setStatus(book.status || "To Read");
  }, [book.status]);

  function handleAdd() {
    if (onAdd) onAdd(book);
  }

  function handleStatusChange(e) {
    const s = e.target.value;
    setStatus(s);
    if (onUpdate && book.id) {
      onUpdate(book.id, { status: s });
    }
  }

  function handleDelete() {
    if (!book.id || !onDelete) return;
    if (confirm("Delete this book from your shelf?")) {
      onDelete(book.id);
    }
  }

  const previewLink = vi.previewLink || vi.infoLink || book.infoLink || "";

  const statusClass =
    status === "Finished"
      ? "pill done"
      : status === "Reading"
      ? "pill reading"
      : "pill todo";

  return (
    <article className="book-card">
      <div className="book-thumb">
        {thumb ? (
          <img src={thumb.replace(/^http:/, "https:")} alt={title} />
        ) : (
          <div className="thumb-placeholder">No cover</div>
        )}
      </div>

      <div className="book-main">
        <div className="book-header">
          <div>
            <h3 className="book-title">{title}</h3>
            {authors && <p className="book-authors">{authors}</p>}
          </div>

          {mode === "saved" && (
            <div className="status-wrap">
              <span className={statusClass}>{status}</span>
            </div>
          )}
        </div>

        {mode === "saved" && (
          <div className="book-meta-row">
            <label className="field-label">Status</label>
            <select value={status} onChange={handleStatusChange}>
              <option>To Read</option>
              <option>Reading</option>
              <option>Finished</option>
            </select>

            {previewLink && (
              <a
                href={previewLink}
                target="_blank"
                rel="noreferrer"
                className="btn ghost"
              >
                Open preview
              </a>
            )}

            <button className="btn ghost danger" onClick={handleDelete}>
              Delete
            </button>
          </div>
        )}

        {mode === "search" && (
          <div className="book-meta-row">
            <button className="btn primary" onClick={handleAdd}>
              Add to shelf
            </button>
            {previewLink && (
              <a
                href={previewLink}
                target="_blank"
                rel="noreferrer"
                className="btn ghost"
              >
                Preview
              </a>
            )}
          </div>
        )}

        {mode === "saved" && (
          <div className="notes-toggle">
            <button className="link-button" onClick={() => setShowNotes((v) => !v)}>
              {showNotes ? "Hide notes" : "Show notes & comments"}
            </button>
          </div>
        )}

        {mode === "saved" && showNotes && book.id && (
          <CommentsList bookId={book.id} apiBase={API} />
        )}
      </div>
    </article>
  );
}
