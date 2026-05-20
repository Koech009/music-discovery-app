import "../../styles/adminUsers.css";
import useAuditLogs from "../../hooks/useAuditLogs";

export default function AdminAuditLogs() {
  const { logs, loading, error, page, totalPages, total, perPage, goToPage } =
    useAuditLogs();

  if (loading) return <p>Loading audit logs...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="admin-users-page">
      <h1>Audit Logs</h1>
      <p className="page-sub">
        A chronological record of every action taken on the platform.{" "}
        <span style={{ color: "#6a5a5a" }}>({total} total)</span>
      </p>

      {logs.length === 0 ? (
        <div className="empty-state">No audit logs recorded yet.</div>
      ) : (
        <>
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Target</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  {/* <td>{new Date(log.timestamp).toLocaleString()}</td> */}
                  <td>{new Date(log.timestamp + "Z").toLocaleString()}</td>
                  <td>{log.user?.username || `User #${log.user_id}`}</td>
                  <td>
                    <span className="badge active">{log.action}</span>
                  </td>
                  <td>
                    {log.target_type && log.target_id
                      ? `${log.target_type} #${log.target_id}`
                      : "—"}
                  </td>
                  <td>{log.details || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination controls */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
              marginTop: "1.5rem",
            }}
          >
            <button
              className="delete-btn"
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              style={{ opacity: page === 1 ? 0.4 : 1 }}
            >
              ← Prev
            </button>

            <span style={{ color: "#aaa", fontSize: "0.875rem" }}>
              Page {page} of {totalPages}
            </span>

            <button
              className="btn-unsuspend"
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              style={{ opacity: page === totalPages ? 0.4 : 1 }}
            >
              Next →
            </button>
          </div>

          <p
            style={{
              textAlign: "center",
              color: "#6a5a5a",
              fontSize: "0.78rem",
              marginTop: "0.5rem",
            }}
          >
            Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)}{" "}
            of {total} logs
          </p>
        </>
      )}
    </div>
  );
}
