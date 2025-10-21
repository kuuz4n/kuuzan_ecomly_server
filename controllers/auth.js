const { validationResult } = require("express-validator");
const { User } = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Token } = require("../models/token");
const { sendMail } = require("../helpers/email_sender");

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return res.status(400).json({ errors: errorMessages });
  }
  try {
    let user = new User({
      ...req.body,
      passwordHash: bcrypt.hashSync(req.body.password, 8),
    });
    user = await user.save();

    if (!user) {
      return res
        .status(500)
        .json({
          message: "Internal Server Error",
          message: "User cannot be created",
        });
    }

    return res.status(201).json(user);
  } catch (error) {
    console.error(error);
    if (error.message.includes("email_1 dup key")) {
      return res.status(409).json({
        type: "AuthError",
        message: "Email already exists",
      });
    }
  }
};

exports.login = async function (req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found \n Check your email and try again.",
      });
    }

    if (!bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(400).json({
        message: "Incorrect password!",
      });
    }

    const accessToken = jwt.sign(
      {
        id: user.id,
        isAdmin: user.isAdmin,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "24h" }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "60d" }
    );

    const token = await Token.findOne({ userId: user.id });
    if (token) await Token.deleteOne({ userId: user.id });
    await new Token({
      userId: user.id,
      accessToken,
      refreshToken,
    }).save();

    user.passwordHash = undefined;
    return res.json({ ...user.toObject(), accessToken });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.messag,
    });
  }
};

exports.verifyToken = async function (req, res) {
  try {
    let accessToken = req.headers.authorization;
    if (!accessToken) {
      return res.json(false);
    }
    accessToken = accessToken.replace("Bearer ", "").trim();

    const token = await Token.findOne({ accessToken });
    if (!token) {
      return res.json(false);
    }

    const tokenData = jwt.decode(token.refreshToken);

    const user = await User.findById(tokenData.id);
    if (!user) {
      return res.json(false);
    }

    const isValid = jwt.verify(
      token.refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    if (!isValid) {
      return res.json(false);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

exports.forgotPassword = async function (req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found \n Check your email and try again.",
      });
    }
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpiry = Date.now() + 3600000; // OTP valid for 1 hour

    await user.save();

    const response = await sendMail(
      user.email,
      "Password Reset OTP",
      `Your OTP for password reset is: ${otp}. It is valid for 1 hour.`
    );

    if (response.statusCode === 500) {
      return res
        .status(500)
        .json({ message: "Error sending email. Please try again later." });
    } else if (response.statusCode === 200) {
      return res
        .status(200)
        .json({ message: "OTP sent to your email address." });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

exports.verifyPasswordResetOTP = async function (req, res) {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found \n Check your email and try again.",
      });
    }
    if (
      user.resetPasswordOtp !== +otp ||
      Date.now() > user.resetPasswordOtpExpiry
    ) {
      return res.status(401).json({ message: "Invalid or expired OTP" });
    }
    user.resetPasswordOtp = 1;
    user.resetPasswordOtpExpiry = undefined;

    await user.save();

    return res
      .status(200)
      .json({ message: "OTP verified. You can now reset your password." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};
exports.resetPassword = async function (req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return res.status(400).json({ errors: errorMessages });
  }

  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found \n Check your email and try again.",
      });
    }

    if (user.resetPasswordOtp !== 1) {
      return res
        .status(401)
        .json({ message: "Unauthorized. Please verify OTP first." });
    }

    user.passwordHash = bcrypt.hashSync(newPassword, 8);
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpiry = undefined;

    await user.save();
    return res
      .status(200)
      .json({
        message:
          "Password reset successful. You can now log in with your new password.",
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};
