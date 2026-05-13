import { useState } from "react";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser as apiDeleteUser,
} from "../api/user.js";
//custom hook that provides admin user management functionality. It allows fetching all users, fetching details of a single user, updating user fields, changing passwords, toggling suspension status, and deleting users. It also manages loading and error states for these operations.
export function useAdminUsers() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  //fetch all users from the API
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
  //load details of a single user by id and handle cases where certain fields may be missing by providing default values. It also manages loading and error states for this operation.
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
  //reloads  all the users
  const refreshUser = async (id) => {
    await loadUsers();
    if (selectedUser?.id === id) await loadUserDetails(id);
  };
  //update  a user details
  const updateUserField = async (id, updates) => {
    try {
      await updateUser(id, updates);
      await refreshUser(id);
    } catch {
      setError("Failed to update user.");
    }
  };
  //change a users password
  const changePassword = async (id, newPassword) => {
    try {
      await updateUser(id, { password: newPassword });
      if (selectedUser?.id === id) await loadUserDetails(id);
    } catch {
      setError("Failed to change password.");
    }
  };
  //flip the suspended status of a user (suspend if currently active, or unsuspend if currently suspended)
  const toggleSuspend = async (id, currentStatus) => {
    try {
      await updateUser(id, { suspended: !currentStatus });
      await refreshUser(id);
    } catch {
      setError("Failed to update suspension status.");
    }
  };
  //delete a user by id and refresh the user list. If the deleted user is currently selected, it also clears the selected user state.
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
