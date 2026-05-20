import "../../styles/adminUsers.css";
import useAuditLogs from "../../hooks/useAuditLogs";
import Pagination from "../../components/Pagination";

export default function AdminAuditLogs() {
  const { logs, loading, error, page, totalPages, total, perPage, goToPage } =
    useAuditLogs();

  if (loading) return <p style={{ padding: "28px", color: "#aaa" }}>Loading audit logs...</p>;
  if (error) return <p className="error" style={{ padding: "28px" }}>{error}</p>;

  const metadata = {
    current_page: page,
    total_pages: totalPages,
    has_prev: page > 1,
    has_next: page < totalPages,
    total,
  };

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

          <Pagination metadata={metadata} onPageChange={goToPage} perPage={perPage} />
        </>
      )}
    </div>
  );
}