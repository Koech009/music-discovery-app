import { useState } from "react";
import { addMessage } from "../api/message";

function useMessage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const createMessage = async (message) => {
    setLoading(true);
    setError(null);
    try {
      const data = await addMessage(message);
      return data;
    } catch {
      setError("Failed to send message");
      throw new Error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return { createMessage, loading, error };
}

export default useMessage;
