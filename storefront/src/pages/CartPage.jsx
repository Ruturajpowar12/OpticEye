import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import formatCurrency from "../utils/formatCurrency";

const CartPage = () => {
  const {
    items,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    updateQty,
    removeFromCart,
  } = useCart();

  if (!items.length) {
    return (
      <section className="section container page">
        <h2>Your cart is empty</h2>
        <p>Add eyewear products to continue.</p>
        <Link to="/shop" className="primary-btn small">
          Browse Shop
        </Link>
      </section>
    );
  }

  return (
    <section className="section container checkout-grid page">
      <div className="list-card">
        <h2>Shopping Cart</h2>
        {items.map((item) => (
          <article key={item.product} className="cart-item">
            <img src={item.image} alt={item.name} />
            <div>
              <h3>{item.name}</h3>
              <p>{formatCurrency(item.price)}</p>
            </div>
            <select
              className="input qty-input"
              value={item.qty}
              onChange={(e) => updateQty(item.product, Number(e.target.value))}
            >
              {Array.from({ length: item.stock }).map((_, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {idx + 1}
                </option>
              ))}
            </select>
            <button type="button" className="ghost-btn" onClick={() => removeFromCart(item.product)}>
              Remove
            </button>
          </article>
        ))}
      </div>

      <aside className="summary-card">
        <h3>Order Summary</h3>
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
          <span>Total</span>
          <strong>{formatCurrency(totalPrice)}</strong>
        </p>

        <Link to="/checkout" className="primary-btn">
          Proceed to Checkout
        </Link>
      </aside>
    </section>
  );
};

export default CartPage;
