// backend/routes/books.js
const express = require("express");
const fetch = require("node-fetch"); // v2
const router = express.Router();

const {
  upsertBook,
  createManualBook,
  getAllBooks,
  getBookById,
  updateBookStatus,
  deleteBook,
  addComment,
  getCommentsForBook,
} = require("../db");

const GOOGLE_BASE = "https://www.googleapis.com/books/v1/volumes";

// --- SEARCH GOOGLE BOOKS ---
router.get("/search", async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.status(400).json({ error: "Query 'q' required" });

    const key = process.env.GOOGLE_BOOKS_API_KEY
      ? `&key=${process.env.GOOGLE_BOOKS_API_KEY}`
      : "";
    const url = `${GOOGLE_BASE}?q=${encodeURIComponent(
      q
    )}&maxResults=20${key}`;

    const r = await fetch(url);
    if (!r.ok) {
      const text = await r.text().catch(() => null);
      console.error("Google Books API error:", r.status, text);
      return res
        .status(502)
        .json({ error: "Google Books API error", status: r.status, body: text });
    }

    const data = await r.json();
    return res.json(data);
  } catch (err) {
    console.error("Server error in /api/books/search:", err);
    return res
      .status(500)
      .json({ error: "server error", message: err.message });
  }
});

// --- SAVE BOOK FROM GOOGLE VOLUME ---
router.post("/", (req, res) => {
  try {
    const volume = req.body;
    if (!volume || !volume.id) {
      return res.status(400).json({ error: "volume id required" });
    }

    const v = volume.volumeInfo || {};
    const book = {
      id: volume.id,
      title: v.title || "Untitled",
      authors: (v.authors || []).join(", "),
      publisher: v.publisher || "",
      publishedDate: v.publishedDate || "",
      description: v.description || "",
      thumbnail:
        (v.imageLinks && (v.imageLinks.thumbnail || v.imageLinks.smallThumbnail)) ||
        "",
      infoLink: v.infoLink || v.previewLink || "",
      status: "To Read",
      raw: JSON.stringify(volume),
    };

    upsertBook(book);
    return res.json({ ok: true, book });
  } catch (err) {
    console.error("DB error in POST /api/books:", err);
    return res
      .status(500)
      .json({ error: "db error", message: err.message });
  }
});

// --- MANUAL ADD BOOK ---
router.post("/manual", (req, res) => {
  try {
    const body = req.body || {};
    if (!body.title) {
      return res.status(400).json({ error: "title required" });
    }

    const id = body.id || "manual-" + Date.now().toString(36);
    const book = {
      id,
      title: body.title,
      authors: body.authors || "",
      publisher: body.publisher || "",
      publishedDate: body.publishedDate || "",
      description: body.description || "",
      thumbnail: body.thumbnail || "",
      infoLink: body.infoLink || "",
      status: body.status || "To Read",
      raw: body.raw || JSON.stringify({ manual: true }),
    };

    createManualBook(book);
    return res.json({ ok: true, book });
  } catch (err) {
    console.error("DB error in POST /api/books/manual:", err);
    return res
      .status(500)
      .json({ error: "db error", message: err.message });
  }
});

// --- LIST ALL SAVED BOOKS ---
router.get("/", (req, res) => {
  try {
    const rows = getAllBooks();
    return res.json(rows);
  } catch (err) {
    console.error("DB error in GET /api/books:", err);
    return res
      .status(500)
      .json({ error: "db error", message: err.message });
  }
});

// --- GET SINGLE BOOK ---
router.get("/:id", (req, res) => {
  try {
    const row = getBookById(req.params.id);
    if (!row) return res.status(404).json({ error: "not found" });
    return res.json(row);
  } catch (err) {
    console.error("DB error in GET /api/books/:id:", err);
    return res
      .status(500)
      .json({ error: "db error", message: err.message });
  }
});

// --- UPDATE BOOK (status for now) ---
router.patch("/:id", (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body || {};
    const existing = getBookById(id);
    if (!existing) return res.status(404).json({ error: "not found" });

    const newStatus = status || existing.status || "To Read";
    updateBookStatus(id, newStatus);

    const updated = getBookById(id);
    return res.json({ ok: true, book: updated });
  } catch (err) {
    console.error("DB error in PATCH /api/books/:id:", err);
    return res
      .status(500)
      .json({ error: "db error", message: err.message });
  }
});

// --- DELETE BOOK ---
router.delete("/:id", (req, res) => {
  try {
    const id = req.params.id;
    const existing = getBookById(id);
    if (!existing) {
      return res.status(404).json({ error: "not found" });
    }

    deleteBook(id);
    return res.json({ ok: true });
  } catch (err) {
    console.error("DB error in DELETE /api/books/:id:", err);
    return res
      .status(500)
      .json({ error: "db error", message: err.message });
  }
});

// --- COMMENTS ---

// list comments
router.get("/:id/comments", (req, res) => {
  try {
    const id = req.params.id;
    const existing = getBookById(id);
    if (!existing) return res.status(404).json({ error: "book not found" });

    const comments = getCommentsForBook(id);
    return res.json(comments);
  } catch (err) {
    console.error("DB error in GET /api/books/:id/comments:", err);
    return res
      .status(500)
      .json({ error: "db error", message: err.message });
  }
});

// add comment
router.post("/:id/comments", (req, res) => {
  try {
    const id = req.params.id;
    const { text } = req.body || {};
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "text required" });
    }

    const existing = getBookById(id);
    if (!existing) {
      return res.status(404).json({ error: "book not found" });
    }

    const comment = addComment(id, text.trim());
    return res.json({ ok: true, comment });
  } catch (err) {
    console.error("DB error in POST /api/books/:id/comments:", err);
    return res
      .status(500)
      .json({ error: "db error", message: err.message });
  }
});

module.exports = router;
