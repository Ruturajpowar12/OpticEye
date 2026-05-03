import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAdminAuth();

  const [email, setEmail] = useState("admin@opticeye.com");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({ email, password });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="admin-auth-wrap page">
      <form className="admin-auth-card" onSubmit={handleSubmit}>
        <h1>OpticEye Admin</h1>
        <p>Login to manage products, orders, users and catalog categories.</p>

        <input
          className="admin-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          className="admin-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />

        {error ? <p className="error-text">{error}</p> : null}

        <button type="submit" className="admin-btn" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </section>
  );
};

export default LoginPage;
