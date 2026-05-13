import { useEffect } from "react";
import useMessage from "../../hooks/useMessage";
import "../../styles/adminUsers.css";

function AdminMessages() {
  const { messages, loading, error, fetchMessages, removeMessage, markRead } =
    useMessage();

  useEffect(() => {
    fetchMessages();
  }, []);

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="admin-users-page">
      <h1>Messages</h1>
      <p className="page-sub">
        {unreadCount > 0
          ? `You have ${unreadCount} unread message${unreadCount !== 1 ? "s" : ""}.`
          : "All messages have been read."}
      </p>

      {loading && <p className="page-sub">Loading...</p>}
      {error && <p className="error">{error}</p>}

      <table className="admin-users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Message</th>
            <th>Received</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {messages.length === 0 && !loading ? (
            <tr>
              <td colSpan="6" className="empty-state">
                No messages yet.
              </td>
            </tr>
          ) : (
            messages.map((m) => (
              <tr key={m.id} className={!m.isRead ? "row-unread" : ""}>
                <td>{m.name}</td>
                <td>{m.email}</td>
                <td className="message-cell">{m.message}</td>
                <td>
                  {m.createdAt
                    ? new Date(m.createdAt).toLocaleString()
                    : "No timestamp"}
                </td>
                <td>
                  {m.isRead ? (
                    <span className="badge active">Read</span>
                  ) : (
                    <span className="badge suspended">Unread</span>
                  )}
                </td>
                <td className="actions">
                  {!m.isRead && (
                    <button className="btn-view" onClick={() => markRead(m.id)}>
                      Mark Read
                    </button>
                  )}
                  <button
                    className="delete-btn"
                    onClick={() => removeMessage(m.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AdminMessages;
