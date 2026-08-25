const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      required: true
    },

    address: {
      type: String,
      default: ""
    },

    role: {
      type: String,
      enum: ["USER", "SELLER", "ADMIN"],
      default: "USER"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);