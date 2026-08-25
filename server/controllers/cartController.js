const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Helper: calculate cart total
const calculateCartTotal = (items) => {
  return items.reduce(
    (total, item) =>
      total + Number(item.price) * Number(item.quantity),
    0
  );
};

// Helper: return populated cart
const getPopulatedCart = async (cartId) => {
  return await Cart.findById(cartId).populate(
    "items.product",
    "name price image stock category"
  );
};

// ADD PRODUCT TO CART
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const parsedQuantity = Number(quantity);

    if (!productId || !Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      return res.status(400).json({
        message: "Product ID and a valid quantity are required"
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    if (product.stock <= 0) {
      return res.status(400).json({
        message: "Product is out of stock"
      });
    }

    if (parsedQuantity > product.stock) {
      return res.status(400).json({
        message: `Only ${product.stock} item(s) available in stock`
      });
    }

    let cart = await Cart.findOne({
      user: req.user._id
    });

    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: [],
        total: 0
      });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      const newQuantity =
        Number(existingItem.quantity) + parsedQuantity;

      if (newQuantity > product.stock) {
        return res.status(400).json({
          message: `Only ${product.stock} item(s) available in stock`
        });
      }

      existingItem.quantity = newQuantity;
      existingItem.price = product.price;
    } else {
      cart.items.push({
        product: product._id,
        quantity: parsedQuantity,
        price: product.price
      });
    }

    cart.total = calculateCartTotal(cart.items);

    await cart.save();

    const updatedCart = await getPopulatedCart(cart._id);

    res.status(200).json({
      message: "Product added to cart",
      cart: updatedCart
    });

  } catch (error) {
    console.error("Add to cart error:", error);

    res.status(500).json({
      message: "Failed to add product to cart"
    });
  }
};


// GET USER CART
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({
      user: req.user._id
    });

    if (!cart) {
      return res.status(200).json({
        message: "Cart is empty",
        cart: {
          items: [],
          total: 0
        }
      });
    }

    // Remove products that no longer exist
    const validItems = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.product);

      if (product) {
        item.price = product.price;
        validItems.push(item);
      }
    }

    cart.items = validItems;
    cart.total = calculateCartTotal(cart.items);

    await cart.save();

    const populatedCart = await getPopulatedCart(cart._id);

    res.status(200).json({
      cart: populatedCart
    });

  } catch (error) {
    console.error("Get cart error:", error);

    res.status(500).json({
      message: "Failed to fetch cart"
    });
  }
};


// UPDATE CART ITEM QUANTITY
const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const parsedQuantity = Number(quantity);

    if (
      !productId ||
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 1
    ) {
      return res.status(400).json({
        message: "Product ID and a valid quantity are required"
      });
    }

    const cart = await Cart.findOne({
      user: req.user._id
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found"
      });
    }

    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({
        message: "Product not found in cart"
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId
      );

      cart.total = calculateCartTotal(cart.items);

      await cart.save();

      return res.status(404).json({
        message: "Product no longer exists",
        cart: await getPopulatedCart(cart._id)
      });
    }

    if (product.stock <= 0) {
      return res.status(400).json({
        message: "Product is out of stock"
      });
    }

    if (parsedQuantity > product.stock) {
      return res.status(400).json({
        message: `Only ${product.stock} item(s) available in stock`
      });
    }

    item.quantity = parsedQuantity;
    item.price = product.price;

    cart.total = calculateCartTotal(cart.items);

    await cart.save();

    const updatedCart = await getPopulatedCart(cart._id);

    res.status(200).json({
      message: "Cart updated successfully",
      cart: updatedCart
    });

  } catch (error) {
    console.error("Update cart error:", error);

    res.status(500).json({
      message: "Failed to update cart"
    });
  }
};


// REMOVE PRODUCT FROM CART
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({
      user: req.user._id
    });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found"
      });
    }

    const itemExists = cart.items.some(
      (item) => item.product.toString() === productId
    );

    if (!itemExists) {
      return res.status(404).json({
        message: "Product not found in cart"
      });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    cart.total = calculateCartTotal(cart.items);

    await cart.save();

    const updatedCart = await getPopulatedCart(cart._id);

    res.status(200).json({
      message: "Product removed from cart",
      cart: updatedCart
    });

  } catch (error) {
    console.error("Remove cart item error:", error);

    res.status(500).json({
      message: "Failed to remove product from cart"
    });
  }
};


// CLEAR CART
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user._id
    });

    if (!cart) {
      return res.status(200).json({
        message: "Cart is already empty",
        cart: {
          items: [],
          total: 0
        }
      });
    }

    cart.items = [];
    cart.total = 0;

    await cart.save();

    res.status(200).json({
      message: "Cart cleared successfully",
      cart
    });

  } catch (error) {
    console.error("Clear cart error:", error);

    res.status(500).json({
      message: "Failed to clear cart"
    });
  }
};


module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart
};