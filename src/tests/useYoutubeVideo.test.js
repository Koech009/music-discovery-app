import { renderHook, act } from "@testing-library/react";
import { describe, expect, vi } from "vitest";
import useYoutubeVideo from "../hooks/useYoutubeVideo";
import * as youtubeApi from "../api/youtube";

describe("useYoutubeVideo", () => {
    it("should start with no videoId, no loading and no error", () => {
        const {result} = renderHook(() => useYoutubeVideo());

        expect(result.current.videoId).toBeNull();
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it("should set videoId after a successful fetch", async () => {
        vi.spyOn(youtubeApi, "searchYoutubeVideo").mockResoledValue("test123");

        const {result} = renderHook(() => useYoutubeVideo());
        await act(async () => {
            await result.current.fetchVideoId("Rema", "Charm");
        });

        expect(result.current.videoId).toBe("test123");
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it("should set error when no video is found", async ()=> {
        vi.spyOn(youtubeApi, "searchYoutubeVideo").mockResolvedValue(null);

        const {result} = renderHook(() => useYoutubeVideo());
        await act(async () => {
            await result.current.fetchVideoId("NonExistentArtist", "NonExistentSong");
        });

        expect(result.current.error).toBe("No music video found for this song.");
        expect(result.current.videoId).toBeNull();
    });

    it("should set error when the API call fails", async () => {
        vi.spyOn(youtubeApi, "searchYoutubeVideo").mockRejectedValue(new Error("API Error"));

        const {result} = renderHook(() => useYoutubeVideo());
        await act(async () => {
            await result.current.fetchVideoId("Rema", "Charm");
        });

        expect(result.current.error).toBe("Something went wrong while fetching the video.");
        expect(result.current.videoId).toBeNull();
    });
}); 
