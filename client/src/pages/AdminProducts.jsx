import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function AdminProducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discount: "",
    category: "",
    image: "",
    stock: ""
  });

  const fetchProducts = async () => {
    try {
      const response = await API.get("/products");

      setProducts(response.data.products || []);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
        "Failed to load products"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    fetchProducts();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      discount: "",
      category: "",
      image: "",
      stock: ""
    });

    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    try {
      if (editingId) {
        const response = await API.put(
          `/products/${editingId}`,
          {
            ...formData,
            price: Number(formData.price),
            discount: Number(formData.discount || 0),
            stock: Number(formData.stock)
          }
        );

        setMessage(
          response.data.message ||
          "Product updated successfully"
        );

      } else {
        const response = await API.post(
          "/products",
          {
            ...formData,
            price: Number(formData.price),
            discount: Number(formData.discount || 0),
            stock: Number(formData.stock)
          }
        );

        setMessage(
          response.data.message ||
          "Product created successfully"
        );
      }

      resetForm();
      fetchProducts();

    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
        "Failed to save product"
      );
    }
  };

  const editProduct = (product) => {
    setEditingId(product._id);

    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      discount: product.discount || "",
      category: product.category || "",
      image: product.image || "",
      stock: product.stock || ""
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const deleteProduct = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      const response = await API.delete(
        `/products/${id}`
      );

      setMessage(
        response.data.message ||
        "Product deleted successfully"
      );

      fetchProducts();

    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
        "Failed to delete product"
      );
    }
  };

  if (loading) {
    return (
      <h2 style={{ textAlign: "center" }}>
        Loading products...
      </h2>
    );
  }

  return (
    <div style={styles.container}>

      <h1 style={styles.title}>
        Admin Product Management 🛍️
      </h1>

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

      {/* PRODUCT FORM */}

      <div style={styles.formBox}>

        <h2>
          {editingId
            ? "Edit Product"
            : "Add New Product"}
        </h2>

        <form onSubmit={handleSubmit}>

          <input
            name="name"
            placeholder="Product Name"
            value={formData.name}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            style={styles.textarea}
            required
          />

          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            style={styles.input}
            min="0"
            required
          />

          <input
            type="number"
            name="discount"
            placeholder="Discount (%)"
            value={formData.discount}
            onChange={handleChange}
            style={styles.input}
            min="0"
            max="100"
          />

          <input
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <input
            name="image"
            placeholder="Image URL"
            value={formData.image}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            type="number"
            name="stock"
            placeholder="Stock"
            value={formData.stock}
            onChange={handleChange}
            style={styles.input}
            min="0"
            required
          />

          <button
            type="submit"
            style={styles.primaryButton}
          >
            {editingId
              ? "Update Product"
              : "Add Product"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              style={styles.cancelButton}
            >
              Cancel Edit
            </button>
          )}

        </form>

      </div>

      {/* PRODUCT LIST */}

      <div style={styles.list}>

        <h2>
          All Products ({products.length})
        </h2>

        {products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          products.map((product) => (

            <div
              key={product._id}
              style={styles.product}
            >

              <img
                src={product.image}
                alt={product.name}
                style={styles.image}
              />

              <div style={styles.details}>

                <h3>{product.name}</h3>

                <p>
                  {product.description}
                </p>

                <p>
                  <strong>
                    ₹{product.price}
                  </strong>
                </p>

                <p>
                  Category: {product.category}
                </p>

                <p>
                  Stock: {product.stock}
                </p>

                <p>
                  Discount: {product.discount || 0}%
                </p>

                <button
                  onClick={() =>
                    editProduct(product)
                  }
                  style={styles.editButton}
                >
                  Edit
                </button>

                <button
                  onClick={() =>
                    deleteProduct(product._id)
                  }
                  style={styles.deleteButton}
                >
                  Delete
                </button>

              </div>

            </div>

          ))
        )}

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
    marginBottom: "30px"
  },

  formBox: {
    maxWidth: "700px",
    margin: "0 auto 40px",
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.08)"
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
    height: "100px",
    padding: "12px",
    margin: "8px 0",
    border: "1px solid #ccc",
    borderRadius: "6px",
    boxSizing: "border-box",
    resize: "vertical"
  },

  primaryButton: {
    width: "100%",
    padding: "13px",
    marginTop: "10px",
    backgroundColor: "#111827",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },

  cancelButton: {
    width: "100%",
    padding: "11px",
    marginTop: "10px",
    backgroundColor: "#e5e7eb",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },

  list: {
    maxWidth: "1000px",
    margin: "auto"
  },

  product: {
    backgroundColor: "white",
    padding: "20px",
    marginBottom: "20px",
    borderRadius: "10px",
    display: "flex",
    gap: "25px"
  },

  image: {
    width: "150px",
    height: "150px",
    objectFit: "contain"
  },

  details: {
    flex: 1
  },

  editButton: {
    padding: "9px 18px",
    marginRight: "10px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  },

  deleteButton: {
    padding: "9px 18px",
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  },

  success: {
    maxWidth: "700px",
    margin: "10px auto",
    color: "green",
    textAlign: "center"
  },

  error: {
    maxWidth: "700px",
    margin: "10px auto",
    color: "red",
    textAlign: "center"
  }
};

export default AdminProducts;