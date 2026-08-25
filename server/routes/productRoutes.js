const express = require("express");

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Get all products
router.get("/", getProducts);

router.get("/:id", getProductById);

// Create product
router.post(
  "/",
  protect,
  authorizeRoles("SELLER", "ADMIN"),
  createProduct
);

router.put(
  "/:id",
  protect,
  authorizeRoles("SELLER", "ADMIN"),
  updateProduct
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("SELLER", "ADMIN"),
  deleteProduct
);

module.exports = router;