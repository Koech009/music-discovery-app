import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import VideoPage from "../pages/VideoPage";

// Mock hooks and sub-components to isolate VideoPage logic
vi.mock("../hooks/useYoutubeVideo");
vi.mock("../components/Loader", () => ({ default: () => <div>Loading...</div> }));
vi.mock("../components/ErrorMessages", () => ({ default: ({ message }) => <div>{message}</div> }));

import useYoutubeVideo from "../hooks/useYoutubeVideo";

const mockFetchVideoId = vi.fn();

// Helper — renders VideoPage with URL params injected via MemoryRouter
const renderVideoPage = (artist = "Adele", title = "Hello") =>
  render(
    <MemoryRouter initialEntries={[`/video/${artist}/${title}`]}>
      <Routes>
        <Route path="/video/:artist/:title" element={<VideoPage />} />
      </Routes>
    </MemoryRouter>
  );

describe("VideoPage", () => {
  it("shows loader while video is being fetched", () => {
    // Verifies Loader renders when loading is true
    useYoutubeVideo.mockReturnValue({ videoId: null, loading: true, error: null, fetchVideoId: mockFetchVideoId });
    renderVideoPage();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows error when video fetch fails", () => {
    // Verifies error message renders when error is set
    useYoutubeVideo.mockReturnValue({ videoId: null, loading: false, error: "Video not found", fetchVideoId: mockFetchVideoId });
    renderVideoPage();
    expect(screen.getByText("Video not found")).toBeInTheDocument();
  });

  it("renders the song title and artist from URL params", () => {
    // Verifies decoded title and artist from URL are displayed in the header
    useYoutubeVideo.mockReturnValue({ videoId: null, loading: false, error: null, fetchVideoId: mockFetchVideoId });
    renderVideoPage("Adele", "Hello");
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("Adele")).toBeInTheDocument();
  });

  it("renders YouTube iframe with correct src when videoId is available", () => {
    // Verifies the iframe src contains the correct YouTube embed URL
    useYoutubeVideo.mockReturnValue({ videoId: "abc123", loading: false, error: null, fetchVideoId: mockFetchVideoId });
    renderVideoPage("Adele", "Hello");
    const iframe = screen.getByTitle(/Hello by Adele/i);
    expect(iframe.src).toContain("https://www.youtube.com/embed/abc123");
  });

  it("calls fetchVideoId with artist and title from URL params on mount", () => {
    // Verifies the hook is called with the correct URL-decoded params
    useYoutubeVideo.mockReturnValue({ videoId: null, loading: false, error: null, fetchVideoId: mockFetchVideoId });
    renderVideoPage("Adele", "Hello");
    expect(mockFetchVideoId).toHaveBeenCalledWith("Adele", "Hello");
  });
});
