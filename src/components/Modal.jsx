import React, {useEffect} from "react";
import useYoutubeVideo from "../hooks/useYoutubeVideo";

const Modal = ({ song, onClose }) => {
    const { videoId, loading, error, fetchVideoId } = useYoutubeVideo();
    useEffect(() => {
        if (song) {
            fetchVideoId(song.artist.name, song.title);
        }
    }, [song]);

    if (!song) return null;

    return (
        <div className="modal_overlay" onClick={onClose}>
            <div className="modal_content" onClick={(e) => e.stopPropagation()}>
                <button className="modal_close" onClick={onClose}>X</button>
                <h2>{song.title}</h2>
                <h3>{song.artist.name}</h3>
                {loading && <p>Loading video...</p>}
                {error && <p>{error}</p>}

                {videoId && (
                    <iframe
                        width="100%"
                        height="400"
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title={song.title}
                        allowFullScreen
                        />
                )}
            </div>
        </div>
    );
};

export default Modal;