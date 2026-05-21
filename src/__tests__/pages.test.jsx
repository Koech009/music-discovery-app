import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

// ─────────────────────────────────────────────
// PAGE IMPORTS
// ─────────────────────────────────────────────

// Public pages
import Home from "../pages/Home";
import About from "../pages/About";
import Contact from "../pages/Contact";
import Search from "../pages/Search";
import VideoPage from "../pages/VideoPage";

// Dashboard pages
import Favourites from "../pages/Favourites";
import Genres from "../pages/Genre";
import Trending from "../pages/Trending";
import Playlists from "../pages/Playlists";
import Profile from "../pages/Profile";
import UserDashboard from "../pages/user/UserDashboard";
import UserPlaylistDetails from "../pages/user/UserPlaylistDetails";

// Auth pages
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";

// Admin pages
import AdminOverview from "../pages/admin/AdminOverview";
import AdminAuditLogs from "../pages/admin/AdminAuditLogs";
import AdminManageUsers from "../pages/admin/AdminManageUsers";
import AdminMessages from "../pages/admin/AdminMessages";
import PendingAdmins from "../pages/admin/PendingAdmins";
import UserDetailsPage from "../pages/admin/UserDetailsPage";

// ─────────────────────────────────────────────
// AXIOS MOCK
// ─────────────────────────────────────────────

const mock = new MockAdapter(axios);
beforeEach(() => mock.reset());

// ─────────────────────────────────────────────
// MODULE MOCKS
// ─────────────────────────────────────────────

vi.mock("../hooks/useFavourites", () => ({
  default: () => ({
    favorites: [
      {
        id: "1",
        title: "Baby",
        artist: { name: "Justin Bieber" },
        album: {},
        preview: null,
        genre: "Pop",
      },
      {
        id: "2",
        title: "Blinding Lights",
        artist: { name: "The Weeknd" },
        album: {},
        preview: null,
        genre: "Pop",
      },
    ],
    loading: false,
    error: null,
    removeFavorite: vi.fn(),
    addFavorite: vi.fn().mockResolvedValue(undefined),
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

vi.mock("../hooks/useLyrics.js", () => ({
  default: () => ({
    lyrics: null,
    loading: false,
    error: null,
    getLyrics: vi.fn(),
    clearLyrics: vi.fn(),
  }),
}));

vi.mock("../hooks/usePlaylists.js", () => ({
  usePlaylists: () => ({
    playlists: [
      { id: "pl-1", name: "Chill Vibes", songs: [], description: "" },
      { id: "pl-2", name: "Workout Mix", songs: [], description: "" },
    ],
    createPlaylist: vi.fn(),
    deletePlaylist: vi.fn(),
    renamePlaylist: vi.fn(),
    removeSongFromPlaylist: vi.fn(),
    updatePlaylistDescription: vi.fn(),
    addSongToPlaylist: vi.fn(),
    getPlaylist: vi.fn(),
    getAllPlaylists: vi.fn(),
  }),
}));

vi.mock("../hooks/useMessage", () => ({
  default: () => ({
    createMessage: vi.fn().mockResolvedValue({}),
    loading: false,
    error: null,
  }),
}));

vi.mock("../hooks/useSignup.js", () => ({
  useSignup: () => ({
    signup: vi.fn().mockResolvedValue(null),
    loading: false,
    error: "",
    success: "",
  }),
}));

vi.mock("../hooks/useAuditLogs", () => ({
  default: () => ({
    logs: [
      {
        id: "log1",
        timestamp: "2024-01-01T10:00:00",
        user: { username: "Alice" },
        action: "LOGIN",
        target_type: "user",
        target_id: "u1",
        details: "Logged in",
      },
    ],
    loading: false,
    error: "",
    page: 1,
    totalPages: 1,
    total: 1,
    perPage: 20,
    goToPage: vi.fn(),
    refetch: vi.fn(),
  }),
}));

vi.mock("../hooks/useAdminUsers", () => ({
  useAdminUsers: () => ({
    users: [
      {
        id: "u1",
        username: "Alice",
        email: "alice@test.com",
        role: "user",
        suspended: false,
      },
      {
        id: "u2",
        username: "Bob",
        email: "bob@test.com",
        role: "admin",
        suspended: true,
      },
    ],
    allUsers: [],
    allMessages: [{ id: "m1", is_read: false }],
    messages: [
      {
        id: "m1",
        name: "Alice",
        email: "alice@test.com",
        message: "Hello there",
        is_read: false,
        created_at: "2024-01-01T10:00:00",
      },
    ],
    loading: false,
    error: "",
    search: "",
    metadata: {
      current_page: 1,
      total_pages: 1,
      has_prev: false,
      has_next: false,
      total: 2,
    },
    msgMetadata: {
      current_page: 1,
      total_pages: 1,
      has_prev: false,
      has_next: false,
      total: 1,
    },
    msgLoading: false,
    msgError: "",
    perPage: 10,
    loadUsers: vi.fn(),
    loadMessages: vi.fn(),
    loadUserDetails: vi.fn(),
    updateUserField: vi.fn(),
    changePassword: vi.fn(),
    toggleSuspend: vi.fn(),
    deleteUser: vi.fn(),
    markRead: vi.fn(),
    removeMessage: vi.fn(),
    goToPage: vi.fn(),
    goToMsgPage: vi.fn(),
    handleSearch: vi.fn(),
    setSelectedUser: vi.fn(),
  }),
}));

vi.mock("../hooks/useUsers", () => ({
  useUsers: () => ({
    users: [],
    pendingAdmins: [
      {
        id: "a1",
        username: "AdminUser",
        email: "admin@test.com",
        created_at: "2024-01-01T10:00:00",
      },
    ],
    pendingMetadata: {
      current_page: 1,
      total_pages: 1,
      has_prev: false,
      has_next: false,
      total: 1,
    },
    perPage: 10,
    loading: false,
    error: "",
    fetchUsers: vi.fn(),
    fetchPendingAdmins: vi.fn(),
    deleteUser: vi.fn(),
    changeRole: vi.fn(),
    promoteUser: vi.fn(),
    suspendUser: vi.fn(),
    approveAdmin: vi.fn(),
    rejectAdmin: vi.fn(),
    goToPendingPage: vi.fn(),
  }),
}));

vi.mock("../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: "u1",
      username: "Alice",
      role: "user",
      email: "alice@test.com",
    },
    login: vi.fn(),
    logout: vi.fn(),
    updateUserContext: vi.fn(),
    hasRole: vi.fn(),
    loading: false,
  }),
}));

