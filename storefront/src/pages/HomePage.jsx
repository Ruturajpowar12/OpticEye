import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import ProductCard from "../components/ProductCard";

const highlights = [
  {
    title: "Frame Fit Guidance",
    description: "Get shape and size recommendations for daily comfort and better visual balance.",
  },
  {
    title: "Lens Customization",
    description: "Single vision, blue-light, progressive, and polarized options tuned to your needs.",
  },
  {
    title: "Fast and Safe Delivery",
    description: "Quick dispatch with secure packaging and live order updates across serviceable cities.",
  },
  {
    title: "Easy Returns",
    description: "Simple return flow with support helpdesk for exchange, fit issues, and replacements.",
  },
];

const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHome = async () => {
      setLoading(true);
      setError("");
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get("/products", { params: { featured: true, limit: 8, sort: "rating-desc" } }),
          api.get("/categories"),
        ]);

        setFeatured(productsRes.data.products || []);
        setCategories(categoriesRes.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load home data");
      } finally {
        setLoading(false);
      }
    };

    loadHome();
  }, []);

  return (
    <div>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-banner">
            <p className="eyebrow">Eyeglasses and Sunglasses</p>
            <h1>See Better. Look Sharper. Shop Smarter.</h1>
            <p>
              OpticEye brings lens-ready eyeglasses, polarized sunglasses, and screen-safe blue
              light styles in one clean experience.
            </p>
            <div className="hero-actions">
              <Link className="primary-btn" to="/shop?category=eyeglasses">
                Shop Eyeglasses
              </Link>
              <Link className="outline-btn" to="/shop?category=sunglasses">
                Shop Sunglasses
              </Link>
            </div>
          </div>

          <div className="hero-card">
            <h3>Why OpticEye</h3>
            <p>
              Better choices, clearer filters, and trusted support for first-time and repeat eyewear
              shoppers.
            </p>
            <div className="hero-metrics">
              <article>
                <strong>5000+</strong>
                <span>Happy Customers</span>
              </article>
              <article>
                <strong>4.8/5</strong>
                <span>Average Rating</span>
              </article>
              <article>
                <strong>7 Days</strong>
                <span>Easy Returns</span>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <h2>Shop by Category</h2>
          <Link to="/shop">View All</Link>
        </div>
        {error ? <p className="error-text">{error}</p> : null}
        {loading ? <p>Loading categories...</p> : null}
        <div className="category-grid">
          {categories.map((category) => (
            <Link key={category._id} to={`/shop?category=${category.slug}`} className="category-card">
              <img src={category.image} alt={category.name} />
              <div>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section container why-section">
        <div className="section-head">
          <h2>Why OpticEye</h2>
        </div>
        <div className="why-grid">
          {highlights.map((item) => (
            <article key={item.title} className="why-card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <h2>Trending Frames</h2>
          <Link to="/shop">Explore More</Link>
        </div>
        {loading ? <p>Loading products...</p> : null}
        <div className="product-grid">
          {featured.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
