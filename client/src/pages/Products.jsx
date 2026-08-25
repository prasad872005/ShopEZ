import { useEffect, useState } from "react";
import API from "../services/api";
import ProductCard from "../components/ProductCard";
import "./Products.css";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await API.get("/products");

        setProducts(response.data.products);
      } catch (error) {
        console.error(error);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <h2 style={{ textAlign: "center" }}>
        Loading products...
      </h2>
    );
  }

  if (error) {
    return (
      <h2 style={{ textAlign: "center", color: "red" }}>
        {error}
      </h2>
    );
  }

  return (
    <div className="products-container">

      <h1 className="products-title">
        ShopEZ Products
      </h1>

      {products.length === 0 ? (
        <h2 style={{ textAlign: "center" }}>
          No products available
        </h2>
      ) : (
        <div className="products-grid">

          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
            />
          ))}

        </div>
      )}

    </div>
  );
}

export default Products;