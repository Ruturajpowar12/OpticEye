import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Layout = () => {
  const { user, logout } = useAuth();
  const { itemsCount } = useCart();

  return (
    <div className="site-shell">
      <header className="topbar">
        <div className="container topbar-inner">
          <NavLink to="/" className="brand">
            <span className="brand-eye">Optic</span>
            <span>Eye</span>
          </NavLink>

          <nav className="nav-links">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/shop">Shop</NavLink>
            <NavLink to="/shop?category=eyeglasses">Eyeglasses</NavLink>
            <NavLink to="/shop?category=sunglasses">Sunglasses</NavLink>
          </nav>

          <div className="nav-actions">
            <NavLink to="/cart" className="cart-pill">
              Cart <span>{itemsCount}</span>
            </NavLink>
            {user ? (
              <>
                <NavLink to="/account">{user.name.split(" ")[0]}</NavLink>
                <button type="button" onClick={logout} className="ghost-btn">
                  Logout
                </button>
              </>
            ) : (
              <NavLink to="/login">Login</NavLink>
            )}
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <h4>OpticEye Store</h4>
            <p>
              Modern eyeglasses and sunglasses for office, driving, study, and everyday wear.
            </p>
            <p className="footer-note">
              Development mode active. New modules are being improved weekly.
            </p>
          </div>
          <div className="footer-block">
            <h4>Customer Care</h4>
            <p>7-day returns and replacement support</p>
            <p>Frame fit and lens power assistance</p>
            <p>Cash on Delivery across serviceable cities</p>
          </div>
          <div className="footer-block">
            <h4>Contact Info</h4>
            <p>Email: support@opticeye.com</p>
            <p>Phone: +91 7249250361</p>
            <p>Address: Siddhanerli, Kagal, Kolhapur</p>
            <p>Hours: Mon-Sat, 9:00 AM - 7:00 PM</p>
          </div>
          <div className="footer-block">
            <h4>Quick Links</h4>
            <nav className="footer-links">
              <NavLink to="/shop">Shop</NavLink>
              <NavLink to="/shop?category=eyeglasses">Eyeglasses</NavLink>
              <NavLink to="/shop?category=sunglasses">Sunglasses</NavLink>
            </nav>
          </div>
        </div>
        <div className="container footer-bottom">
          <p>(c) {new Date().getFullYear()} OpticEye. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
