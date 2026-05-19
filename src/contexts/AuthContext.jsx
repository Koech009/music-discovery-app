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

const [token, setToken] = useState(() => {
  return localStorage.getItem("token") || null;
});

  // Login — calls Flask auth endpoint
  const login = async (email, password) => {
  try {
    const res = await axios.post(`${API_BASE}/auth/login`, {
      email,
      password,
    });

    const { user, token } = res.data;
    setUser(user);
    setToken(token);
    localStorage.setItem("tunely_user", JSON.stringify(user));
    localStorage.setItem("token", token);
    return user;
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
    setToken(null);
    localStorage.removeItem("tunely_user");
    localStorage.removeItem("token");
  };

  // Role check
  const hasRole = (role) => user?.role === role;

  return (
<AuthContext.Provider value={{ user, token, login, logout, hasRole }}>
  {children}
</AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
