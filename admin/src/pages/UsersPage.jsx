import { useEffect, useMemo, useState } from "react";
import api from "../api/client";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/auth/users");
      setUsers(data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleAdmin = async (user) => {
    try {
      const { data } = await api.put(`/auth/users/${user._id}`, {
        name: user.name,
        email: user.email,
        isAdmin: !user.isAdmin,
      });
      setUsers((prev) => prev.map((item) => (item._id === data._id ? { ...item, ...data } : item)));
      setMessage(`Updated role for ${data.name}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update role");
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Delete this user?")) {
      return;
    }

    try {
      await api.delete(`/auth/users/${userId}`);
      setUsers((prev) => prev.filter((item) => item._id !== userId));
      setMessage("User removed.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
    }
  };

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return users;
    }
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
    );
  }, [users, search]);

  return (
    <section className="stack-gap">
      <header>
        <h1>Users</h1>
        <p>Manage customer accounts and admin privileges.</p>
      </header>

      {error ? <p className="error-text">{error}</p> : null}
      {message ? <p className="success-text">{message}</p> : null}
      {loading ? <p>Loading users...</p> : null}

      <article className="panel table-wrap">
        <div className="table-header-row">
          <h3>User List</h3>
          <input
            className="admin-input search-input"
            placeholder="Search users"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Admin</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.isAdmin ? "Yes" : "No"}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="action-row">
                    <button type="button" className="small-btn" onClick={() => toggleAdmin(user)}>
                      Toggle Admin
                    </button>
                    <button
                      type="button"
                      className="small-btn danger"
                      onClick={() => deleteUser(user._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </section>
  );
};

export default UsersPage;
