import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import CosmicFooter from "../components/CosmicFooter";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from?.pathname || "/app";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      nav(from, { replace: true });
    } catch (ex) {
      setErr(ex.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center animate-fadeIn">
      {/* Login Card */}
      <div className="max-w-md w-full glass-panel p-8 rounded-2xl shadow-xl animate-float">
        <h1 className="text-2xl font-semibold mb-2 bg-gradient-to-r from-purple-300 to-indigo-300 text-transparent bg-clip-text">
          Welcome back to ShelfIt
        </h1>

        <p className="text-sm text-slate-300 mb-6">
          Log in to your cosmic bookshelf.
        </p>

        {err && (
          <div className="mb-4 text-sm text-rose-300 bg-rose-900/40 border border-rose-500/40 rounded-lg px-3 py-2">
            {err}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full cosmic-input mt-1"
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full cosmic-input mt-1"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-cosmic py-2.5 mt-2 rounded-full shadow-lg shadow-purple-800/60 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-xs text-slate-400 text-center">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-indigo-300 underline">
            Sign up
          </Link>
        </p>
      </div>

      <CosmicFooter />
    </div>
  );
}
