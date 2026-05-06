import "../styles/ui.css";

function ErrorMessages({ message }) {
  if (!message) return null;
  return <div className="error">{message}</div>;
}

export default ErrorMessages;
