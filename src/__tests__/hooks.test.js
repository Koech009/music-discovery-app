import { renderHook, act } from "@testing-library/react";
import { vi } from "vitest";
import useDeezerSearch from "../hooks/useDeezerSearch";
import useYoutubeVideo from "../hooks/useYoutubeVideo";
import useLyrics from "../hooks/useLyrics";
import useFavorites from "../hooks/useFavourites";
import * as deezerApi from "../api/deezer";
import * as youtubeApi from "../api/youtube";
import * as lyricsApi from "../api/lyrics";
import axios from "axios";

describe("useDeezerSearch", () => {
  it("should start with empty results, no loading and no error", () => {
    const { result } = renderHook(() => useDeezerSearch());
    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should return results after a successful search", async () => {
    const mockSongs = [
      { id: 1, title: "Charm", artist: { name: "Rema" }, album: { title: "25" } },
      { id: 2, title: "Rolling", artist: { name: "Adele" }, album: { title: "21" } },
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

  it("should set error when no songs are found", async () => {
    vi.spyOn(deezerApi, "searchDeezer").mockResolvedValue([]);
    const { result } = renderHook(() => useDeezerSearch());
    await act(async () => {
      await result.current.search("NonExistentArtist");
    });
    expect(result.current.error).toBe("No songs found.");
    expect(result.current.results).toEqual([]);
  });
});

describe("useYoutubeVideo", () => {
  it("should start with no videoId, no loading and no error", () => {
    const { result } = renderHook(() => useYoutubeVideo());
    expect(result.current.videoId).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should set videoId after a successful fetch", async () => {
    vi.spyOn(youtubeApi, "searchYoutubeVideo").mockResolvedValue("abc123");
    const { result } = renderHook(() => useYoutubeVideo());
    await act(async () => {
      await result.current.fetchVideoId("Rema", "Charm");
    });
    expect(result.current.videoId).toBe("abc123");
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should set error when no video is found", async () => {
    vi.spyOn(youtubeApi, "searchYoutubeVideo").mockResolvedValue(null);
    const { result } = renderHook(() => useYoutubeVideo());
    await act(async () => {
      await result.current.fetchVideoId("Unknown", "Unknown");
    });
    expect(result.current.videoId).toBeNull();
    expect(result.current.error).toBe("No music video found for this song.");
  });

  it("should set error when the API call fails", async () => {
    vi.spyOn(youtubeApi, "searchYoutubeVideo").mockRejectedValue(new Error("API Error"));
    const { result } = renderHook(() => useYoutubeVideo());
    await act(async () => {
      await result.current.fetchVideoId("Rema", "Charm");
    });
    expect(result.current.videoId).toBeNull();
    expect(result.current.error).toBe("Something went wrong while fetching the video.");
  });
});

describe("useLyrics", () => {
  it("should start with no lyrics, no loading and no error", () => {
    const { result } = renderHook(() => useLyrics());
    expect(result.current.lyrics).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should set lyrics after a successful fetch", async () => {
    vi.spyOn(lyricsApi, "SearchForLyric").mockResolvedValue({
      lyrics: "I hate that I love you so much right now",
    });
    const { result } = renderHook(() => useLyrics());
    await act(async () => {
      await result.current.getLyrics("Rema", "Charm");
    });
    expect(result.current.lyrics).toBe("I hate that I love you so much right now");
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should set error when lyrics are not found", async () => {
    vi.spyOn(lyricsApi, "SearchForLyric").mockResolvedValue({});
    const { result } = renderHook(() => useLyrics());
    await act(async () => {
      await result.current.getLyrics("Unknown", "Unknown");
    });
    expect(result.current.lyrics).toBeNull();
    expect(result.current.error).toBe("Lyrics not found.");
  });

  it("should set error when the API call fails", async () => {
    vi.spyOn(lyricsApi, "SearchForLyric").mockRejectedValue(new Error("Network Error"));
    const { result } = renderHook(() => useLyrics());
    await act(async () => {
      await result.current.getLyrics("Rema", "Charm");
    });
    expect(result.current.lyrics).toBeNull();
    expect(result.current.error).toBe("Could not fetch lyrics.");
  });
});

describe("useFavorites", () => {
  it("should start with empty favorites, no loading and no error", async () => {
    vi.spyOn(axios, "get").mockResolvedValue({ data: [] });
    const { result } = renderHook(() => useFavorites());
    await act(async () => {});
    expect(result.current.favorites).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should load favorites on mount", async () => {
    const mockFavorites = [
      { id: 1, title: "Charm", artist: { name: "Rema" } },
      { id: 2, title: "Hello", artist: { name: "Adele" } },
    ];
    vi.spyOn(axios, "get").mockResolvedValue({ data: mockFavorites });
    const { result } = renderHook(() => useFavorites());
    await act(async () => {});
    expect(result.current.favorites).toEqual(mockFavorites);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should add a favorite successfully", async () => {
    const newSong = { id: 3, title: "Essence", artist: { name: "Wizkid" } };
    vi.spyOn(axios, "get").mockResolvedValue({ data: [] });
    vi.spyOn(axios, "post").mockResolvedValue({ data: newSong });
    const { result } = renderHook(() => useFavorites());
    await act(async () => {});
    await act(async () => {
      await result.current.addFavorite(newSong);
    });
    expect(result.current.favorites).toContainEqual(newSong);
  });

  it("should remove a favorite successfully", async () => {
    const mockFavorites = [
      { id: 1, title: "Charm", artist: { name: "Rema" } },
      { id: 2, title: "Hello", artist: { name: "Adele" } },
    ];
    vi.spyOn(axios, "get").mockResolvedValue({ data: mockFavorites });
    vi.spyOn(axios, "delete").mockResolvedValue({});
    const { result } = renderHook(() => useFavorites());
    await act(async () => {});
    await act(async () => {
      await result.current.removeFavorite(1);
    });
    expect(result.current.favorites).not.toContainEqual(mockFavorites[0]);
  });

  it("should set error when loading favorites fails", async () => {
    vi.spyOn(axios, "get").mockRejectedValue(new Error("Network Error"));
    const { result } = renderHook(() => useFavorites());
    await act(async () => {});
    expect(result.current.error).toBe("Could not load favorites.");
  });
});