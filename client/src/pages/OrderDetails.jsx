import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get(`/orders/${id}`);

      setOrder(response.data.order);
    } catch (error) {
      console.error("Order details error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load order"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const cancelOrder = async () => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmCancel) return;

    try {
      setCancelling(true);

      const response = await API.put(
        `/orders/cancel/${id}`
      );

      alert(
        response.data.message ||
          "Order cancelled successfully"
      );

      setOrder(response.data.order);
    } catch (error) {
      console.error("Cancel order error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to cancel order"
      );
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "PLACED":
        return {
          backgroundColor: "#dbeafe",
          color: "#1d4ed8"
        };

      case "CONFIRMED":
        return {
          backgroundColor: "#fef3c7",
          color: "#92400e"
        };

      case "SHIPPED":
        return {
          backgroundColor: "#e0e7ff",
          color: "#4338ca"
        };

      case "DELIVERED":
        return {
          backgroundColor: "#dcfce7",
          color: "#166534"
        };

      case "CANCELLED":
        return {
          backgroundColor: "#fee2e2",
          color: "#b91c1c"
        };

      default:
        return {
          backgroundColor: "#f3f4f6",
          color: "#374151"
        };
    }
  };

  const getPaymentStyle = (status) => {
    switch (status) {
      case "PAID":
        return {
          backgroundColor: "#dcfce7",
          color: "#166534"
        };

      case "PENDING":
        return {
          backgroundColor: "#fef3c7",
          color: "#92400e"
        };

      case "FAILED":
        return {
          backgroundColor: "#fee2e2",
          color: "#b91c1c"
        };

      default:
        return {
          backgroundColor: "#f3f4f6",
          color: "#374151"
        };
    }
  };

  if (loading) {
    return (
      <div style={styles.message}>
        <div style={styles.loader}>⏳</div>
        <h2>Loading order details...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.message}>
        <div style={styles.errorIcon}>⚠️</div>

        <h2>{error}</h2>

        <button
          onClick={fetchOrder}
          style={styles.button}
        >
          Try Again
        </button>

        <button
          onClick={() => navigate("/orders")}
          style={styles.secondaryButton}
        >
          Back to Orders
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={styles.message}>
        <h2>Order not found</h2>

        <button
          onClick={() => navigate("/orders")}
          style={styles.button}
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>

      <div style={styles.box}>

        {/* BACK BUTTON */}

        <button
          onClick={() => navigate("/orders")}
          style={styles.back}
        >
          ← Back to Orders
        </button>

        {/* HEADER */}

        <div style={styles.header}>

          <div>
            <h1 style={styles.title}>
              Order Details 📦
            </h1>

            <p style={styles.orderId}>
              Order ID: {order._id}
            </p>

            {order.createdAt && (
              <p style={styles.date}>
                Placed on {formatDate(order.createdAt)}
              </p>
            )}
          </div>

          <span
            style={{
              ...styles.statusBadge,
              ...getStatusStyle(
                order.orderStatus
              )
            }}
          >
            {order.orderStatus}
          </span>

        </div>

        <hr style={styles.divider} />

        {/* PAYMENT INFORMATION */}

        <h2 style={styles.sectionTitle}>
          Payment Information
        </h2>

        <div style={styles.infoGrid}>

          <div style={styles.infoBox}>
            <span style={styles.label}>
              Payment Method
            </span>

            <strong>
              {order.paymentMethod ===
              "ONLINE"
                ? "Online Payment"
                : "Cash on Delivery"}
            </strong>
          </div>

          <div style={styles.infoBox}>
            <span style={styles.label}>
              Payment Status
            </span>

            <span
              style={{
                ...styles.paymentBadge,
                ...getPaymentStyle(
                  order.paymentStatus
                )
              }}
            >
              {order.paymentStatus}
            </span>
          </div>

        </div>

        <hr style={styles.divider} />

        {/* PRODUCTS */}

        <h2 style={styles.sectionTitle}>
          Ordered Products
        </h2>

        <div>
          {order.items.map((item, index) => (

            <div
              key={item._id || index}
              style={styles.item}
            >

              {item.product?.image ? (
                <img
                  src={item.product.image}
                  alt={item.name}
                  style={styles.image}
                />
              ) : (
                <div style={styles.imagePlaceholder}>
                  🛍️
                </div>
              )}

              <div style={styles.itemDetails}>

                <h3 style={styles.productName}>
                  {item.name}
                </h3>

                <p style={styles.itemText}>
                  Price: ₹
                  {Number(item.price).toFixed(2)}
                </p>

                <p style={styles.itemText}>
                  Quantity: {item.quantity}
                </p>

                <strong style={styles.subtotal}>
                  Subtotal: ₹
                  {(
                    item.price *
                    item.quantity
                  ).toFixed(2)}
                </strong>

              </div>

            </div>

          ))}
        </div>

        {/* TOTAL */}

        <div style={styles.total}>

          <span>
            Total Amount
          </span>

          <strong>
            ₹
            {Number(
              order.totalAmount
            ).toFixed(2)}
          </strong>

        </div>

        <hr style={styles.divider} />

        {/* SHIPPING */}

        <h2 style={styles.sectionTitle}>
          Delivery Address
        </h2>

        <div style={styles.address}>

          <strong>
            {order.shippingAddress.name}
          </strong>

          <p>
            {order.shippingAddress.address}
          </p>

          <p>
            {order.shippingAddress.city},{" "}
            {order.shippingAddress.state} -{" "}
            {order.shippingAddress.pincode}
          </p>

          <p>
            📞 {order.shippingAddress.phone}
          </p>

        </div>

        {/* ORDER PROGRESS */}

        {order.orderStatus !==
          "CANCELLED" && (

          <div style={styles.progressSection}>

            <h2 style={styles.sectionTitle}>
              Order Progress
            </h2>

            <div style={styles.progress}>

              {[
                "PLACED",
                "CONFIRMED",
                "SHIPPED",
                "DELIVERED"
              ].map((status, index) => {

                const statuses = [
                  "PLACED",
                  "CONFIRMED",
                  "SHIPPED",
                  "DELIVERED"
                ];

                const currentIndex =
                  statuses.indexOf(
                    order.orderStatus
                  );

                const completed =
                  index <= currentIndex;

                return (
                  <div
                    key={status}
                    style={styles.progressItem}
                  >

                    <div
                      style={{
                        ...styles.progressCircle,
                        ...(completed
                          ? styles.progressCompleted
                          : {})
                      }}
                    >
                      {completed
                        ? "✓"
                        : index + 1}
                    </div>

                    <span
                      style={{
                        ...styles.progressLabel,
                        ...(completed
                          ? styles.progressTextCompleted
                          : {})
                      }}
                    >
                      {status}
                    </span>

                  </div>
                );
              })}

            </div>

          </div>
        )}

        {/* ACTIONS */}

        <div style={styles.actions}>

          {(order.orderStatus === "PLACED" ||
            order.orderStatus === "CONFIRMED") && (

            <button
              onClick={cancelOrder}
              disabled={cancelling}
              style={{
                ...styles.cancel,
                opacity: cancelling ? 0.6 : 1
              }}
            >
              {cancelling
                ? "Cancelling..."
                : "Cancel Order"}
            </button>

          )}

          <button
            onClick={() => navigate("/products")}
            style={styles.shopButton}
          >
            Continue Shopping
          </button>

        </div>

      </div>

    </div>
  );
}

