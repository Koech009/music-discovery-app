import { useState } from "react";
import { SearchForLyric } from "../api/lyrics";

// Hook will be used condiationally when the user wants to view lyrics from the Lyrics.ovh API,
// provided the lyrics are available from API.


function useLyrics() {
    const [Lyrics, setLyrics] = useState('')

    return ();
};

export default useLyrics;