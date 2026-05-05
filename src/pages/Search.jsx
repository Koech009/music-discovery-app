import { useState } from "react";
import SearchBar from "../components/SearchBar.jsx";
import useDeezerSearch from "../hooks/useDeezerSearch.js";
import SongTable from "../components/SongTable.jsx";
import "../styles/index.css";

function Search() {
  const [query, setQuery] = useState("");
  const { results, search, loading, error } = useDeezerSearch();

  const handleSearch = (q) => {
    setQuery(q);
    search(q);
  };

  return (
    <div className="search-page">
      <h1>Search Music</h1>

      {/* Single Search Bar */}
      <SearchBar
        placeholder="Enter artist or song..."
        onSearch={handleSearch}
      />

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {results.length > 0 && <SongTable songs={results} />}
    </div>
  );
}

export default Search;
