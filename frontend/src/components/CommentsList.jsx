import React, { useEffect, useState } from "react";

export default function CommentsList({ bookId, apiBase }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const API = apiBase || import.meta.env.VITE_API_BASE || "http://localhost:4000";

  useEffect(() => {
    load();
  }, [bookId]);

  async function load() {
    try {
      const res = await fetch(`${API}/api/books/${bookId}/comments`);
      if (!res.ok) {
        setComments([]);
        return;
      }
      const data = await res.json();
      setComments(data || []);
    } catch (err) {
      console.error("Comments load error", err);
    }
  }

  async function add() {
    if (!text.trim()) return;
    try {
      const res = await fetch(`${API}/api/books/${bookId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        console.warn("Add comment failed", data);
        return;
      }
      setText("");
      load();
    } catch (err) {
      console.error("Add comment error", err);
    }
  }

  return (
    <div className="comments-box">
      <div className="comments-list">
        {comments.length === 0 ? (
          <div className="comments-empty">No notes yet</div>
        ) : (
          comments.map((c) => (
            <div className="comment-row" key={c.id}>
              <div className="comment-text">{c.text}</div>
              <div className="comment-time">
                {c.created_at
                  ? new Date(c.created_at).toLocaleString()
                  : ""}
              </div>
            </div>
          ))
        )}
      </div>
      <div className="comments-input-row">
        <input
          className="input subtle"
          placeholder="Add a quick note..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn primary" type="button" onClick={add}>
          Add
        </button>
      </div>
    </div>
  );
}
