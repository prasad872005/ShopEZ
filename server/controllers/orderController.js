const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");

// ==========================================
// CREATE ORDER / CHECKOUT
// ==========================================

const createOrder = async (req, res) => {
  try {
    const {
      name,
      phone,
      address,
      city,
      state,
      pincode,
      paymentMethod
    } = req.body;

    // Validate shipping details
    if (
      !name ||
      !phone ||
      !address ||
      !city ||
      !state ||
      !pincode
    ) {
      return res.status(400).json({
        message: "Please provide complete shipping address"
      });
    }

    // Validate phone
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        message: "Please enter a valid 10-digit Indian phone number"
      });
    }

    // Validate pincode
    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({
        message: "Please enter a valid 6-digit pincode"
      });
    }

    // Validate payment method
    const selectedPaymentMethod = paymentMethod || "COD";

    if (!["COD", "ONLINE"].includes(selectedPaymentMethod)) {
      return res.status(400).json({
        message: "Invalid payment method"
      });
    }

    // IMPORTANT:
    // Online payments must go through Razorpay verification.
    // Do not create an ONLINE order directly from this endpoint.
    if (selectedPaymentMethod === "ONLINE") {
      return res.status(400).json({
        message:
          "For online payment, please use the Razorpay payment option."
      });
    }

    // ==========================================
    // GET USER CART
    // ==========================================

    const cart = await Cart.findOne({
      user: req.user._id
    }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Your cart is empty"
      });
    }

    // ==========================================
    // CHECK PRODUCTS + STOCK
    // ==========================================

    for (const item of cart.items) {
      if (!item.product) {
        return res.status(400).json({
          message: "Product no longer exists"
        });
      }

      if (item.quantity > item.product.stock) {
        return res.status(400).json({
          message: `Not enough stock for ${item.product.name}`
        });
      }
    }

    // ==========================================
    // PREPARE ORDER ITEMS
    // ==========================================

    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: Number(item.price)
    }));

    // ==========================================
    // CALCULATE TOTAL
    // ==========================================

    const totalAmount = cart.items.reduce(
      (total, item) =>
        total +
        Number(item.price) * Number(item.quantity),
      0
    );

    if (totalAmount <= 0) {
      return res.status(400).json({
        message: "Invalid order amount"
      });
    }

    // ==========================================
    // CREATE COD ORDER
    // ==========================================

    const order = await Order.create({
      user: req.user._id,

      items: orderItems,

      totalAmount,

      shippingAddress: {
        name: name.trim(),
        phone,
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode
      },

      paymentMethod: "COD",

      paymentStatus: "PENDING",

      orderStatus: "PLACED"
    });

    // ==========================================
    // REDUCE PRODUCT STOCK
    // ==========================================

    for (const item of cart.items) {
      await Product.findByIdAndUpdate(
        item.product._id,
        {
          $inc: {
            stock: -item.quantity
          }
        }
      );
    }

    // ==========================================
    // CLEAR CART
    // ==========================================

    cart.items = [];
    cart.total = 0;

    await cart.save();

    // ==========================================
    // GET CREATED ORDER
    // ==========================================

    const createdOrder = await Order.findById(order._id)
      .populate("user", "name email")
      .populate(
        "items.product",
        "name price image category"
      );

    res.status(201).json({
      message: "Order placed successfully",
      order: createdOrder
    });

  } catch (error) {
    console.error("Create order error:", error);

    res.status(500).json({
      message: "Failed to create order",
      error: error.message
    });
  }
};


// ==========================================
// GET MY ORDERS
// ==========================================

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id
    })
      .populate(
        "items.product",
        "name price image category"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: orders.length,
      orders
    });

  } catch (error) {
    console.error("Get my orders error:", error);

    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message
    });
  }
};


// ==========================================
// GET SINGLE ORDER
// ==========================================

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate(
        "items.product",
        "name price image category"
      );

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    // User can only view their own order.
    // Admin can view any order.
    if (
      order.user._id.toString() !==
        req.user._id.toString() &&
      req.user.role !== "ADMIN"
    ) {
      return res.status(403).json({
        message: "You are not allowed to view this order"
      });
    }

    res.status(200).json({
      order
    });

  } catch (error) {
    console.error("Get order by ID error:", error);

    res.status(500).json({
      message: "Failed to fetch order",
      error: error.message
    });
  }
};


// ==========================================
// CANCEL ORDER - USER
// ==========================================

