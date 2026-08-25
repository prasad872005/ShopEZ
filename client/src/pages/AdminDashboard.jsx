import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
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

    const fetchStats = async () => {
      try {
        const response = await API.get(
          "/orders/admin/stats"
        );

        console.log(
          "Admin stats:",
          response.data
        );

        setStats(response.data);

      } catch (error) {
        console.error(error);

        setError(
          error.response?.data?.message ||
          "Failed to load dashboard"
        );

      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  if (loading) {
    return (
      <h2 style={{ textAlign: "center" }}>
        Loading dashboard...
      </h2>
    );
  }

  if (error) {
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

  return (
    <div style={styles.container}>

      <h1 style={styles.title}>
        Admin Dashboard 👨‍💼
      </h1>

      {/* STAT CARDS */}

      <div style={styles.grid}>

        <div style={styles.card}>
          <div style={styles.icon}>
            👥
          </div>

          <div>
            <p style={styles.label}>
              Total Users
            </p>

            <h2 style={styles.number}>
              {stats.totalUsers}
            </h2>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.icon}>
            🛍️
          </div>

          <div>
            <p style={styles.label}>
              Total Products
            </p>

            <h2 style={styles.number}>
              {stats.totalProducts}
            </h2>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.icon}>
            📦
          </div>

          <div>
            <p style={styles.label}>
              Total Orders
            </p>

            <h2 style={styles.number}>
              {stats.totalOrders}
            </h2>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.icon}>
            💰
          </div>

          <div>
            <p style={styles.label}>
              Total Sales
            </p>

            <h2 style={styles.number}>
              ₹{Number(
                stats.totalSales
              ).toFixed(2)}
            </h2>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.icon}>
            🚚
          </div>

          <div>
            <p style={styles.label}>
              Pending Orders
            </p>

            <h2 style={styles.number}>
              {stats.pendingOrders}
            </h2>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.icon}>
            ✅
          </div>

          <div>
            <p style={styles.label}>
              Delivered Orders
            </p>

            <h2 style={styles.number}>
              {stats.deliveredOrders}
            </h2>
          </div>
        </div>

      </div>

      {/* ORDER STATUS */}

      <div style={styles.statusBox}>

        <h2>
          Order Overview
        </h2>

        <div style={styles.statusGrid}>

          <div>
            <strong>
              Pending
            </strong>

            <p>
              {stats.pendingOrders}
            </p>
          </div>

          <div>
            <strong>
              Delivered
            </strong>

            <p>
              {stats.deliveredOrders}
            </p>
          </div>

          <div>
            <strong>
              Cancelled
            </strong>

            <p>
              {stats.cancelledOrders}
            </p>
          </div>

        </div>

      </div>

      {/* ACTION BUTTONS */}

      <div style={styles.actions}>

        <button
          onClick={() =>
            navigate("/admin/products")
          }
          style={styles.button}
        >
          🛍️ Manage Products
        </button>

        <button
          onClick={() =>
            navigate("/admin/orders")
          }
          style={styles.button}
        >
          📦 Manage Orders
        </button>

          <button
  onClick={() =>
    navigate("/admin/users")
  }
  style={styles.button}
>
  👥 Manage Users
</button>

      </div>

    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    backgroundColor: "#f3f4f6",
    minHeight: "calc(100vh - 70px)"
  },

  title: {
    textAlign: "center",
    marginBottom: "40px"
  },

  grid: {
    maxWidth: "1100px",
    margin: "auto",
    display: "grid",
    gridTemplateColumns:
      "repeat(3, 1fr)",
    gap: "20px"
  },

  card: {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    boxShadow:
      "0 3px 10px rgba(0,0,0,0.08)"
  },

  icon: {
    fontSize: "35px"
  },

  label: {
    margin: 0,
    color: "#6b7280"
  },

  number: {
    margin: "5px 0 0",
    fontSize: "25px"
  },

  statusBox: {
    maxWidth: "1100px",
    margin: "30px auto",
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "10px",
    boxShadow:
      "0 3px 10px rgba(0,0,0,0.08)"
  },

  statusGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, 1fr)",
    textAlign: "center",
    gap: "20px"
  },

  actions: {
    maxWidth: "1100px",
    margin: "30px auto",
    display: "flex",
    gap: "20px",
    justifyContent: "center"
  },

  button: {
    padding: "14px 25px",
    backgroundColor: "#111827",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px"
  }
};

export default AdminDashboard;