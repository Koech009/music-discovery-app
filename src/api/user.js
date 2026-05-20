import api from "../utils/api";

// Helper for PATCH requests
const patch = async (url, body) => (await api.patch(url, body)).data;

// -------------------- User Endpoints --------------------

export const getUsers = async () => (await api.get("/users")).data.users;

export const getUserById = async (id) => (await api.get(`/users/${id}`)).data.user;

export const createUser = async (userData) => (await api.post("/users", userData)).data.user;

export const updateUser = async (id, updates) => patch(`/users/${id}`, updates);

export const deleteUser = async (id) => (await api.delete(`/users/${id}`)).data;

export const updateUserProfile = async (id, profileUpdates) => updateUser(id, profileUpdates);

export const changePassword = async (id, { old: oldPassword, new: newPassword }) =>
  (await api.patch(`/users/${id}/change-password`, {
    old_password: oldPassword,
    new_password: newPassword,
  })).data;

// -------------------- Auth Endpoints --------------------

export const loginUser = async (email, password) => {
  try {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
  } catch (err) {
    const message = err.response?.data?.error || "Login failed. Please try again.";
    throw new Error(message);
  }
};

export const signupUser = async (userData) =>
  (await api.post("/auth/signup", userData)).data;

// -------------------- Admin Endpoints --------------------

export const toggleSuspendUser = async (id) => patch(`/admin/users/${id}/suspend`);

export const changeUserPassword = async (id, newPassword) =>
  (await api.patch(`/users/${id}/change-password`, { new_password: newPassword })).data;

export const getPendingAdmins = async () => (await api.get("/admin/admins/pending")).data.pending_admins ?? [];

export const approveAdmin = async (id) => patch(`/admin/admins/${id}/approve`);

export const rejectAdmin = async (id) => (await api.delete(`/admin/admins/${id}/reject`)).data;

export const promoteUser = async (id) => (await api.patch(`/admin/users/${id}/promote`)).data;

export const deleteUserAdmin = async (id) => (await api.delete(`/admin/users/${id}`)).data;