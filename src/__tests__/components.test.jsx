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
    addFavorite: vi.fn().mockResolvedValue(undefined), // ✅ returns Promise
    removeFavorite: vi.fn(),
  }),
}));

vi.mock("../hooks/useLyrics.js", () => ({
  default: () => ({
    lyrics: null,
    loading: false,
    error: null,
    getLyrics: vi.fn().mockResolvedValue(undefined), // ✅ returns Promise
  }),
}));

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
    render(<Footer />);
    expect(screen.getByText("🎵 Tunely")).toBeInTheDocument();
  });

  it("renders footer links", () => {
    render(<Footer />);
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
  });

  it("renders current year in copyright", () => {
    render(<Footer />);
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
    fireEvent.click(container.querySelector(".overlay"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not call onClose when modal content is clicked", () => {
    const onClose = vi.fn();
    const { container } = render(
      <Modal isOpen={true} onClose={onClose}>
        <p>Content</p>
      </Modal>,
    );
    fireEvent.click(container.querySelector(".modal"));
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
    expect(screen.getByText("Search")).toBeInTheDocument();
    expect(screen.getByText("Favorites")).toBeInTheDocument();
    expect(screen.getByText("Trending")).toBeInTheDocument();
    expect(screen.getByText("Genres")).toBeInTheDocument();
  });

  it("applies active class to current route", () => {
    render(
      <MemoryRouter initialEntries={["/search"]}>
        <NavBar />
      </MemoryRouter>,
    );
    expect(screen.getByText("Search")).toHaveClass("active");
  });

  it("does not apply active class to inactive routes", () => {
    render(
      <MemoryRouter initialEntries={["/search"]}>
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

  it("renders Watch Video, Read Lyrics, and Save buttons per song", () => {
    renderWithRouter(<SongTable songs={mockSongs} />);
    expect(screen.getAllByText("Watch Video")).toHaveLength(2);
    expect(screen.getAllByText("Read Lyrics")).toHaveLength(2);
    expect(screen.getAllByText("❤️ Save")).toHaveLength(2);
  });

  // ✅ Fixed: mockResolvedValue on addFavorite + findByText
  it("shows toast when Save is clicked", async () => {
    renderWithRouter(<SongTable songs={mockSongs} />);
    fireEvent.click(screen.getAllByText("❤️ Save")[0]);
    expect(
      await screen.findByText(`❤️ "Baby" added to Favorites!`),
    ).toBeInTheDocument();
  });

  // ✅ Fixed: findByText waits for async modal render
  it("opens lyrics modal when Read Lyrics is clicked", async () => {
    renderWithRouter(<SongTable songs={mockSongs} />);
    fireEvent.click(screen.getAllByText("Read Lyrics")[0]);
    expect(await screen.findByText("Baby — Justin Bieber")).toBeInTheDocument();
  });

  // ✅ Fixed: findByText for open, waitFor for close
  it("closes modal when close button is clicked", async () => {
    renderWithRouter(<SongTable songs={mockSongs} />);
    fireEvent.click(screen.getAllByText("Read Lyrics")[0]);
    await screen.findByText("Baby — Justin Bieber");

    fireEvent.click(screen.getByText("✖"));
    await waitFor(() => {
      expect(
        screen.queryByText("Baby — Justin Bieber"),
      ).not.toBeInTheDocument();
    });
  });
});
