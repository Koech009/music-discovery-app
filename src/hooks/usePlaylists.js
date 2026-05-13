import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import * as playlistAPI from "../api/playlists.js";

export function usePlaylists() {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState(undefined); // undefined = loading, [] = loaded/empty

  /* =========================
     LOAD — re-runs when user logs in/out
  ========================= */
  useEffect(() => {
    if (!user?.id) {
      setPlaylists([]); // clear on logout
      return;
    }
    (async () => {
      try {
        const data = await playlistAPI.getPlaylists(user.id);
        setPlaylists(data);
      } catch (err) {
        console.error("Failed to fetch playlists:", err);
        setPlaylists([]);
      }
    })();
  }, [user?.id]);

  /* =========================
     HELPERS
  ========================= */
  // IDs are strings
  const updateLocal = (playlistId, updated) =>
    setPlaylists((prev) =>
      prev.map((pl) => (pl.id === playlistId ? updated : pl)),
    );

  /* =========================
     CREATE
  ========================= */
  const createPlaylist = async (name, description = "") => {
    try {
      const newPl = await playlistAPI.createPlaylist(
        name,
        description,
        user.id,
      );
      setPlaylists((prev) => [...(prev ?? []), newPl]);
      return newPl.id;
    } catch (err) {
      console.error("Failed to create playlist:", err);
      throw err;
    }
  };

  /* =========================
     READ
  ========================= */
  const getPlaylist = (id) => (playlists ?? []).find((pl) => pl.id === id);

  const getAllPlaylists = () => playlists ?? [];

  /* =========================
     UPDATE
  ========================= */
  const addSongToPlaylist = async (song, playlistId) => {
    try {
      const updated = await playlistAPI.addSongToPlaylist(playlistId, song);
      updateLocal(playlistId, updated);
    } catch (err) {
      console.error("Failed to add song:", err);
      throw err; // re-throw so caller can handle duplicate toast
    }
  };

  const removeSongFromPlaylist = async (songId, playlistId) => {
    try {
      const updated = await playlistAPI.removeSongFromPlaylist(
        playlistId,
        songId,
      );
      updateLocal(playlistId, updated);
    } catch (err) {
      console.error("Failed to remove song:", err);
      throw err;
    }
  };

  const renamePlaylist = async (playlistId, newName) => {
    try {
      const updated = await playlistAPI.renamePlaylist(playlistId, newName);
      updateLocal(playlistId, updated);
    } catch (err) {
      console.error("Failed to rename playlist:", err);
      throw err;
    }
  };

  const updatePlaylistDescription = async (playlistId, newDescription) => {
    try {
      const updated = await playlistAPI.updatePlaylistDescription(
        playlistId,
        newDescription,
      );
      updateLocal(playlistId, updated);
    } catch (err) {
      console.error("Failed to update description:", err);
      throw err;
    }
  };

  /* =========================
     DELETE
  ========================= */
  const deletePlaylist = async (playlistId) => {
    try {
      await playlistAPI.deletePlaylist(playlistId);
      setPlaylists((prev) => prev.filter((pl) => pl.id !== playlistId));
    } catch (err) {
      console.error("Failed to delete playlist:", err);
      throw err;
    }
  };

  return {
    playlists,
    createPlaylist,
    getPlaylist,
    getAllPlaylists,
    addSongToPlaylist,
    removeSongFromPlaylist,
    renamePlaylist,
    updatePlaylistDescription,
    deletePlaylist,
  };
}
