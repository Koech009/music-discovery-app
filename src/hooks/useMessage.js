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

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMessages();
      setMessages(data);
    } catch {
      setError("Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  };

  // Public — no JWT needed (contact form)
  const createMessage = async (message) => {
    try {
      const data = await addMessage(message);
      setMessages((prev) => [...prev, data]);
    } catch {
      setError("Failed to send message");
    }
  };

  // Admin only
  const markRead = async (id) => {
    try {
      await markAsRead(id);
      
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, is_read: true, isRead: true } : m))
      );
    } catch {
      setError("Failed to mark message as read");
    }
  };

  // Admin only
  const removeMessage = async (id) => {
    try {
      await deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch {
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