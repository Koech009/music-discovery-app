import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const API_BASE = `${baseURL}/api`;

export const getMessages = async () => {
  return axios.get(`${API_BASE}/messages`);
};

export const addMessage = async (message) => {
  const payload = {
    ...message,
    createdAt: new Date().toISOString(),
    isRead: false,
  };
  return axios.post(`${API_BASE}/messages`, payload);
};

export const updateMessage = async (id, updates) => {
  return axios.patch(`${API_BASE}/messages/${id}`, updates);
};

export const deleteMessage = async (id) => {
  return axios.delete(`${API_BASE}/messages/${id}`);
};

export const markAsRead = async (id) => {
  return axios.patch(`${API_BASE}/messages/${id}`, { is_read: true });
};
