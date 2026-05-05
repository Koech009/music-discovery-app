import { useState } from "react";

// Search bar will bs used to search for songs or artists.
function SearchBar() {
    const [SearchQuery, setSearchQuery] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
    };

    const handleSearchQueryChange = (event) => {
        setSearchQuery(event.target.value)
    }

    return (
    <div id='searchbar'>
        <form onSubmit = {handleSubmit}>
            <input type="text" placeholder="Search for a song or artist" value={SearchQuery} onChange={handleSearchQueryChange}></input>

            <button type="submit">Search</button>
        </form>
    </div>
);
};

// From searching either a song or artist, the result should be viewed in a table format.

export default SearchBar;