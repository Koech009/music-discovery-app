import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminUsers } from "../../hooks/useAdminUsers";
import ChangePasswordModal from "./ChangePasswordModal";
import Pagination from "../../components/Pagination";
import { useState } from "react";
import "../../styles/adminUsers.css";

function AdminManageUsers() {
  const {
    users,
    loading,
    error,
    search,
    metadata,
    perPage,
    loadUsers,
    updateUserField,
    deleteUser,
    toggleSuspend,
    changePassword,
    goToPage,
    handleSearch,
  } = useAdminUsers();

  const navigate = useNavigate();
  const [passwordUser, setPasswordUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  if (loading) return <p style={{ padding: "28px", color: "#aaa" }}>Loading users...</p>;
  if (error) return <p className="error" style={{ padding: "28px" }}>{error}</p>;

  return (
    <div className="admin-users-page">
      <h1>User Management</h1>
      <p className="page-sub">View, edit, suspend or remove platform users.</p>

      <input
        type="text"
        placeholder="Search users..."
        className="admin-search"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
      />

      <table className="admin-users-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="5" className="empty-state">
                No users found.
              </td>
            </tr>
          ) : (
            users.map((u) => (
              <tr key={u.id}>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>
                  <select
                    value={u.role}
                    onChange={(e) =>
                      updateUserField(u.id, { role: e.target.value })
                    }
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <span className={`badge ${u.suspended ? "suspended" : "active"}`}>
                    {u.suspended ? "Suspended" : "Active"}
                  </span>
                </td>
                <td className="actions">
                  <button
                    className="btn-view"
                    onClick={() => navigate(`/admin/users/${u.id}`)}
                  >
                    View
                  </button>
                  <button
                    className="btn-password"
                    onClick={() => setPasswordUser(u)}
                  >
                    Password
                  </button>
                  <button
                    className={u.suspended ? "btn-unsuspend" : "btn-suspend"}
                    onClick={() => toggleSuspend(u.id)}
                  >
                    {u.suspended ? "Unsuspend" : "Suspend"}
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => deleteUser(u.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <Pagination metadata={metadata} onPageChange={goToPage} perPage={perPage} />

      {passwordUser && (
        <ChangePasswordModal
          user={passwordUser}
          onClose={() => setPasswordUser(null)}
          changePassword={changePassword}
        />
      )}
    </div>
  );
}

export default AdminManageUsers;