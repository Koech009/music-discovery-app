import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";

// ─────────────────────────────────────────────
// API IMPORTS
// ─────────────────────────────────────────────
import { searchDeezer, getArtist, getAlbum } from "../api/deezer";
import { SearchForLyric } from "../api/lyrics";
import { searchYoutubeVideo } from "../api/youtube";
import {
  getAuditLogs,
  getAuditLogsByUser,
  getAuditLogsByAction,
} from "../api/auditlogs";
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  fetchGenreForSong,
} from "../api/favourites";
import {
  getMessages,
  addMessage,
  updateMessage,
  deleteMessage,
  markAsRead,
} from "../api/messages";
import {
  getPlaylists,
  getPlaylist,
  createPlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  renamePlaylist,
  deletePlaylist,
} from "../api/playlists";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
  signupUser,
  toggleSuspendUser,
  getPendingAdmins,
  approveAdmin,
  rejectAdmin,
  promoteUser,
  deleteUserAdmin,
  changePassword,
} from "../api/user";

// ─────────────────────────────────────────────
// MOCKS
// ─────────────────────────────────────────────

vi.mock("axios");

// Mock the shared api util (used by audit, favorites, messages, playlists, users)
vi.mock("../utils/api", () => {
  const api = {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  };
  return { default: api };
});

import api from "../utils/api";

beforeEach(() => {
  vi.clearAllMocks();
});

// ─────────────────────────────────────────────
// DEEZER
// ─────────────────────────────────────────────

