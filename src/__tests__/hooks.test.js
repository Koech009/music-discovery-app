import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

// ─────────────────────────────────────────────
// HOOK IMPORTS
// ─────────────────────────────────────────────
import useDeezerSearch from "../hooks/useDeezerSearch";
import useYoutubeVideo from "../hooks/useYoutubeVideo";
import useLyrics from "../hooks/useLyrics";
import useAuditLogs from "../hooks/useAuditLogs";
import useMessage from "../hooks/useMessage";
import { useSignup } from "../hooks/useSignup";
import { useUsers } from "../hooks/useUsers";
import { useAdminUsers } from "../hooks/useAdminUsers";
import { usePlaylists } from "../hooks/usePlaylists";
import useFavorites from "../hooks/useFavourites";

// ─────────────────────────────────────────────
// API MOCKS
// ─────────────────────────────────────────────
import * as deezerApi from "../api/deezer";
import * as youtubeApi from "../api/youtube";
import * as lyricsApi from "../api/lyrics";

vi.mock("../api/auditlogs", () => ({
  getAuditLogs: vi.fn(),
}));
vi.mock("../api/message", () => ({
  addMessage: vi.fn(),
  getMessages: vi.fn(),
  markAsRead: vi.fn(),
  deleteMessage: vi.fn(),
}));
vi.mock("../api/user.js", () => ({
  signupUser: vi.fn(),
  getUsers: vi.fn(),
  getPendingAdmins: vi.fn(),
  deleteUserAdmin: vi.fn(),
  updateUser: vi.fn(),
  promoteUser: vi.fn(),
  toggleSuspendUser: vi.fn(),
  approveAdmin: vi.fn(),
  rejectAdmin: vi.fn(),
  getUserById: vi.fn(),
  changeUserPassword: vi.fn(),
}));
vi.mock("../api/playlists.js", () => ({
  getPlaylists: vi.fn(),
  createPlaylist: vi.fn(),
  addSongToPlaylist: vi.fn(),
  removeSongFromPlaylist: vi.fn(),
  renamePlaylist: vi.fn(),
  updatePlaylistDescription: vi.fn(),
  deletePlaylist: vi.fn(),
}));
vi.mock("../api/favourites", () => ({
  getFavorites: vi.fn(),
  addFavorite: vi.fn(),
  removeFavorite: vi.fn(),
  fetchGenreForSong: vi.fn(),
}));

// ─────────────────────────────────────────────
// AUTH CONTEXT MOCK
// ─────────────────────────────────────────────
vi.mock("../contexts/AuthContext.jsx", () => ({
  useAuth: () => ({
    user: { id: "user-1" },
    login: vi.fn(),
  }),
}));

import { getAuditLogs } from "../api/auditlogs";
import {
  addMessage,
  getMessages,
  markAsRead,
  deleteMessage,
} from "../api/message";
import {
  signupUser,
  getUsers,
  getPendingAdmins,
  deleteUserAdmin,
  updateUser,
  promoteUser as apiPromoteUser,
  toggleSuspendUser,
  approveAdmin as apiApproveAdmin,
  rejectAdmin as apiRejectAdmin,
  getUserById,
  changeUserPassword,
} from "../api/user.js";
import * as playlistAPI from "../api/playlists.js";
import {
  getFavorites,
  addFavorite as apiAddFavorite,
  removeFavorite as apiRemoveFavorite,
  fetchGenreForSong,
} from "../api/favourites";

beforeEach(() => vi.clearAllMocks());

// ─────────────────────────────────────────────
// useDeezerSearch
// ─────────────────────────────────────────────

