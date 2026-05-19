import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const API_BASE = `${baseURL}/api`;

export function useUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchPendingAdmins();
  }, []);

  // --- Fetch all users ---
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/users`);
      setUsers(res.data);
    } catch {
      setError("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  // --- Fetch pending admins ---
  const fetchPendingAdmins = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/admins/pending`);
      setPendingAdmins(res.data);
    } catch {
      setError("Failed to fetch pending admins.");
    }
  };

  // --- Delete user ---
  const deleteUser = async (id) => {
    try {
      await axios.delete(`${API_BASE}/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      setError("Failed to delete user.");
    }
  };

  // --- Change user role ---
  const changeRole = async (id, newRole) => {
    try {
      const res = await axios.patch(`${API_BASE}/users/${id}`, {
        role: newRole,
        actorId: currentUser.id,
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: newRole } : u)),
      );
      return res.data;
    } catch {
      setError("Failed to change user role.");
    }
  };

  // --- Promote user to admin (pending approval) ---
  const promoteUser = async (id) => {
    try {
      const res = await axios.patch(`${API_BASE}/admin/users/${id}/promote`);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, role: "admin", approved: false } : u,
        ),
      );
      setPendingAdmins((prev) => [...prev, res.data]);
    } catch {
      setError("Failed to promote user.");
    }
  };

  // --- Suspend/unsuspend user ---
  const suspendUser = async (id) => {
    try {
      const res = await axios.patch(`${API_BASE}/admin/users/${id}/suspend`);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, suspended: !u.suspended } : u)),
      );
      return res.data;
    } catch {
      setError("Failed to suspend user.");
    }
  };

  // --- Approve pending admin ---
  const approveAdmin = async (id) => {
    try {
      const res = await axios.patch(`${API_BASE}/admin/admins/${id}/approve`);
      setPendingAdmins((prev) => prev.filter((u) => u.id !== id));
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, approved: true } : u)),
      );
      return res.data;
    } catch {
      setError("Failed to approve admin.");
    }
  };

  // --- Reject/remove pending admin ---
  const rejectAdmin = async (id) => {
    try {
      const res = await axios.delete(`${API_BASE}/admin/admins/${id}/reject`);
      setPendingAdmins((prev) => prev.filter((u) => u.id !== id));
      setUsers((prev) => prev.filter((u) => u.id !== id));
      return res.data;
    } catch {
      setError("Failed to reject admin.");
    }
  };

  return {
    users,
    pendingAdmins,
    loading,
    error,
    fetchUsers,
    fetchPendingAdmins,
    deleteUser,
    changeRole,
    promoteUser,
    suspendUser,
    approveAdmin,
    rejectAdmin,
  };
}
