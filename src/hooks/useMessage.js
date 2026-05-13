import { useState, useEffect } from "react";
import {
  getMessages,
  addMessage,
  markAsRead,
  deleteMessage,
} from "../api/message";

function useMessage() {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch all messages
  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await getMessages();
      setMessages(res.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  };

  // Add new message (used by contact form)
  const createMessage = async (message) => {
    try {
      const res = await addMessage(message);
      setMessages((prev) => [...prev, res.data]);
    } catch (err) {
      setError("Failed to send message");
    }
  };

  // Mark a message as read
  const markRead = async (id) => {
    try {
      await markAsRead(id);
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, isRead: true } : m)),
      );
    } catch (err) {
      setError("Failed to mark message as read");
    }
  };

  // Delete message
  const removeMessage = async (id) => {
    try {
      await deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setError("Failed to delete message");
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return {
    messages,
    loading,
    error,
    fetchMessages,
    createMessage,
    markRead,
    removeMessage,
  };
}

export default useMessage;
