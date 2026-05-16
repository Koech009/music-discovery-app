const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const API_BASE = `${baseURL}/api`;
const BASE_URL = `${API_BASE}/playlists`;

const toId = (id) => {
  if (!id && id !== 0) throw new Error(`Invalid playlist ID: "${id}"`);
  return id;
};

const patch = async (id, body) => {
  const response = await fetch(`${BASE_URL}/${toId(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Failed to update playlist ${id}`);
  return response.json();
};

// fetch all playlists belonging to a specific user
export async function getPlaylists(userId) {
  if (!userId) throw new Error("userId is required to fetch playlists");
  const response = await fetch(`${BASE_URL}?userId=${userId}`);
  if (!response.ok) throw new Error("Failed to fetch playlists");
  return response.json();
}

// fetch a single playlist by ID
export async function getPlaylist(id) {
  const response = await fetch(`${BASE_URL}/${toId(id)}`);
  if (!response.ok) throw new Error(`Playlist "${id}" not found`);
  return response.json();
}

// create a new playlist
export async function createPlaylist(name, description = "", userId) {
  if (!userId) throw new Error("userId is required to create a playlist");
  if (!name?.trim()) throw new Error("Playlist name cannot be empty");

  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: name.trim(),
      description: description.trim(),
      userId,
      songs: [],
      createdAt: new Date().toISOString(),
    }),
  });
  if (!response.ok) throw new Error("Failed to create playlist");
  return response.json();
}

// ADD SONG TO PLAYLIST with duplicate guard
export async function addSongToPlaylist(playlistId, song) {
  const playlist = await getPlaylist(playlistId);

  if (playlist.songs.some((s) => s.id === song.id)) {
    const err = new Error(`"${song.title}" is already in this playlist`);
    err.duplicate = true;
    throw err;
  }

  return patch(playlistId, {
    ...playlist,
    songs: [...playlist.songs, song],
  });
}

// REMOVE SONG FROM PLAYLIST
export async function removeSongFromPlaylist(playlistId, songId) {
  const playlist = await getPlaylist(playlistId);
  return patch(playlistId, {
    ...playlist,
    songs: playlist.songs.filter((s) => s.id !== songId),
  });
}

// RENAME PLAYLIST
export async function renamePlaylist(playlistId, newName) {
  if (!newName?.trim()) throw new Error("Playlist name cannot be empty");
  return patch(playlistId, { name: newName.trim() });
}

// UPDATE DESCRIPTION
export async function updatePlaylistDescription(playlistId, newDescription) {
  return patch(playlistId, { description: newDescription?.trim() ?? "" });
}

// DELETE PLAYLIST
export async function deletePlaylist(playlistId) {
  const response = await fetch(`${BASE_URL}/${toId(playlistId)}`, {
    method: "DELETE",
  });
  if (!response.ok)
    throw new Error(`Failed to delete playlist "${playlistId}"`);
  return true;
}
