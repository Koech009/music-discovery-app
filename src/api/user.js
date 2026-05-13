import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:3002" });

//fetch all users
export const getUsers = async () => (await api.get("/users")).data;
//fetch single user by id
export const getUserById = async (id) => (await api.get(`/users/${id}`)).data;
//create a new user with default values for createdAt, lastLogin, suspended, profile, and activity
export const createUser = async (userData) =>
  (
    await api.post("/users", {
      ...userData,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      suspended: false,
      profile: userData.profile || { bio: "", favourites: [], playlists: [] },
      activity: [],
    })
  ).data;
//update user details (e.g. profile, password, suspension status) by id
export const updateUser = async (id, updates) =>
  (await api.patch(`/users/${id}`, updates)).data;
// delete a user by id-admins can only do this
export const deleteUser = async (id) => (await api.delete(`/users/${id}`)).data;

// Login-check credentials

export const loginUser = async (email, password) => {
  const users = (await api.get("/users")).data;
  //ffind user with matching email and password (case-insensitive email)
  const user = users.find(
    (u) =>
      u.email?.toLowerCase() === email.toLowerCase() && u.password === password,
  );
  //if no user found, return null
  if (!user) return null;
  //update lastLogin timestamp and log activity
  await updateUser(user.id, { lastLogin: new Date().toISOString() });
  await logActivity(user.id, "Logged in");

  return user;
};

// Profile and Password Management

//merge new profile updates with existing profile data to avoid overwriting unchanged fields
export const updateUserProfile = async (id, profileUpdates) => {
  const user = await getUserById(id);
  const updated = await updateUser(id, {
    profile: { ...user.profile, ...profileUpdates },
  });
  await logActivity(id, "Updated profile");
  return updated;
};
// Change password with old password verification
export const changePassword = async (
  id,
  { old: oldPassword, new: newPassword },
) => {
  const user = await getUserById(id);
  if (user.password !== oldPassword)
    throw new Error("Old password is incorrect.");
  const updated = await updateUser(id, { password: newPassword });
  await logActivity(id, "Changed password");
  return updated;
};

// Admin-Suspend / Unsuspend

//toggle user's suspended status (suspended users cannot log in or create playlists) and log the action in their activity feed
export const toggleSuspendUser = async (id) => {
  const user = await getUserById(id);
  const newStatus = !user.suspended;
  await updateUser(id, { suspended: newStatus });
  await logActivity(
    id,
    newStatus ? "Account suspended" : "Account unsuspended",
  );
  return newStatus;
};
