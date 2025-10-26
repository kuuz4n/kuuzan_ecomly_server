const { default: mongoose } = require("mongoose");
const { Product } = require("../models/product");
const { User } = require("../models/user");

exports.getUserWishlist = async function (req, res) {
  try {
    const user = await User.findByid(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const wishlist = [];

    for (const wishProduct of user.wishlist) {
      const product = await Product.findByid(wishProduct.productId);
      if (!product) {
        wishlist.push({
          ...wishProduct,
          productExist: false,
          productOutOfStock: false,
        });
      } else if (product.countInstock < 1) {
        wishlist.push({
          ...wishProduct,
          productExist: true,
          productOutOfStock: true,
        });
      } else {
        wishlist.push({
          productId: product._id,
          prudctImage: product.image,
          productPrice: product.price,
          productName: product.name,
          productExist: true,
          productOutOfStock: false,
        });
      }
    }
    return res.json(wishlist);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.addToWishlist = async function (req, res) {
  try {
    const user = await User.findByid(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const product = await Product.findByid(req.body.productId);
    if (!product) {
      return res
        .status(404)
        .json({ message: "Could not add product. Product not found!" });
    }

    const productAlreadyExists = user.wishlist.find((item) =>
      item.productId.equals(
        new mongoose.Schema.Types.ObjectId(req.body.productId)
      )
    );
    if (productAlreadyExists) {
      return res
        .status(409)
        .json({ message: "Product already exists in wishlist" });
    }

    user.wishlist.push({
      productId: req.body.productId,
      prudctImage: product.image,
      productPrice: product.price,
      productName: product.name,
    });

    await user.save();
    return res.status(200).end();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.removeFromWishlist = async function (req, res) {
  try {
    const userId = req.params.id;
    const productId = req.params.productId;
    const user = await User.findByid(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const index = user.wishlist.findIndex((item) =>
      item.productId.equals(new mongoose.Schema.Types.ObjectId(productId))
    );

    if (index === -1) {
      return res
        .status(404)
        .json({ message: "Product not found in wishlist!" });
    }
    user.wishlist.splice(index, 1);

    await user.save();
    return res.status(204).end();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};
