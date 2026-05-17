import axios from "axios";

const API_BASE = "/api";

// fetch all messages
export const getMessages = async () => {
  return axios.get(`${API_BASE}/messages`);
};

// create a new message
export const addMessage = async (message) => {
  const payload = {
    ...message,
    createdAt: new Date().toISOString(),
    isRead: false,
  };
  return axios.post(`${API_BASE}/messages`, payload);
};

// edit existing message
export const updateMessage = async (id, updates) => {
  return axios.patch(`${API_BASE}/messages/${id}`, updates);
};

// remove a message by id
export const deleteMessage = async (id) => {
  return axios.delete(`${API_BASE}/messages/${id}`);
};

// mark a message as read by id
// mark a message as read by id
export const markAsRead = async (id) => {
  return axios.patch(`${API_BASE}/messages/${id}`, { is_read: true });
};
