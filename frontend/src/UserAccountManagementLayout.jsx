import React from "react";

function UserAccountManagementLayout() {
  return (
    <section className="panel glass-panel user-management-panel">
      <div className="panel-header">
        <h2>User Account Management</h2>
        <span className="panel-tag">Admin</span>
      </div>

      <div className="user-management-grid">
        <div className="user-form-card">
          <div className="dashboard-section-header">
            <h3>Add User</h3>
          </div>

          <form className="usage-form">
            <label>
              Full Name
              <input type="text" placeholder="Enter full name" />
            </label>

            <label>
              Email
              <input type="email" placeholder="Enter email address" />
            </label>

            <label>
              Role
              <select defaultValue="">
                <option value="" disabled>
                  Select role
                </option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="staff">Staff</option>
              </select>
            </label>

            <label>
              Status
              <select defaultValue="">
                <option value="" disabled>
                  Select status
                </option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>

            <button type="submit">Add User</button>
          </form>
        </div>

        <div className="user-table-card">
          <div className="dashboard-section-header">
            <h3>User Accounts</h3>
          </div>

          <div className="dashboard-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="4">User account data will appear here.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

export default UserAccountManagementLayout;