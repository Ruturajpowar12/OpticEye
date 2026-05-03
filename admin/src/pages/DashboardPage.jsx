import { useEffect, useState } from "react";
import api from "../api/client";
import formatCurrency from "../utils/formatCurrency";

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const { data: dashboard } = await api.get("/admin/dashboard");
        setData(dashboard);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  if (!data) {
    return <p>{error || "Dashboard unavailable"}</p>;
  }

  const cards = [
    { label: "Total Revenue", value: formatCurrency(data.summary.totalRevenue) },
    { label: "Total Orders", value: data.summary.totalOrders },
    { label: "Total Products", value: data.summary.totalProducts },
    { label: "Total Users", value: data.summary.totalUsers },
  ];

  return (
    <section className="stack-gap page">
      <header>
        <h1>Dashboard</h1>
        <p>Quick business snapshot for OpticEye e-commerce.</p>
      </header>

      <div className="stat-grid">
        {cards.map((card) => (
          <article key={card.label} className="stat-card">
            <h3>{card.label}</h3>
            <strong>{card.value}</strong>
          </article>
        ))}
      </div>

      <div className="admin-panels">
        <article className="panel">
          <h3>Order Status Mix</h3>
          <div className="stack-gap">
            {data.orderStatus.map((item) => (
              <p key={item._id} className="metric-row">
                <span>{item._id}</span>
                <strong>{item.count}</strong>
              </p>
            ))}
          </div>
        </article>

        <article className="panel">
          <h3>Low Stock Alerts</h3>
          <div className="stack-gap">
            {data.lowStockProducts.map((item) => (
              <p key={item._id} className="metric-row">
                <span>{item.title}</span>
                <strong>{item.stock}</strong>
              </p>
            ))}
          </div>
        </article>
      </div>

      <article className="panel">
        <h3>Recent Orders</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Total</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id.slice(-8)}</td>
                  <td>{order.user?.name || "NA"}</td>
                  <td>{order.status}</td>
                  <td>{formatCurrency(order.totalPrice)}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
};

export default DashboardPage;
