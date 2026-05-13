import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminUsers } from "../../hooks/useAdminUsers";
import ChangePasswordModal from "./ChangePasswordModal";
import "../../styles/adminUsers.css";

function AdminManageUsers() {
  const {
    users,
    loadUsers,
    updateUserField,
    deleteUser,
    toggleSuspend,
    changePassword,
  } = useAdminUsers();

  const navigate = useNavigate(); //routing hook to navigate to user details page
  const [search, setSearch] = useState(""); //track search input for filtering users by username
  const [passwordUser, setPasswordUser] = useState(null); //track which user's password is being changed to show the modal

  useEffect(() => {
    loadUsers();
  }, []); //load all users when the component mounts
  //filter users based on search input, matching username case-insensitively
  const filtered = users.filter((u) =>
    u.username?.toLowerCase().includes(search.toLowerCase()),
  );
  //rendered ui
  return (
    <div className="admin-users-page">
      <h1>User Management</h1>
      <p className="page-sub">View, edit, suspend or remove platform users.</p>

      <input
        type="text"
        placeholder="Search users..."
        className="admin-search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
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
          {filtered.length === 0 ? (
            <tr>
              <td colSpan="5" className="empty-state">
                No users found.
              </td>
            </tr>
          ) : (
            filtered.map((u) => (
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
                  <span
                    className={`badge ${u.suspended ? "suspended" : "active"}`}
                  >
                    {u.suspended ? "Suspended" : "Active"}
                  </span>
                </td>

                <td className="actions">
                  {/* Navigate to full page instead of modal */}
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
                    Change Password
                  </button>

                  <button
                    className={u.suspended ? "btn-unsuspend" : "btn-suspend"}
                    onClick={() => toggleSuspend(u.id, u.suspended)}
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
