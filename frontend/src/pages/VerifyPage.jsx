import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import CosmicFooter from "../components/CosmicFooter";

export default function VerifyPage() {
  const { API } = useAuth();
  const location = useLocation();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }

    async function run() {
      try {
        const res = await fetch(
          `${API}/api/auth/verify?token=${encodeURIComponent(token)}`
        );
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setStatus("error");
          setMessage(data.error || "Verification failed.");
        } else {
          setStatus("success");
          setMessage("Your email has been verified. You can now log in!");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Server error while verifying.");
      }
    }

    run();
  }, [API, location.search]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center animate-fadeIn">
      <div className="max-w-md w-full glass-panel rounded-2xl p-8 text-center animate-float">
        {status === "verifying" && (
          <>
            <h1 className="text-xl font-semibold mb-2">
              Verifying your account...
            </h1>
            <p className="text-sm text-slate-300">
              Hang tight while we confirm your email.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <h1 className="text-2xl font-semibold mb-2 text-emerald-300">
              Email verified ✅
            </h1>
            <p className="text-sm text-slate-300 mb-4">{message}</p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-full btn-cosmic px-5 py-2 text-sm font-medium shadow-lg shadow-violet-800/60"
            >
              Go to login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-2xl font-semibold mb-2 text-rose-300">
              Verification failed
            </h1>
            <p className="text-sm text-slate-300 mb-4">{message}</p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-full bg-slate-800 px-5 py-2 text-sm font-medium hover:bg-slate-700"
            >
              Back to login
            </Link>
          </>
        )}
      </div>

      <CosmicFooter />
    </div>
  );
}
