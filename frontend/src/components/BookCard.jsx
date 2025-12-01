import React, { useEffect, useState } from "react";
import CommentsList from "./CommentsList";

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
    book.thumbnail ||
    vi.imageLinks?.thumbnail ||
    vi.imageLinks?.smallThumbnail ||
    "";
  const previewLink = vi.previewLink || vi.infoLink || book.infoLink || "";

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

  const pillClass =
    status === "Finished"
      ? "bg-emerald-500/15 text-emerald-200 border border-emerald-400/40"
      : status === "Reading"
      ? "bg-amber-500/15 text-amber-200 border border-amber-400/40"
      : "bg-sky-500/10 text-sky-200 border border-sky-400/40";

  return (
    <article className="flex gap-3 p-3 rounded-2xl bg-gradient-to-br from-slate-900/70 via-slate-950/80 to-slate-900/60 border border-white/8 shadow-space-soft">
      <div className="flex-shrink-0">
        {thumb ? (
          <img
            src={thumb.replace(/^http:/, "https:")}
            alt={title}
            className="w-[70px] h-[100px] object-cover rounded-xl border border-white/10"
          />
        ) : (
          <div className="w-[70px] h-[100px] rounded-xl border border-dashed border-slate-500/60 flex items-center justify-center text-[10px] text-slate-400">
            No cover
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <div className="flex justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold truncate">{title}</h3>
            {authors && (
              <p className="text-xs text-slate-300 truncate">{authors}</p>
            )}
          </div>
          {mode === "saved" && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide ${pillClass}`}
            >
              {status}
            </span>
          )}
        </div>

        {mode === "saved" ? (
          <>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px]">
              <span className="text-slate-400">Status</span>
              <select
                value={status}
                onChange={handleStatusChange}
                className="bg-slate-950/70 border border-slate-600/60 rounded-full px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-space-accent-soft"
              >
                <option>To Read</option>
                <option>Reading</option>
                <option>Finished</option>
              </select>

              {previewLink && (
                <a
                  href={previewLink}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-slate-900/80 border border-slate-500/60 hover:bg-slate-800"
                >
                  🔗 Preview
                </a>
              )}

              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-rose-900/60 border border-rose-500/60 text-rose-100 hover:bg-rose-800"
              >
                ✕ Delete
              </button>
            </div>

            <button
              type="button"
              className="mt-2 text-[11px] text-indigo-300 hover:text-indigo-200 underline underline-offset-2 w-fit"
              onClick={() => setShowNotes((v) => !v)}
            >
              {showNotes ? "Hide notes" : "Show notes & comments"}
            </button>

            {showNotes && book.id && <CommentsList bookId={book.id} />}
          </>
        ) : (
          <div className="flex items-center gap-2 mt-2">
            <button
              type="button"
              onClick={handleAdd}
              className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-space-accent text-white shadow-md shadow-violet-900/50 hover:bg-violet-500"
            >
              ➕ Add to shelf
            </button>
            {previewLink && (
              <a
                href={previewLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-500/60 hover:bg-slate-800"
              >
                🔗 Preview
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
