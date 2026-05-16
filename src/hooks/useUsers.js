import { useState, useEffect } from "react";
import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const API_BASE = `${baseURL}/api`;

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/users`);
      setUsers(res.data);
    } catch (err) {
      setError("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    try {
      await axios.delete(`${API_BASE}/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setError("Failed to delete user.");
    }
  };

  const promoteUser = async (id) => {
    try {
      await axios.patch(`${API_BASE}/admin/users/${id}/promote`);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: "admin" } : u)),
      );
    } catch (err) {
      setError("Failed to promote user.");
    }
  };

  const suspendUser = async (id) => {
    try {
      await axios.patch(`${API_BASE}/admin/users/${id}/suspend`);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, suspended: !u.suspended } : u)),
      );
    } catch (err) {
      setError("Failed to suspend user.");
    }
  };

  return {
    users,
    loading,
    error,
    fetchUsers,
    deleteUser,
    promoteUser,
    suspendUser,
  };
}
