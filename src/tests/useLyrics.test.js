import { renderHook, act } from "@testing-library/react";
import { vi } from "vitest";
import useLyrics from "../hooks/useLyrics.js";
import * as lyricsApi from "../api/lyrics.js";

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