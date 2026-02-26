import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const redirect = location.state?.from?.pathname || "/account";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form);
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section container auth-shell">
      <aside className="auth-side">
        <p className="eyebrow">Development Preview</p>
        <h3>OpticEye Account Access</h3>
        <p>
          Sign in to track your orders, manage saved details, and continue
          checkout faster.
        </p>
        <ul>
          <li>Order timeline and status updates</li>
          <li>Saved profile and contact details</li>
          <li>One-click reorder experience</li>
        </ul>
      </aside>

      <form className="auth-card auth-form-card" onSubmit={handleSubmit}>
        <h2>Welcome Back</h2>
        <p>Login to track orders and manage your profile.</p>

        <label className="input-wrap">
          <span>Email Address</span>
          <input
            className="input"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
        </label>

        <label className="input-wrap">
          <span>Password</span>
          <input
            className="input"
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            required
          />
        </label>

        {error ? <p className="error-text">{error}</p> : null}

        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="auth-link-row">
          New to OpticEye? <Link to="/register">Create account</Link>
        </p>
      </form>
    </section>
  );
};

export default LoginPage;
