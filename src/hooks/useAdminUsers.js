import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser as apiDeleteUser,
  changeUserPassword,
} from "../api/user.js";

export function useAdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      setUsers(await getUsers());
    } catch {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  const loadUserDetails = async (id) => {
    try {
      setLoading(true);
      const user = await getUserById(id);
      const fullUser = {
        ...user,
        profile: user.profile || { bio: "", favourites: [], playlists: [] },
        activity: user.activity || [],
        createdAt: user.createdAt || "N/A",
        lastLogin: user.lastLogin || "N/A",
        suspended: user.suspended ?? false,
      };
      setSelectedUser(fullUser);
      return fullUser;
    } catch {
      setError("Failed to load user details.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async (id) => {
    await loadUsers();
    if (selectedUser?.id === id) await loadUserDetails(id);
  };

  // update a user field — always passes actorId for audit logging
  const updateUserField = async (id, updates) => {
    try {
      await updateUser(id, { ...updates, actorId: currentUser?.id });
      await refreshUser(id);
    } catch {
      setError("Failed to update user.");
    }
  };

  const changePassword = async (id, newPassword) => {
    try {
      await updateUser(id, { password: newPassword });
      if (selectedUser?.id === id) await loadUserDetails(id);
    } catch {
      setError("Failed to change password.");
    }
  };

  // toggle suspend — passes actorId for audit logging
  const toggleSuspend = async (id, currentStatus) => {
    try {
      await updateUser(id, {
        suspended: !currentStatus,
        actorId: currentUser?.id,
      });
      await refreshUser(id);
    } catch {
      setError("Failed to update suspension status.");
    }
  };

  const deleteUser = async (id) => {
    try {
      await apiDeleteUser(id);
      await loadUsers();
      if (selectedUser?.id === id) setSelectedUser(null);
    } catch {
      setError("Failed to delete user.");
    }
  };

  return {
    users,
    selectedUser,
    loading,
    error,
    loadUsers,
    loadUserDetails,
    updateUserField,
    changePassword,
    toggleSuspend,
    deleteUser,
    setSelectedUser,
  };
}
