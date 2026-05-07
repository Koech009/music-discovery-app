// There is a problem when accessing lyrics that can not be found.
// After trying to read a song that does not have lyrics, the caption could not display lyrics appears with lyrics underneath it.

import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";

import { searchDeezer } from "../api/deezer";
import { SearchForLyric } from "../api/lyrics";
import { searchYoutubeVideo } from "../api/youtube";

// vi.clearAllMocks(); <- function for clearing mocks


// Mocking from vitest.
vi.mock("axios");

// Deezer API tests
describe("Deezer API Tests", () => {
    // searchDeezer tests.
  describe("searchDeezer", () => {
    it("should return a list of songs on a successful search", async () => {
      const mockData = { data: { data: [{ title: "Song 1" }, { title: "Song 2" }] } };
      axios.get.mockResolvedValueOnce(mockData);

      const result = await searchDeezer("Daft Punk");

      expect(axios.get).toHaveBeenCalledWith("/api/deezer/search?q=Daft Punk");
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe("Song 1");
    });

    it("should return an empty array if the API returns no data field", async () => {
      axios.get.mockResolvedValueOnce({ data: {} });
      const result = await searchDeezer("Unknown Artist");
      expect(result).toEqual([]);
    });

    it("should return an empty array and log error on failure", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      axios.get.mockRejectedValueOnce(new Error("Network Error"));

      const result = await searchDeezer("Daft Punk");

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

//  getArtist tests. TODO: This will come later
});

// Lyrics.ovh API tests.
describe("Lyrics.ovh API Tests", () => {

});
// YouTube API test.
describe("Lyrics.ovh API Tests", () => {

});



