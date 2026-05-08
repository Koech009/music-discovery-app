import { renderHook, act } from "@testing-library/react";
import { vi } from "vitest";
import useFavorites from "../hooks/useFavourites";
import axios from "axios";

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