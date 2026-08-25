import Navbar from "./components/Navbar";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import AdminProducts from "./pages/AdminProducts";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrders from "./pages/AdminOrders";
import AdminUsers from "./pages/AdminUsers";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        <Route path="/" element={<Home />} />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/products"
          element={<Products />}
        />

        <Route
  path="/products/:id"
  element={<ProductDetails />}
/>

        <Route
  path="/cart"
  element={
    <ProtectedRoute>
      <Cart />
    </ProtectedRoute>
  }
/>

        <Route
  path="/checkout"
  element={<Checkout />}
/>

        <Route
  path="/orders"
  element={
    <ProtectedRoute>
      <Orders />
    </ProtectedRoute>
  }
/>

        <Route
  path="/orders/:id"
  element={<OrderDetails />}
/>

        <Route
  path="/admin/products"
  element={<AdminProducts />}
/>

        <Route
  path="/admin"
  element={
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  }
/>

        <Route
  path="/admin/orders"
  element={<AdminOrders />}
/>

      <Route
  path="/admin/users"
  element={
    <AdminRoute>
      <AdminUsers />
    </AdminRoute>
  }
/>

      </Routes>

    </BrowserRouter>
  ); 
}

export default App;