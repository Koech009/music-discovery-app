import { useState } from "react";
import { useAdminUsers } from "../../hooks/useAdminUsers";
import "../../styles/adminUsers.css";

function ChangePasswordModal({ user, onClose }) {
  const { changePassword } = useAdminUsers();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  const handleSave = async () => {
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

    await changePassword(user.id, password);
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-card">
        <h2>Change Password for {user.username}</h2>

        {error && <p className="error">{error}</p>}

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        <button onClick={handleSave}>Save</button>
        <button onClick={onClose} className="cancel-btn">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default ChangePasswordModal;
