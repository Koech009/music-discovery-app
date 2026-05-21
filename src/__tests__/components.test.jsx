import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Components
import ErrorMessages from "../components/ErrorMessages";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import Modal from "../components/Modal";
import NavBar from "../components/NavBar";
import SearchBar from "../components/SearchBar";
import SongTable from "../components/SongTable";

// ─────────────────────────────────────────────
// MOCKS
// ─────────────────────────────────────────────

vi.mock("../hooks/useFavourites.js", () => ({
  default: () => ({
    favorites: [],
    loading: false,
    error: null,
    addFavorite: vi.fn().mockResolvedValue(undefined),
    removeFavorite: vi.fn(),
  }),
}));

vi.mock("../hooks/useLyrics.js", () => ({
  default: () => ({
    lyrics: null,
    loading: false,
    error: null,
    getLyrics: vi.fn().mockResolvedValue(undefined),
    clearLyrics: vi.fn(),
  }),
}));

vi.mock("../hooks/usePlaylists.js", () => ({
  usePlaylists: () => ({
    playlists: [
      { id: "pl-1", name: "Chill Vibes" },
      { id: "pl-2", name: "Workout Mix" },
    ],
    createPlaylist: vi.fn().mockResolvedValue("pl-new"),
    addSongToPlaylist: vi.fn().mockResolvedValue(undefined),
  }),
}));

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const renderWithRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

const mockSongs = [
  {
    id: "1",
    title: "Baby",
    artist: { name: "Justin Bieber" },
    album: { title: "My World 2.0", cover_medium: "https://cover.jpg" },
    preview: "https://preview.mp3",
  },
  {
    id: "2",
    title: "Blinding Lights",
    artist: { name: "The Weeknd" },
    album: { title: "After Hours", cover_medium: null },
    preview: null,
  },
];

beforeEach(() => vi.clearAllMocks());

// ─────────────────────────────────────────────
// ErrorMessages
// ─────────────────────────────────────────────

