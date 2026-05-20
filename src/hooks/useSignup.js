import { useState } from "react";
import { signupUser } from "../api/user.js";
import { useAuth } from "../contexts/AuthContext.jsx";

export function useSignup() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const signup = async (formData) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Basic validations
      if (!formData.username || formData.username.length < 3) {
        throw new Error("Username must be at least 3 characters.");
      }
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        throw new Error("Invalid email format.");
      }
      if (!formData.password || formData.password.length < 8) {
        throw new Error("Password must be at least 8 characters.");
      }

      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role || "user",
      };

      const data = await signupUser(payload);

      if (payload.role === "admin") {
        setSuccess("Admin account created and pending approval.");
        return null;
      }

      // Regular users get tokens immediately
      login(data.user, data.access_token, data.refresh_token);
      setSuccess("Signup successful!");
      return data.user;
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Signup failed.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { signup, loading, error, success };
}
