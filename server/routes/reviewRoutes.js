const express = require("express");

const {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview
} = require("../controllers/reviewController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Add review
router.post("/", protect, createReview);

// Get product reviews
router.get(
  "/product/:productId",
  getProductReviews
);

// Update review
router.put(
  "/:id",
  protect,
  updateReview
);

// Delete review
router.delete(
  "/:id",
  protect,
  deleteReview
);

module.exports = router;