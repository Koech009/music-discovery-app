import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

import Favourites from "../pages/Favourites";
import Genres from "../pages/Genre";
import Home from "../pages/Home";
import Search from "../pages/Search";
import Trending from "../pages/Trending";
import VideoPage from "../pages/VideoPage";

// ─────────────────────────────────────────────
// MOCKS
// ─────────────────────────────────────────────

const mock = new MockAdapter(axios);
beforeEach(() => mock.reset());

vi.mock("../hooks/useFavourites", () => ({
  default: () => ({
    favorites: [
      { id: "1", title: "Baby", artist: { name: "Justin Bieber" } },
      { id: "2", title: "Blinding Lights", artist: { name: "The Weeknd" } },
    ],
    loading: false,
    error: null,
    removeFavorite: vi.fn(),
  }),
}));

vi.mock("../hooks/useDeezerSearch", () => ({
  default: () => ({
    results: [],
    search: vi.fn(),
    loading: false,
    error: null,
  }),
}));

vi.mock("../hooks/useYoutubeVideo.js", () => ({
  default: () => ({
    videoId: "dQw4w9WgXcQ",
    loading: false,
    error: null,
    fetchVideoId: vi.fn(),
  }),
}));

const renderWithRouter = (ui, { route = "/" } = {}) => {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);
};

