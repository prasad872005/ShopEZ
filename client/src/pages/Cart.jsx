import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Cart.css";

function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState("");
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setError("");

        const response = await API.get("/cart");

        setCart(response.data.cart);
      } catch (error) {
        console.error(error);

        setError(
          error.response?.data?.message ||
            "Failed to load cart"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [navigate]);

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;

    try {
      setUpdating(productId);
      setError("");

      const response = await API.put("/cart/update", {
        productId,
        quantity
      });

      setCart(response.data.cart);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to update cart"
      );
    } finally {
      setUpdating("");
    }
  };

  const removeItem = async (productId) => {
    try {
      setUpdating(productId);
      setError("");

      const response = await API.delete(
        `/cart/remove/${productId}`
      );

      setCart(response.data.cart);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to remove item"
      );
    } finally {
      setUpdating("");
    }
  };

  const clearCart = async () => {
    try {
      setClearing(true);
      setError("");

      const response = await API.delete("/cart/clear");

      setCart(response.data.cart);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to clear cart"
      );
    } finally {
      setClearing(false);
    }
  };

  const totalItems =
    cart?.items?.reduce(
      (total, item) => total + item.quantity,
      0
    ) || 0;

  const cartTotal =
    cart?.items?.reduce(
      (total, item) =>
        total + Number(item.price) * Number(item.quantity),
      0
    ) || 0;

  if (loading) {
    return (
      <div className="cart-loading">
        <h2>Loading cart...</h2>
      </div>
    );
  }

  if (error && !cart) {
    return (
      <div className="cart-error-container">
        <h2 className="cart-error">{error}</h2>

        <button
          onClick={() => navigate("/products")}
          className="cart-shop-button"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="cart-empty">
        <h1>Your Cart is Empty 🛒</h1>

        <p>Add some products to your cart and come back here.</p>

        <button
          onClick={() => navigate("/products")}
          className="cart-shop-button"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1 className="cart-title">
        Shopping Cart 🛒
      </h1>

      {error && (
        <div className="cart-error">
          {error}
        </div>
      )}

      <div className="cart-content">

        <div className="cart-items">

          {cart.items.map((item) => {
            const product = item.product;

            const isUpdating =
              updating === product._id;

            const maxStock =
              Number(product.stock) || 0;

            const isMaxStock =
              item.quantity >= maxStock;

            return (
              <div
                key={product._id}
                className="cart-item"
              >

                <img
                  src={product.image}
                  alt={product.name}
                  className="cart-image"
                />

                <div className="cart-details">

                  <h2>{product.name}</h2>

                  <p>
                    Price: ₹
                    {Number(item.price).toFixed(2)}
                  </p>

                  <p>
                    Stock available: {maxStock}
                  </p>

                  <div className="cart-quantity">

                    <button
                      disabled={
                        isUpdating ||
                        item.quantity <= 1
                      }
                      onClick={() =>
                        updateQuantity(
                          product._id,
                          item.quantity - 1
                        )
                      }
                    >
                      −
                    </button>

                    <span>
                      {isUpdating
                        ? "..."
                        : item.quantity}
                    </span>

                    <button
                      disabled={
                        isUpdating ||
                        isMaxStock
                      }
                      onClick={() =>
                        updateQuantity(
                          product._id,
                          item.quantity + 1
                        )
                      }
                    >
                      +
                    </button>

                  </div>

                  {isMaxStock && (
                    <small>
                      Maximum available quantity reached
                    </small>
                  )}

                  <p>
                    Subtotal: ₹
                    {(
                      Number(item.price) *
                      Number(item.quantity)
                    ).toFixed(2)}
                  </p>

                  <button
                    disabled={isUpdating}
                    onClick={() =>
                      removeItem(product._id)
                    }
                    className="cart-remove"
                  >
                    {isUpdating
                      ? "Removing..."
                      : "Remove"}
                  </button>

                </div>
              </div>
            );
          })}

        </div>

        <div className="cart-summary">

          <h2>Order Summary</h2>

          <div className="cart-line">
            <span>Total Items</span>

            <span>
              {totalItems}
            </span>
          </div>

          <div className="cart-line">
            <span>Products</span>

            <span>
              {cart.items.length}
            </span>
          </div>

          <div className="cart-line">
            <span>Total</span>

            <strong>
              ₹{cartTotal.toFixed(2)}
            </strong>
          </div>

          <button
            disabled={
              !cart.items.length ||
              clearing
            }
            onClick={() => navigate("/checkout")}
            className="cart-checkout"
          >
            Proceed to Checkout
          </button>

          <button
            disabled={clearing}
            onClick={clearCart}
            className="cart-clear"
          >
            {clearing
              ? "Clearing..."
              : "Clear Cart"}
          </button>

        </div>

      </div>
    </div>
  );
}

export default Cart;