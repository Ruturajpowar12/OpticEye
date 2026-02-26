import { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import formatCurrency from "../utils/formatCurrency";

const ORDER_STATUS = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/orders");
      setOrders(data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, status) => {
    try {
      const { data } = await api.put(`/orders/${orderId}/status`, { status });
      setOrders((prev) =>
        prev.map((order) =>
          order._id === data._id
            ? {
                ...order,
                ...data,
                user: order.user,
              }
            : order
        )
      );
      setMessage(`Order ${data._id.slice(-8)} updated to ${data.status}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return orders;
    }

    return orders.filter(
      (order) =>
        order._id.toLowerCase().includes(query) ||
        order.user?.name?.toLowerCase().includes(query) ||
        order.status.toLowerCase().includes(query)
    );
  }, [orders, search]);

  return (
    <section className="stack-gap">
      <header>
        <h1>Orders</h1>
        <p>Monitor order lifecycle and update fulfillment states.</p>
      </header>

      {error ? <p className="error-text">{error}</p> : null}
      {message ? <p className="success-text">{message}</p> : null}
      {loading ? <p>Loading orders...</p> : null}

      <article className="panel table-wrap">
        <div className="table-header-row">
          <h3>Order List</h3>
          <input
            className="admin-input search-input"
            placeholder="Search orders"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order._id}>
                <td>{order._id.slice(-8)}</td>
                <td>{order.user?.name || "NA"}</td>
                <td>{formatCurrency(order.totalPrice)}</td>
                <td>{order.isPaid ? "Yes" : "No"}</td>
                <td>
                  <select
                    className="admin-input"
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  >
                    {ORDER_STATUS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </section>
  );
};

export default OrdersPage;
