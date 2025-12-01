// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { init } = require("./db");

const authRouter = require("./routes/auth");
const booksRouter = require("./routes/books");

const app = express();
const PORT = process.env.PORT || 4000;

// 🔐 CORS: allow localhost & Netlify
const corsOptions = {
  origin: [
    "http://localhost:5173", // Vite dev
    "https://velvety-alfajores-8621a7.netlify.app", // your Netlify URL
  ],
};
app.use(cors(corsOptions));

app.use(express.json());

// init DB
init();

app.get("/", (req, res) => {
  res.json({ ok: true, message: "ShelfIt V2 backend running" });
});

// auth routes (email/password + verify)
app.use("/api/auth", authRouter);

// books routes (no supabase auth backend now, just demo-user logic)
app.use("/api/books", booksRouter);

app.listen(PORT, () => {
  console.log(`ShelfIt V2 API listening on port ${PORT}`);
});
