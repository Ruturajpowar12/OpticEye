import { Link } from "react-router-dom";
import formatCurrency from "../utils/formatCurrency";

const ProductCard = ({ product }) => {
  const finalPrice = product.salePrice || product.price;

  return (
    <article className="product-card">
      <Link to={`/product/${product._id}`} className="product-image-wrap">
        <img src={product.images[0]} alt={product.title} className="product-image" />
      </Link>
      <div className="product-body">
        <p className="product-meta">
          {product.brand} | {product.frameType}
        </p>
        <h3>{product.title}</h3>
        <p className="product-meta">{product.color}</p>
        <div className="price-row">
          <strong>{formatCurrency(finalPrice)}</strong>
          {product.salePrice ? <span className="strike">{formatCurrency(product.price)}</span> : null}
        </div>
        <Link to={`/product/${product._id}`} className="primary-btn small">
          View Details
        </Link>
      </div>
    </article>
  );
};

export default ProductCard;
