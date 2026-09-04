// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, Provider, githubProvider } from "../lib/firebase";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [localuser,setLocaluser]= useState(null)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Google Login
  const googleSignIn = async () => {
    const result = await signInWithPopup(auth, Provider);
    return result;
  };

  // GitHub Login
  const githubSignIn = async () => {
    const result = await signInWithPopup(auth, githubProvider);
    return result;
  };

  // Logout
  const logout = () => signOut(auth);

  return (
    <AuthCtx.Provider
      value={{ user, loading, googleSignIn, githubSignIn, logout ,localuser,setLocaluser }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);