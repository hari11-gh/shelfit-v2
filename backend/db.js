// backend/db.js
const Database = require("better-sqlite3");
const path = require("path");
require("dotenv").config();

const dbFile =
  process.env.DATABASE_FILE || path.join(__dirname, "shelfitv2.sqlite3");
const db = new Database(dbFile);

function init() {
  db.pragma("foreign_keys = ON");

  // books table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT,
      authors TEXT,
      publisher TEXT,
      publishedDate TEXT,
      description TEXT,
      thumbnail TEXT,
      infoLink TEXT,
      status TEXT DEFAULT 'To Read',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      raw JSON
    )
  `).run();

  // comments table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(book_id) REFERENCES books(id) ON DELETE CASCADE
    )
  `).run();
}

function upsertBook(book) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO books
    (id, title, authors, publisher, publishedDate, description,
     thumbnail, infoLink, status, raw)
    VALUES (@id, @title, @authors,
            @publisher, @publishedDate, @description,
            @thumbnail, @infoLink, @status, @raw)
  `);
  return stmt.run(book);
}

function createManualBook(b) {
  const stmt = db.prepare(`
    INSERT INTO books
    (id, title, authors, publisher, publishedDate, description,
     thumbnail, infoLink, status, raw)
    VALUES (@id, @title, @authors,
            @publisher, @publishedDate, @description,
            @thumbnail, @infoLink, @status, @raw)
  `);
  return stmt.run(b);
}

function getAllBooks() {
  return db
    .prepare(`SELECT * FROM books ORDER BY datetime(created_at) DESC`)
    .all();
}

function getBookById(id) {
  return db.prepare(`SELECT * FROM books WHERE id = ?`).get(id);
}

function updateBookStatus(id, status) {
  const stmt = db.prepare(`
    UPDATE books SET status = @status WHERE id = @id
  `);
  return stmt.run({ id, status });
}

function deleteBook(id) {
  // comments will be removed via ON DELETE CASCADE
  const stmt = db.prepare(`DELETE FROM books WHERE id = ?`);
  return stmt.run(id);
}

// comments

function addComment(bookId, text) {
  const id = "c_" + Date.now().toString(36) + Math.random().toString(36).slice(2);
  const stmt = db.prepare(`
    INSERT INTO comments (id, book_id, text) VALUES (@id, @book_id, @text)
  `);
  stmt.run({ id, book_id: bookId, text });
  return getCommentById(id);
}

function getCommentsForBook(bookId) {
  return db
    .prepare(
      `SELECT * FROM comments WHERE book_id = ? ORDER BY datetime(created_at) DESC`
    )
    .all(bookId);
}

function getCommentById(id) {
  return db.prepare(`SELECT * FROM comments WHERE id = ?`).get(id);
}

module.exports = {
  db,
  init,
  upsertBook,
  createManualBook,
  getAllBooks,
  getBookById,
  updateBookStatus,
  deleteBook,
  addComment,
  getCommentsForBook,
};
