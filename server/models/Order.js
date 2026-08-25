const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },

    name: {
      type: String,
      required: true
    },

    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    price: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    _id: false
  }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    items: [orderItemSchema],

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    shippingAddress: {
      name: {
        type: String,
        required: true
      },

      phone: {
        type: String,
        required: true
      },

      address: {
        type: String,
        required: true
      },

      city: {
        type: String,
        required: true
      },

      state: {
        type: String,
        required: true
      },

      pincode: {
        type: String,
        required: true
      }
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      default: "COD"
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING"
    },

    razorpayOrderId: {
  type: String,
  default: null
},

razorpayPaymentId: {
  type: String,
  default: null
},

    orderStatus: {
      type: String,
      enum: [
        "PLACED",
        "CONFIRMED",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED"
      ],
      default: "PLACED"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Order", orderSchema);