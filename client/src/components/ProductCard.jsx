import { Link } from "react-router-dom";
import "./ProductCard.css";

function ProductCard({ product }) {
  const discountedPrice =
    product.price -
    (product.price * product.discount) / 100;

  return (
    <div className="product-card">

      <img
        src={product.image}
        alt={product.name}
        className="product-card-image"
      />

      <div className="product-card-content">

        <h3 className="product-card-name">
          {product.name}
        </h3>

        <p className="product-card-category">
          {product.category}
        </p>

        <div>
          <span className="product-card-price">
            ₹{discountedPrice.toFixed(2)}
          </span>

          {product.discount > 0 && (
            <span className="product-card-original-price">
              ₹{product.price}
            </span>
          )}
        </div>

        {product.discount > 0 && (
          <p className="product-card-discount">
            {product.discount}% OFF
          </p>
        )}

        <p>
          ⭐ {product.ratings || 0}
        </p>

        <p>
          Stock: {product.stock}
        </p>

        <Link
          to={`/products/${product._id}`}
          className="product-card-button"
        >
          View Product
        </Link>

      </div>
    </div>
  );
}

export default ProductCard;