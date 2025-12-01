import React, { useState } from "react";

export default function ManualAddForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");

  function submit(e) {
    e.preventDefault();

    if (!title.trim()) return;

    onAdd({
      title,
      authors,
      description,
      thumbnail,
      status: "To Read",
    });

    setTitle("");
    setAuthors("");
    setDescription("");
    setThumbnail("");
  }

  return (
    <form
      onSubmit={submit}
      className="cosmic-panel p-4 rounded-xl mt-3 space-y-3"
    >
      <h3 className="font-medium text-sm text-purple-200">Add Manual Book</h3>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full bg-slate-900/40 border border-purple-400/20 rounded px-2 py-2 text-sm
                   focus:border-purple-400/40 outline-none"
        placeholder="Title"
      />

      <input
        value={authors}
        onChange={(e) => setAuthors(e.target.value)}
        className="w-full bg-slate-900/40 border border-purple-400/20 rounded px-2 py-2 text-sm
                   focus:border-purple-400/40 outline-none"
        placeholder="Authors (optional)"
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full bg-slate-900/40 border border-purple-400/20 rounded px-2 py-2 text-sm
                   focus:border-purple-400/40 outline-none"
        placeholder="Description (optional)"
      />

      <input
        value={thumbnail}
        onChange={(e) => setThumbnail(e.target.value)}
        className="w-full bg-slate-900/40 border border-purple-400/20 rounded px-2 py-2 text-sm
                   focus:border-purple-400/40 outline-none"
        placeholder="Image URL (optional)"
      />

      <button className="btn-cosmic w-full py-2 rounded-xl text-sm">
        Add Book
      </button>
    </form>
  );
}
