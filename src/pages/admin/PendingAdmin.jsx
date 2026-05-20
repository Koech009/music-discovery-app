import React from "react";
import { useUsers } from "../../hooks/useUsers";
import Pagination from "../../components/Pagination";
import "../../styles/adminUsers.css";

function PendingAdmins() {
  const {
    pendingAdmins,
    pendingMetadata,
    perPage,
    approveAdmin,
    rejectAdmin,
    loading,
    error,
    goToPendingPage,
  } = useUsers();

  if (loading) return <p style={{ padding: "28px", color: "#aaa" }}>Loading pending admins...</p>;
  if (error) return <p className="error" style={{ padding: "28px" }}>{error}</p>;

  return (
    <div className="admin-users-page">
      <h1>Pending Admin Accounts</h1>
      <p className="page-sub">
        Review and approve or reject pending admin account requests.{" "}
        <span style={{ color: "#6a5a5a" }}>({pendingMetadata.total} total)</span>
      </p>

      {pendingMetadata.total === 0 ? (
        <div className="empty-state">No pending admin accounts at the moment.</div>
      ) : (
        <>
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Requested At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingAdmins.map((admin) => (
                <tr key={admin.id}>
                  <td>{admin.username}</td>
                  <td>{admin.email}</td>
                  <td>
                    {new Date(
                      admin.createdAt || admin.created_at
                    ).toLocaleString()}
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn-unsuspend"
                        onClick={() => approveAdmin(admin.id)}
                      >
                        Approve
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => rejectAdmin(admin.id)}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            metadata={pendingMetadata}
            onPageChange={goToPendingPage}
            perPage={perPage}
          />
        </>
      )}
    </div>
  );
}

export default PendingAdmins;