const styles = {
  container: {
    padding: "40px 20px",
    backgroundColor: "#f3f4f6",
    minHeight: "calc(100vh - 70px)"
  },

  box: {
    maxWidth: "900px",
    margin: "auto",
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "12px",
    boxShadow:
      "0 3px 12px rgba(0,0,0,0.08)"
  },

  back: {
    padding: "9px 15px",
    border: "none",
    backgroundColor: "#e5e7eb",
    borderRadius: "6px",
    cursor: "pointer",
    marginBottom: "25px",
    fontWeight: "600"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    flexWrap: "wrap"
  },

  title: {
    margin: 0,
    fontSize: "30px",
    color: "#111827"
  },

  orderId: {
    margin: "10px 0 4px",
    color: "#4b5563",
    fontSize: "13px",
    wordBreak: "break-all"
  },

  date: {
    margin: 0,
    color: "#9ca3af",
    fontSize: "13px"
  },

  statusBadge: {
    padding: "7px 14px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700"
  },

  divider: {
    border: "none",
    borderTop: "1px solid #e5e7eb",
    margin: "25px 0"
  },

  sectionTitle: {
    fontSize: "19px",
    marginBottom: "15px",
    color: "#111827"
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "15px"
  },

  infoBox: {
    padding: "15px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },

  label: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#6b7280",
    letterSpacing: "0.5px"
  },

  paymentBadge: {
    width: "fit-content",
    padding: "5px 10px",
    borderRadius: "15px",
    fontSize: "11px",
    fontWeight: "700"
  },

  item: {
    display: "flex",
    gap: "20px",
    padding: "18px 0",
    borderBottom: "1px solid #f1f1f1"
  },

  image: {
    width: "110px",
    height: "110px",
    objectFit: "contain",
    borderRadius: "8px",
    border: "1px solid #e5e7eb"
  },

  imagePlaceholder: {
    width: "110px",
    height: "110px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: "8px",
    fontSize: "35px"
  },

  itemDetails: {
    flex: 1
  },

  productName: {
    marginTop: 0,
    marginBottom: "10px"
  },

  itemText: {
    margin: "5px 0",
    color: "#6b7280"
  },

  subtotal: {
    display: "block",
    marginTop: "10px"
  },

  total: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "23px",
    margin: "25px 0",
    color: "#111827"
  },

  address: {
    backgroundColor: "#f9fafb",
    padding: "18px",
    borderRadius: "8px",
    lineHeight: "1.6",
    color: "#4b5563"
  },

  progressSection: {
    marginTop: "25px"
  },

  progress: {
    display: "flex",
    justifyContent: "space-between",
    position: "relative",
    marginTop: "25px"
  },

  progressItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    zIndex: 1
  },

  progressCircle: {
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    backgroundColor: "#e5e7eb",
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700"
  },

  progressCompleted: {
    backgroundColor: "#111827",
    color: "white"
  },

  progressLabel: {
    fontSize: "10px",
    color: "#9ca3af",
    fontWeight: "600"
  },

  progressTextCompleted: {
    color: "#111827"
  },

  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "30px",
    flexWrap: "wrap"
  },

  cancel: {
    flex: 1,
    minWidth: "180px",
    padding: "13px",
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600"
  },

  shopButton: {
    flex: 1,
    minWidth: "180px",
    padding: "13px",
    backgroundColor: "#111827",
    color: "white",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600"
  },

  message: {
    textAlign: "center",
    padding: "100px 20px"
  },

  loader: {
    fontSize: "40px"
  },

  errorIcon: {
    fontSize: "40px"
  },

  button: {
    padding: "11px 22px",
    backgroundColor: "#111827",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    margin: "5px"
  },

  secondaryButton: {
    padding: "11px 22px",
    backgroundColor: "#e5e7eb",
    color: "#111827",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    margin: "5px"
  }
};

export default OrderDetails;