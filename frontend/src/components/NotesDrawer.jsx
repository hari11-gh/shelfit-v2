import React, { useEffect } from "react";

export default function NotesDrawer({
  book,
  notes,
  loading,
  newNote,
  setNewNote,
  onAddNote,
  onDeleteNote,
  onClose,
}) {
  // Close drawer on ESC
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  if (!book) return null;

  return (
    <div
      className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm animate-fadeIn flex justify-end"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md h-full bg-slate-900/80 backdrop-blur-xl shadow-[0_0_40px_rgba(150,100,255,0.4)]
                   border-l border-purple-400/20 p-5 animate-slideIn flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-purple-300 mb-1">
          Notes for
        </h2>
        <p className="text-sm text-slate-300 mb-3">{book.title}</p>

        {/* Notes list */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <p className="text-slate-400 text-sm">Loading notes...</p>
          ) : notes.length === 0 ? (
            <p className="text-slate-400 text-sm">No notes yet.</p>
          ) : (
            notes.map((n) => (
              <div
                key={n.id}
                className="p-3 bg-slate-800/50 border border-white/10 rounded-lg flex justify-between items-start"
              >
                <p className="text-sm text-slate-200">{n.text}</p>
                <button
                  onClick={() => onDeleteNote(book.id, n.id)}
                  className="text-red-400 text-xs hover:text-red-500 ml-2"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add note */}
        <div className="mt-3">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Write a note..."
            className="w-full bg-slate-800/60 border border-purple-400/20 rounded-lg p-2 text-sm outline-none"
          />

          <button
            onClick={() => onAddNote(book.id)}
            className="w-full mt-2 btn-cosmic py-2 rounded-lg text-sm"
          >
            Add Note
          </button>

          <button
            onClick={onClose}
            className="w-full mt-2 py-2 text-sm rounded-lg bg-slate-800 border border-slate-600 hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
