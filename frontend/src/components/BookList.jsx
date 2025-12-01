import React from "react";

export default function BookList({
  books,
  mode,
  onAdd,
  onUpdate,
  onDelete,
  onOpenNotes,
}) {
  if (!books || books.length === 0)
    return <p className="text-sm text-slate-400">No books found.</p>;

  return (
    <div className="space-y-3 mt-3">
      {books.map((b) => {
        const volumeInfo = b.volumeInfo || b;

        const thumbnail =
          volumeInfo.thumbnail ||
          (volumeInfo.imageLinks && volumeInfo.imageLinks.thumbnail) ||
          "";

        const previewUrl =
          volumeInfo.infoLink ||
          (volumeInfo.previewLink || "");

        return (
          <div
            key={b.id}
            className="flex gap-3 book-card p-4 rounded-xl"
          >
            {/* Thumbnail */}
            <div className="w-16 h-20 rounded overflow-hidden flex items-center justify-center book-thumb bg-black/40">
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt="cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-slate-500">No Image</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <p className="font-semibold text-sm text-purple-100">
                {volumeInfo.title}
              </p>

              <p className="text-xs text-slate-300">
                {volumeInfo.authors || "Unknown Author"}
              </p>

              {/* Preview link */}
              {previewUrl && (
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-1 text-xs text-indigo-300 hover:text-indigo-400 underline"
                >
                  Preview Book
                </a>
              )}

              {/* SEARCH MODE */}
              {mode === "search" && onAdd && (
                <button
                  onClick={() => onAdd(b)}
                  className="mt-2 text-xs btn-cosmic px-3 py-1 rounded"
                >
                  + Add
                </button>
              )}

              {/* SAVED MODE */}
              {mode === "saved" && (
                <div className="mt-3 flex gap-2 flex-wrap items-center">

                  {/* UPDATED STATUS SELECT */}
                  <select
                    value={b.status}
                    onChange={(e) =>
                      onUpdate && onUpdate(b.id, { status: e.target.value })
                    }
                    className="
                      px-3 py-1.5 text-xs rounded-lg
                      bg-[rgba(45,25,75,0.8)]
                      border border-[rgba(180,140,255,0.35)]
                      text-purple-200
                      shadow-[0_0_8px_rgba(160,120,255,0.35)]
                      hover:bg-[rgba(65,35,95,0.9)]
                      focus:outline-none focus:ring-2 focus:ring-purple-400/60
                      transition-all
                    "
                  >
                    <option value="To Read">To Read</option>
                    <option value="Reading">Reading</option>
                    <option value="Completed">Completed</option>
                  </select>

                  {/* Notes */}
                  <button
                    onClick={() => onOpenNotes && onOpenNotes(b)}
                    className="text-xs bg-indigo-500 px-3 py-1 rounded-full shadow-md hover:bg-indigo-400 transition"
                  >
                    Notes
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => onDelete && onDelete(b.id)}
                    className="text-xs bg-red-500 px-3 py-1 rounded-full hover:bg-red-400 transition"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
