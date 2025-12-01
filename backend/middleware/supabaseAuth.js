// backend/middleware/supabaseAuth.js
require("dotenv").config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

if (!SUPABASE_URL || !SUPABASE_JWT_SECRET) {
  console.error("[supabaseAuth] Missing env vars");
}

async function supabaseAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    // Dynamically import JOSE (CommonJS compatible)
    const { jwtVerify } = await import("jose");

    // Validate token
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(SUPABASE_JWT_SECRET)
    );

    // Attach user to request
    req.user = {
      id: payload.sub,
      email: payload.email,
    };

    return next();
  } catch (err) {
    console.error("[supabaseAuth] JWT verify failed:", err.message);
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = supabaseAuth;
