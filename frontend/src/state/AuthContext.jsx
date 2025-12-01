import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "../lib/supabaseClient";

const API = import.meta.env.VITE_API_BASE || "https://shelfit-backend.onrender.com";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load session on mount
  useEffect(() => {
    let ignore = false;

    async function loadSession() {
      setLoading(true);
      const { data } = await supabase.auth.getSession();

      if (!ignore) {
        setSession(data.session || null);
        setUser(data.session?.user || null);
        setLoading(false);
      }
    }

    loadSession();

    // Subscribe to changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user || null);
    });

    return () => {
      ignore = true;
      subscription.unsubscribe();
    };
  }, []);

  async function signup(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw new Error(error.message);
    return data;
  }

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new Error(error.message);

    setSession(data.session);
    setUser(data.user || null);
    return data;
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }

  const token = session?.access_token || null;

  return (
    <AuthContext.Provider
      value={{
        API,
        user,
        session,
        token,
        signup,
        login,
        logout,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
