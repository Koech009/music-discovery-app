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
};

// Lyrics.ovh API tests.
describe("Lyrics.ovh API Tests", () => {

};git 
// YouTube API test.
describe("Lyrics.ovh API Tests", () => {

};



