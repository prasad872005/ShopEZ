import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const token = localStorage.getItem("token");

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setMenuOpen(false);
    navigate("/login");
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">

      <Link
        to="/"
        className="logo"
        onClick={closeMenu}
      >
        ShopEZ
      </Link>

      <button
        className="menu-button"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>

      <div
        className={`navbar-links ${
          menuOpen ? "mobile" : ""
        }`}
      >

        <Link
          to="/"
          className="nav-link"
          onClick={closeMenu}
        >
          Home
        </Link>

        <Link
          to="/products"
          className="nav-link"
          onClick={closeMenu}
        >
          Products
        </Link>

        {token && (
          <>
            <Link
              to="/cart"
              className="nav-link"
              onClick={closeMenu}
            >
              Cart
            </Link>

            <Link
              to="/orders"
              className="nav-link"
              onClick={closeMenu}
            >
              Orders
            </Link>
          </>
        )}

        {token && user?.role === "ADMIN" && (
          <>
            <Link
              to="/admin"
              className="nav-link"
              onClick={closeMenu}
            >
              Admin
            </Link>

            <Link
              to="/admin/users"
              className="nav-link"
              onClick={closeMenu}
            >
              Users
            </Link>
          </>
        )}

        {token ? (
          <button
            onClick={logout}
            className="logout-button"
          >
            Logout
          </button>
        ) : (
          <>
            <Link
              to="/login"
              className="nav-link"
              onClick={closeMenu}
            >
              Login
            </Link>

            <Link
              to="/register"
              className="nav-link"
              onClick={closeMenu}
            >
              Register
            </Link>
          </>
        )}

      </div>
    </nav>
  );
}

export default Navbar;