const Product = require("../models/Product");

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
      stock
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
      discount,
      category,
      image,
      stock,
      seller: req.user._id
    });

    res.status(201).json({
      message: "Product created successfully",
      product
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to create product",
      error: error.message
    });
  }
};


// GET ALL PRODUCTS
const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sort
    } = req.query;

    const filter = {};

    // Search by product name
    if (search) {
      filter.name = {
        $regex: search,
        $options: "i"
      };
    }

    // Filter by category
    if (category) {
      filter.category = {
        $regex: `^${category}$`,
        $options: "i"
      };
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    // Sorting
    let sortOption = {
      createdAt: -1
    };

    if (sort === "priceLow") {
      sortOption = {
        price: 1
      };
    }

    if (sort === "priceHigh") {
      sortOption = {
        price: -1
      };
    }

    if (sort === "rating") {
      sortOption = {
        ratings: -1
      };
    }

    const products = await Product.find(filter)
      .populate("seller", "name email")
      .sort(sortOption);

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

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("seller", "name email");

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.status(200).json({
      product
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch product",
      error: error.message
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    product.name = req.body.name ?? product.name;
    product.description = req.body.description ?? product.description;
    product.price = req.body.price ?? product.price;
    product.discount = req.body.discount ?? product.discount;
    product.category = req.body.category ?? product.category;
    product.image = req.body.image ?? product.image;
    product.stock = req.body.stock ?? product.stock;

    const updatedProduct = await product.save();

    res.json({
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


const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    await product.deleteOne();

    res.json({
      message: "Product deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product",
      error: error.message
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
};