// ─────────────────────────────────────────────
// HOME
// ─────────────────────────────────────────────
describe("Home", () => {
  it("renders hero heading", () => {
    renderWithRouter(<Home />);
    expect(screen.getByText("Discover Music Instantly")).toBeInTheDocument();
  });

  it("renders stats section", () => {
    renderWithRouter(<Home />);
    expect(screen.getByText("50M+")).toBeInTheDocument();
    expect(screen.getByText("2M+")).toBeInTheDocument();
    expect(screen.getByText("1900+")).toBeInTheDocument();
  });

  it("renders feature cards", () => {
    renderWithRouter(<Home />);
    expect(screen.getByText("Search Songs")).toBeInTheDocument();
    expect(screen.getByText("Watch Videos")).toBeInTheDocument();
    expect(screen.getByText("Read Lyrics")).toBeInTheDocument();
    expect(screen.getByText("Save Favorites")).toBeInTheDocument();
  });

  it("renders Get Started link pointing to /search", () => {
    renderWithRouter(<Home />);
    const links = screen.getAllByRole("link", { name: /get started/i });
    expect(links[0]).toHaveAttribute("href", "/search");
  });

  it("renders How It Works steps", () => {
    renderWithRouter(<Home />);
    expect(screen.getByText("Search")).toBeInTheDocument();
    expect(screen.getByText("Explore")).toBeInTheDocument();
    expect(screen.getByText("Enjoy")).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────
// FAVOURITES
// ─────────────────────────────────────────────
describe("Favourites", () => {
  it("renders page heading", () => {
    renderWithRouter(<Favourites />);
    expect(screen.getByText("My Favourites")).toBeInTheDocument();
  });

  it("renders list of favourite songs", () => {
    renderWithRouter(<Favourites />);
    expect(screen.getByText("Baby")).toBeInTheDocument();
    expect(screen.getByText("Justin Bieber")).toBeInTheDocument();
    expect(screen.getByText("Blinding Lights")).toBeInTheDocument();
    expect(screen.getByText("The Weeknd")).toBeInTheDocument();
  });

  it("renders remove buttons for each song", () => {
    renderWithRouter(<Favourites />);
    const removeButtons = screen.getAllByText("Remove");
    expect(removeButtons).toHaveLength(2);
  });

  it("shows empty state when no favourites", () => {
    renderWithRouter(<Favourites />);
  });

  it("shows loader when loading", () => {
    renderWithRouter(<Favourites />);
  });
});

// ─────────────────────────────────────────────
// GENRES
// ─────────────────────────────────────────────
describe("Genres", () => {
  it("renders page heading", async () => {
    mock.onGet("/api/deezer/genre").reply(200, { data: [] });
    renderWithRouter(<Genres />);
    expect(screen.getByText("🎸 Genres")).toBeInTheDocument();
  });

  it("renders genre buttons from API", async () => {
    mock.onGet("/api/deezer/genre").reply(200, {
      data: [
        { id: 132, name: "Pop" },
        { id: 152, name: "Rock" },
      ],
    });

    renderWithRouter(<Genres />);

    expect(await screen.findByText("Pop")).toBeInTheDocument();
    expect(await screen.findByText("Rock")).toBeInTheDocument();
  });

  it("fetches and displays songs when genre is clicked", async () => {
    mock.onGet("/api/deezer/genre").reply(200, {
      data: [{ id: 132, name: "Pop" }],
    });
    mock.onGet("/api/deezer/chart/132").reply(200, {
      tracks: {
        data: [{ id: "99", title: "Levitating", artist: { name: "Dua Lipa" } }],
      },
    });

    renderWithRouter(<Genres />);

    fireEvent.click(await screen.findByText("Pop"));

    expect(await screen.findByText("Levitating")).toBeInTheDocument();
    expect(await screen.findByText("Dua Lipa")).toBeInTheDocument();
  });

  it("shows error when genre fetch fails", async () => {
    mock.onGet("/api/deezer/genre").reply(500);
    renderWithRouter(<Genres />);
    expect(
      await screen.findByText("Could not load genres."),
    ).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────
// SEARCH
// ─────────────────────────────────────────────
describe("Search", () => {
  it("renders page heading", () => {
    renderWithRouter(<Search />);
    expect(screen.getByText("Search Music")).toBeInTheDocument();
  });

  it("renders search bar", () => {
    renderWithRouter(<Search />);
    expect(
      screen.getByPlaceholderText("Enter artist or song..."),
    ).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────
// TRENDING
// ─────────────────────────────────────────────
describe("Trending", () => {
  it("renders page heading", async () => {
    mock.onGet("/api/deezer/chart").reply(200, {
      tracks: {
        data: [
          { id: "1", title: "Blinding Lights", artist: { name: "The Weeknd" } },
        ],
      },
    });
    renderWithRouter(<Trending />);
    expect(await screen.findByText("🔥 Trending Now")).toBeInTheDocument();
  });

  it("renders trending songs from API", async () => {
    mock.onGet("/api/deezer/chart").reply(200, {
      tracks: {
        data: [
          { id: "1", title: "Blinding Lights", artist: { name: "The Weeknd" } },
          { id: "2", title: "Levitating", artist: { name: "Dua Lipa" } },
        ],
      },
    });
    renderWithRouter(<Trending />);
    expect(await screen.findByText("Blinding Lights")).toBeInTheDocument();
    expect(await screen.findByText("The Weeknd")).toBeInTheDocument();
    expect(await screen.findByText("Levitating")).toBeInTheDocument();
    expect(await screen.findByText("Dua Lipa")).toBeInTheDocument();
  });

  it("renders rank numbers", async () => {
    mock.onGet("/api/deezer/chart").reply(200, {
      tracks: {
        data: [
          { id: "1", title: "Song One", artist: { name: "Artist One" } },
          { id: "2", title: "Song Two", artist: { name: "Artist Two" } },
        ],
      },
    });
    renderWithRouter(<Trending />);
    expect(await screen.findByText("#1")).toBeInTheDocument();
    expect(await screen.findByText("#2")).toBeInTheDocument();
  });

  it("shows error when trending fetch fails", async () => {
    mock.onGet("/api/deezer/chart").reply(500);
    renderWithRouter(<Trending />);
    expect(
      await screen.findByText("Could not load trending songs."),
    ).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────
// VIDEO PAGE
// ─────────────────────────────────────────────
describe("VideoPage", () => {
  const renderVideoPage = () =>
    render(
      <MemoryRouter initialEntries={["/video/Justin Bieber/Baby"]}>
        <Routes>
          <Route path="/video/:artist/:title" element={<VideoPage />} />
        </Routes>
      </MemoryRouter>,
    );

  it("renders song title and artist from URL params", () => {
    renderVideoPage();
    expect(screen.getByText("Baby")).toBeInTheDocument();
    expect(screen.getByText("Justin Bieber")).toBeInTheDocument();
  });

  it("renders YouTube iframe when videoId is available", () => {
    renderVideoPage();
    const iframe = screen.getByTitle("Baby by Justin Bieber");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute(
      "src",
      "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
    );
  });

  it("renders back button", () => {
    renderVideoPage();
    expect(screen.getByText("← Back to Search")).toBeInTheDocument();
  });
});
