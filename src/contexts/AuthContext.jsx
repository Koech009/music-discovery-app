import { createContext, useContext, useState } from "react";
import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const API_BASE = `${baseURL}/api`;

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("tunely_user")) || null;
    } catch {
      return null;
    }
  });

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        email,
        password,
      });

      const loggedInUser = res.data;

      // ✅ Only block admins if not approved
      if (loggedInUser.role === "admin" && !loggedInUser.approved) {
        throw new Error(
          "Your admin account is pending approval. Contact an existing admin.",
        );
      }

      setUser(loggedInUser);
      localStorage.setItem("tunely_user", JSON.stringify(loggedInUser));
      return loggedInUser;
    } catch (err) {
      if (err.response?.status === 401) {
        throw new Error("Invalid email or password.");
      }
      if (err.response?.status === 403) {
        const message = err.response?.data?.error;
        if (message === "Account is suspended") {
          throw new Error("Your account has been suspended. Contact support.");
        }
        throw new Error(message || "Access denied.");
      }
      throw new Error("Cannot connect to server. Please try again.");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("tunely_user");
  };

  const hasRole = (role) => user?.role === role;

  return (
    <AuthContext.Provider value={{ user, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
