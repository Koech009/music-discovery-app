import { createContext, useContext, useState, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore user from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch {
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  }, []);

  // Called after successful loginUser() / signupUser() API call
  const login = (userData, accessToken, refreshToken) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
    setUser(userData);
  };

  // Blocklist token server-side then clear locally
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // clear locally even if server call fails
    } finally {
      localStorage.clear();
      setUser(null);
    }
  };

  // Add this function before hasRole
const updateUserContext = (updatedUser) => {
  setUser(updatedUser);
  localStorage.setItem("user", JSON.stringify(updatedUser));
};


  const hasRole = (role) => user?.role === role;
  const isAdmin = () => user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUserContext, hasRole, isAdmin }}>

      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}