const User = require("../models/User");

// GET ALL USERS - ADMIN
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


// UPDATE USER ROLE - ADMIN
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    const allowedRoles = [
      "USER",
      "SELLER",
      "ADMIN"
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role"
      });
    }

    const user = await User.findById(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    user.role = role;

    await user.save();

    res.status(200).json({
      message: "User role updated successfully",
      user: {
        id: user._id,
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


// DELETE USER - ADMIN
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Prevent deleting yourself
    if (
      user._id.toString() ===
      req.user._id.toString()
    ) {
      return res.status(400).json({
        message: "You cannot delete your own account"
      });
    }

    await user.deleteOne();

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


module.exports = {
  getAllUsers,
  updateUserRole,
  deleteUser
};