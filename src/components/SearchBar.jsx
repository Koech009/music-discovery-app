import "../styles/forms.css";

function SearchBar({ placeholder, onSearch }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const query = e.target.search.value.trim();
    if (query) onSearch(query);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", gap: "10px", width: "100%" }}
    >
      <input
        type="text"
        name="search"
        placeholder={placeholder}
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
