import { useState } from "react";
import { createUser, getUsers } from "../api/user.js";

export function useSignup() {
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

      // Fetch existing users
      const existingUsers = await getUsers();

      if (
        existingUsers.some(
          (u) =>
            u.username &&
            u.username.toLowerCase() === formData.username.toLowerCase(),
        )
      ) {
        throw new Error("Username is already taken.");
      }

      if (
        existingUsers.some(
          (u) =>
            u.email && u.email.toLowerCase() === formData.email.toLowerCase(),
        )
      ) {
        throw new Error("Email is already registered.");
      }

      // Payload with createdAt + status
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role, // admin or user
        createdAt: new Date().toISOString(),
        status: "active",
      };

      const newUser = await createUser(payload);

      setSuccess("Signup successful!");
      return newUser;
    } catch (err) {
      setError(err.message || "Signup failed.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { signup, loading, error, success };
}
