import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const api = axios.create({ baseURL: `${baseURL}/api` });
// fetch all users
export const getUsers = async () => (await api.get("/users")).data;

// fetch single user by id
export const getUserById = async (id) => (await api.get(`/users/${id}`)).data;

// create a new user
export const createUser = async (userData) =>
  (await api.post("/users", userData)).data;

// update user details by id
export const updateUser = async (id, updates) =>
  (await api.patch(`/users/${id}`, updates)).data;

// delete a user by id
export const deleteUser = async (id) => (await api.delete(`/users/${id}`)).data;

// Login — calls Flask auth endpoint
export const loginUser = async (email, password) => {
  try {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
  } catch (err) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      return null;
    }
    throw err;
  }
};

// Signup — calls Flask auth endpoint
export const signupUser = async (userData) => {
  const res = await api.post("/auth/signup", userData);
  return res.data;
};

// Update user profile
export const updateUserProfile = async (id, profileUpdates) => {
  return await updateUser(id, profileUpdates);
};

// Change password(user changing password )
export const changePassword = async (
  id,
  { old: oldPassword, new: newPassword },
) => {
  const res = await api.patch(`/users/${id}/change-password`, {
    old_password: oldPassword,
    new_password: newPassword,
  });
  return res.data;
};
// Admin — toggle suspend/unsuspend
export const toggleSuspendUser = async (id) => {
  const res = await api.patch(`/admin/users/${id}/suspend`);
  return res.data;
};

// Admin change password (no old password needed)
export const changeUserPassword = async (id, newPassword) => {
  const res = await api.patch(`/users/${id}/change-password`, {
    new_password: newPassword,
  });
  return res.data;
};

// Admin: get all pending admins
export const getPendingAdmins = async () => {
  const res = await api.get("/admin/admins/pending");
  return res.data;
};

// Admin: approve a pending admin
export const approveAdmin = async (id) => {
  const res = await api.patch(`/admin/admins/${id}/approve`);
  return res.data;
};

// Admin: reject/remove a pending admin
export const rejectAdmin = async (id) => {
  const res = await api.delete(`/admin/admins/${id}/reject`);
  return res.data;
};
