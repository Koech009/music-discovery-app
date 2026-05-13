import { useEffect } from "react";
import "../styles/ui.css";
// A reusable modal component that can be used to display content in a popup overlay. It takes isOpen, onClose, and children as props. It also listens for the Escape key to close the modal when it's open.
function Modal({ isOpen, onClose, children }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✖
        </button>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
