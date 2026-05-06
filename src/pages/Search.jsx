import { useState } from "react";
import SearchBar from "../components/SearchBar.jsx";
import useDeezerSearch from "../hooks/useDeezerSearch.js";
import SongTable from "../components/SongTable.jsx";
import Loader from "../components/Loader.jsx";
import ErrorMessages from "../components/ErrorMessages.jsx";
import "../styles/index.css";

function Search() {
  const [query, setQuery] = useState("");
  const { results, search, loading, error } = useDeezerSearch();

  // Trigger search from SearchBar and store the query for empty state message
  const handleSearch = (q) => {
    setQuery(q);
    search(q);
  };

  return (
    <div className="search-page">
      <h1>Search Music</h1>

      {/* Search bar — triggers Deezer API search on submit */}
      <SearchBar
        placeholder="Enter artist or song..."
        onSearch={handleSearch}
      />

      {/* Loading and error states */}
      {loading && <Loader />}
      {error && <ErrorMessages message={error} />}

      {/* Show message if search returned no results */}
      {!loading && query && results.length === 0 && (
        <p>No results found for "{query}".</p>
      )}

      {/* Render results in SongTable */}
      {results.length > 0 && <SongTable songs={results} />}
    </div>
  );
}

export default Search;
