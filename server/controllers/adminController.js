const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

// GET ADMIN DASHBOARD STATS
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const totalProducts = await Product.countDocuments();

    const totalOrders = await Order.countDocuments();

    const salesResult = await Order.aggregate([
      {
        $match: {
          orderStatus: {
            $ne: "CANCELLED"
          }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: {
            $sum: "$totalAmount"
          }
        }
      }
    ]);

    const totalSales =
      salesResult.length > 0
        ? salesResult[0].totalSales
        : 0;

    const pendingOrders = await Order.countDocuments({
      orderStatus: "PLACED"
    });

    const deliveredOrders = await Order.countDocuments({
      orderStatus: "DELIVERED"
    });

    res.status(200).json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalSales,
      pendingOrders,
      deliveredOrders
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch dashboard statistics",
      error: error.message
    });
  }
};

// GET ALL USERS
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: users.length,
      users
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message
    });
  }
};


// UPDATE USER ROLE
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["USER", "ADMIN"].includes(role)) {
      return res.status(400).json({
        message: "Role must be USER or ADMIN"
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Prevent admin from changing their own role
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: "You cannot change your own role"
      });
    }

    user.role = role;

    await user.save();

    res.status(200).json({
      message: "User role updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to update user role",
      error: error.message
    });
  }
};


// DELETE USER
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: "You cannot delete your own account"
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "User deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to delete user",
      error: error.message
    });
  }
};

// GET ALL PRODUCTS
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: products.length,
      products
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message
    });
  }
};


// CREATE PRODUCT
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discount,
      category,
      image,
      stock,
      ratings
    } = req.body;

    if (
      !name ||
      !description ||
      price === undefined ||
      !category ||
      stock === undefined
    ) {
      return res.status(400).json({
        message: "Please provide all required product fields"
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      discount: discount || 0,
      category,
      image: image || "",
      stock,
      seller: req.user._id,
      ratings: ratings || 0
    });

    const createdProduct = await Product.findById(product._id)
      .populate("seller", "name email");

    res.status(201).json({
      message: "Product created successfully",
      product: createdProduct
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to create product",
      error: error.message
    });
  }
};


// UPDATE PRODUCT
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    const {
      name,
      description,
      price,
      discount,
      category,
      image,
      stock
    } = req.body;

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (discount !== undefined) product.discount = discount;
    if (category !== undefined) product.category = category;
    if (image !== undefined) product.image = image;
    if (stock !== undefined) product.stock = stock;

    await product.save();

    const updatedProduct = await Product.findById(product._id)
      .populate("seller", "name email");

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to update product",
      error: error.message
    });
  }
};


// DELETE PRODUCT
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Product deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product",
      error: error.message
    });
  }
};

// GET ALL ORDERS
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone")
      .populate(
        "items.product",
        "name price image"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: orders.length,
      orders
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message
    });
  }
};


// GET SINGLE ORDER FOR ADMIN
const getAdminOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone address")
      .populate(
        "items.product",
        "name price image category stock"
      );

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    res.status(200).json({
      order
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch order",
      error: error.message
    });
  }
};


// UPDATE ORDER STATUS
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "PLACED",
      "CONFIRMED",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status"
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    // Don't change a delivered order
    if (order.orderStatus === "DELIVERED") {
      return res.status(400).json({
        message: "Delivered order cannot be changed"
      });
    }

    // Don't change a cancelled order
    if (order.orderStatus === "CANCELLED") {
      return res.status(400).json({
        message: "Cancelled order cannot be changed"
      });
    }

    order.orderStatus = status;

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate("user", "name email")
      .populate(
        "items.product",
        "name price image"
      );

    res.status(200).json({
      message: "Order status updated successfully",
      order: updatedOrder
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to update order status",
      error: error.message
    });
  }
};

module.exports = {
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
};