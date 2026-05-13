import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://localhost:3002";

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
      const user = users.find((u) => u.id === id);
      if (!user) return;
      const updated = { ...user, role: "admin" };
      await axios.put(`${API_BASE}/users/${id}`, updated);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } catch (err) {
      setError("Failed to promote user.");
    }
  };

  return { users, loading, error, fetchUsers, deleteUser, promoteUser };
}
