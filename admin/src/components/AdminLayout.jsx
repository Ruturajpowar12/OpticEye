import { NavLink, Outlet } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

const AdminLayout = () => {
  const { user, logout } = useAdminAuth();

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <h2>OpticEye Admin</h2>
        <p>{user?.email}</p>
        <nav>
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/products">Products</NavLink>
          <NavLink to="/categories">Categories</NavLink>
          <NavLink to="/orders">Orders</NavLink>
          <NavLink to="/users">Users</NavLink>
        </nav>
        <button type="button" onClick={logout} className="ghost-btn">
          Logout
        </button>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
