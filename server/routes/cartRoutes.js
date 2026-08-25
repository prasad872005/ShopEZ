const express = require("express");

const {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require("../controllers/cartController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/add", protect, addToCart);

router.get("/", protect, getCart);

router.put("/update", protect, updateCartItem);

router.delete(
  "/remove/:productId",
  protect,
  removeFromCart
);

router.delete(
  "/clear",
  protect,
  clearCart
);

module.exports = router;