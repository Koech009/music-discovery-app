import React from "react";
import "../styles/table.css";

const SongTable =({ songs, onSelectSong }) => {
    if (!songs || songs.length === 0) {
        return <p className="no_results">No songs found. Try searching for something else</p>;
    }

    return (
        <table className = "song_table">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Artist</th>
                    <th>Album</th>
                </tr>
            </thead>
            <tbody>
                {songs.map((song) => (
                    <tr key={song.id}>
                        <td>{song.title}</td>
                        <td>{song.artist.name}</td>
                        <td>{song.album.title}</td>
                        <td><button className="watch_btn" onClick={()=> onSelectSong(song)}>Watch the Music Video</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default SongTable;