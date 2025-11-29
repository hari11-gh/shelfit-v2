import React from "react";
import BookCard from "./BookCard";

export default function BookList({
  books,
  mode = "search",
  onAdd,
  onUpdate,
  onDelete,
}) {
  if (!books || books.length === 0) {
    return <div className="empty">No books</div>;
  }

  return (
    <div className="book-list">
      {books.map((b) => (
        <BookCard
          key={b.id || b.etag || (b.volumeInfo && b.volumeInfo.title) || Math.random()}
          book={b}
          mode={mode}
          onAdd={onAdd}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
