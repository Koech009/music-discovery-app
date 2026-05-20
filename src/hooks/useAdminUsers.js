import { useState, useMemo } from "react";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUserAdmin,
  changeUserPassword,
  toggleSuspendUser,
} from "../api/user.js";

const PER_PAGE = 10;

export function useAdminUsers() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

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
      await updateUser(id, updates);
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
      setError(msg);
      throw err;
    }
  };

  const toggleSuspend = async (id) => {
    try {
      await toggleSuspendUser(id);
      await refreshUser(id);
    } catch {
      setError("Failed to update suspension status.");
    }
  };

  const deleteUser = async (id) => {
    try {
      await deleteUserAdmin(id);
      await loadUsers();
      if (selectedUser?.id === id) setSelectedUser(null);
    } catch {
      setError("Failed to delete user.");
    }
  };

  //  Pagination 

  // Filter first, then paginate
  const filtered = useMemo(
    () =>
      users.filter((u) =>
        u.username?.toLowerCase().includes(search.toLowerCase())
      ),
    [users, search]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));

  const paginated = useMemo(
    () => filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    [filtered, page]
  );

  const metadata = {
    current_page: page,
    total_pages: totalPages,
    has_prev: page > 1,
    has_next: page < totalPages,
    total: filtered.length,
  };

  const goToPage = (p) => {
    if (p >= 1 && p <= totalPages) setPage(p);
  };

  // Reset to page 1 when search changes
  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

  return {
    users: paginated,      
    allUsers: users,       
    selectedUser,
    loading,
    error,
    search,
    metadata,
    perPage: PER_PAGE,
    loadUsers,
    loadUserDetails,
    updateUserField,
    changePassword,
    toggleSuspend,
    deleteUser,
    setSelectedUser,
    goToPage,
    handleSearch,
  };
}