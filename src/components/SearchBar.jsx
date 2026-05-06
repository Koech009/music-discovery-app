import { useState } from "react";
import "../styles/forms.css";

function SearchBar({ placeholder, onSearch }) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query && onSearch) {
      onSearch(query);
      setSearchQuery("");
    }
  };

  const handleSearchQueryChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", gap: "10px", width: "100%" }}
    >
      <input
        type="text"
        name="search"
        placeholder={placeholder || "Search for a song or artist"}
        value={searchQuery}
        onChange={handleSearchQueryChange}
        className="form-input"
        style={{ flex: 1 }}
      />
      <button type="submit" className="form-btn">
        Search
      </button>
    </form>
  );
}

export default SearchBar;
