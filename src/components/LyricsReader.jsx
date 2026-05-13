import { useState } from "react";
//defines the LyricsReader component that provides text-to-speech functionality for song lyrics. It includes buttons to read, pause, resume, and stop the speech synthesis of the lyrics.
function LyricsReader({ lyrics }) {
  // State to manage the current speech utterance
  const [utterance, setUtterance] = useState(null);
  // Function to start reading the lyrics aloud
  const speakLyrics = () => {
    if (!lyrics) return;
    // Stop any ongoing speech before starting a new one
    window.speechSynthesis.cancel();
    const newUtterance =
      new // Create a new SpeechSynthesisUtterance with the lyrics text
      SpeechSynthesisUtterance(lyrics);
    newUtterance.lang = "en-US"; // Set language to English (US)
    newUtterance.rate = 1; //
    newUtterance.pitch = 1; // Set normal rate and pitch
    setUtterance(newUtterance); // Save the utterance in state for later control
    //call the speak method to read the lyrics aloud
    window.speechSynthesis.speak(newUtterance);
  };
  // Function to pause the speech synthesis
  const pauseLyrics = () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
    }
  };
  // Function to resume the speech synthesis if it is paused
  const resumeLyrics = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  };
  // Function to stop the speech synthesis and clear the utterance state
  const stopLyrics = () => {
    window.speechSynthesis.cancel();
    setUtterance(null);
  };
  // Render the component with control buttons and a box to display the lyrics
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
