import React from "react";
import { useUsers } from "../../hooks/useUsers";
import "../../styles/adminUsers.css";

function PendingAdmins() {
  const { pendingAdmins, approveAdmin, rejectAdmin, loading, error } =
    useUsers();

  if (loading) return <p>Loading pending admins...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="admin-users-page">
      <h1>Pending Admin Accounts</h1>
      <p className="page-sub">
        Review and approve or reject pending admin account requests.
      </p>

      {pendingAdmins.length === 0 ? (
        <div className="empty-state">
          No pending admin accounts at the moment.
        </div>
      ) : (
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
                    admin.createdAt || admin.created_at,
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
      )}
    </div>
  );
}

export default PendingAdmins;
