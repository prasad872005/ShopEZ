import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import "./ProductDetails.css";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await API.get(
          `/products/${id}`
        );

        setProduct(response.data.product);
      } catch (error) {
        console.error(error);
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const addToCart = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await API.post("/cart/add", {
        productId: product._id,
        quantity
      });

      setMessage(response.data.message);
      setError("");
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
        "Failed to add product to cart"
      );

      setMessage("");
    }
  };

  if (loading) {
    return (
      <h2 style={{ textAlign: "center" }}>
        Loading product...
      </h2>
    );
  }

  if (error && !product) {
    return (
      <h2
        style={{
          textAlign: "center",
          color: "red"
        }}
      >
        {error}
      </h2>
    );
  }

  if (!product) {
    return (
      <h2 style={{ textAlign: "center" }}>
        Product not found
      </h2>
    );
  }

  const discountedPrice =
    product.price -
    (product.price * product.discount) / 100;

  return (
    <div className="product-details-container">

      <div className="product-details-product">

        {/* IMAGE */}

        <div className="product-details-image-section">
          <img
            src={product.image}
            alt={product.name}
            className="product-details-image"
          />
        </div>

        {/* DETAILS */}

        <div className="product-details-info">

          <p className="product-details-category">
            {product.category}
          </p>

          <h1 className="product-details-name">
            {product.name}
          </h1>

          <p className="product-details-rating">
            ⭐ {product.ratings || 0} / 5
          </p>

          <p className="product-details-description">
            {product.description}
          </p>

          <div>
            <span className="product-details-price">
              ₹{discountedPrice.toFixed(2)}
            </span>

            {product.discount > 0 && (
              <span className="product-details-original-price">
                ₹{product.price}
              </span>
            )}
          </div>

          {product.discount > 0 && (
            <p className="product-details-discount">
              {product.discount}% OFF
            </p>
          )}

          <p>
            <strong>Stock:</strong>{" "}
            {product.stock}
          </p>

          {/* QUANTITY */}

          {product.stock > 0 && (
            <div className="product-details-quantity">

              <button
                onClick={() =>
                  setQuantity(
                    Math.max(
                      1,
                      quantity - 1
                    )
                  )
                }
              >
                -
              </button>

              <span>
                {quantity}
              </span>

              <button
                onClick={() =>
                  setQuantity(
                    Math.min(
                      product.stock,
                      quantity + 1
                    )
                  )
                }
              >
                +
              </button>

            </div>
          )}

          {/* SUCCESS */}

          {message && (
            <p className="product-details-success">
              {message}
            </p>
          )}

          {/* ERROR */}

          {error && (
            <p className="product-details-error">
              {error}
            </p>
          )}

          {/* CART */}

          <button
            onClick={addToCart}
            disabled={product.stock === 0}
            className="product-details-cart-button"
          >
            {product.stock === 0
              ? "Out of Stock"
              : "Add to Cart 🛒"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default ProductDetails;