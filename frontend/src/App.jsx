import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./state/AuthContext";
import InstallPwaButton from "./components/InstallPwaButton";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import VerifyPage from "./pages/VerifyPage";
import ShelfPage from "./pages/ShelfPage";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-200">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default function App() {
  return (
    <div className="min-h-screen text-slate-50">
      <Routes>
        {/* default route */}
        <Route path="/" element={<Navigate to="/app" replace />} />

        {/* auth pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify" element={<VerifyPage />} />

        {/* protected app */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <ShelfPage />
            </ProtectedRoute>
          }
        />

        {/* catch-all */}
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>

      {/* PWA install button */}
      <InstallPwaButton />
    </div>
  );
}
