import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import formatCurrency from "../utils/formatCurrency";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, itemsPrice, taxPrice, shippingPrice, totalPrice, clearCart } = useCart();

  const [address, setAddress] = useState({
    fullName: user?.address?.fullName || user?.name || "",
    phone: user?.address?.phone || "",
    line1: user?.address?.line1 || "",
    line2: user?.address?.line2 || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    postalCode: user?.address?.postalCode || "",
    country: user?.address?.country || "India",
  });
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("ONLINE");
  const [onlineProvider, setOnlineProvider] = useState("GPAY");

  useEffect(() => {
    if (!items.length) {
      navigate("/cart", { replace: true });
    }
  }, [items.length, navigate]);

  const handlePlaceOrder = async (event) => {
    event.preventDefault();
    setError("");
    setPlacingOrder(true);

    try {
      const payload = {
        orderItems: items.map((item) => ({
          product: item.product,
          qty: item.qty,
        })),
        shippingAddress: address,
        paymentMethod: paymentMethod === "ONLINE" ? onlineProvider : "COD",
      };

      const { data } = await api.post("/orders", payload);
      clearCart();
      navigate(`/account?order=${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Order placement failed");
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <section className="section container checkout-grid page">
      <form className="list-card form-grid" onSubmit={handlePlaceOrder}>
        <h2>Shipping Details</h2>
        <input
          className="input"
          placeholder="Full Name"
          value={address.fullName}
          onChange={(e) => setAddress((prev) => ({ ...prev, fullName: e.target.value }))}
          required
        />
        <input
          className="input"
          placeholder="Phone"
          value={address.phone}
          onChange={(e) => setAddress((prev) => ({ ...prev, phone: e.target.value }))}
          required
        />
        <input
          className="input"
          placeholder="Address Line 1"
          value={address.line1}
          onChange={(e) => setAddress((prev) => ({ ...prev, line1: e.target.value }))}
          required
        />
        <input
          className="input"
          placeholder="Address Line 2 (Optional)"
          value={address.line2}
          onChange={(e) => setAddress((prev) => ({ ...prev, line2: e.target.value }))}
        />
        <div className="split-grid">
          <input
            className="input"
            placeholder="City"
            value={address.city}
            onChange={(e) => setAddress((prev) => ({ ...prev, city: e.target.value }))}
            required
          />
          <input
            className="input"
            placeholder="State"
            value={address.state}
            onChange={(e) => setAddress((prev) => ({ ...prev, state: e.target.value }))}
            required
          />
        </div>
        <div className="split-grid">
          <input
            className="input"
            placeholder="Postal Code"
            value={address.postalCode}
            onChange={(e) => setAddress((prev) => ({ ...prev, postalCode: e.target.value }))}
            required
          />
          <input
            className="input"
            placeholder="Country"
            value={address.country}
            onChange={(e) => setAddress((prev) => ({ ...prev, country: e.target.value }))}
            required
          />
        </div>
        <div className="payment-section">
          <h3>Payment Options</h3>
          <div className="payment-method-grid">
            <label className={`pay-card ${paymentMethod === "ONLINE" ? "selected" : ""}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="ONLINE"
                checked={paymentMethod === "ONLINE"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="pay-card-title">Online Payment</span>
              <span className="pay-card-sub">UPI and wallet supported</span>
            </label>
            <label className={`pay-card ${paymentMethod === "COD" ? "selected" : ""}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked={paymentMethod === "COD"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="pay-card-title">Cash on Delivery</span>
              <span className="pay-card-sub">Pay when order arrives</span>
            </label>
          </div>
          {paymentMethod === "ONLINE" ? (
            <div className="online-provider-grid">
              <button
                type="button"
                className={`provider-card ${onlineProvider === "GPAY" ? "selected" : ""}`}
                onClick={() => setOnlineProvider("GPAY")}
              >
                <span className="provider-icon gpay-icon">G</span>
                <span>GPay</span>
              </button>
              <button
                type="button"
                className={`provider-card ${onlineProvider === "PAYTM" ? "selected" : ""}`}
                onClick={() => setOnlineProvider("PAYTM")}
              >
                <span className="provider-icon paytm-icon">P</span>
                <span>Paytm</span>
              </button>
              <button
                type="button"
                className={`provider-card ${onlineProvider === "PHONEPE" ? "selected" : ""}`}
                onClick={() => setOnlineProvider("PHONEPE")}
              >
                <span className="provider-icon phonepe-icon">P</span>
                <span>PhonePe</span>
              </button>
            </div>
          ) : null}
          <p className="muted-text">
            Selected: {paymentMethod === "ONLINE" ? `Online (${onlineProvider})` : "Cash on Delivery"}
          </p>
        </div>

        {error ? <p className="error-text">{error}</p> : null}

        <button type="submit" className="primary-btn" disabled={placingOrder}>
          {placingOrder
            ? "Placing Order..."
            : `Place Order (${paymentMethod === "ONLINE" ? onlineProvider : "COD"})`}
        </button>
      </form>

      <aside className="summary-card">
        <h3>Payment Summary</h3>
        <p>
          <span>Items</span>
          <strong>{formatCurrency(itemsPrice)}</strong>
        </p>
        <p>
          <span>Tax</span>
          <strong>{formatCurrency(taxPrice)}</strong>
        </p>
        <p>
          <span>Shipping</span>
          <strong>{formatCurrency(shippingPrice)}</strong>
        </p>
        <p className="summary-total">
          <span>Total Payable</span>
          <strong>{formatCurrency(totalPrice)}</strong>
        </p>
      </aside>
    </section>
  );
};

export default CheckoutPage;
