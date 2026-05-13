//backbone of authentication for the app. it manages login,logout and role checks
import { createContext, useContext, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:3002";
//create a context to share auth state across the app
const AuthContext = createContext();
//wraps the app with auth context provider and manages user state, login, logout and role checks. It also persists the user in localStorage to maintain login state across page refreshes.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("tunely_user")) || null;
    } catch {
      return null;
    }
  });
  //login function that checks the provided email and password
  const login = async (email, password) => {
    let users;

    try {
      const res = await axios.get(`${API_BASE}/users`);
      users = res.data;
    } catch {
      throw new Error("Cannot connect to server. Please try again.");
    }

    if (!Array.isArray(users)) {
      throw new Error("Unexpected server response. Please try again.");
    }

    const found = users.find(
      (u) =>
        u.email?.toLowerCase() === email.toLowerCase() &&
        u.password === password,
    );

    if (!found) {
      throw new Error("Invalid email or password.");
    }

    //  Update lastLogin each time user logs in
    const updatedUser = { ...found, lastLogin: new Date().toISOString() };
    try {
      await axios.put(`${API_BASE}/users/${found.id}`, updatedUser);
    } catch {
      console.warn("Failed to update lastLogin in server, continuing anyway.");
    }

    setUser(updatedUser);
    localStorage.setItem("tunely_user", JSON.stringify(updatedUser));
    return updatedUser;
  };
  //clear user state and localStorage on logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("tunely_user");
  };
  //check if the logged-in user has a specific role (e.g. "admin") for role-based access control
  const hasRole = (role) => user?.role === role;
  //make user, login, logout and hasRole available to all child components through the AuthContext provider
  return (
    <AuthContext.Provider value={{ user, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