describe("ErrorMessages", () => {
  it("renders error message when message is provided", () => {
    render(<ErrorMessages message="Something went wrong" />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("renders nothing when message is null", () => {
    const { container } = render(<ErrorMessages message={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when message is empty string", () => {
    const { container } = render(<ErrorMessages message="" />);
    expect(container).toBeEmptyDOMElement();
  });
});

// ─────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────

describe("Footer", () => {
  it("renders brand name", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );
    expect(screen.getByText("🎵 Tunely")).toBeInTheDocument();
  });

  it("renders footer links", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Contact Us")).toBeInTheDocument();
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
    expect(screen.getByText("Terms of Service")).toBeInTheDocument();
  });

  it("renders current year in copyright", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );
    const year = new Date().getFullYear();
    expect(
      screen.getByText(`© ${year} Tunely. All rights reserved.`),
    ).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────
// Loader
// ─────────────────────────────────────────────

describe("Loader", () => {
  it("renders loading text", () => {
    render(<Loader />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders spinner element", () => {
    const { container } = render(<Loader />);
    expect(container.querySelector(".spinner")).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────
// Modal
// ─────────────────────────────────────────────

describe("Modal", () => {
  it("renders children when open", () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <p>Modal Content</p>
      </Modal>,
    );
    expect(screen.getByText("Modal Content")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    const { container } = render(
      <Modal isOpen={false} onClose={vi.fn()}>
        <p>Modal Content</p>
      </Modal>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        <p>Content</p>
      </Modal>,
    );
    fireEvent.click(screen.getByText("✖"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when overlay is clicked", () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal isOpen={true} onClose={onClose}>
        <p>Content</p>
      </Modal>,
    );
    fireEvent.click(container.querySelector(".modal-overlay"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose when modal content is clicked", () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal isOpen={true} onClose={onClose}>
        <p>Content</p>
      </Modal>,
    );
    fireEvent.click(container.querySelector(".modal-content"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("calls onClose when Escape key is pressed", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        <p>Content</p>
      </Modal>,
    );
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// ─────────────────────────────────────────────
// NavBar
// ─────────────────────────────────────────────

describe("NavBar", () => {
  it("renders logo", () => {
    renderWithRouter(<NavBar />);
    expect(screen.getByText("🎵 Tunely")).toBeInTheDocument();
  });

  it("renders all nav links", () => {
    renderWithRouter(<NavBar />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Contact Us")).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
  });

  it("applies active class to current route", () => {
    render(
      <MemoryRouter initialEntries={["/about"]}>
        <NavBar />
      </MemoryRouter>,
    );
    expect(screen.getByText("About")).toHaveClass("active");
  });

  it("does not apply active class to inactive routes", () => {
    render(
      <MemoryRouter initialEntries={["/about"]}>
        <NavBar />
      </MemoryRouter>,
    );
    expect(screen.getByText("Home")).not.toHaveClass("active");
  });
});

// ─────────────────────────────────────────────
// SearchBar
// ─────────────────────────────────────────────

describe("SearchBar", () => {
  it("renders input with placeholder", () => {
    render(<SearchBar placeholder="Search songs..." onSearch={vi.fn()} />);
    expect(screen.getByPlaceholderText("Search songs...")).toBeInTheDocument();
  });

  it("uses default placeholder when none provided", () => {
    render(<SearchBar onSearch={vi.fn()} />);
    expect(
      screen.getByPlaceholderText("Search for a song or artist"),
    ).toBeInTheDocument();
  });

  it("calls onSearch with trimmed query on submit", () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "  Baby  " },
    });
    fireEvent.click(screen.getByText("Search"));
    expect(onSearch).toHaveBeenCalledWith("Baby");
  });

  it("does not call onSearch when input is empty", () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    fireEvent.click(screen.getByText("Search"));
    expect(onSearch).not.toHaveBeenCalled();
  });

  it("clears input after successful search", () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Baby" } });
    fireEvent.click(screen.getByText("Search"));
    expect(input.value).toBe("");
  });
});

// ─────────────────────────────────────────────
// SongTable
// ─────────────────────────────────────────────

describe("SongTable", () => {
  it("renders all songs", () => {
    renderWithRouter(<SongTable songs={mockSongs} />);
    expect(screen.getByText("Baby")).toBeInTheDocument();
    expect(screen.getByText("Blinding Lights")).toBeInTheDocument();
  });

  it("renders album art when cover is available", () => {
    renderWithRouter(<SongTable songs={mockSongs} />);
    const img = screen.getByAltText("My World 2.0");
    expect(img).toHaveAttribute("src", "https://cover.jpg");
  });

  it("renders placeholder when no album art", () => {
    renderWithRouter(<SongTable songs={mockSongs} />);
    expect(screen.getByText("♪")).toBeInTheDocument();
  });

  it("renders audio preview when available", () => {
    renderWithRouter(<SongTable songs={mockSongs} />);
    const audio = document.querySelector("audio");
    expect(audio).toBeInTheDocument();
    expect(audio).toHaveAttribute("src", "https://preview.mp3");
  });

  it("renders action buttons per song", () => {
    renderWithRouter(<SongTable songs={mockSongs} />);
    expect(screen.getAllByText("🎬 Video")).toHaveLength(2);
    expect(screen.getAllByText("📄 Lyrics")).toHaveLength(2);
    expect(screen.getAllByText("❤️ Save")).toHaveLength(2);
    expect(screen.getAllByText("➕ Add to Playlist")).toHaveLength(2);
  });

  it("shows toast when Save is clicked", async () => {
    renderWithRouter(<SongTable songs={mockSongs} />);
    fireEvent.click(screen.getAllByText("❤️ Save")[0]);
    expect(
      await screen.findByText(`❤️ "Baby" added to Favorites!`),
    ).toBeInTheDocument();
  });

  it("opens lyrics modal when Lyrics button is clicked", async () => {
    renderWithRouter(<SongTable songs={mockSongs} />);
    fireEvent.click(screen.getAllByText("📄 Lyrics")[0]);
    expect(await screen.findByText("Baby — Justin Bieber")).toBeInTheDocument();
  });

  it("closes lyrics modal when close button is clicked", async () => {
    renderWithRouter(<SongTable songs={mockSongs} />);
    fireEvent.click(screen.getAllByText("📄 Lyrics")[0]);
    await screen.findByText("Baby — Justin Bieber");

    fireEvent.click(screen.getByText("✖"));
    await waitFor(() => {
      expect(
        screen.queryByText("Baby — Justin Bieber"),
      ).not.toBeInTheDocument();
    });
  });

  it("opens playlist modal when Add to Playlist is clicked", async () => {
    renderWithRouter(<SongTable songs={mockSongs} />);
    fireEvent.click(screen.getAllByText("➕ Add to Playlist")[0]);
    expect(await screen.findByText(/"Baby"/)).toBeInTheDocument();
  });

  it("closes playlist modal when Cancel is clicked", async () => {
    renderWithRouter(<SongTable songs={mockSongs} />);
    fireEvent.click(screen.getAllByText("➕ Add to Playlist")[0]);
    await screen.findByText(/"Baby"/);

    fireEvent.click(screen.getByText("Cancel"));
    await waitFor(() => {
      expect(screen.queryByText(/"Baby"/)).not.toBeInTheDocument();
    });
  });
});
