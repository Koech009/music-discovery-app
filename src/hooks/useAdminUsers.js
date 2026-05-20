import { useState } from "react";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUserAdmin,
  changeUserPassword,
  toggleSuspendUser,
} from "../api/user.js";

export function useAdminUsers() {
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

  const updateUserField = async (id, updates) => {
    try {
      await updateUser(id, updates); // actorId removed — JWT handles it
      await refreshUser(id);
    } catch {
      setError("Failed to update user.");
    }
  };


  const changePassword = async (id, newPassword) => {
    try {
      await changeUserPassword(id, newPassword);
      if (selectedUser?.id === id) await loadUserDetails(id);
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || "Unknown error";
      console.error("changePassword error:", msg, err?.response);
      setError(msg);
      throw err;
    }
  };

  const toggleSuspend = async (id) => {
    try {
      await toggleSuspendUser(id); // backend toggles — no currentStatus needed
      await refreshUser(id);
    } catch {
      setError("Failed to update suspension status.");
    }
  };

  const deleteUser = async (id) => {
    try {
      await deleteUserAdmin(id); // uses admin delete endpoint
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