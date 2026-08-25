const express = require("express");

const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  getAdminStats
} = require("../controllers/orderController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware"); 
const router = express.Router();

// Checkout / place order
router.post("/", protect, createOrder);

// Get logged-in user's orders
router.get("/my-orders", protect, getMyOrders);

router.get(
  "/admin/stats",
  protect,
  authorizeRoles("ADMIN"),
  getAdminStats
); 

router.get(   
  "/admin/all",
  protect,
  authorizeRoles("ADMIN"),
  getAllOrders
);

router.put(
  "/admin/status/:id",
  protect,
  authorizeRoles("ADMIN"),
  updateOrderStatus
);

router.get("/:id", protect, getOrderById);

router.put(
  "/cancel/:id",
  protect,
  cancelOrder
);

module.exports = router;