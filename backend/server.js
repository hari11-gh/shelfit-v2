require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { init } = require("./db");

const authRouter = require("./routes/auth");
const booksRouter = require("./routes/books");

const app = express();
const PORT = process.env.PORT || 4000;

// ✅ Correct CORS configuration for Render + Netlify
app.use(cors({
  origin: [
    "http://localhost:5173",          // Vite local
    "https://shelfit-v2.netlify.app"  // LIVE FRONTEND
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// ✅ Ensure OPTIONS preflight requests are handled
app.options("*", cors());

app.use(express.json());

// Init SQLite DB
init();

app.get("/", (req, res) => {
  res.json({ ok: true, message: "ShelfIt V2 backend running" });
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/books", booksRouter);

// Start server
app.listen(PORT, () => {
  console.log(`ShelfIt V2 API listening on port ${PORT}`);
});
