import React, {useState} from "react";
import SongTable from "../components/SongTable";
import Modal from "../components/Modal";
import useDeezerSearch from "../hooks/useDeezerSearch";
import useLyrics from "../hooks/useLyrics";
import "../styles/songDetails.css";

const SongDetails = () => {
    const [selectedSong, setSelectedSong] = useState(null);
    const [query, setQuery] = useState("");
    const { songs, loading, error, searchSongs} = useDeezerSearch();
    const {lyrics, fetchLyrics} = useLyrics();

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            searchSongs(query);
        }
    };

    const handleSelectSong = (song) => {
        setSelectedSong(song);
        fetchLyrics(song.artist.name, song.title);
    };

    const handleCloseModal = () => {
        setSelectedSong(null);
    }

    return (
        <div className="song_details_page">
            <h1>Search Songs</h1>
            <form onSubmit = {handleSearch}>
                <input
                    type="text"
                    placeholder = "Search for a song or artist..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button type="submit">Search</button>
            </form>

            {loading && <p>Loading songs...</p>}
            {error && <p>{error}</p>}

            {songs && songs.length > 0 && ( 
             <> <SongTable songs={songs} onSelectSong={handleSelectSong} />

                {selectedSong && lyrics && (
                    <div className="lyrics_area">
                    <h2>Lyrics - {selectedSong.title}</h2>
                    <p>{lyrics}</p>
                    </div>
                )}
             </>
            )}

            {selectedSong && (
                <Modal song={selectedSong} onClose={handleCloseModal} />
            )}
        </div>
    );
};

export default SongDetails;