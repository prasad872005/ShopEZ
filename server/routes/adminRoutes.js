const express = require("express");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const {
  getDashboardStats,

  getAllUsers,
  updateUserRole,
  deleteUser,

  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,

  getAllOrders,
  getAdminOrderById,
  updateOrderStatus
} = require("../controllers/adminController");     

const router = express.Router();

// Admin dashboard welcome
router.get(
  "/dashboard",
  protect,
  adminOnly,
  (req, res) => {
    res.status(200).json({
      message: "Welcome to ShopEZ Admin Dashboard",
      admin: req.user
    });
  }
);

// Dashboard statistics
router.get(
  "/stats",
  protect,
  adminOnly,
  getDashboardStats
);

// Get all users
router.get(
  "/users",
  protect,
  adminOnly,
  getAllUsers
);

// Update user role
router.put(
  "/users/:id/role",
  protect,
  adminOnly,
  updateUserRole
);

// Delete user
router.delete(
  "/users/:id",
  protect,
  adminOnly,
  deleteUser
);

// Get all products
router.get(
  "/products",
  protect,
  adminOnly,
  getAllProducts
);

// Create product
router.post(
  "/products",
  protect,
  adminOnly,
  createProduct
);

// Update product
router.put(
  "/products/:id",
  protect,
  adminOnly,
  updateProduct
);

// Delete product
router.delete(
  "/products/:id",
  protect,
  adminOnly,
  deleteProduct
);

// Get all orders
router.get(
  "/orders",
  protect,
  adminOnly,
  getAllOrders
);

// Get single order
router.get(
  "/orders/:id",
  protect,
  adminOnly,
  getAdminOrderById
);

// Update order status
router.put(
  "/orders/:id/status",
  protect,
  adminOnly,
  updateOrderStatus
);
module.exports = router;