// backend/db.js
const Database = require("better-sqlite3");

let db;

function init() {
  if (db) return;

  db = new Database("shelfit-v2.db"); // new db file; no old FK constraints
  db.pragma("journal_mode = WAL");

  // Books table – NO FOREIGN KEYS
  db.prepare(`
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      authors TEXT,
      publisher TEXT,
      publishedDate TEXT,
      description TEXT,
      thumbnail TEXT,
      infoLink TEXT,
      status TEXT DEFAULT 'To Read',
      raw TEXT
    )
  `).run();

  // Comments table – no enforced FK, we filter by book_id + user_id in code
  db.prepare(`
    CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id TEXT,
  user_id TEXT,
  text TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(book_id) REFERENCES books(id) ON DELETE CASCADE
)
  `).run();

  console.log("SQLite initialised (shelfit-v2.db)");
}

// ---------- BOOK HELPERS ----------

function upsertBook(book) {
  const stmt = db.prepare(`
    INSERT INTO books (
      id, user_id, title, authors, publisher,
      publishedDate, description, thumbnail,
      infoLink, status, raw
    ) VALUES (
      @id, @user_id, @title, @authors, @publisher,
      @publishedDate, @description, @thumbnail,
      @infoLink, @status, @raw
    )
    ON CONFLICT(id) DO UPDATE SET
      user_id       = excluded.user_id,
      title         = excluded.title,
      authors       = excluded.authors,
      publisher     = excluded.publisher,
      publishedDate = excluded.publishedDate,
      description   = excluded.description,
      thumbnail     = excluded.thumbnail,
      infoLink      = excluded.infoLink,
      status        = excluded.status,
      raw           = excluded.raw
  `);

  stmt.run(book);
}

function createManualBook(book) {
  // manual add is just an upsert
  upsertBook(book);
}

function getAllBooksForUser(userId) {
  return db
    .prepare(
      `SELECT * FROM books WHERE user_id = ? ORDER BY rowid DESC`
    )
    .all(userId);
}

function getBookByIdForUser(id, userId) {
  return db
    .prepare(
      `SELECT * FROM books WHERE id = ? AND user_id = ?`
    )
    .get(id, userId);
}

function updateBookStatus(id, userId, status) {
  db.prepare(
    `UPDATE books SET status = ? WHERE id = ? AND user_id = ?`
  ).run(status, id, userId);
}

function deleteBook(id, userId) {
  db.prepare(
    `DELETE FROM books WHERE id = ? AND user_id = ?`
  ).run(id, userId);

  // also delete comments for that book & user
  db.prepare(
    `DELETE FROM comments WHERE book_id = ? AND user_id = ?`
  ).run(id, userId);
}

// ---------- COMMENT HELPERS ----------

function addComment(bookId, userId, text) {
  const stmt = db.prepare(`
    INSERT INTO comments (book_id, user_id, text)
    VALUES (?, ?, ?)
  `);
  const info = stmt.run(bookId, userId, text);

  return {
    id: info.lastInsertRowid,
    book_id: bookId,
    user_id: userId,
    text,
    created_at: new Date().toISOString(),
  };
}

function getCommentsForBook(bookId, userId) {
  return db
    .prepare(
      `SELECT * FROM comments WHERE book_id = ? AND user_id = ? ORDER BY created_at DESC`
    )
    .all(bookId, userId);
}

module.exports = {
  init,
  upsertBook,
  createManualBook,
  getAllBooksForUser,
  getBookByIdForUser,
  updateBookStatus,
  deleteBook,
  addComment,
  getCommentsForBook,
};
