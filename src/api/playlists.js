import api from "../utils/api";

const API_BASE = "/playlists";

const toId = (id) => {
  if (!id && id !== 0) throw new Error(`Invalid playlist ID: "${id}"`);
  return id;
};

const patch = async (id, body) => {
  const res = await api.patch(`${API_BASE}/${toId(id)}`, body);
  return res.data.playlist;
};

// Fetch all playlists for the logged-in user
export async function getPlaylists() {
  try {
    const res = await api.get(API_BASE);
    return res.data.playlists;
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to fetch playlists");
  }
}

// Fetch a single playlist by ID
export async function getPlaylist(id) {
  try {
    const res = await api.get(`${API_BASE}/${toId(id)}`);
    return res.data.playlist;
  } catch (err) {
    throw new Error(err.response?.data?.error || `Playlist "${id}" not found`);
  }
}

// Create a new playlist
export async function createPlaylist(name, description = "") {
  if (!name?.trim()) throw new Error("Playlist name cannot be empty");
  try {
    const res = await api.post(API_BASE, {
      name: name.trim(),
      description: description.trim(),
      songs: [],
    });
    return res.data.playlist;
  } catch (err) {
    throw new Error(err.response?.data?.error || "Failed to create playlist");
  }
}

// Add song to playlist with duplicate guard
export async function addSongToPlaylist(playlistId, song) {
  const playlist = await getPlaylist(playlistId);
  if (playlist.songs.some((s) => s.id === song.id)) {
    const err = new Error(`"${song.title}" is already in this playlist`);
    err.duplicate = true;
    throw err;
  }
  return patch(playlistId, { songs: [...playlist.songs, song] });
}

// Remove song from playlist
export async function removeSongFromPlaylist(playlistId, songId) {
  const playlist = await getPlaylist(playlistId);
  return patch(playlistId, {
    songs: playlist.songs.filter((s) => s.id !== songId),
  });
}

// Rename playlist
export async function renamePlaylist(playlistId, newName) {
  if (!newName?.trim()) throw new Error("Playlist name cannot be empty");
  return patch(playlistId, { name: newName.trim() });
}

// Update playlist description
export async function updatePlaylistDescription(playlistId, newDescription) {
  return patch(playlistId, { description: newDescription?.trim() ?? "" });
}

// Delete playlist
export async function deletePlaylist(playlistId) {
  try {
    await api.delete(`${API_BASE}/${toId(playlistId)}`);
    return true;
  } catch (err) {
    throw new Error(err.response?.data?.error || `Failed to delete playlist "${playlistId}"`);
  }
}
