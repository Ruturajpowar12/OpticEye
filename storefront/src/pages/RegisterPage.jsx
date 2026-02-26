import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(form);
      navigate("/account", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section container auth-shell">
      <aside className="auth-side">
        <p className="eyebrow">Create Your Profile</p>
        <h3>Join OpticEye in 30 Seconds</h3>
        <p>
          Register once and continue shopping with faster checkout and order
          tracking.
        </p>
        <ul>
          <li>Access saved cart from your account</li>
          <li>Track eyeglasses and sunglasses orders</li>
          <li>Receive offer updates on frame collections</li>
        </ul>
      </aside>

      <form className="auth-card auth-form-card" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        <p>Join OpticEye for personalized shopping and faster checkout.</p>

        <label className="input-wrap">
          <span>Full Name</span>
          <input
            className="input"
            placeholder="Enter your full name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
        </label>

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
            placeholder="Minimum 6 characters"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            required
            minLength={6}
          />
        </label>

        {error ? <p className="error-text">{error}</p> : null}

        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? "Creating..." : "Create Account"}
        </button>

        <p className="auth-link-row">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </section>
  );
};

export default RegisterPage;
