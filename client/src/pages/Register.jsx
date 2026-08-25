import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: ""
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await API.post(
        "/auth/register",
        formData
      );

      console.log("Register response:", response.data);

      setMessage("Registration successful!");

      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: ""
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error) {
      console.error("Register error:", error);

      setError(
        error.response?.data?.message ||
        "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>

        <h1>ShopEZ Register</h1>

        {message && (
          <p style={styles.success}>
            {message}
          </p>
        )}

        {error && (
          <p style={styles.error}>
            {error}
          </p>
        )}

        <form onSubmit={handleRegister}>

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <textarea
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            style={styles.textarea}
          />

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            {loading ? "Registering..." : "Register"}
          </button>

        </form>

        <p>
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            style={styles.link}
          >
            Login
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
    backgroundColor: "#f3f4f6",
    padding: "30px"
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
    margin: "8px 0",
    border: "1px solid #ccc",
    borderRadius: "6px",
    boxSizing: "border-box"
  },

  textarea: {
    width: "100%",
    height: "80px",
    padding: "12px",
    margin: "8px 0",
    border: "1px solid #ccc",
    borderRadius: "6px",
    boxSizing: "border-box",
    resize: "vertical"
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

  success: {
    color: "green"
  },

  error: {
    color: "red"
  },

  link: {
    color: "blue",
    cursor: "pointer"
  }
};

export default Register;