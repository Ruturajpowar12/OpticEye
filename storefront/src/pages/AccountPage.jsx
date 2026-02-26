import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import formatCurrency from "../utils/formatCurrency";

const AccountPage = () => {
  const location = useLocation();
  const { user, updateProfile } = useAuth();

  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const newOrderId = useMemo(() => new URLSearchParams(location.search).get("order"), [location.search]);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const { data } = await api.get("/orders/my-orders");
        setOrders(data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load orders");
      } finally {
        setLoadingOrders(false);
      }
    };

    loadOrders();
  }, []);

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setSaving(true);

    try {
      await updateProfile(profile);
      setMessage("Profile updated successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Profile update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="section container checkout-grid">
      <form className="list-card form-grid" onSubmit={handleProfileSubmit}>
        <h2>My Profile</h2>
        <input
          className="input"
          placeholder="Name"
          value={profile.name}
          onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
          required
        />
        <input
          className="input"
          placeholder="Email"
          value={profile.email}
          onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
          required
        />

        {message ? <p className="success-text">{message}</p> : null}
        {error ? <p className="error-text">{error}</p> : null}

        <button type="submit" className="primary-btn" disabled={saving}>
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </form>

      <div className="summary-card">
        <h3>My Orders</h3>
        {loadingOrders ? <p>Loading orders...</p> : null}
        {!loadingOrders && !orders.length ? <p>No orders yet.</p> : null}
        <div className="orders-list">
          {orders.map((order) => (
            <article
              key={order._id}
              className={`order-item ${newOrderId === order._id ? "order-new" : ""}`}
            >
              <p>
                <strong>Order:</strong> {order._id}
              </p>
              <p>
                <strong>Total:</strong> {formatCurrency(order.totalPrice)}
              </p>
              <p>
                <strong>Status:</strong> {order.status}
              </p>
              <p>
                <strong>Placed:</strong> {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AccountPage;
