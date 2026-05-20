import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { updateUser, changePassword } from "../api/user.js";
import "../styles/auth.css";

export default function Profile() {
  const { user, updateUserContext } = useAuth(); 

  const [form, setForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
    bio: user?.bio || "",
    address: user?.address || "",
    phone: user?.phone || "",
  });

  const [passwords, setPasswords] = useState({ old: "", new: "" });
  const [errors, setErrors] = useState({});
  const [pwErrors, setPwErrors] = useState({});
  const [alert, setAlert] = useState(null);

  const isAdmin = user?.role === "admin";
  const firstLogin = user?.first_login === true;

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const validateProfile = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = "Username is required.";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      errs.email = "Valid email is required.";
    if (form.phone && !form.phone.match(/^\+?\d{7,15}$/))
      errs.phone = "Phone must be digits, 7–15 characters.";
    if (form.address?.trim().length > 0 && form.address.trim().length < 5)
      errs.address = "Address must be at least 5 characters.";
    return errs;
  };

  const validatePassword = () => {
    const errs = {};
    if (!passwords.old) errs.old = "Old password is required.";
    if (!passwords.new) {
      errs.new = "New password is required.";
    } else if (passwords.new.length < 8) {
      errs.new = "Password must be at least 8 characters.";
    } else if (
      !/[A-Z]/.test(passwords.new) ||
      !/[a-z]/.test(passwords.new) ||
      !/[0-9]/.test(passwords.new) ||
      !/[!@#$%^&*]/.test(passwords.new)
    ) {
      errs.new = "Password must include uppercase, lowercase, number, and symbol.";
    }
    return errs;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const errs = validateProfile();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    try {
      await updateUser(user.id, {
        username: form.username,
        email: form.email,
        bio: form.bio,
        address: form.address,
        phone: form.phone,
      });

      updateUserContext({
        ...user,
        username: form.username,
        email: form.email,
        bio: form.bio,
        address: form.address,
        phone: form.phone,
        first_login: false,
      });

      setErrors({});
      showAlert("success", "Profile updated successfully!");
    } catch {
      showAlert("error", "Failed to update profile. Please try again.");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const errs = validatePassword();
    if (Object.keys(errs).length > 0) {
      setPwErrors(errs);
      return;
    }
    try {
      await changePassword(user.id, passwords);
      setPasswords({ old: "", new: "" });
      setPwErrors({});
      showAlert("success", "Password changed successfully!");
    } catch (err) {
      showAlert("error", err.message || "Failed to change password.");
    }
  };

  if (!user)
    return <p style={{ padding: "28px", color: "#aaa" }}>Not logged in.</p>;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">
          {isAdmin ? "Admin Profile" : "My Profile"}
        </h1>
        <p className="auth-sub">Manage your account and security settings.</p>

        {firstLogin && (
          <div className="auth-alert auth-alert--error">
            ⚠ First login detected — please update your profile before continuing.
          </div>
        )}

        {alert && (
          <div className={`auth-alert ${alert.type === "error" ? "auth-alert--error" : "auth-alert--success"}`}>
            {alert.message}
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleUpdate} noValidate>
          <div className="auth-field">
            <label>Username</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className={errors.username ? "input-error" : ""}
            />
            {errors.username && <p className="field-error">{errors.username}</p>}
          </div>

          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={errors.email ? "input-error" : ""}
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          <div className="auth-field">
            <label>Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>

          <div className="auth-field">
            <label>Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className={errors.address ? "input-error" : ""}
            />
            {errors.address && <p className="field-error">{errors.address}</p>}
          </div>

          <div className="auth-field">
            <label>Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={errors.phone ? "input-error" : ""}
            />
            {errors.phone && <p className="field-error">{errors.phone}</p>}
          </div>

          <button type="submit" className="auth-btn">
            Update Profile
          </button>
        </form>

        {/* Password Form */}
        <h2 className="auth-title" style={{ marginTop: "30px" }}>
          Change Password
        </h2>

        <form onSubmit={handlePasswordChange} noValidate>
          <div className="auth-field">
            <label>Old Password</label>
            <input
              type="password"
              value={passwords.old}
              onChange={(e) => setPasswords({ ...passwords, old: e.target.value })}
              className={pwErrors.old ? "input-error" : ""}
            />
            {pwErrors.old && <p className="field-error">{pwErrors.old}</p>}
          </div>

          <div className="auth-field">
            <label>New Password</label>
            <input
              type="password"
              value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              className={pwErrors.new ? "input-error" : ""}
            />
            {pwErrors.new && <p className="field-error">{pwErrors.new}</p>}
          </div>

          <button type="submit" className="auth-btn">
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}