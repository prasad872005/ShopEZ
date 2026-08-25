import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function AdminOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = JSON.parse(
      localStorage.getItem("user")
    );

    if (!user || user.role !== "ADMIN") {
      navigate("/");
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await API.get(
          "/orders/admin/all"
        );

        console.log(
          "Admin orders:",
          response.data
        );

        setOrders(
          response.data.orders || []
        );

      } catch (error) {
        console.error(error);

        setError(
          error.response?.data?.message ||
          "Failed to load orders"
        );
      } finally {
        setLoading(false);
      }
    };

    

    fetchOrders();
  }, [navigate]);

  if (loading) {
    return (
      <h2 style={{ textAlign: "center" }}>
        Loading orders...
      </h2>
    );
  }

  const updateStatus = async (
  orderId,
  status
) => {
  try {
    const response = await API.put(
      `/orders/admin/status/${orderId}`,
      {
        status
      }
    );

    alert(
      response.data.message ||
      "Order status updated successfully"
    );

    setOrders((previousOrders) =>
      previousOrders.map((order) =>
        order._id === orderId
          ? response.data.order
          : order
      )
    );

  } catch (error) {
    console.error(error);

    alert(
      error.response?.data?.message ||
      "Failed to update order status"
    );
  }
};

  return (
    <div style={styles.container}>

      <h1 style={styles.title}>
        Admin Order Management 📦
      </h1>

      {error && (
        <p style={styles.error}>
          {error}
        </p>
      )}

      <div style={styles.summary}>
        Total Orders: <strong>{orders.length}</strong>
      </div>

      {orders.length === 0 ? (
        <div style={styles.empty}>
          <h2>No orders found</h2>
        </div>
      ) : (

        <div style={styles.orders}>

          {orders.map((order) => (

            <div
              key={order._id}
              style={styles.order}
            >

              <div style={styles.header}>

                <div>
                  <h2>
                    Order #{order._id.slice(-8)}
                  </h2>

                  <p>
                    Date:{" "}
                    {new Date(
                      order.createdAt
                    ).toLocaleString()}
                  </p>
                </div>

                <select
  value={order.orderStatus}
  onChange={(e) =>
    updateStatus(
      order._id,
      e.target.value
    )
  }
  style={styles.statusSelect}
>
  <option value="PLACED">
    PLACED
  </option>

  <option value="CONFIRMED">
    CONFIRMED
  </option>

  <option value="SHIPPED">
    SHIPPED
  </option>

  <option value="DELIVERED">
    DELIVERED
  </option>

  <option value="CANCELLED">
    CANCELLED
  </option>
</select>

              </div>

              <hr />

              <div style={styles.customer}>

                <h3>Customer</h3>

                <p>
                  <strong>Name:</strong>{" "}
                  {order.user?.name ||
                    "Unknown"}
                </p>

                <p>
                  <strong>Email:</strong>{" "}
                  {order.user?.email ||
                    "Unknown"}
                </p>

              </div>

              <h3>Products</h3>

              {order.items.map((item) => (

                <div
                  key={item._id}
                  style={styles.item}
                >

                  {item.product?.image && (
                    <img
                      src={item.product.image}
                      alt={item.name}
                      style={styles.image}
                    />
                  )}

                  <div>

                    <strong>
                      {item.name}
                    </strong>

                    <p>
                      Price: ₹{item.price}
                    </p>

                    <p>
                      Quantity: {item.quantity}
                    </p>

                    <p>
                      Subtotal: ₹
                      {(
                        item.price *
                        item.quantity
                      ).toFixed(2)}
                    </p>

                  </div>

                </div>

              ))}

              <hr />

              <div style={styles.footer}>

                <div>
                  <p>
                    <strong>
                      Payment:
                    </strong>{" "}
                    {order.paymentMethod}
                  </p>

                  <p>
                    <strong>
                      Payment Status:
                    </strong>{" "}
                    {order.paymentStatus}
                  </p>
                </div>

                <h2>
                  ₹
                  {Number(
                    order.totalAmount
                  ).toFixed(2)}
                </h2>

              </div>

              <div>

                <h3>
                  Shipping Address
                </h3>

                <p>
                  {order.shippingAddress?.name}
                </p>

                <p>
                  {order.shippingAddress?.address}
                </p>

                <p>
                  {order.shippingAddress?.city},{" "}
                  {order.shippingAddress?.state} -{" "}
                  {order.shippingAddress?.pincode}
                </p>

                <p>
                  Phone:{" "}
                  {order.shippingAddress?.phone}
                </p>

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    backgroundColor: "#f3f4f6",
    minHeight: "calc(100vh - 70px)"
  },

  statusSelect: {
  padding: "8px 12px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  cursor: "pointer",
  fontWeight: "bold"
},

  title: {
    textAlign: "center",
    marginBottom: "30px"
  },

  summary: {
    maxWidth: "1000px",
    margin: "0 auto 20px",
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    fontSize: "18px"
  },

  orders: {
    maxWidth: "1000px",
    margin: "auto"
  },

  order: {
    backgroundColor: "white",
    padding: "25px",
    marginBottom: "25px",
    borderRadius: "10px",
    boxShadow:
      "0 3px 10px rgba(0,0,0,0.08)"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  status: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    padding: "8px 15px",
    borderRadius: "20px",
    fontWeight: "bold"
  },

  customer: {
    marginBottom: "20px"
  },

  item: {
    display: "flex",
    gap: "20px",
    padding: "15px 0",
    borderBottom: "1px solid #eee"
  },

  image: {
    width: "80px",
    height: "80px",
    objectFit: "contain"
  },

  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  empty: {
    textAlign: "center",
    padding: "80px"
  },

  error: {
    textAlign: "center",
    color: "red"
  }
};

export default AdminOrders;