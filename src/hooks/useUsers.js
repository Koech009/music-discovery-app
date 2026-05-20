import { useState, useEffect, useMemo } from "react";
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

const PER_PAGE = 10;

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pending admins pagination
  const [pendingPage, setPendingPage] = useState(1);

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
      await deleteUserAdmin(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      setError("Failed to delete user.");
    }
  };

  const changeRole = async (id, newRole) => {
    try {
      await updateUser(id, { role: newRole });
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
      await toggleSuspendUser(id);
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

  // Pending admins pagination 

  const pendingTotalPages = Math.max(1, Math.ceil(pendingAdmins.length / PER_PAGE));

  const paginatedPendingAdmins = useMemo(
    () => pendingAdmins.slice((pendingPage - 1) * PER_PAGE, pendingPage * PER_PAGE),
    [pendingAdmins, pendingPage]
  );

  const pendingMetadata = {
    current_page: pendingPage,
    total_pages: pendingTotalPages,
    has_prev: pendingPage > 1,
    has_next: pendingPage < pendingTotalPages,
    total: pendingAdmins.length,
  };

  const goToPendingPage = (p) => {
    if (p >= 1 && p <= pendingTotalPages) setPendingPage(p);
  };

  return {
    users,
    pendingAdmins: paginatedPendingAdmins,
    pendingMetadata,
    perPage: PER_PAGE,
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
    goToPendingPage,
  };
}