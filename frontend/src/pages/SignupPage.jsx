import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import CosmicFooter from "../components/CosmicFooter";

export default function SignupPage() {
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setInfo("");
    setLoading(true);
    try {
      const data = await signup(email.trim(), password);
      setInfo("Account created! Check your email for verification.");
      if (data.verifyUrlDev) {
        setInfo((p) => p + "\n\nDeveloper Verify:\n" + data.verifyUrlDev);
      }
    } catch (ex) {
      setErr(ex.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center animate-fadeIn">
      <div className="max-w-md w-full glass-panel p-8 rounded-2xl animate-float shadow-xl">
        <h1 className="text-2xl font-semibold mb-2 bg-gradient-to-r from-purple-300 to-indigo-300 text-transparent bg-clip-text">
          Create your ShelfIt account
        </h1>

        <p className="text-sm text-slate-300 mb-6">
          Your cosmic shelf awaits.
        </p>

        {err && (
          <div className="text-sm text-rose-300 bg-rose-900/40 border border-rose-500/40 rounded-lg px-3 py-2 mb-4 whitespace-pre-wrap">
            {err}
          </div>
        )}

        {info && (
          <div className="text-xs text-emerald-200 bg-emerald-900/30 border border-emerald-500/40 rounded-lg px-3 py-2 mb-4 whitespace-pre-wrap">
            {info}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              className="w-full cosmic-input mt-1"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-cosmic py-2.5 mt-2 rounded-full shadow-lg shadow-purple-800/60 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Signing up..." : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-xs text-slate-400 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-300 underline">
            Log in
          </Link>
        </p>
      </div>

      <CosmicFooter />
    </div>
  );
}
