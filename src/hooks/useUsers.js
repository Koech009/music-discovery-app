import { useState, useEffect } from "react";
import {
  getUsers,
  getPendingAdmins,
  deleteUserAdmin,
  updateUser,
  promoteUser as apiPromoteUser,
  toggleSuspendUser,
  approveAdmin as apiApproveAdmin,
  rejectAdmin as apiRejectAdmin,
} from "../api/user.js";

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchPendingAdmins();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getUsers();
      setUsers(data);
    } catch {
      setError("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingAdmins = async () => {
    try {
      const data = await getPendingAdmins();
      setPendingAdmins(data);
    } catch {
      setError("Failed to fetch pending admins.");
    }
  };

  const deleteUser = async (id) => {
    try {
      await deleteUserAdmin(id); // ← admin delete endpoint
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      setError("Failed to delete user.");
    }
  };

  const changeRole = async (id, newRole) => {
    try {
      await updateUser(id, { role: newRole }); // ← removed actorId, JWT handles it
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
      );
    } catch {
      setError("Failed to change user role.");
    }
  };

  const promoteUser = async (id) => {
    try {
      const res = await apiPromoteUser(id);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, role: "admin", approved: false } : u
        )
      );
      setPendingAdmins((prev) => [...prev, res.user ?? res]);
    } catch {
      setError("Failed to promote user.");
    }
  };

  const suspendUser = async (id) => {
    try {
      await toggleSuspendUser(id); // ← backend toggles, no need to track currentStatus
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, suspended: !u.suspended } : u))
      );
    } catch {
      setError("Failed to suspend user.");
    }
  };

  const approveAdmin = async (id) => {
    try {
      await apiApproveAdmin(id);
      setPendingAdmins((prev) => prev.filter((u) => u.id !== id));
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, approved: true } : u))
      );
    } catch {
      setError("Failed to approve admin.");
    }
  };

  const rejectAdmin = async (id) => {
    try {
      await apiRejectAdmin(id);
      setPendingAdmins((prev) => prev.filter((u) => u.id !== id));
      setUsers((prev) => prev.filter((u) => u.id !== id));
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