import api from "../utils/api";

const API_BASE = "/messages";

// Get all messages (admin only)
export const getMessages = async () => {
  const res = await api.get(`${API_BASE}`);
  return res.data.messages ?? [];
};

// Add a new message (public contact form)
export const addMessage = async (message) => {
  const payload = {
    ...message,
    createdAt: new Date().toISOString(),
    isRead: false,
  };
  const res = await api.post(`${API_BASE}`, payload);
  return res.data.message ?? res.data;
};

// Update a message (admin only)
export const updateMessage = async (id, updates) => {
  const res = await api.patch(`${API_BASE}/${id}`, updates);
  return res.data;
};

// Delete a message (admin only)
export const deleteMessage = async (id) => {
  const res = await api.delete(`${API_BASE}/${id}`);
  return res.data;
};

// Mark a message as read (admin only)
export const markAsRead = async (id) => {
  const res = await api.patch(`${API_BASE}/${id}`, { is_read: true });
  return res.data;
};