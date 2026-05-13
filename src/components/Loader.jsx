import "../styles/ui.css";
// A simple loader component that shows a loading spinner and a message while data is being fetched or processed.
function Loader() {
  return (
    <div className="loader">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  );
}

export default Loader;
