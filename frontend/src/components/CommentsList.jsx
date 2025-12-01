import React, { useEffect, useState } from "react";
import { useAuth } from "../state/AuthContext";

export default function CommentsList({ bookId }) {
  const { API, token } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  async function load() {
    const res = await fetch(`${API}/api/books/${bookId}/comments`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      const data = await res.json();
      setComments(data);
    }
  }

  useEffect(() => {
    if (bookId && token) load();
  }, [bookId, token]);

  async function add() {
    if (!text.trim()) return;

    const res = await fetch(`${API}/api/books/${bookId}/comments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (res.ok) {
      setText("");
      load();
    }
  }

  return (
    <div className="mt-3">
      {comments.map((c) => (
        <div key={c.id} className="bg-slate-700 p-2 rounded mb-2 text-sm">
          {c.text}
        </div>
      ))}

      <div className="flex gap-2">
        <input
          className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm"
          placeholder="Add note..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          onClick={add}
          className="px-3 py-1 bg-indigo-500 text-sm rounded"
        >
          Add
        </button>
      </div>
    </div>
  );
}
