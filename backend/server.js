// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { init } = require("./db");
const booksRouter = require("./routes/books");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

init();

app.get("/", (req, res) => {
  res.json({ ok: true, message: "ShelfIt V2 backend running" });
});

app.use("/api/books", booksRouter);

app.listen(PORT, () => {
  console.log(`ShelfIt V2 API listening on port ${PORT}`);
});
