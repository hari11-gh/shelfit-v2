// backend/routes/auth.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const {
  createUser,
  getUserByEmail,
  getUserById,
  setUserVerified,
  createVerificationToken,
  getVerificationToken,
  deleteVerificationToken,
} = require("../db");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || "http://localhost:5173";

// email transport (optional real email)
function getTransport() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ error: "email and password required" });

    const existing = getUserByEmail(email.toLowerCase());
    if (existing) return res.status(400).json({ error: "email already in use" });

    const id = "u_" + Date.now().toString(36) + Math.random().toString(36).slice(2);
    const hash = await bcrypt.hash(password, 10);

    const user = createUser({
      id,
      email: email.toLowerCase(),
      password_hash: hash,
    });

    const token =
      "v_" + Date.now().toString(36) + Math.random().toString(36).slice(2);
    createVerificationToken(user.id, token);

    const verifyUrl = `${FRONTEND_BASE_URL}/verify?token=${token}`;

    // Try sending email; if SMTP not configured, just log
    const transport = getTransport();
    if (transport) {
      const from = process.env.EMAIL_FROM || "ShelfIt <no-reply@shelfit.app>";
      await transport.sendMail({
        from,
        to: user.email,
        subject: "Verify your ShelfIt account",
        text: `Hi! Click to verify your ShelfIt account: ${verifyUrl}`,
      });
    } else {
      console.log("=== VERIFICATION LINK (dev only) ===");
      console.log(verifyUrl);
      console.log("====================================");
    }

    return res.json({ ok: true, message: "signup ok, verify email", verifyUrlDev: verifyUrl });
  } catch (err) {
    console.error("signup error", err);
    return res.status(500).json({ error: "server error", message: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ error: "email and password required" });

    const user = getUserByEmail(email.toLowerCase());
    if (!user) return res.status(400).json({ error: "invalid credentials" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(400).json({ error: "invalid credentials" });

    if (!user.verified) {
      return res.status(403).json({ error: "email not verified" });
    }

    const token = jwt.sign({ sub: user.id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({
      ok: true,
      token,
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    console.error("login error", err);
    return res.status(500).json({ error: "server error", message: err.message });
  }
});

router.get("/verify", (req, res) => {
  try {
    const token = req.query.token;
    if (!token) return res.status(400).json({ error: "token required" });

    const record = getVerificationToken(token);
    if (!record) return res.status(400).json({ error: "invalid token" });

    setUserVerified(record.user_id);
    deleteVerificationToken(token);

    const user = getUserById(record.user_id);
    return res.json({ ok: true, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error("verify error", err);
    return res.status(500).json({ error: "server error", message: err.message });
  }
});

module.exports = router;
