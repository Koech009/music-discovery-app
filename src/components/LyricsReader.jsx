import { useState } from "react";

function LyricsReader({ lyrics }) {
  const [utterance, setUtterance] = useState(null);

  const speakLyrics = () => {
    if (!lyrics) return;
    window.speechSynthesis.cancel();
    const newUtterance = new SpeechSynthesisUtterance(lyrics);
    newUtterance.lang = "en-US";
    newUtterance.rate = 1;
    newUtterance.pitch = 1;
    setUtterance(newUtterance);
    window.speechSynthesis.speak(newUtterance);
  };

  const pauseLyrics = () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
    }
  };

  const resumeLyrics = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  };

  const stopLyrics = () => {
    window.speechSynthesis.cancel();
    setUtterance(null);
  };

  return (
    <div>
      <div className="speech-controls">
        <button className="btn btn--secondary" onClick={speakLyrics}>
          🔊 Read Aloud
        </button>
        <button className="btn btn--secondary" onClick={pauseLyrics}>
          ⏸ Pause
        </button>
        <button className="btn btn--secondary" onClick={resumeLyrics}>
          ▶ Resume
        </button>
        <button className="btn btn--secondary" onClick={stopLyrics}>
          ⏹ Stop
        </button>
      </div>
      <pre className="lyrics-box">{lyrics}</pre>
    </div>
  );
}

export default LyricsReader;
