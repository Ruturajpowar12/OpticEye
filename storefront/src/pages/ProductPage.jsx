import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client";
import { useCart } from "../context/CartContext";
import formatCurrency from "../utils/formatCurrency";

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  if (loading) {
    return <section className="section container page">Loading product...</section>;
  }

  if (!product) {
    return <section className="section container page">{error || "Product not found"}</section>;
  }

  const finalPrice = product.salePrice || product.price;

  return (
    <section className="section container product-detail page">
      <img src={product.images[0]} alt={product.title} className="detail-image" />
      <div>
        <p className="eyebrow">{product.category?.name}</p>
        <h2>{product.title}</h2>
        <p>{product.description}</p>

        <div className="detail-tags">
          <span>{product.brand}</span>
          <span>{product.frameType}</span>
          <span>{product.lensType}</span>
          <span>{product.gender}</span>
        </div>

        <div className="price-row large">
          <strong>{formatCurrency(finalPrice)}</strong>
          {product.salePrice ? <span className="strike">{formatCurrency(product.price)}</span> : null}
        </div>

        <div className="stock-row">
          <span>{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</span>
          {product.stock > 0 ? (
            <select value={qty} onChange={(e) => setQty(Number(e.target.value))} className="input qty-input">
              {Array.from({ length: Math.min(product.stock, 8) }).map((_, index) => (
                <option key={index + 1} value={index + 1}>
                  Qty: {index + 1}
                </option>
              ))}
            </select>
          ) : null}
        </div>

        <button
          type="button"
          className="primary-btn"
          disabled={product.stock === 0}
          onClick={() => {
            addToCart(product, qty);
            navigate("/cart");
          }}
        >
          Add to Cart
        </button>
      </div>
    </section>
  );
};

export default ProductPage;
