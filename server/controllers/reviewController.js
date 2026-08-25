const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");

// CREATE REVIEW
const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({
        message: "Please provide product, rating and comment"
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5"
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    // Check whether user purchased the product
    const purchased = await Order.findOne({
      user: req.user._id,
      "items.product": productId,
      orderStatus: "DELIVERED"
    });

    if (!purchased) {
      return res.status(403).json({
        message: "You can review only products you have purchased and received"
      });
    }

    // Check existing review
    const existingReview = await Review.findOne({
      product: productId,
      user: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({
        message: "You have already reviewed this product"
      });
    }

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating,
      comment
    });

    // Calculate average rating
    const reviews = await Review.find({
      product: productId
    });

    const totalRating = reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );

    const averageRating =
      totalRating / reviews.length;

    product.ratings = Number(
      averageRating.toFixed(1)
    );

    await product.save();

    const createdReview = await Review.findById(
      review._id
    ).populate("user", "name");

    res.status(201).json({
      message: "Review added successfully",
      review: createdReview,
      averageRating: product.ratings
    });

  } catch (error) {
    // Duplicate review protection
    if (error.code === 11000) {
      return res.status(400).json({
        message: "You have already reviewed this product"
      });
    }

    res.status(500).json({
      message: "Failed to create review",
      error: error.message
    });
  }
};


// GET PRODUCT REVIEWS
const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId
    })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: reviews.length,
      reviews
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch reviews",
      error: error.message
    });
  }
};

// UPDATE REVIEW
const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: "Review not found"
      });
    }

    // Only review owner can update
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can update only your own review"
      });
    }

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          message: "Rating must be between 1 and 5"
        });
      }

      review.rating = rating;
    }

    if (comment !== undefined) {
      review.comment = comment;
    }

    await review.save();

    // Recalculate average rating
    const reviews = await Review.find({
      product: review.product
    });

    const totalRating = reviews.reduce(
      (sum, item) => sum + item.rating,
      0
    );

    const averageRating =
      totalRating / reviews.length;

    await Product.findByIdAndUpdate(
      review.product,
      {
        ratings: Number(averageRating.toFixed(1))
      }
    );

    const updatedReview = await Review.findById(
      review._id
    ).populate("user", "name");

    res.status(200).json({
      message: "Review updated successfully",
      review: updatedReview,
      averageRating: Number(averageRating.toFixed(1))
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to update review",
      error: error.message
    });
  }
};


// DELETE REVIEW
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: "Review not found"
      });
    }

    // Only review owner can delete
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You can delete only your own review"
      });
    }

    const productId = review.product;

    await Review.findByIdAndDelete(req.params.id);

    // Recalculate average rating
    const reviews = await Review.find({
      product: productId
    });

    let averageRating = 0;

    if (reviews.length > 0) {
      const totalRating = reviews.reduce(
        (sum, item) => sum + item.rating,
        0
      );

      averageRating =
        totalRating / reviews.length;
    }

    await Product.findByIdAndUpdate(
      productId,
      {
        ratings: Number(averageRating.toFixed(1))
      }
    );

    res.status(200).json({
      message: "Review deleted successfully",
      averageRating: Number(averageRating.toFixed(1))
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to delete review",
      error: error.message
    });
  }
};

module.exports = {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview
};