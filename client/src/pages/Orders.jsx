import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setError("");

      const response = await API.get("/orders/my-orders");

      setOrders(response.data.orders || []);
    } catch (error) {
      console.error("Orders error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load orders"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const cancelOrder = async (orderId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmCancel) return;

    try {
      setCancellingId(orderId);

      const response = await API.put(
        `/orders/cancel/${orderId}`
      );

      alert(
        response.data.message ||
          "Order cancelled successfully"
      );

      await fetchOrders();
    } catch (error) {
      console.error("Cancel order error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to cancel order"
      );
    } finally {
      setCancellingId(null);
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

  const getStatusClass = (status) => {
    switch (status) {
      case "PLACED":
        return styles.statusPlaced;

      case "CONFIRMED":
        return styles.statusConfirmed;

      case "SHIPPED":
        return styles.statusShipped;

      case "DELIVERED":
        return styles.statusDelivered;

      case "CANCELLED":
        return styles.statusCancelled;

      default:
        return styles.statusDefault;
    }
  };

  const getPaymentStatusClass = (status) => {
    switch (status) {
      case "PAID":
        return styles.paymentPaid;

      case "PENDING":
        return styles.paymentPending;

      case "FAILED":
        return styles.paymentFailed;

      default:
        return styles.paymentDefault;
    }
  };

  if (loading) {
    return (
      <div style={styles.message}>
        <div style={styles.loader}>⏳</div>
        <h2>Loading your orders...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.message}>
        <div style={styles.errorIcon}>⚠️</div>

        <h2>{error}</h2>

        <button
          onClick={fetchOrders}
          style={styles.button}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={styles.empty}>
        <div style={styles.emptyIcon}>📦</div>

        <h1>No Orders Yet</h1>

        <p style={styles.emptyText}>
          You haven't placed any orders yet.
        </p>

        <button
          onClick={() => navigate("/products")}
          style={styles.button}
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>

      {/* PAGE HEADER */}

      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.title}>
            My Orders 📦
          </h1>

          <p style={styles.subtitle}>
            Track and manage your ShopEZ orders
          </p>
        </div>

        <button
          onClick={() => navigate("/products")}
          style={styles.shopButton}
        >
          Continue Shopping
        </button>
      </div>

      {/* ORDER COUNT */}

      <div style={styles.orderCount}>
        {orders.length}{" "}
        {orders.length === 1
          ? "Order"
          : "Orders"}
      </div>

      {/* ORDERS */}

      <div style={styles.orders}>

        {orders.map((order) => (

          <div
            key={order._id}
            style={styles.order}
          >

            {/* ORDER HEADER */}

            <div style={styles.header}>

              <div>
                <span style={styles.smallLabel}>
                  ORDER ID
                </span>

                <p style={styles.orderId}>
                  #{order._id}
                </p>

                <p style={styles.date}>
                  {formatDate(order.createdAt)}
                </p>
              </div>

              <div style={styles.statusContainer}>

                <span style={styles.smallLabel}>
                  ORDER STATUS
                </span>

                <span
                  style={{
                    ...styles.statusBadge,
                    ...getStatusClass(
                      order.orderStatus
                    )
                  }}
                >
                  {order.orderStatus}
                </span>

              </div>

            </div>

            <hr style={styles.divider} />

            {/* PRODUCTS */}

            <h3 style={styles.sectionTitle}>
              Products
            </h3>

            <div>
              {order.items.map((item, index) => (

                <div
                  key={item._id || index}
                  style={styles.item}
                >

                  <div style={styles.productInfo}>

                    {item.product?.image ? (
                      <img
                        src={item.product.image}
                        alt={item.name}
                        style={styles.productImage}
                      />
                    ) : (
                      <div style={styles.imagePlaceholder}>
                        🛍️
                      </div>
                    )}

                    <div>
                      <strong style={styles.productName}>
                        {item.name}
                      </strong>

                      <p style={styles.productMeta}>
                        ₹{Number(item.price).toFixed(2)}
                        {" × "}
                        {item.quantity}
                      </p>
                    </div>

                  </div>

                  <strong>
                    ₹
                    {(
                      item.price *
                      item.quantity
                    ).toFixed(2)}
                  </strong>

                </div>

              ))}
            </div>

            <hr style={styles.divider} />

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

            {/* PAYMENT */}

            <div style={styles.infoGrid}>

              <div style={styles.infoBox}>
                <span style={styles.smallLabel}>
                  PAYMENT METHOD
                </span>

                <strong>
                  {order.paymentMethod ===
                  "ONLINE"
                    ? "Online Payment"
                    : "Cash on Delivery"}
                </strong>
              </div>

              <div style={styles.infoBox}>
                <span style={styles.smallLabel}>
                  PAYMENT STATUS
                </span>

                <span
                  style={{
                    ...styles.paymentBadge,
                    ...getPaymentStatusClass(
                      order.paymentStatus
                    )
                  }}
                >
                  {order.paymentStatus}
                </span>
              </div>

            </div>

            {/* DELIVERY ADDRESS */}

            <div style={styles.addressBox}>

              <h3 style={styles.sectionTitle}>
                Delivery Address
              </h3>

              <p style={styles.addressText}>
                <strong>
                  {order.shippingAddress.name}
                </strong>
                <br />

                {order.shippingAddress.address}
                <br />

                {order.shippingAddress.city},{" "}
                {order.shippingAddress.state} -{" "}
                {order.shippingAddress.pincode}
                <br />

                📞 {order.shippingAddress.phone}
              </p>

            </div>

            {/* ACTIONS */}

            <div style={styles.actions}>

              <button
                onClick={() =>
                  navigate(
                    `/orders/${order._id}`
                  )
                }
                style={styles.viewButton}
              >
                View Order
              </button>

              {(order.orderStatus ===
                "PLACED" ||
                order.orderStatus ===
                  "CONFIRMED") && (

                <button
                  onClick={() =>
                    cancelOrder(order._id)
                  }
                  disabled={
                    cancellingId ===
                    order._id
                  }
                  style={{
                    ...styles.cancelButton,
                    opacity:
                      cancellingId ===
                      order._id
                        ? 0.6
                        : 1
                  }}
                >
                  {cancellingId ===
                  order._id
                    ? "Cancelling..."
                    : "Cancel Order"}
                </button>

              )}

            </div>

          </div>

        ))}

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

  pageHeader: {
    maxWidth: "1000px",
    margin: "0 auto 25px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap"
  },

  title: {
    margin: 0,
    fontSize: "32px",
    color: "#111827"
  },

  subtitle: {
    marginTop: "8px",
    color: "#6b7280"
  },

  shopButton: {
    padding: "11px 20px",
    backgroundColor: "#111827",
    color: "white",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "600"
  },

  orderCount: {
    maxWidth: "1000px",
    margin: "0 auto 15px",
    color: "#6b7280",
    fontWeight: "600"
  },

  orders: {
    maxWidth: "1000px",
    margin: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "25px"
  },

  order: {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow:
      "0 3px 12px rgba(0,0,0,0.08)"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    flexWrap: "wrap"
  },

  smallLabel: {
    display: "block",
    fontSize: "11px",
    color: "#6b7280",
    fontWeight: "700",
    letterSpacing: "0.5px",
    marginBottom: "5px"
  },

  orderId: {
    margin: "0",
    fontSize: "13px",
    color: "#374151",
    wordBreak: "break-all"
  },

  date: {
    margin: "6px 0 0",
    color: "#9ca3af",
    fontSize: "13px"
  },

  statusContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end"
  },

  statusBadge: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700"
  },

  statusPlaced: {
    backgroundColor: "#dbeafe",
    color: "#1d4ed8"
  },

  statusConfirmed: {
    backgroundColor: "#fef3c7",
    color: "#92400e"
  },

  statusShipped: {
    backgroundColor: "#e0e7ff",
    color: "#4338ca"
  },

  statusDelivered: {
    backgroundColor: "#dcfce7",
    color: "#166534"
  },

  statusCancelled: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c"
  },

  statusDefault: {
    backgroundColor: "#f3f4f6",
    color: "#374151"
  },

  divider: {
    border: "none",
    borderTop: "1px solid #e5e7eb",
    margin: "20px 0"
  },

  sectionTitle: {
    margin: "0 0 12px",
    fontSize: "17px",
    color: "#111827"
  },

  item: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    padding: "12px 0",
    borderBottom: "1px solid #f1f1f1"
  },

  productInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },

  productImage: {
    width: "55px",
    height: "55px",
    objectFit: "cover",
    borderRadius: "8px",
    border: "1px solid #e5e7eb"
  },

  imagePlaceholder: {
    width: "55px",
    height: "55px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: "8px",
    fontSize: "22px"
  },

  productName: {
    display: "block",
    color: "#111827"
  },

  productMeta: {
    margin: "5px 0 0",
    fontSize: "13px",
    color: "#6b7280"
  },

  total: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "20px",
    margin: "18px 0",
    color: "#111827"
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
    marginTop: "15px"
  },

  infoBox: {
    padding: "14px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },

  paymentBadge: {
    display: "inline-block",
    width: "fit-content",
    padding: "4px 9px",
    borderRadius: "15px",
    fontSize: "11px",
    fontWeight: "700"
  },

  paymentPaid: {
    backgroundColor: "#dcfce7",
    color: "#166534"
  },

  paymentPending: {
    backgroundColor: "#fef3c7",
    color: "#92400e"
  },

  paymentFailed: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c"
  },

  paymentDefault: {
    backgroundColor: "#f3f4f6",
    color: "#374151"
  },

  addressBox: {
    marginTop: "20px",
    padding: "16px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px"
  },

  addressText: {
    margin: 0,
    lineHeight: "1.7",
    color: "#4b5563"
  },

  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
    flexWrap: "wrap"
  },

  viewButton: {
    padding: "10px 20px",
    backgroundColor: "#111827",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600"
  },

  cancelButton: {
    padding: "10px 20px",
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600"
  },

  empty: {
    textAlign: "center",
    padding: "100px 20px"
  },

  emptyIcon: {
    fontSize: "60px"
  },

  emptyText: {
    color: "#6b7280",
    marginBottom: "25px"
  },

  message: {
    textAlign: "center",
    padding: "100px 20px"
  },

  loader: {
    fontSize: "40px"
  },

  errorIcon: {
    fontSize: "40px",
    marginBottom: "10px"
  },

  button: {
    padding: "12px 25px",
    backgroundColor: "#111827",
    color: "white",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "600"
  }
};

export default Orders;