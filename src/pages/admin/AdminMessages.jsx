import { useEffect } from "react";
import { useAdminUsers } from "../../hooks/useAdminUsers";
import Pagination from "../../components/Pagination";
import "../../styles/adminUsers.css";

function AdminMessages() {
  const {
    messages,
    allMessages,
    msgLoading,
    msgError,
    msgMetadata,
    loadMessages,
    removeMessage,
    markRead,
    goToMsgPage,
    perPage,
  } = useAdminUsers();

  useEffect(() => {
    loadMessages();
  }, []);

  const unreadCount = allMessages.filter((m) => !m.is_read).length;

  return (
    <div className="admin-users-page">
      <h1>Messages</h1>
      <p className="page-sub">
        {unreadCount > 0
          ? `You have ${unreadCount} unread message${unreadCount !== 1 ? "s" : ""}.`
          : "All messages have been read."}
        <span style={{ color: "#6a5a5a", marginLeft: "6px" }}>
          ({msgMetadata.total} total)
        </span>
      </p>

      {msgLoading && <p className="page-sub">Loading...</p>}
      {msgError && <p className="error">{msgError}</p>}

      {!msgLoading && msgMetadata.total === 0 ? (
        <div className="empty-state">No messages yet.</div>
      ) : (
        <>
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
              {messages.map((m) => (
                <tr key={m.id} className={!m.is_read ? "row-unread" : ""}>
                  <td>{m.name}</td>
                  <td>{m.email}</td>
                  <td className="message-cell">{m.message}</td>
                  <td>
                    {m.created_at
                      ? new Date(m.created_at).toLocaleString()
                      : "No timestamp"}
                  </td>
                  <td>
                    {m.is_read ? (
                      <span className="badge active">Read</span>
                    ) : (
                      <span className="badge suspended">Unread</span>
                    )}
                  </td>
                  <td className="actions">
                    {!m.is_read && (
                      <button
                        className="btn-view"
                        onClick={() => markRead(m.id)}
                      >
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
              ))}
            </tbody>
          </table>

          <Pagination
            metadata={msgMetadata}
            onPageChange={goToMsgPage}
            perPage={perPage}
          />
        </>
      )}
    </div>
  );
}

export default AdminMessages;
