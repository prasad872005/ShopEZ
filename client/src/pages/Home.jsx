import { Link } from "react-router-dom";

function Home() {
  return (
    <div style={styles.container}>

      <section style={styles.hero}>

        <h1 style={styles.heroTitle}>
  Welcome to ShopEZ 🛍️
</h1>

        <p>
          Your one-stop destination for effortless
          online shopping.
        </p>

        <p>
          Discover amazing products, great discounts
          and a simple shopping experience.
        </p>

        <Link
          to="/products"
          style={styles.button}
        >
          Shop Now
        </Link>

      </section>


      <section style={styles.features}>

        <div style={styles.card}>
          <h2>🛒 Easy Shopping</h2>
          <p>
            Browse products and add them to your cart
            easily.
          </p>
        </div>

        <div style={styles.card}>
          <h2>💳 Secure Checkout</h2>
          <p>
            Simple and secure checkout experience.
          </p>
        </div>

        <div style={styles.card}>
          <h2>📦 Order Tracking</h2>
          <p>
            Track your orders from placement to delivery.
          </p>
        </div>

        <div style={styles.card}>
          <h2>⭐ Customer Reviews</h2>
          <p>
            Read reviews and share your experience.
          </p>
        </div>

      </section>

    </div>
  );
}

const styles = {
  container: {
    minHeight: "calc(100vh - 70px)",
    backgroundColor: "#f3f4f6"
  },

  hero: {
    textAlign: "center",
    padding: "90px 20px",
    backgroundColor: "#e5e7eb"
  },

 heroTitle: {
  fontSize: "45px"
},

heroText: {
  fontSize: "18px"
},

  button: {
    display: "inline-block",
    marginTop: "20px",
    padding: "12px 25px",
    backgroundColor: "#111827",
    color: "white",
    textDecoration: "none",
    borderRadius: "6px"
  },

  features: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
    padding: "40px"
  },

  card: {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  }
};

export default Home;