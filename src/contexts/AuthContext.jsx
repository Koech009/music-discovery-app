import { createContext, useContext, useState } from "react";
import axios from "axios";

const API_BASE = "/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("tunely_user")) || null;
    } catch {
      return null;
    }
  });

  // Login — calls Flask auth endpoint
  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        email,
        password,
      });

      const loggedInUser = res.data;
      setUser(loggedInUser);
      localStorage.setItem("tunely_user", JSON.stringify(loggedInUser));
      return loggedInUser;
    } catch (err) {
      if (err.response?.status === 401) {
        throw new Error("Invalid email or password.");
      }
      if (err.response?.status === 403) {
        throw new Error("Your account has been suspended.");
      }
      throw new Error("Cannot connect to server. Please try again.");
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("tunely_user");
  };

  // Role check
  const hasRole = (role) => user?.role === role;

  return (
    <AuthContext.Provider value={{ user, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