describe("Deezer API", () => {
  describe("searchDeezer", () => {
    it("returns a list of songs on success", async () => {
      axios.get.mockResolvedValueOnce({
        data: { data: [{ title: "Song 1" }, { title: "Song 2" }] },
      });
      const result = await searchDeezer("Daft Punk");
      expect(axios.get).toHaveBeenCalledWith("/api/deezer/search?q=Daft Punk");
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe("Song 1");
    });

    it("returns empty array if no data field", async () => {
      axios.get.mockResolvedValueOnce({ data: {} });
      const result = await searchDeezer("Unknown");
      expect(result).toEqual([]);
    });

    it("returns empty array and logs error on failure", async () => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});
      axios.get.mockRejectedValueOnce(new Error("Network Error"));
      const result = await searchDeezer("Daft Punk");
      expect(result).toEqual([]);
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe("getArtist", () => {
    it("returns artist details on success", async () => {
      axios.get.mockResolvedValueOnce({ data: { id: 123, name: "Justice" } });
      const result = await getArtist(123);
      expect(axios.get).toHaveBeenCalledWith("/api/deezer/artist/123");
      expect(result.name).toBe("Justice");
    });

    it("returns null and logs error on failure", async () => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});
      axios.get.mockRejectedValueOnce(new Error("404 Not Found"));
      const result = await getArtist(999);
      expect(result).toBeNull();
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe("getAlbum", () => {
    it("returns album details on success", async () => {
      axios.get.mockResolvedValueOnce({
        data: { id: 1, title: "Random Access Memories" },
      });
      const result = await getAlbum(1);
      expect(axios.get).toHaveBeenCalledWith("/api/deezer/album/1");
      expect(result.title).toBe("Random Access Memories");
    });

    it("returns null and logs error on failure", async () => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});
      axios.get.mockRejectedValueOnce(new Error("Not Found"));
      const result = await getAlbum(999);
      expect(result).toBeNull();
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });
});

// ─────────────────────────────────────────────
// LYRICS
// ─────────────────────────────────────────────

describe("Lyrics API", () => {
  it("returns lyrics data on success", async () => {
    const mockLyrics = { lyrics: "My heart goes up..." };
    axios.get.mockResolvedValueOnce({ data: mockLyrics });
    const result = await SearchForLyric("Celeste", "Stop This Flame");
    expect(axios.get).toHaveBeenCalledWith(
      "/api/lyrics/Celeste/Stop This Flame",
      { timeout: 5000 },
    );
    expect(result).toEqual(mockLyrics);
  });

  it("throws user-friendly error on failure", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    axios.get.mockRejectedValueOnce(new Error("404"));
    await expect(SearchForLyric("Artist", "Song")).rejects.toThrow(
      "Lyrics service is currently unavailable.",
    );
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("does not return stale lyrics after a failed fetch", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    axios.get.mockRejectedValueOnce(new Error("404"));
    let result = null;
    try {
      result = await SearchForLyric("Ghost", "No Lyrics Here");
    } catch {
      // expected
    }
    expect(result).toBeNull();
    spy.mockRestore();
  });
});

// ─────────────────────────────────────────────
// YOUTUBE
// ─────────────────────────────────────────────

describe("YouTube API", () => {
  it("returns videoId when a video is found", async () => {
    axios.get.mockResolvedValueOnce({
      data: { items: [{ id: { videoId: "dQw4w9WgXcQ" } }] },
    });
    const videoId = await searchYoutubeVideo(
      "Rick Astley",
      "Never Gonna Give You Up",
    );
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining("/search"),
      expect.objectContaining({
        params: expect.objectContaining({
          part: "snippet",
          q: "Rick Astley Never Gonna Give You Up Official Music Video",
          type: "video",
          maxResults: 1,
        }),
      }),
    );
    expect(videoId).toBe("dQw4w9WgXcQ");
  });

  it("returns null if items array is empty", async () => {
    axios.get.mockResolvedValueOnce({ data: { items: [] } });
    const result = await searchYoutubeVideo("Unknown", "Nothing");
    expect(result).toBeNull();
  });

  it("returns null and logs error on failure", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    axios.get.mockRejectedValueOnce(new Error("API Key Invalid"));
    const result = await searchYoutubeVideo("Artist", "Title");
    expect(result).toBeNull();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

// ─────────────────────────────────────────────
// AUDIT LOGS
// ─────────────────────────────────────────────

describe("Audit Logs API", () => {
  it("fetches all audit logs with default pagination", async () => {
    const mockLogs = { logs: [], total: 0 };
    api.get.mockResolvedValueOnce({ data: mockLogs });
    const result = await getAuditLogs();
    expect(api.get).toHaveBeenCalledWith("/admin/audit/", {
      params: { page: 1, per_page: 20 },
    });
    expect(result).toEqual(mockLogs);
  });

  it("fetches audit logs with custom pagination", async () => {
    api.get.mockResolvedValueOnce({ data: { logs: [] } });
    await getAuditLogs(3, 50);
    expect(api.get).toHaveBeenCalledWith("/admin/audit/", {
      params: { page: 3, per_page: 50 },
    });
  });

  it("throws on failure", async () => {
    api.get.mockRejectedValueOnce({
      response: { data: { error: "Unauthorized" } },
    });
    await expect(getAuditLogs()).rejects.toThrow("Unauthorized");
  });

  it("fetches audit logs by user", async () => {
    api.get.mockResolvedValueOnce({ data: { logs: [] } });
    await getAuditLogsByUser("user-42");
    expect(api.get).toHaveBeenCalledWith("/admin/audit/user/user-42", {
      params: { page: 1, per_page: 20 },
    });
  });

  it("throws on getAuditLogsByUser failure", async () => {
    api.get.mockRejectedValueOnce({
      response: { data: { error: "Not found" } },
    });
    await expect(getAuditLogsByUser("bad-id")).rejects.toThrow("Not found");
  });

  it("fetches audit logs by action", async () => {
    api.get.mockResolvedValueOnce({ data: { logs: [] } });
    await getAuditLogsByAction("LOGIN");
    expect(api.get).toHaveBeenCalledWith("/admin/audit/action/LOGIN", {
      params: { page: 1, per_page: 20 },
    });
  });

  it("throws on getAuditLogsByAction failure", async () => {
    api.get.mockRejectedValueOnce({
      response: { data: { error: "Server error" } },
    });
    await expect(getAuditLogsByAction("DELETE")).rejects.toThrow(
      "Server error",
    );
  });
});

// ─────────────────────────────────────────────
// FAVORITES
// ─────────────────────────────────────────────

describe("Favorites API", () => {
  const mockSong = {
    id: "s1",
    title: "Blinding Lights",
    artist: { name: "The Weeknd" },
    album: { title: "After Hours", cover_small: "cover.jpg", id: 101 },
    preview: "preview.mp3",
    isrc: "USRC12345",
  };

  it("fetches favorites for a user", async () => {
    api.get.mockResolvedValueOnce({ data: [mockSong] });
    const result = await getFavorites("user-1");
    expect(api.get).toHaveBeenCalledWith("/favorites", {
      params: { userId: "user-1" },
    });
    expect(result).toHaveLength(1);
  });

  it("fetches favorites without userId", async () => {
    api.get.mockResolvedValueOnce({ data: [] });
    await getFavorites();
    expect(api.get).toHaveBeenCalledWith("/favorites", { params: {} });
  });

  it("adds a favorite", async () => {
    api.post.mockResolvedValueOnce({ data: { id: "fav-1" } });
    const result = await addFavorite(mockSong, "user-1", "Pop");
    expect(api.post).toHaveBeenCalledWith(
      "/favorites",
      expect.objectContaining({
        title: "Blinding Lights",
        artist_name: "The Weeknd",
        genre: "Pop",
      }),
    );
    expect(result).toEqual({ id: "fav-1" });
  });

  it("removes a favorite", async () => {
    api.delete.mockResolvedValueOnce({ data: {} });
    const result = await removeFavorite("fav-1");
    expect(api.delete).toHaveBeenCalledWith("/favorites/fav-1");
    expect(result).toBe("fav-1");
  });

  it("throws on getFavorites failure", async () => {
    api.get.mockRejectedValueOnce({
      response: { data: { error: "Fetch failed" } },
    });
    await expect(getFavorites("user-1")).rejects.toThrow("Fetch failed");
  });

  it("fetchGenreForSong returns genre name when album has genres", async () => {
    axios.get.mockResolvedValueOnce({
      data: { genres: { data: [{ name: "Electronic" }] } },
    });
    const genre = await fetchGenreForSong(mockSong);
    expect(genre).toBe("Electronic");
  });

  it("fetchGenreForSong returns Unknown when no albumId", async () => {
    const genre = await fetchGenreForSong({ album: {} });
    expect(genre).toBe("Unknown");
  });

  it("fetchGenreForSong returns Unknown on error", async () => {
    axios.get.mockRejectedValueOnce(new Error("fail"));
    const genre = await fetchGenreForSong(mockSong);
    expect(genre).toBe("Unknown");
  });
});

// ─────────────────────────────────────────────
// MESSAGES
// ─────────────────────────────────────────────

describe("Messages API", () => {
  it("fetches all messages", async () => {
    api.get.mockResolvedValueOnce({ data: { messages: [{ id: 1 }] } });
    const result = await getMessages();
    expect(api.get).toHaveBeenCalledWith("/messages");
    expect(result).toHaveLength(1);
  });

  it("returns empty array if messages key missing", async () => {
    api.get.mockResolvedValueOnce({ data: {} });
    const result = await getMessages();
    expect(result).toEqual([]);
  });

  it("adds a message with createdAt and isRead fields", async () => {
    const newMsg = { id: "m1", name: "Alice" };
    api.post.mockResolvedValueOnce({ data: { message: newMsg } });
    const result = await addMessage({ name: "Alice" });
    expect(api.post).toHaveBeenCalledWith(
      "/messages",
      expect.objectContaining({ name: "Alice", isRead: false }),
    );
    expect(result).toEqual(newMsg);
  });

  it("updates a message", async () => {
    api.patch.mockResolvedValueOnce({ data: { id: "m1", is_read: true } });
    const result = await updateMessage("m1", { is_read: true });
    expect(api.patch).toHaveBeenCalledWith("/messages/m1", { is_read: true });
    expect(result.is_read).toBe(true);
  });

  it("deletes a message", async () => {
    api.delete.mockResolvedValueOnce({ data: { deleted: true } });
    const result = await deleteMessage("m1");
    expect(api.delete).toHaveBeenCalledWith("/messages/m1");
    expect(result.deleted).toBe(true);
  });

  it("marks a message as read", async () => {
    api.patch.mockResolvedValueOnce({ data: { id: "m1", is_read: true } });
    await markAsRead("m1");
    expect(api.patch).toHaveBeenCalledWith("/messages/m1", { is_read: true });
  });
});

// ─────────────────────────────────────────────
// PLAYLISTS
// ─────────────────────────────────────────────

describe("Playlists API", () => {
  const mockPlaylist = {
    id: "pl-1",
    name: "Chill Vibes",
    songs: [{ id: "s1", title: "Song A" }],
  };

  it("fetches all playlists", async () => {
    api.get.mockResolvedValueOnce({ data: { playlists: [mockPlaylist] } });
    const result = await getPlaylists();
    expect(api.get).toHaveBeenCalledWith("/playlists");
    expect(result).toHaveLength(1);
  });

  it("fetches a single playlist by id", async () => {
    api.get.mockResolvedValueOnce({ data: { playlist: mockPlaylist } });
    const result = await getPlaylist("pl-1");
    expect(api.get).toHaveBeenCalledWith("/playlists/pl-1");
    expect(result.name).toBe("Chill Vibes");
  });

  it("creates a playlist", async () => {
    api.post.mockResolvedValueOnce({ data: { playlist: mockPlaylist } });
    const result = await createPlaylist("Chill Vibes", "Sunday morning");
    expect(api.post).toHaveBeenCalledWith(
      "/playlists",
      expect.objectContaining({ name: "Chill Vibes", songs: [] }),
    );
    expect(result.name).toBe("Chill Vibes");
  });

  it("throws when creating playlist with empty name", async () => {
    await expect(createPlaylist("")).rejects.toThrow(
      "Playlist name cannot be empty",
    );
  });

  it("adds a song to a playlist", async () => {
    const newSong = { id: "s2", title: "Song B" };
    // getPlaylist call
    api.get.mockResolvedValueOnce({ data: { playlist: mockPlaylist } });
    // patch call
    api.patch.mockResolvedValueOnce({
      data: {
        playlist: { ...mockPlaylist, songs: [...mockPlaylist.songs, newSong] },
      },
    });
    const result = await addSongToPlaylist("pl-1", newSong);
    expect(result.songs).toHaveLength(2);
  });

  it("throws duplicate error when adding existing song", async () => {
    api.get.mockResolvedValueOnce({ data: { playlist: mockPlaylist } });
    const err = await addSongToPlaylist("pl-1", {
      id: "s1",
      title: "Song A",
    }).catch((e) => e);
    expect(err.duplicate).toBe(true);
    expect(err.message).toContain("already in this playlist");
  });

  it("removes a song from a playlist", async () => {
    api.get.mockResolvedValueOnce({ data: { playlist: mockPlaylist } });
    api.patch.mockResolvedValueOnce({
      data: { playlist: { ...mockPlaylist, songs: [] } },
    });
    const result = await removeSongFromPlaylist("pl-1", "s1");
    expect(result.songs).toHaveLength(0);
  });

  it("renames a playlist", async () => {
    api.patch.mockResolvedValueOnce({
      data: { playlist: { ...mockPlaylist, name: "Late Night" } },
    });
    const result = await renamePlaylist("pl-1", "Late Night");
    expect(result.name).toBe("Late Night");
  });

  it("throws when renaming with empty name", async () => {
    await expect(renamePlaylist("pl-1", "")).rejects.toThrow(
      "Playlist name cannot be empty",
    );
  });

  it("deletes a playlist", async () => {
    api.delete.mockResolvedValueOnce({});
    const result = await deletePlaylist("pl-1");
    expect(api.delete).toHaveBeenCalledWith("/playlists/pl-1");
    expect(result).toBe(true);
  });

  it("throws on invalid playlist id", async () => {
    await expect(getPlaylist(null)).rejects.toThrow("Invalid playlist ID");
  });
});

// ─────────────────────────────────────────────
// USERS & AUTH
// ─────────────────────────────────────────────

describe("Users & Auth API", () => {
  it("fetches all users", async () => {
    api.get.mockResolvedValueOnce({ data: { users: [{ id: "u1" }] } });
    const result = await getUsers();
    expect(api.get).toHaveBeenCalledWith("/users");
    expect(result).toHaveLength(1);
  });

  it("fetches a user by id", async () => {
    api.get.mockResolvedValueOnce({
      data: { user: { id: "u1", name: "Alice" } },
    });
    const result = await getUserById("u1");
    expect(result.name).toBe("Alice");
  });

  it("creates a user", async () => {
    api.post.mockResolvedValueOnce({ data: { user: { id: "u2" } } });
    const result = await createUser({ name: "Bob" });
    expect(result.id).toBe("u2");
  });

  it("updates a user", async () => {
    api.patch.mockResolvedValueOnce({ data: { name: "Updated" } });
    const result = await updateUser("u1", { name: "Updated" });
    expect(result.name).toBe("Updated");
  });

  it("deletes a user", async () => {
    api.delete.mockResolvedValueOnce({ data: { deleted: true } });
    const result = await deleteUser("u1");
    expect(result.deleted).toBe(true);
  });

  it("logs in a user successfully", async () => {
    api.post.mockResolvedValueOnce({
      data: { token: "abc", user: { id: "u1" } },
    });
    const result = await loginUser("alice@example.com", "password");
    expect(api.post).toHaveBeenCalledWith("/auth/login", {
      email: "alice@example.com",
      password: "password",
    });
    expect(result.token).toBe("abc");
  });

  it("throws on login failure", async () => {
    api.post.mockRejectedValueOnce({
      response: { data: { error: "Invalid credentials" } },
    });
    await expect(loginUser("x@x.com", "wrong")).rejects.toThrow(
      "Invalid credentials",
    );
  });

  it("signs up a user", async () => {
    api.post.mockResolvedValueOnce({ data: { id: "u3" } });
    const result = await signupUser({ name: "Carol", email: "c@c.com" });
    expect(result.id).toBe("u3");
  });

  it("toggles user suspension", async () => {
    api.patch.mockResolvedValueOnce({ data: { suspended: true } });
    const result = await toggleSuspendUser("u1");
    expect(api.patch).toHaveBeenCalledWith(
      "/admin/users/u1/suspend",
      undefined,
    );
    expect(result.suspended).toBe(true);
  });

  it("fetches pending admins", async () => {
    api.get.mockResolvedValueOnce({ data: { pending_admins: [{ id: "a1" }] } });
    const result = await getPendingAdmins();
    expect(result).toHaveLength(1);
  });

  it("returns empty array if pending_admins key missing", async () => {
    api.get.mockResolvedValueOnce({ data: {} });
    const result = await getPendingAdmins();
    expect(result).toEqual([]);
  });

  it("approves an admin", async () => {
    api.patch.mockResolvedValueOnce({ data: { approved: true } });
    const result = await approveAdmin("a1");
    expect(api.patch).toHaveBeenCalledWith(
      "/admin/admins/a1/approve",
      undefined,
    );
    expect(result.approved).toBe(true);
  });

  it("rejects an admin", async () => {
    api.delete.mockResolvedValueOnce({ data: { rejected: true } });
    const result = await rejectAdmin("a1");
    expect(result.rejected).toBe(true);
  });

  it("promotes a user", async () => {
    api.patch.mockResolvedValueOnce({ data: { role: "admin" } });
    const result = await promoteUser("u1");
    expect(result.role).toBe("admin");
  });

  it("deletes a user as admin", async () => {
    api.delete.mockResolvedValueOnce({ data: { deleted: true } });
    const result = await deleteUserAdmin("u1");
    expect(result.deleted).toBe(true);
  });

  it("changes a user password", async () => {
    api.patch.mockResolvedValueOnce({ data: { success: true } });
    const result = await changePassword("u1", {
      old: "oldpass",
      new: "newpass",
    });
    expect(api.patch).toHaveBeenCalledWith("/users/u1/change-password", {
      old_password: "oldpass",
      new_password: "newpass",
    });
    expect(result.success).toBe(true);
  });
});
