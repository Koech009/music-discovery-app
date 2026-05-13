import axios from "axios";

const BASE_URL = "http://localhost:3002/messages";
//fetch all messages
export const getMessages = async () => {
  return axios.get(BASE_URL);
};
//create a new message with timestamp and isRead flag
export const addMessage = async (message) => {
  const payload = {
    ...message,
    createdAt: new Date().toISOString(),
    isRead: false,
  };
  return axios.post(BASE_URL, payload);
};
//edit  existing message
export const updateMessage = async (id, updates) => {
  return axios.patch(`${BASE_URL}/${id}`, updates);
};
//remove a message by id
export const deleteMessage = async (id) => {
  return axios.delete(`${BASE_URL}/${id}`);
};
//mark a message as read by id
export const markAsRead = async (id) => {
  return axios.patch(`${BASE_URL}/${id}`, { isRead: true });
};
