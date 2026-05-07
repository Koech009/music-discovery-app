import {renderHook, act} from "@testing-library/react";
import {vi} from "vitest";
import useDeezerSearch from "../hooks/useDeezerSearch.js";
import * as deezerApi from "../api/deezer.js";

describe("useDeezerSearch", () => {
    it ("should start with empty results and there should be no loading and no error", () => {
        const {result} = renderHook(() => useDeezerSearch());
        expect(result.current.results).toEqual([]);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
    });

    it ("should return results after a successful search", async () => {
        const mockSongs = [
        { id: 1, title: "Charm", artist: { name: "Rema" }, album: { title: "25" } },
        { id: 2, title: "Rolling", artist: { name: "Adele" }, album: { title: "21" } },
        ];
    
        vi.spyOn(deezerApi, "searchDeezer").mockResolvedValue(mockSongs);

        const {result} = renderHook(() => useDeezerSearch());
        await act(async () => {
            await result.current.search("Rema");
        });

        expect(result.current.results).toEqual(mockSongs);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
    });

    it ("should set error when no songs are found", async () => {
        vi.spyOn(deezerApi, "searchDeezer").mockResolvedValue([]);

        const {result} = renderHook(() => useDeezerSearch());
        await act(async () => {
            await result.current.search("NonExistentArtist");
        });

        expect(result.current.error).toBe("No songs found.");
        expect(result.current.results).toEqual([]);
    });
});