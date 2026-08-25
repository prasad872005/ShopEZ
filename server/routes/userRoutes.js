const express = require("express");

const {
  getAllUsers,
  updateUserRole,
  deleteUser
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();


// GET ALL USERS
router.get(
  "/",
  protect,
  authorizeRoles("ADMIN"),
  getAllUsers
);


// UPDATE USER ROLE
router.put(
  "/role/:id",
  protect,
  authorizeRoles("ADMIN"),
  updateUserRole
);


// DELETE USER
router.delete(
  "/:id",
  protect,
  authorizeRoles("ADMIN"),
  deleteUser
);


module.exports = router;