import React, { useState } from "react";

export default function ManualAddForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [status, setStatus] = useState("To Read");
  const [notes, setNotes] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  function submit(e) {
    e?.preventDefault?.();
    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    const book = {
      id: "manual-" + Date.now().toString(36),
      title: title.trim(),
      authors: authors.trim(),
      publisher: "",
      publishedDate: "",
      description: notes,
      thumbnail: thumbnailUrl.trim(),
      status,
      raw: JSON.stringify({ manual: true }),
    };

    onAdd(book);
    setTitle("");
    setAuthors("");
    setStatus("To Read");
    setNotes("");
    setThumbnailUrl("");
  }

  return (
    <form className="manual-form" onSubmit={submit}>
      <label>
        <span>Title</span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Book title"
        />
      </label>

      <label>
        <span>Author</span>
        <input
          value={authors}
          onChange={(e) => setAuthors(e.target.value)}
          placeholder="Author name"
        />
      </label>

      <label>
        <span>Status</span>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>To Read</option>
          <option>Reading</option>
          <option>Finished</option>
        </select>
      </label>

      <label>
        <span>Cover image URL (optional)</span>
        <input
          value={thumbnailUrl}
          onChange={(e) => setThumbnailUrl(e.target.value)}
          placeholder="https://example.com/cover.jpg"
        />
      </label>

      <label>
        <span>Notes</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Thoughts, quotes, progress..."
        />
      </label>

      <button className="btn primary full" type="submit">
        Add Book
      </button>
    </form>
  );
}