const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    // Check ownership
    if (
      order.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You are not allowed to cancel this order"
      });
    }

    // Only PLACED or CONFIRMED orders can be cancelled
    if (
      order.orderStatus !== "PLACED" &&
      order.orderStatus !== "CONFIRMED"
    ) {
      return res.status(400).json({
        message: "Order cannot be cancelled at this stage"
      });
    }

    // ==========================================
    // RESTORE STOCK
    // ==========================================

    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        {
          $inc: {
            stock: item.quantity
          }
        }
      );
    }

    // ==========================================
    // UPDATE ORDER
    // ==========================================

    order.orderStatus = "CANCELLED";

    // COD doesn't require refund.
    // Online payment refund is not automatically
    // processed here.
    if (order.paymentStatus === "PENDING") {
      order.paymentStatus = "FAILED";
    }

    await order.save();

    const updatedOrder = await Order.findById(
      order._id
    )
      .populate("user", "name email")
      .populate(
        "items.product",
        "name price image category"
      );

    res.status(200).json({
      message: "Order cancelled successfully",
      order: updatedOrder
    });

  } catch (error) {
    console.error("Cancel order error:", error);

    res.status(500).json({
      message: "Failed to cancel order",
      error: error.message
    });
  }
};


// ==========================================
// GET ALL ORDERS - ADMIN
// ==========================================

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate(
        "items.product",
        "name price image category"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: orders.length,
      orders
    });

  } catch (error) {
    console.error("Get all orders error:", error);

    res.status(500).json({
      message: "Failed to fetch all orders",
      error: error.message
    });
  }
};


// ==========================================
// UPDATE ORDER STATUS - ADMIN
// ==========================================

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // ==========================================
    // VALIDATE STATUS
    // ==========================================

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

    // ==========================================
    // FIND ORDER
    // ==========================================

    const order = await Order.findById(
      req.params.id
    );

    // IMPORTANT:
    // Check order before using order.orderStatus
    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    // ==========================================
    // PREVENT UNNECESSARY STATUS UPDATE
    // ==========================================

    if (order.orderStatus === status) {
      return res.status(200).json({
        message: "Order status is already " + status,
        order
      });
    }

    // ==========================================
    // RESTORE STOCK WHEN ADMIN CANCELS
    // ==========================================

    if (
      status === "CANCELLED" &&
      order.orderStatus !== "CANCELLED"
    ) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          {
            $inc: {
              stock: item.quantity
            }
          }
        );
      }

      // If payment was still pending,
      // mark it as failed/cancelled.
      if (order.paymentStatus === "PENDING") {
        order.paymentStatus = "FAILED";
      }
    }

    // ==========================================
    // UPDATE STATUS ONLY ONCE
    // ==========================================

    order.orderStatus = status;

    await order.save();

    // ==========================================
    // GET UPDATED ORDER
    // ==========================================

    const updatedOrder = await Order.findById(
      order._id
    )
      .populate("user", "name email")
      .populate(
        "items.product",
        "name price image category"
      );

    res.status(200).json({
      message: "Order status updated successfully",
      order: updatedOrder
    });

  } catch (error) {
    console.error(
      "Update order status error:",
      error
    );

    res.status(500).json({
      message: "Failed to update order status",
      error: error.message
    });
  }
};


// ==========================================
// ADMIN DASHBOARD STATISTICS
// ==========================================

const getAdminStats = async (req, res) => {
  try {
    const totalUsers =
      await User.countDocuments();

    const totalProducts =
      await Product.countDocuments();

    const totalOrders =
      await Order.countDocuments();

    const pendingOrders =
      await Order.countDocuments({
        orderStatus: {
          $in: [
            "PLACED",
            "CONFIRMED",
            "SHIPPED"
          ]
        }
      });

    const deliveredOrders =
      await Order.countDocuments({
        orderStatus: "DELIVERED"
      });

    const cancelledOrders =
      await Order.countDocuments({
        orderStatus: "CANCELLED"
      });

    // ==========================================
    // TOTAL SALES
    // ==========================================
    //
    // Cancelled orders are excluded.
    //

    const salesResult =
      await Order.aggregate([
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

    res.status(200).json({
      totalUsers,
      totalProducts,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      totalSales
    });

  } catch (error) {
    console.error(
      "Get admin stats error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch admin statistics",
      error: error.message
    });
  }
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
  getAdminStats
};