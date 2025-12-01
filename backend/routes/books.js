// backend/routes/books.js
const express = require("express");
const router = express.Router();

const {
  upsertBook,
  createManualBook,
  getAllBooksForUser,
  getBookByIdForUser,
  updateBookStatus,
  deleteBook,
  addComment,
  getCommentsForBook,
} = require("../db");

// TEMPORARY USER HANDLER (no Supabase backend auth for now)
function getUserId(req) {
  return (req.user && req.user.id) || "demo-user";
}

// ------------------------------------------------------------
// SAVE BOOK FROM GOOGLE VOLUME
// ------------------------------------------------------------
router.post("/", (req, res) => {
  try {
    const volume = req.body;
    if (!volume || !volume.id) {
      return res.status(400).json({ error: "volume id required" });
    }

    const v = volume.volumeInfo || {};
    const userId = getUserId(req);

    const book = {
      id: volume.id + "::" + userId,
      user_id: userId,
      title: v.title || "Untitled",
      authors: (v.authors || []).join(", "),
      publisher: v.publisher || "",
      publishedDate: v.publishedDate || "",
      description: v.description || "",
      thumbnail:
        (v.imageLinks &&
          (v.imageLinks.thumbnail || v.imageLinks.smallThumbnail)) ||
        "",
      infoLink: v.infoLink || v.previewLink || "",
      status: "To Read",
      raw: JSON.stringify(volume),
    };

    upsertBook(book);
    return res.json({ ok: true, book });
  } catch (err) {
    console.error("DB error in POST /api/books:", err);
    return res.status(500).json({ error: "db error", message: err.message });
  }
});

// ------------------------------------------------------------
// MANUAL ADD BOOK
// ------------------------------------------------------------
router.post("/manual", (req, res) => {
  try {
    const body = req.body || {};
    if (!body.title) {
      return res.status(400).json({ error: "title required" });
    }

    const userId = getUserId(req);
    const id =
      body.id || "manual-" + Date.now().toString(36) + "-" + userId;

    const book = {
      id,
      user_id: userId,
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
    return res.status(500).json({ error: "db error", message: err.message });
  }
});

// ------------------------------------------------------------
// LIST ALL SAVED BOOKS
// ------------------------------------------------------------
router.get("/", (req, res) => {
  try {
    const rows = getAllBooksForUser(getUserId(req));
    return res.json(rows);
  } catch (err) {
    console.error("DB error in GET /api/books:", err);
    return res.status(500).json({ error: "db error", message: err.message });
  }
});

// ------------------------------------------------------------
// GET SINGLE BOOK
// ------------------------------------------------------------
router.get("/:id", (req, res) => {
  try {
    const row = getBookByIdForUser(req.params.id, getUserId(req));
    if (!row) return res.status(404).json({ error: "not found" });
    return res.json(row);
  } catch (err) {
    console.error("DB error in GET /api/books/:id:", err);
    return res.status(500).json({ error: "db error", message: err.message });
  }
});

// ------------------------------------------------------------
// UPDATE BOOK STATUS
// ------------------------------------------------------------
router.patch("/:id", (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body || {};
    const userId = getUserId(req);

    const existing = getBookByIdForUser(id, userId);
    if (!existing) return res.status(404).json({ error: "not found" });

    const newStatus = status || existing.status || "To Read";
    updateBookStatus(id, userId, newStatus);

    const updated = getBookByIdForUser(id, userId);
    return res.json({ ok: true, book: updated });
  } catch (err) {
    console.error("DB error in PATCH /api/books/:id:", err);
    return res.status(500).json({ error: "db error", message: err.message });
  }
});

// ------------------------------------------------------------
// DELETE BOOK
// ------------------------------------------------------------
router.delete("/:id", (req, res) => {
  try {
    const id = req.params.id;
    const userId = getUserId(req);

    const existing = getBookByIdForUser(id, userId);
    if (!existing) {
      return res.status(404).json({ error: "not found" });
    }

    deleteBook(id, userId);
    return res.json({ ok: true });
  } catch (err) {
    console.error("DB error in DELETE /api/books/:id:", err);
    return res.status(500).json({ error: "db error", message: err.message });
  }
});

// ------------------------------------------------------------
// GET COMMENTS FOR BOOK
// ------------------------------------------------------------
router.get("/:id/comments", (req, res) => {
  try {
    const id = req.params.id;
    const userId = getUserId(req);

    const existing = getBookByIdForUser(id, userId);
    if (!existing) return res.status(404).json({ error: "book not found" });

    const comments = getCommentsForBook(id, userId);
    return res.json(comments);
  } catch (err) {
    console.error("DB error in GET /api/books/:id/comments:", err);
    return res.status(500).json({ error: "db error", message: err.message });
  }
});

// ------------------------------------------------------------
// ADD COMMENT
// ------------------------------------------------------------
router.post("/:id/comments", (req, res) => {
  try {
    const id = req.params.id;
    const { text } = req.body || {};
    const userId = getUserId(req);

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "text required" });
    }

    const existing = getBookByIdForUser(id, userId);
    if (!existing) {
      return res.status(404).json({ error: "book not found" });
    }

    const comment = addComment(id, userId, text.trim());
    return res.json({ ok: true, comment });
  } catch (err) {
    console.error("DB error in POST /api/books/:id/comments:", err);
    return res.status(500).json({ error: "db error", message: err.message });
  }
});

// ------------------------------------------------------------
// DELETE COMMENT (FIXED VERSION)
// ------------------------------------------------------------
router.delete("/:id/comments/:commentId", (req, res) => {
  try {
    const bookId = req.params.id;
    const commentId = req.params.commentId;
    const userId = getUserId(req);  // << FIXED

    const existing = getBookByIdForUser(bookId, userId);
    if (!existing) {
      return res.status(404).json({ error: "book not found" });
    }

    const comments = getCommentsForBook(bookId, userId);
    const comment = comments.find((c) => c.id == commentId);

    if (!comment) {
      return res.status(404).json({ error: "comment not found" });
    }

    // delete comment
    const sqlite = require("../db").db;
    sqlite
      .prepare(
        "DELETE FROM comments WHERE id = ? AND book_id = ? AND user_id = ?"
      )
      .run(commentId, bookId, userId);

    return res.json({ ok: true });
  } catch (err) {
    console.error("DB error DELETE comment:", err);
    return res.status(500).json({ error: "db error", message: err.message });
  }
});

module.exports = router;