describe("useDeezerSearch", () => {
  it("starts with empty results, no loading, no error", () => {
    const { result } = renderHook(() => useDeezerSearch());
    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("returns results after a successful search", async () => {
    const mockSongs = [
      {
        id: 1,
        title: "Charm",
        artist: { name: "Rema" },
        album: { title: "25" },
      },
      {
        id: 2,
        title: "Rolling",
        artist: { name: "Adele" },
        album: { title: "21" },
      },
    ];
    vi.spyOn(deezerApi, "searchDeezer").mockResolvedValue(mockSongs);
    const { result } = renderHook(() => useDeezerSearch());
    await act(async () => {
      await result.current.search("Rema");
    });
    expect(result.current.results).toEqual(mockSongs);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets error when no songs are found", async () => {
    vi.spyOn(deezerApi, "searchDeezer").mockResolvedValue([]);
    const { result } = renderHook(() => useDeezerSearch());
    await act(async () => {
      await result.current.search("NonExistentArtist");
    });
    expect(result.current.error).toBe("No songs found.");
    expect(result.current.results).toEqual([]);
  });
});

// ─────────────────────────────────────────────
// useYoutubeVideo
// ─────────────────────────────────────────────

describe("useYoutubeVideo", () => {
  it("starts with no videoId, no loading, no error", () => {
    const { result } = renderHook(() => useYoutubeVideo());
    expect(result.current.videoId).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets videoId after a successful fetch", async () => {
    vi.spyOn(youtubeApi, "searchYoutubeVideo").mockResolvedValue("abc123");
    const { result } = renderHook(() => useYoutubeVideo());
    await act(async () => {
      await result.current.fetchVideoId("Rema", "Charm");
    });
    expect(result.current.videoId).toBe("abc123");
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets error when no video is found", async () => {
    vi.spyOn(youtubeApi, "searchYoutubeVideo").mockResolvedValue(null);
    const { result } = renderHook(() => useYoutubeVideo());
    await act(async () => {
      await result.current.fetchVideoId("Unknown", "Unknown");
    });
    expect(result.current.videoId).toBeNull();
    expect(result.current.error).toBe("No music video found for this song.");
  });

  it("sets error when the API call fails", async () => {
    vi.spyOn(youtubeApi, "searchYoutubeVideo").mockRejectedValue(
      new Error("API Error"),
    );
    const { result } = renderHook(() => useYoutubeVideo());
    await act(async () => {
      await result.current.fetchVideoId("Rema", "Charm");
    });
    expect(result.current.videoId).toBeNull();
    expect(result.current.error).toBe(
      "Something went wrong while fetching the video.",
    );
  });
});

// ─────────────────────────────────────────────
// useLyrics
// ─────────────────────────────────────────────

describe("useLyrics", () => {
  it("starts with no lyrics, no loading, no error", () => {
    const { result } = renderHook(() => useLyrics());
    expect(result.current.lyrics).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets lyrics after a successful fetch", async () => {
    vi.spyOn(lyricsApi, "SearchForLyric").mockResolvedValue({
      lyrics: "I hate that I love you so much right now",
    });
    const { result } = renderHook(() => useLyrics());
    await act(async () => {
      await result.current.getLyrics("Rema", "Charm");
    });
    expect(result.current.lyrics).toBe(
      "I hate that I love you so much right now",
    );
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets error when lyrics are not found", async () => {
    vi.spyOn(lyricsApi, "SearchForLyric").mockResolvedValue({});
    const { result } = renderHook(() => useLyrics());
    await act(async () => {
      await result.current.getLyrics("Unknown", "Unknown");
    });
    expect(result.current.lyrics).toBeNull();
    expect(result.current.error).toBe("Lyrics not found.");
  });

  it("sets error when the API call fails", async () => {
    vi.spyOn(lyricsApi, "SearchForLyric").mockRejectedValue(
      new Error("Network Error"),
    );
    const { result } = renderHook(() => useLyrics());
    await act(async () => {
      await result.current.getLyrics("Rema", "Charm");
    });
    expect(result.current.lyrics).toBeNull();
    expect(result.current.error).toBe("Could not fetch lyrics.");
  });

  it("clearLyrics resets lyrics and error", async () => {
    vi.spyOn(lyricsApi, "SearchForLyric").mockResolvedValue({
      lyrics: "Some lyrics",
    });
    const { result } = renderHook(() => useLyrics());
    await act(async () => {
      await result.current.getLyrics("Rema", "Charm");
    });
    expect(result.current.lyrics).toBe("Some lyrics");
    act(() => {
      result.current.clearLyrics();
    });
    expect(result.current.lyrics).toBeNull();
    expect(result.current.error).toBeNull();
  });
});

// ─────────────────────────────────────────────
// useAuditLogs
// ─────────────────────────────────────────────

describe("useAuditLogs", () => {
  it("fetches logs on mount", async () => {
    getAuditLogs.mockResolvedValue({ logs: [{ id: 1 }], pages: 3, total: 21 });
    const { result } = renderHook(() => useAuditLogs());
    await act(async () => {});
    expect(result.current.logs).toEqual([{ id: 1 }]);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.total).toBe(21);
    expect(result.current.loading).toBe(false);
  });

  it("sets error on fetch failure", async () => {
    getAuditLogs.mockRejectedValue(new Error("Server error"));
    const { result } = renderHook(() => useAuditLogs());
    await act(async () => {});
    expect(result.current.error).toBe("Server error");
    expect(result.current.logs).toEqual([]);
  });

  it("goToPage changes page within valid range", async () => {
    getAuditLogs.mockResolvedValue({ logs: [], pages: 5, total: 100 });
    const { result } = renderHook(() => useAuditLogs());
    await act(async () => {});
    act(() => {
      result.current.goToPage(3);
    });
    expect(result.current.page).toBe(3);
  });

  it("goToPage does not go below page 1", async () => {
    getAuditLogs.mockResolvedValue({ logs: [], pages: 5, total: 100 });
    const { result } = renderHook(() => useAuditLogs());
    await act(async () => {});
    act(() => {
      result.current.goToPage(0);
    });
    expect(result.current.page).toBe(1);
  });

  it("refetch re-runs the fetch", async () => {
    getAuditLogs.mockResolvedValue({ logs: [], pages: 1, total: 0 });
    const { result } = renderHook(() => useAuditLogs());
    await act(async () => {});
    await act(async () => {
      await result.current.refetch();
    });
    expect(getAuditLogs).toHaveBeenCalledTimes(2);
  });
});

// ─────────────────────────────────────────────
// useMessage
// ─────────────────────────────────────────────

describe("useMessage", () => {
  it("starts with no error and no loading", () => {
    const { result } = renderHook(() => useMessage());
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("creates a message successfully", async () => {
    addMessage.mockResolvedValue({ id: "m1", name: "Alice" });
    const { result } = renderHook(() => useMessage());
    let returned;
    await act(async () => {
      returned = await result.current.createMessage({ name: "Alice" });
    });
    expect(returned).toEqual({ id: "m1", name: "Alice" });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets error and throws on failure", async () => {
    addMessage.mockRejectedValue(new Error("Network error"));
    const { result } = renderHook(() => useMessage());
    await act(async () => {
      await expect(
        result.current.createMessage({ name: "Bob" }),
      ).rejects.toThrow("Failed to send message");
    });
    expect(result.current.error).toBe("Failed to send message");
  });
});

// ─────────────────────────────────────────────
// useSignup
// ─────────────────────────────────────────────

describe("useSignup", () => {
  it("starts with no error, no success, no loading", () => {
    const { result } = renderHook(() => useSignup());
    expect(result.current.error).toBe("");
    expect(result.current.success).toBe("");
    expect(result.current.loading).toBe(false);
  });

  it("signs up a regular user successfully", async () => {
    signupUser.mockResolvedValue({
      user: { id: "u1", role: "user" },
      access_token: "tok",
      refresh_token: "ref",
    });
    const { result } = renderHook(() => useSignup());
    let returned;
    await act(async () => {
      returned = await result.current.signup({
        username: "alice",
        email: "alice@example.com",
        password: "password123",
        role: "user",
      });
    });
    expect(returned).toEqual({ id: "u1", role: "user" });
    expect(result.current.success).toBe("Signup successful!");
    expect(result.current.error).toBe("");
  });

  it("shows pending message for admin role", async () => {
    signupUser.mockResolvedValue({ user: { id: "a1", role: "admin" } });
    const { result } = renderHook(() => useSignup());
    let returned;
    await act(async () => {
      returned = await result.current.signup({
        username: "adminuser",
        email: "admin@example.com",
        password: "password123",
        role: "admin",
      });
    });
    expect(returned).toBeNull();
    expect(result.current.success).toBe(
      "Admin account created and pending approval.",
    );
  });

  it("sets error for short username", async () => {
    const { result } = renderHook(() => useSignup());
    await act(async () => {
      await result.current.signup({
        username: "ab",
        email: "a@b.com",
        password: "password123",
      });
    });
    expect(result.current.error).toBe(
      "Username must be at least 3 characters.",
    );
  });

  it("sets error for invalid email", async () => {
    const { result } = renderHook(() => useSignup());
    await act(async () => {
      await result.current.signup({
        username: "alice",
        email: "not-an-email",
        password: "password123",
      });
    });
    expect(result.current.error).toBe("Invalid email format.");
  });

  it("sets error for short password", async () => {
    const { result } = renderHook(() => useSignup());
    await act(async () => {
      await result.current.signup({
        username: "alice",
        email: "alice@example.com",
        password: "short",
      });
    });
    expect(result.current.error).toBe(
      "Password must be at least 8 characters.",
    );
  });
});

// ─────────────────────────────────────────────
// useUsers
// ─────────────────────────────────────────────

describe("useUsers", () => {
  beforeEach(() => {
    getUsers.mockResolvedValue([]);
    getPendingAdmins.mockResolvedValue([]);
  });

  it("loads users and pending admins on mount", async () => {
    getUsers.mockResolvedValue([{ id: "u1", username: "Alice" }]);
    getPendingAdmins.mockResolvedValue([{ id: "a1" }]);
    const { result } = renderHook(() => useUsers());
    await act(async () => {});
    expect(result.current.users).toHaveLength(1);
    expect(result.current.pendingAdmins).toHaveLength(1);
  });

  it("sets error on getUsers failure", async () => {
    getUsers.mockRejectedValue(new Error("fail"));
    const { result } = renderHook(() => useUsers());
    await act(async () => {});
    expect(result.current.error).toBe("Failed to fetch users.");
  });

  it("deletes a user", async () => {
    getUsers.mockResolvedValue([{ id: "u1" }, { id: "u2" }]);
    deleteUserAdmin.mockResolvedValue({});
    const { result } = renderHook(() => useUsers());
    await act(async () => {});
    await act(async () => {
      await result.current.deleteUser("u1");
    });
    expect(result.current.users.find((u) => u.id === "u1")).toBeUndefined();
  });

  it("changes a user role", async () => {
    getUsers.mockResolvedValue([{ id: "u1", role: "user" }]);
    updateUser.mockResolvedValue({});
    const { result } = renderHook(() => useUsers());
    await act(async () => {});
    await act(async () => {
      await result.current.changeRole("u1", "admin");
    });
    expect(result.current.users.find((u) => u.id === "u1").role).toBe("admin");
  });

  it("suspends a user by toggling suspended flag", async () => {
    getUsers.mockResolvedValue([{ id: "u1", suspended: false }]);
    toggleSuspendUser.mockResolvedValue({});
    const { result } = renderHook(() => useUsers());
    await act(async () => {});
    await act(async () => {
      await result.current.suspendUser("u1");
    });
    expect(result.current.users.find((u) => u.id === "u1").suspended).toBe(
      true,
    );
  });

  it("approves an admin", async () => {
    getPendingAdmins.mockResolvedValue([{ id: "a1" }]);
    getUsers.mockResolvedValue([{ id: "a1", approved: false }]);
    apiApproveAdmin.mockResolvedValue({});
    const { result } = renderHook(() => useUsers());
    await act(async () => {});
    await act(async () => {
      await result.current.approveAdmin("a1");
    });
    expect(
      result.current.pendingAdmins.find((u) => u.id === "a1"),
    ).toBeUndefined();
  });

  it("rejects an admin", async () => {
    getPendingAdmins.mockResolvedValue([{ id: "a1" }]);
    getUsers.mockResolvedValue([{ id: "a1" }]);
    apiRejectAdmin.mockResolvedValue({});
    const { result } = renderHook(() => useUsers());
    await act(async () => {});
    await act(async () => {
      await result.current.rejectAdmin("a1");
    });
    expect(
      result.current.pendingAdmins.find((u) => u.id === "a1"),
    ).toBeUndefined();
    expect(result.current.users.find((u) => u.id === "a1")).toBeUndefined();
  });
});

// ─────────────────────────────────────────────
// useAdminUsers
// ─────────────────────────────────────────────

describe("useAdminUsers", () => {
  it("starts with empty users and messages", () => {
    const { result } = renderHook(() => useAdminUsers());
    expect(result.current.users).toEqual([]);
    expect(result.current.messages).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("loadUsers populates users list", async () => {
    getUsers.mockResolvedValue([{ id: "u1", username: "Alice" }]);
    const { result } = renderHook(() => useAdminUsers());
    await act(async () => {
      await result.current.loadUsers();
    });
    expect(result.current.allUsers).toHaveLength(1);
  });

  it("sets error when loadUsers fails", async () => {
    getUsers.mockRejectedValue(new Error("fail"));
    const { result } = renderHook(() => useAdminUsers());
    await act(async () => {
      await result.current.loadUsers();
    });
    expect(result.current.error).toBe("Failed to load users.");
  });

  it("loadUserDetails sets selectedUser with defaults", async () => {
    getUserById.mockResolvedValue({ id: "u1", username: "Alice" });
    const { result } = renderHook(() => useAdminUsers());
    await act(async () => {
      await result.current.loadUserDetails("u1");
    });
    expect(result.current.selectedUser.id).toBe("u1");
    expect(result.current.selectedUser.suspended).toBe(false);
    expect(result.current.selectedUser.profile).toEqual({
      bio: "",
      favourites: [],
      playlists: [],
    });
  });

  it("loadMessages populates messages list", async () => {
    getMessages.mockResolvedValue([{ id: "m1", text: "Hello" }]);
    const { result } = renderHook(() => useAdminUsers());
    await act(async () => {
      await result.current.loadMessages();
    });
    expect(result.current.allMessages).toHaveLength(1);
  });

  it("markRead updates a message is_read to true", async () => {
    getMessages.mockResolvedValue([{ id: "m1", is_read: false }]);
    markAsRead.mockResolvedValue({});
    const { result } = renderHook(() => useAdminUsers());
    await act(async () => {
      await result.current.loadMessages();
    });
    await act(async () => {
      await result.current.markRead("m1");
    });
    expect(result.current.allMessages.find((m) => m.id === "m1").is_read).toBe(
      true,
    );
  });

  it("removeMessage removes a message from state", async () => {
    getMessages.mockResolvedValue([{ id: "m1" }, { id: "m2" }]);
    deleteMessage.mockResolvedValue({});
    const { result } = renderHook(() => useAdminUsers());
    await act(async () => {
      await result.current.loadMessages();
    });
    await act(async () => {
      await result.current.removeMessage("m1");
    });
    expect(
      result.current.allMessages.find((m) => m.id === "m1"),
    ).toBeUndefined();
  });

  it("handleSearch filters users and resets page to 1", async () => {
    getUsers.mockResolvedValue([
      { id: "u1", username: "Alice" },
      { id: "u2", username: "Bob" },
    ]);
    const { result } = renderHook(() => useAdminUsers());
    await act(async () => {
      await result.current.loadUsers();
    });
    act(() => {
      result.current.handleSearch("alice");
    });
    expect(result.current.metadata.current_page).toBe(1);
    expect(result.current.allUsers.length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────
// usePlaylists
// ─────────────────────────────────────────────

describe("usePlaylists", () => {
  const mockPlaylists = [
    { id: "pl-1", name: "Chill Vibes", songs: [{ id: "s1", title: "Song A" }] },
    { id: "pl-2", name: "Workout Mix", songs: [] },
  ];

  beforeEach(() => {
    playlistAPI.getPlaylists.mockResolvedValue(mockPlaylists);
  });

  it("loads playlists on mount", async () => {
    const { result } = renderHook(() => usePlaylists());
    await act(async () => {});
    expect(result.current.playlists).toHaveLength(2);
  });

  it("createPlaylist adds a new playlist", async () => {
    playlistAPI.createPlaylist.mockResolvedValue({
      id: "pl-3",
      name: "New",
      songs: [],
    });
    const { result } = renderHook(() => usePlaylists());
    await act(async () => {});
    await act(async () => {
      await result.current.createPlaylist("New", "desc");
    });
    expect(result.current.playlists).toHaveLength(3);
  });

  it("getPlaylist returns the correct playlist by id", async () => {
    const { result } = renderHook(() => usePlaylists());
    await act(async () => {});
    expect(result.current.getPlaylist("pl-1").name).toBe("Chill Vibes");
  });

  it("addSongToPlaylist updates the playlist in state", async () => {
    const updated = {
      id: "pl-1",
      name: "Chill Vibes",
      songs: [{ id: "s1" }, { id: "s2", title: "Song B" }],
    };
    playlistAPI.addSongToPlaylist.mockResolvedValue(updated);
    const { result } = renderHook(() => usePlaylists());
    await act(async () => {});
    await act(async () => {
      await result.current.addSongToPlaylist(
        { id: "s2", title: "Song B" },
        "pl-1",
      );
    });
    expect(result.current.getPlaylist("pl-1").songs).toHaveLength(2);
  });

  it("removeSongFromPlaylist updates the playlist in state", async () => {
    const updated = { id: "pl-1", name: "Chill Vibes", songs: [] };
    playlistAPI.removeSongFromPlaylist.mockResolvedValue(updated);
    const { result } = renderHook(() => usePlaylists());
    await act(async () => {});
    await act(async () => {
      await result.current.removeSongFromPlaylist("s1", "pl-1");
    });
    expect(result.current.getPlaylist("pl-1").songs).toHaveLength(0);
  });

  it("renamePlaylist updates the name in state", async () => {
    const updated = { id: "pl-1", name: "Late Night", songs: [] };
    playlistAPI.renamePlaylist.mockResolvedValue(updated);
    const { result } = renderHook(() => usePlaylists());
    await act(async () => {});
    await act(async () => {
      await result.current.renamePlaylist("pl-1", "Late Night");
    });
    expect(result.current.getPlaylist("pl-1").name).toBe("Late Night");
  });

  it("deletePlaylist removes the playlist from state", async () => {
    playlistAPI.deletePlaylist.mockResolvedValue(true);
    const { result } = renderHook(() => usePlaylists());
    await act(async () => {});
    await act(async () => {
      await result.current.deletePlaylist("pl-1");
    });
    expect(
      result.current.playlists.find((p) => p.id === "pl-1"),
    ).toBeUndefined();
  });
});

// ─────────────────────────────────────────────
// useFavorites
// ─────────────────────────────────────────────

describe("useFavorites", () => {
  const mockFav = {
    id: "f1",
    title: "Charm",
    isrc: "ABC123",
    artist: { name: "Rema" },
    album: { id: 1 },
  };

  beforeEach(() => {
    getFavorites.mockResolvedValue([mockFav]);
    fetchGenreForSong.mockResolvedValue("Afrobeats");
  });

  it("loads favorites on mount", async () => {
    const { result } = renderHook(() => useFavorites());
    await act(async () => {});
    expect(result.current.favorites).toHaveLength(1);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets error when loading favorites fails", async () => {
    getFavorites.mockRejectedValue(new Error("Network Error"));
    const { result } = renderHook(() => useFavorites());
    await act(async () => {});
    expect(result.current.error).toBe("Could not load favorites.");
  });

  it("adds a favorite successfully", async () => {
    const newSong = {
      id: "f2",
      title: "Essence",
      isrc: "XYZ999",
      artist: { name: "Wizkid" },
      album: { id: 2 },
    };
    apiAddFavorite.mockResolvedValue(newSong);
    const { result } = renderHook(() => useFavorites());
    await act(async () => {});
    await act(async () => {
      await result.current.addFavorite(newSong);
    });
    expect(result.current.favorites).toHaveLength(2);
  });

  it("returns duplicate flag if song already in favorites", async () => {
    const { result } = renderHook(() => useFavorites());
    await act(async () => {});
    let returned;
    await act(async () => {
      returned = await result.current.addFavorite(mockFav);
    });
    expect(returned).toEqual({ duplicate: true });
    expect(apiAddFavorite).not.toHaveBeenCalled();
  });

  it("removes a favorite successfully", async () => {
    apiRemoveFavorite.mockResolvedValue({});
    const { result } = renderHook(() => useFavorites());
    await act(async () => {});
    await act(async () => {
      await result.current.removeFavorite("f1");
    });
    expect(result.current.favorites.find((f) => f.id === "f1")).toBeUndefined();
  });

  it("sets error when removing favorite fails", async () => {
    apiRemoveFavorite.mockRejectedValue(new Error("fail"));
    const { result } = renderHook(() => useFavorites());
    await act(async () => {});
    await act(async () => {
      await result.current.removeFavorite("f1").catch(() => {});
    });
    expect(result.current.error).toBe("Could not remove favorite.");
  });
});
