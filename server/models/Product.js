const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    category: {
      type: String,
      required: true,
      trim: true
    },

    image: {
      type: String,
      default: ""
    },

    stock: {
      type: Number,
      required: true,
      min: 0
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    ratings: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Product", productSchema);