const { User } = require("../models/user");

exports.getUsers = async function (_, res) {
  try {
    const users = await User.find().select("name email isAdmin");
    if (!users) {
      return res.status(404).json({ message: "No users found" });
    }
    return res.json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

exports.getUserById = async function (req, res) {
  try {
    const user = await User.findById(req.params.id).select(
      "-passwordHash -resetPasswordOtp -resetPasswordOtpExpiry -cart"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

exports.updateUser = async function (req, res) {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Request body is missing" });
    }

    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.email) updates.email = req.body.email;
    if (req.body.phone) updates.phone = req.body.phone;

    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ message: "No valid fields provided for update" });
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.passwordHash = undefined;
    user.cart = undefined;
    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};
