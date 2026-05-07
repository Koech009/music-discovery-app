// There is a problem when accessing lyrics that can not be found.
// After trying to read a song that does not have lyrics, the caption could not display lyrics appears with lyrics underneath it.

import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";

import { searchDeezer, getArtist} from "../api/deezer";
import { SearchForLyric } from "../api/lyrics";
import { searchYoutubeVideo } from "../api/youtube";


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

//  getArtist tests.
describe("getArtist", () => {
    it("should return artist details on success", async () => {
      const mockArtist = { id: 123, name: "Justice" };
      axios.get.mockResolvedValueOnce({ data: mockArtist });

      const result = await getArtist(123);

      expect(axios.get).toHaveBeenCalledWith("/api/deezer/artist/123");
      expect(result.name).toBe("Justice");
    });

    it("should return null and log error on failure", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      axios.get.mockRejectedValueOnce(new Error("404 Not Found"));

      const result = await getArtist(999);

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});

// Lyrics.ovh API tests.
describe("Lyrics.ovh API Tests", () => {
    it("should return lyrics data when the request is successful", async () => {
    const mockLyrics = { lyrics: "My heart goes up, my heart goes down..." };
    axios.get.mockResolvedValueOnce({ data: mockLyrics });

    const result = await SearchForLyric("Celeste", "Stop This Flame");

    expect(axios.get).toHaveBeenCalledWith(
      "/api/lyrics/Celeste/Stop This Flame",
      {timeout: 5000}
    );
    expect(result).toEqual(mockLyrics);
  });

  it("should throw a user-friendly error when the API call fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    
    axios.get.mockRejectedValueOnce(new Error("Request failed with status code 404"));

    await expect(SearchForLyric("Artist", "Song"))
      .rejects
      .toThrow("Lyrics service is currently unavailable.");

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

// YouTube API test.
describe("YouTube API Tests", () => {
    it("should return the videoId when a video is found", async () => {
    const mockResponse = {
      data: {
        items: [{id: { videoId: "dQw4w9WgXcQ" }}]
      }
    };
    
    axios.get.mockResolvedValueOnce(mockResponse);

    const videoId = await searchYoutubeVideo("Rick Astley", "Never Gonna Give You Up");

    expect(axios.get).toHaveBeenCalledWith(
      "https://www.googleapis.com/youtube/v3/search",
      expect.objectContaining({
        params: expect.objectContaining({
          part: "snippet",
          q: "Rick Astley Never Gonna Give You Up Official Music Video",
          type: "video",
          maxResults: 1,
        })
      })
    );

    expect(videoId).toBe("dQw4w9WgXcQ");
  });

  it("should return null if the items array is empty", async () => {
    axios.get.mockResolvedValueOnce({ data: { items: [] } });

    const result = await searchYoutubeVideo("Unknown", "Nothing");

    expect(result).toBeNull();
  });

  it("should return null and log an error if the request fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    axios.get.mockRejectedValueOnce(new Error("API Key Invalid"));

    const result = await searchYoutubeVideo("Artist", "Title");

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
});



