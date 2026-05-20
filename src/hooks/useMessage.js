import { useState, useEffect, useMemo } from "react";
import {
  getMessages,
  addMessage,
  markAsRead,
  deleteMessage,
} from "../api/message";

const PER_PAGE = 10;

function useMessage() {
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

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

  const createMessage = async (message) => {
    try {
      const data = await addMessage(message);
      setMessages((prev) => [...prev, data]);
    } catch {
      setError("Failed to send message");
    }
  };

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

  // Pagination 

  const totalPages = Math.max(1, Math.ceil(messages.length / PER_PAGE));

  const paginated = useMemo(
    () => messages.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    [messages, page]
  );

  const metadata = {
    current_page: page,
    total_pages: totalPages,
    has_prev: page > 1,
    has_next: page < totalPages,
    total: messages.length,
  };

  const goToPage = (p) => {
    if (p >= 1 && p <= totalPages) setPage(p);
  };

  return {
    messages: paginated,
    allMessages: messages,
    loading,
    error,
    metadata,
    perPage: PER_PAGE,
    fetchMessages,
    createMessage,
    markRead,
    removeMessage,
    goToPage,
  };
}

export default useMessage;