vi.mock("../api/user", () => ({
  loginUser: vi.fn(),
  updateUser: vi.fn().mockResolvedValue({}),
  changePassword: vi.fn().mockResolvedValue({}),
  getUserById: vi.fn().mockResolvedValue({
    id: "u1",
    username: "Alice",
    role: "user",
    suspended: false,
  }),
  toggleSuspendUser: vi.fn().mockResolvedValue({}),
  deleteUserAdmin: vi.fn().mockResolvedValue({}),
}));

vi.mock("../api/favourites", () => ({
  getFavorites: vi.fn().mockResolvedValue([]),
  addFavorite: vi.fn().mockResolvedValue({}),
  removeFavorite: vi.fn().mockResolvedValue({}),
  fetchGenreForSong: vi.fn().mockResolvedValue("Pop"),
}));

vi.mock("../api/playlists.js", () => ({
  getPlaylists: vi.fn().mockResolvedValue([]),
  getPlaylistById: vi
    .fn()
    .mockResolvedValue({ id: "pl-1", name: "Chill", songs: [] }),
  addSongToPlaylist: vi.fn().mockResolvedValue({}),
  removeSongFromPlaylist: vi.fn().mockResolvedValue({}),
}));

vi.mock("../utils/api", () => ({
  default: {
    get: vi.fn().mockResolvedValue({
      data: { users: [], pending_admins: [], messages: [] },
    }),
    post: vi.fn().mockResolvedValue({ data: {} }),
    patch: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
  },
}));

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const renderWithRouter = (ui, { route = "/" } = {}) =>
  render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);

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
    expect(screen.getByText("500K+")).toBeInTheDocument();
  });

  it("renders feature cards", () => {
    renderWithRouter(<Home />);
    expect(screen.getByText("Search songs")).toBeInTheDocument();
    expect(screen.getByText("Watch videos")).toBeInTheDocument();
    expect(screen.getByText("Read lyrics")).toBeInTheDocument();
    expect(screen.getByText("Save favourites")).toBeInTheDocument();
  });

  it("renders Get Started link pointing to /signup", () => {
    renderWithRouter(<Home />);
    const links = screen.getAllByRole("link", { name: /get started/i });
    expect(links[0]).toHaveAttribute("href", "/signup");
  });

  it("renders How It Works steps", () => {
    renderWithRouter(<Home />);
    expect(screen.getByText("Sign up")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
    expect(screen.getByText("Enjoy")).toBeInTheDocument();
  });

  it("renders new features section", () => {
    renderWithRouter(<Home />);
    expect(screen.getByText("Playlists")).toBeInTheDocument();
    expect(screen.getByText("User accounts")).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────
// ABOUT
// ─────────────────────────────────────────────

describe("About", () => {
  it("renders page heading", () => {
    renderWithRouter(<About />);
    expect(
      screen.getByText("Tunely", { selector: "span" }),
    ).toBeInTheDocument();
  });

  it("renders mission section", () => {
    renderWithRouter(<About />);
    expect(screen.getByText("Our Mission")).toBeInTheDocument();
  });

  it("renders why Tunely section", () => {
    renderWithRouter(<About />);
    expect(screen.getByText("Why Tunely?")).toBeInTheDocument();
  });

  it("renders new features list", () => {
    renderWithRouter(<About />);
    expect(
      screen.getByText("Create and manage playlists your way."),
    ).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────
// CONTACT
// ─────────────────────────────────────────────

describe("Contact", () => {
  it("renders page heading", () => {
    renderWithRouter(<Contact />);
    expect(screen.getByText("Us", { selector: "span" })).toBeInTheDocument();
  });

  it("renders form fields", () => {
    renderWithRouter(<Contact />);
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Message")).toBeInTheDocument();
  });

  it("renders submit button", () => {
    renderWithRouter(<Contact />);
    expect(screen.getByText("Send Message")).toBeInTheDocument();
  });

  it("shows validation errors when submitted empty", async () => {
    renderWithRouter(<Contact />);
    fireEvent.click(screen.getByText("Send Message"));
    expect(await screen.findByText("Name is required.")).toBeInTheDocument();
    expect(await screen.findByText("Email is required.")).toBeInTheDocument();
    expect(
      await screen.findByText("Message cannot be empty."),
    ).toBeInTheDocument();
  });

  it("shows success message on valid submit", async () => {
    renderWithRouter(<Contact />);
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Alice" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "alice@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "Hello there" },
    });
    fireEvent.click(screen.getByText("Send Message"));
    expect(
      await screen.findByText("Message sent successfully!"),
    ).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────

describe("Login", () => {
  it("renders login form", () => {
    renderWithRouter(<Login />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByText("Log In")).toBeInTheDocument();
  });

  it("renders Tunely logo", () => {
    renderWithRouter(<Login />);
    expect(screen.getByText("Tunely")).toBeInTheDocument();
  });

  it("shows validation error for empty email", async () => {
    renderWithRouter(<Login />);
    fireEvent.click(screen.getByText("Log In"));
    expect(await screen.findByText("Email is required.")).toBeInTheDocument();
  });

  it("shows validation error for invalid email", async () => {
    renderWithRouter(<Login />);
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "not-an-email" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByText("Log In"));
    expect(
      await screen.findByText("Invalid email format."),
    ).toBeInTheDocument();
  });

  it("shows validation error for short password", async () => {
    renderWithRouter(<Login />);
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "alice@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "short" },
    });
    fireEvent.click(screen.getByText("Log In"));
    expect(
      await screen.findByText("Password must be at least 8 characters."),
    ).toBeInTheDocument();
  });

  it("renders sign up link", () => {
    renderWithRouter(<Login />);
    expect(screen.getByText("Sign up")).toBeInTheDocument();
  });

  it("toggles password visibility", () => {
    renderWithRouter(<Login />);
    const toggle = screen.getByText("👁️");
    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("type", "password");
    fireEvent.click(toggle);
    expect(input).toHaveAttribute("type", "text");
  });
});

// ─────────────────────────────────────────────
// SIGNUP
// ─────────────────────────────────────────────

describe("Signup", () => {
  it("renders signup form", () => {
    renderWithRouter(<Signup />);
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByText("Create Account")).toBeInTheDocument();
  });

  it("renders Tunely logo", () => {
    renderWithRouter(<Signup />);
    expect(screen.getByText("Tunely")).toBeInTheDocument();
  });

  it("shows validation error for empty username", async () => {
    renderWithRouter(<Signup />);
    fireEvent.click(screen.getByText("Create Account"));
    expect(
      await screen.findByText("Username is required."),
    ).toBeInTheDocument();
  });

  it("shows error for username with spaces", async () => {
    renderWithRouter(<Signup />);
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "alice bob" },
    });
    fireEvent.click(screen.getByText("Create Account"));
    expect(
      await screen.findByText("Username cannot contain spaces."),
    ).toBeInTheDocument();
  });

  it("shows error for mismatched passwords", async () => {
    renderWithRouter(<Signup />);
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "alice" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "alice@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Password1!" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "Different1!" },
    });
    fireEvent.click(screen.getByText("Create Account"));
    expect(
      await screen.findByText("Passwords do not match."),
    ).toBeInTheDocument();
  });

  it("renders Log in link", () => {
    renderWithRouter(<Signup />);
    expect(screen.getByText("Log in")).toBeInTheDocument();
  });

  it("renders role selector with user and admin options", () => {
    renderWithRouter(<Signup />);
    expect(screen.getByText("User")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
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

  it("renders search bar with correct placeholder", () => {
    renderWithRouter(<Search />);
    expect(
      screen.getByPlaceholderText("Enter artist or song..."),
    ).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────
// VIDEO PAGE
// ─────────────────────────────────────────────

describe("VideoPage", () => {
  const renderVideoPage = () =>
    render(
      <MemoryRouter initialEntries={["/dashboard/video/Justin Bieber/Baby"]}>
        <Routes>
          <Route
            path="/dashboard/video/:artist/:title"
            element={<VideoPage />}
          />
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
    expect(screen.getAllByText("✕ Remove")).toHaveLength(2);
  });

  it("renders lyrics and video buttons per song", () => {
    renderWithRouter(<Favourites />);
    expect(screen.getAllByText("📄 Lyrics")).toHaveLength(2);
    expect(screen.getAllByText("🎬 Video")).toHaveLength(2);
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
        data: [
          {
            id: "99",
            title: "Levitating",
            artist: { name: "Dua Lipa" },
            album: {},
            preview: null,
          },
        ],
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
// TRENDING
// ─────────────────────────────────────────────

describe("Trending", () => {
  it("renders page heading", async () => {
    mock.onGet("/api/deezer/chart").reply(200, {
      tracks: { data: [] },
    });
    renderWithRouter(<Trending />);
    expect(await screen.findByText("🔥 Trending Now")).toBeInTheDocument();
  });

  it("renders trending songs from API", async () => {
    mock.onGet("/api/deezer/chart").reply(200, {
      tracks: {
        data: [
          {
            id: "1",
            title: "Blinding Lights",
            artist: { name: "The Weeknd" },
            album: {},
            preview: null,
          },
          {
            id: "2",
            title: "Levitating",
            artist: { name: "Dua Lipa" },
            album: {},
            preview: null,
          },
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
          {
            id: "1",
            title: "Song One",
            artist: { name: "Artist One" },
            album: {},
            preview: null,
          },
          {
            id: "2",
            title: "Song Two",
            artist: { name: "Artist Two" },
            album: {},
            preview: null,
          },
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
// PLAYLISTS
// ─────────────────────────────────────────────

describe("Playlists", () => {
  it("renders page heading", () => {
    renderWithRouter(<Playlists />);
    expect(screen.getByText("My Playlists")).toBeInTheDocument();
  });

  it("renders playlist cards", () => {
    renderWithRouter(<Playlists />);
    expect(screen.getByText("Chill Vibes")).toBeInTheDocument();
    expect(screen.getByText("Workout Mix")).toBeInTheDocument();
  });

  it("renders edit and delete buttons per playlist", () => {
    renderWithRouter(<Playlists />);
    expect(screen.getAllByText("✏️ Edit")).toHaveLength(2);
    expect(screen.getAllByText("🗑️ Delete")).toHaveLength(2);
  });

  it("renders show songs toggle buttons", () => {
    renderWithRouter(<Playlists />);
    expect(screen.getAllByText("▼ Show Songs")).toHaveLength(2);
  });

  it("renders playlist count in subtitle", () => {
    renderWithRouter(<Playlists />);
    expect(screen.getByText("2 playlists")).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────

describe("Profile", () => {
  it("renders profile heading", () => {
    renderWithRouter(<Profile />);
    expect(screen.getByText("My Profile")).toBeInTheDocument();
  });

  it("renders profile form fields", () => {
    renderWithRouter(<Profile />);
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Bio")).toBeInTheDocument();
  });

  it("renders update profile button", () => {
    renderWithRouter(<Profile />);
    expect(screen.getByText("Update Profile")).toBeInTheDocument();
  });

  it("renders change password section", () => {
    renderWithRouter(<Profile />);
    expect(screen.getByText("Change Password")).toBeInTheDocument();
    expect(
      screen.getByText("Change Password", { selector: "button" }),
    ).toBeInTheDocument();
  });

  it("shows validation error for invalid email on update", async () => {
    renderWithRouter(<Profile />);
    const emailInput = screen.getByLabelText("Email");
    fireEvent.change(emailInput, { target: { value: "bad-email" } });
    fireEvent.click(screen.getByText("Update Profile"));
    expect(
      await screen.findByText("Valid email is required."),
    ).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────
// USER DASHBOARD
// ─────────────────────────────────────────────

describe("UserDashboard", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          success: true,
          playlists: [],
          favorites: [],
          metadata: null,
        }),
    });
  });

  it("renders welcome message with username", () => {
    renderWithRouter(<UserDashboard />);
    expect(screen.getByText(/Welcome back, Alice/)).toBeInTheDocument();
  });

  it("renders dashboard cards", () => {
    renderWithRouter(<UserDashboard />);
    expect(screen.getByText("Search Music")).toBeInTheDocument();
    expect(screen.getByText("My Playlists")).toBeInTheDocument();
    expect(screen.getByText("Favourites")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    renderWithRouter(<UserDashboard />);
    expect(screen.getByText("Go to Search →")).toBeInTheDocument();
    expect(screen.getByText("Manage Profile →")).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────
// USER PLAYLIST DETAILS
// ─────────────────────────────────────────────

describe("UserPlaylistDetails", () => {
  const renderPage = () =>
    render(
      <MemoryRouter initialEntries={["/dashboard/playlists/pl-1"]}>
        <Routes>
          <Route
            path="/dashboard/playlists/:id"
            element={<UserPlaylistDetails />}
          />
        </Routes>
      </MemoryRouter>,
    );

  it("renders playlist name after load", async () => {
    renderPage();
    expect(await screen.findByText("Chill")).toBeInTheDocument();
  });

  it("renders add songs search bar", async () => {
    renderPage();
    expect(
      await screen.findByPlaceholderText("Search songs..."),
    ).toBeInTheDocument();
  });

  it("renders empty songs message", async () => {
    renderPage();
    expect(
      await screen.findByText("No songs yet. Add some below!"),
    ).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────
// ADMIN OVERVIEW
// ─────────────────────────────────────────────

describe("AdminOverview", () => {
  it("renders welcome message", async () => {
    renderWithRouter(<AdminOverview />);
    expect(await screen.findByText(/Welcome back, Alice/)).toBeInTheDocument();
  });

  it("renders all dashboard cards", async () => {
    renderWithRouter(<AdminOverview />);
    expect(await screen.findByText("👥 Manage Users")).toBeInTheDocument();
    expect(screen.getByText("📩 Messages")).toBeInTheDocument();
    expect(screen.getByText("🗂 Audit Logs")).toBeInTheDocument();
    expect(screen.getByText("🎵 Genres")).toBeInTheDocument();
    expect(screen.getByText("🔥 Trending")).toBeInTheDocument();
  });

  it("renders navigation links", async () => {
    renderWithRouter(<AdminOverview />);
    expect(await screen.findByText("Manage Users →")).toBeInTheDocument();
    expect(screen.getByText("View Audit Logs →")).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────
// ADMIN AUDIT LOGS
// ─────────────────────────────────────────────

describe("AdminAuditLogs", () => {
  it("renders page heading", () => {
    renderWithRouter(<AdminAuditLogs />);
    expect(screen.getByText("Audit Logs")).toBeInTheDocument();
  });

  it("renders log entry", () => {
    renderWithRouter(<AdminAuditLogs />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("LOGIN")).toBeInTheDocument();
    expect(screen.getByText("Logged in")).toBeInTheDocument();
  });

  it("renders table headers", () => {
    renderWithRouter(<AdminAuditLogs />);
    expect(screen.getByText("Timestamp")).toBeInTheDocument();
    expect(screen.getByText("Actor")).toBeInTheDocument();
    expect(screen.getByText("Action")).toBeInTheDocument();
    expect(screen.getByText("Target")).toBeInTheDocument();
    expect(screen.getByText("Details")).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────
// ADMIN MANAGE USERS
// ─────────────────────────────────────────────

describe("AdminManageUsers", () => {
  it("renders page heading", () => {
    renderWithRouter(<AdminManageUsers />);
    expect(screen.getByText("User Management")).toBeInTheDocument();
  });

  it("renders user rows", () => {
    renderWithRouter(<AdminManageUsers />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("renders action buttons per user", () => {
    renderWithRouter(<AdminManageUsers />);
    expect(screen.getAllByText("View")).toHaveLength(2);
    expect(screen.getAllByText("Delete")).toHaveLength(2);
  });

  it("renders suspend and unsuspend buttons correctly", () => {
    renderWithRouter(<AdminManageUsers />);
    expect(screen.getByText("Suspend")).toBeInTheDocument();
    expect(screen.getByText("Unsuspend")).toBeInTheDocument();
  });

  it("renders search input", () => {
    renderWithRouter(<AdminManageUsers />);
    expect(screen.getByPlaceholderText("Search users...")).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────
// ADMIN MESSAGES
// ─────────────────────────────────────────────

describe("AdminMessages", () => {
  it("renders page heading", () => {
    renderWithRouter(<AdminMessages />);
    expect(screen.getByText("Messages")).toBeInTheDocument();
  });

  it("renders message rows", () => {
    renderWithRouter(<AdminMessages />);
    expect(screen.getByText("Hello there")).toBeInTheDocument();
    expect(screen.getByText("alice@test.com")).toBeInTheDocument();
  });

  it("renders Mark Read button for unread messages", () => {
    renderWithRouter(<AdminMessages />);
    expect(screen.getByText("Mark Read")).toBeInTheDocument();
  });

  it("renders Delete button", () => {
    renderWithRouter(<AdminMessages />);
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("shows unread message count", () => {
    renderWithRouter(<AdminMessages />);
    expect(screen.getByText(/1 unread message/)).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────
// PENDING ADMINS
// ─────────────────────────────────────────────

describe("PendingAdmins", () => {
  it("renders page heading", () => {
    renderWithRouter(<PendingAdmins />);
    expect(screen.getByText("Pending Admin Accounts")).toBeInTheDocument();
  });

  it("renders pending admin rows", () => {
    renderWithRouter(<PendingAdmins />);
    expect(screen.getByText("AdminUser")).toBeInTheDocument();
    expect(screen.getByText("admin@test.com")).toBeInTheDocument();
  });

  it("renders Approve and Reject buttons", () => {
    renderWithRouter(<PendingAdmins />);
    expect(screen.getByText("Approve")).toBeInTheDocument();
    expect(screen.getByText("Reject")).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────
// USER DETAILS PAGE (Admin)
// ─────────────────────────────────────────────

describe("UserDetailsPage", () => {
  const renderPage = () =>
    render(
      <MemoryRouter initialEntries={["/admin/users/u1"]}>
        <Routes>
          <Route path="/admin/users/:id" element={<UserDetailsPage />} />
        </Routes>
      </MemoryRouter>,
    );

  it("renders user details after load", async () => {
    renderPage();
    expect(await screen.findByText("User Details")).toBeInTheDocument();
  });

  it("renders back button", async () => {
    renderPage();
    expect(await screen.findByText("← Back to Users")).toBeInTheDocument();
  });

  it("renders suspend and delete buttons", async () => {
    renderPage();
    expect(await screen.findByText("Suspend")).toBeInTheDocument();
    expect(await screen.findByText("Delete User")).toBeInTheDocument();
  });

  it("renders user username", async () => {
    renderPage();
    expect(await screen.findByText("Alice")).toBeInTheDocument();
  });
});
