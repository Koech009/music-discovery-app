import "../styles/ui.css";
// A simple reusable component that displays error messages in ui and takes a message prop. If the message is empty or null, it returns null and renders nothing.
function ErrorMessages({ message }) {
  if (!message) return null;
  return <div className="error">{message}</div>;
}

export default ErrorMessages;
