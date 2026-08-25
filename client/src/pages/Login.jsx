import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
  e.preventDefault();

  console.log("LOGIN BUTTON CLICKED");
  console.log("Email:", email);

  setError("");
  setLoading(true);

  try {
    const response = await API.post("/auth/login", {
      email,
      password
    });

    console.log("LOGIN SUCCESS:", response.data);

    localStorage.setItem("token", response.data.token);

    localStorage.setItem(
      "user",
      JSON.stringify(response.data.user)
    );

    alert("LOGIN SUCCESSFUL!");

    navigate("/products");

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    alert(
      error.response?.data?.message ||
      "LOGIN FAILED"
    );

    setError(
      error.response?.data?.message ||
      "Login failed"
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h1>ShopEZ Login</h1>

        {error && (
          <p style={styles.error}>
            {error}
          </p>
        )}

        <form onSubmit={handleLogin}>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p>
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            style={styles.link}
          >
            Register
          </span>
        </p>

      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "80vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6"
  },

  box: {
    width: "400px",
    padding: "35px",
    backgroundColor: "white",
    borderRadius: "10px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
  },

  input: {
    width: "100%",
    padding: "12px",
    margin: "10px 0",
    border: "1px solid #ccc",
    borderRadius: "6px",
    boxSizing: "border-box"
  },

  button: {
    width: "100%",
    padding: "12px",
    marginTop: "10px",
    backgroundColor: "#111827",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },

  error: {
    color: "red"
  },

  link: {
    color: "blue",
    cursor: "pointer"
  }
};

export default Login;