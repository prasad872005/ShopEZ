const Razorpay = require("razorpay");
const crypto = require("crypto");

const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ==========================================
// CREATE RAZORPAY ORDER
// ==========================================

const createRazorpayOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user._id
    }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: "Your cart is empty"
      });
    }

    let totalAmount = 0;

    for (const item of cart.items) {
      if (!item.product) {
        return res.status(400).json({
          message: "One or more products no longer exist"
        });
      }

      const product = item.product;

      if (product.stock <= 0) {
        return res.status(400).json({
          message: `${product.name} is out of stock`
        });
      }

      if (item.quantity > product.stock) {
        return res.status(400).json({
          message: `Only ${product.stock} item(s) available for ${product.name}`
        });
      }

      // Always use current product price
      totalAmount +=
        Number(product.price) *
        Number(item.quantity);
    }

    totalAmount = Number(totalAmount.toFixed(2));

    const amount = Math.round(totalAmount * 100);

    if (!Number.isInteger(amount) || amount <= 0) {
      return res.status(400).json({
        message: "Invalid order amount"
      });
    }

    const options = {
      amount,
      currency: "INR",
      receipt: `shopez_${Date.now()}`,
      payment_capture: 1
    };

    const razorpayOrder =
      await razorpay.orders.create(options);

    console.log(
      "Razorpay order created:",
      razorpayOrder.id
    );

    res.status(201).json({
      message: "Razorpay order created successfully",

      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency
      },

      key: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error(
      "Razorpay create order error:",
      error
    );

    res.status(500).json({
      message: "Failed to create payment order"
    });
  }
};


// ==========================================
// VERIFY RAZORPAY PAYMENT
// ==========================================

const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,

      name,
      phone,
      address,
      city,
      state,
      pincode
    } = req.body;

    // ==========================================
    // VALIDATE PAYMENT DATA
    // ==========================================

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message: "Payment details are missing"
      });
    }

    // ==========================================
    // CHECK DUPLICATE PAYMENT
    // ==========================================

    const existingOrder = await Order.findOne({
      razorpayPaymentId: razorpay_payment_id
    });

    if (existingOrder) {
      return res.status(200).json({
        message: "Payment already verified",
        order: existingOrder
      });
    }

    // ==========================================
    // VERIFY SIGNATURE
    // ==========================================

    const generatedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET
        )
        .update(
          `${razorpay_order_id}|${razorpay_payment_id}`
        )
        .digest("hex");

    const signaturesMatch =
      crypto.timingSafeEqual(
        Buffer.from(generatedSignature),
        Buffer.from(razorpay_signature)
      );

    if (!signaturesMatch) {
      return res.status(400).json({
        message: "Payment verification failed"
      });
    }

    // ==========================================
    // VALIDATE SHIPPING ADDRESS
    // ==========================================

    if (
      !name?.trim() ||
      !phone ||
      !address?.trim() ||
      !city?.trim() ||
      !state?.trim() ||
      !pincode
    ) {
      return res.status(400).json({
        message: "Please provide complete shipping address"
      });
    }

    // ==========================================
    // GET CART
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
    // CHECK STOCK + CALCULATE CURRENT TOTAL
    // ==========================================

    let totalAmount = 0;

    for (const item of cart.items) {
      if (!item.product) {
        return res.status(400).json({
          message: "One or more products no longer exist"
        });
      }

      const product = item.product;

      if (product.stock <= 0) {
        return res.status(400).json({
          message: `${product.name} is out of stock`
        });
      }

      if (item.quantity > product.stock) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name}`
        });
      }

      totalAmount +=
        Number(product.price) *
        Number(item.quantity);
    }

    totalAmount = Number(totalAmount.toFixed(2));

    // ==========================================
    // GET RAZORPAY ORDER
    // ==========================================

    const razorpayOrder =
      await razorpay.orders.fetch(
        razorpay_order_id
      );

    // ==========================================
    // VERIFY AMOUNT
    // ==========================================

    const expectedAmount =
      Math.round(totalAmount * 100);

    if (
      Number(razorpayOrder.amount) !==
      expectedAmount
    ) {
      return res.status(400).json({
        message:
          "Payment amount does not match the cart total"
      });
    }

    // ==========================================
    // PREPARE ORDER ITEMS
    // ==========================================

    const orderItems = cart.items.map(
      (item) => ({
        product: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price
      })
    );

    // ==========================================
    // CREATE SHOP EZ ORDER
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

      paymentMethod: "ONLINE",

      paymentStatus: "PAID",

      razorpayOrderId:
        razorpay_order_id,

      razorpayPaymentId:
        razorpay_payment_id,

      orderStatus: "PLACED"
    });

    // ==========================================
    // REDUCE STOCK
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

    const createdOrder =
      await Order.findById(order._id)
        .populate(
          "user",
          "name email"
        )
        .populate(
          "items.product",
          "name price image"
        );

    res.status(200).json({
      message:
        "Payment successful and order placed",

      order: createdOrder
    });

  } catch (error) {
    console.error(
      "Payment verification error:",
      error
    );

    res.status(500).json({
      message:
        "Payment verification failed"
    });
  }
};


module.exports = {
  createRazorpayOrder,
  verifyPayment
};