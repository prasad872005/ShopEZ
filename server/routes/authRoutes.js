const express = require("express");

const {
  registerUser,
  loginUser
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/profile", protect, (req, res) => {
  res.json({
    message: "You accessed a protected route",
    user: req.user
  });
});

router.get("/user-area", protect, authorizeRoles("USER"), (req, res) => {
  res.json({
    message: "Welcome to the ShopEZ user area",
    user: req.user
  });
});

router.get("/admin-area", protect, authorizeRoles("ADMIN"), (req, res) => {
  res.json({
    message: "Welcome to the ShopEZ admin area",
    user: req.user
  });
});

module.exports = router;