import { useState, useMemo } from "react";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUserAdmin,
  changeUserPassword,
  toggleSuspendUser,
} from "../api/user.js";
import { getMessages, markAsRead, deleteMessage } from "../api/message.js";

const PER_PAGE = 10;

export function useAdminUsers() {
  // ── Users state ──────────────────────────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [search, setSearch] = useState("");

  // ── Messages state ───────────────────────────────────────────────────────
  const [messages, setMessages] = useState([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [msgError, setMsgError] = useState("");
  const [msgPage, setMsgPage] = useState(1);

  // ── User actions ─────────────────────────────────────────────────────────
  const loadUsers = async () => {
    try {
      setUserLoading(true);
      setUsers(await getUsers());
    } catch {
      setUserError("Failed to load users.");
    } finally {
      setUserLoading(false);
    }
  };

  const loadUserDetails = async (id) => {
    try {
      setUserLoading(true);
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
      setUserError("Failed to load user details.");
      return null;
    } finally {
      setUserLoading(false);
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
      setUserError("Failed to update user.");
    }
  };

  const changePassword = async (id, newPassword) => {
    try {
      await changeUserPassword(id, newPassword);
      if (selectedUser?.id === id) await loadUserDetails(id);
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || "Unknown error";
      setUserError(msg);
      throw err;
    }
  };

  const toggleSuspend = async (id) => {
    try {
      await toggleSuspendUser(id);
      await refreshUser(id);
    } catch {
      setUserError("Failed to update suspension status.");
    }
  };

  const deleteUser = async (id) => {
    try {
      await deleteUserAdmin(id);
      await loadUsers();
      if (selectedUser?.id === id) setSelectedUser(null);
    } catch {
      setUserError("Failed to delete user.");
    }
  };

  // ── Message actions ──────────────────────────────────────────────────────
  const loadMessages = async () => {
    try {
      setMsgLoading(true);
      setMsgError("");
      setMessages(await getMessages());
    } catch {
      setMsgError("Failed to load messages.");
    } finally {
      setMsgLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await markAsRead(id);
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, is_read: true } : m)),
      );
    } catch {
      setMsgError("Failed to mark message as read.");
    }
  };

  const removeMessage = async (id) => {
    try {
      await deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch {
      setMsgError("Failed to delete message.");
    }
  };

  // ── User pagination ───────────────────────────────────────────────────────
  const filtered = useMemo(
    () =>
      users.filter((u) =>
        u.username?.toLowerCase().includes(search.toLowerCase()),
      ),
    [users, search],
  );

  const userTotalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginatedUsers = useMemo(
    () => filtered.slice((userPage - 1) * PER_PAGE, userPage * PER_PAGE),
    [filtered, userPage],
  );
  const userMetadata = {
    current_page: userPage,
    total_pages: userTotalPages,
    has_prev: userPage > 1,
    has_next: userPage < userTotalPages,
    total: filtered.length,
  };
  const goToUserPage = (p) => {
    if (p >= 1 && p <= userTotalPages) setUserPage(p);
  };
  const handleSearch = (val) => {
    setSearch(val);
    setUserPage(1);
  };

  // ── Message pagination ────────────────────────────────────────────────────
  const msgTotalPages = Math.max(1, Math.ceil(messages.length / PER_PAGE));
  const paginatedMessages = useMemo(
    () => messages.slice((msgPage - 1) * PER_PAGE, msgPage * PER_PAGE),
    [messages, msgPage],
  );
  const msgMetadata = {
    current_page: msgPage,
    total_pages: msgTotalPages,
    has_prev: msgPage > 1,
    has_next: msgPage < msgTotalPages,
    total: messages.length,
  };
  const goToMsgPage = (p) => {
    if (p >= 1 && p <= msgTotalPages) setMsgPage(p);
  };

  return {
    // Users
    users: paginatedUsers,
    allUsers: users,
    selectedUser,
    loading: userLoading,
    error: userError,
    search,
    metadata: userMetadata,
    perPage: PER_PAGE,
    loadUsers,
    loadUserDetails,
    updateUserField,
    changePassword,
    toggleSuspend,
    deleteUser,
    setSelectedUser,
    goToPage: goToUserPage,
    handleSearch,

    // Messages
    messages: paginatedMessages,
    allMessages: messages,
    msgLoading,
    msgError,
    msgMetadata,
    loadMessages,
    markRead,
    removeMessage,
    goToMsgPage,
  };
}
