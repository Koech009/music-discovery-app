import { useState } from "react";
import "../../styles/adminUsers.css";

function ChangePasswordModal({ user, onClose, changePassword }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  const handleSave = async () => {
    setError("");
    setSuccess("");

    if (!password) {
      setError("Password is required.");
      return;
    }
    if (!strongPasswordRegex.test(password)) {
      setError(
        "Password must be at least 8 characters, include uppercase, lowercase, number, and symbol.",
      );
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await changePassword(user.id, password);
      setSuccess("Password changed successfully!");
      setTimeout(() => onClose(), 1500);
    } catch {
      setError("Failed to change password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-card">
        <h2>Change Password for {user.username}</h2>

        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        {/* hidden dummy fields to trick browser autofill */}
        <input type="text" style={{ display: "none" }} />
        <input type="password" style={{ display: "none" }} />

        <input
          type="password"
          placeholder="New password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
        />
        <input
          type="password"
          placeholder="Confirm password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value);
            setError("");
          }}
        />

        <button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </button>
        <button onClick={onClose} className="cancel-btn" disabled={loading}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default ChangePasswordModal;