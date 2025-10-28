const { default: mongoose } = require("mongoose");
const { User } = require("../models/user");
const { Product } = require("../models/product");
const { CartProduct } = require("../models/cart_product");
const { OrderItem } = require("../models/order_items");
const { Order } = require("../models/order");

exports.addOrder = async function (orderData) {
  if (!mongoose.isValidObjectId(orderData.user)) {
    return console.error("User Validation Failed: Invalid user!");
  }
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findbyId(orderData.user);
    if (!user) {
      await session.abortTransaction();
      return console.trace("ORDER CREATION FAILED: User not found");
    }
    const orderItems = orderData.orderItems;
    const orderItemIds = [];
    for (const orderItem of orderItems) {
      if (
        !mongoose.isValidObjectId(orderItem.product) ||
        !(await Product.findbyId(orderItem.product))
      ) {
        await session.abortTransaction();
        return console.trace("ORDER CREATION FAILED: Invalid product");
      }
    }
    const product = await Product.findbyId(orderItem.product);
    const cartProduct = await CartProduct.findbyId(orderItems.cartProductId);
    if (!cartProduct) {
      await session.abortTransaction();
      return console.trace("ORDER CREATION FAILED: Invalid cart product");
    }

    let orderItemModel = await new OrderItem(orderItem).save({ session });

    if (!orderItemModel) {
      await session.abortTransaction();
      return console.trace(
        `ORDER CREATION FAILED,``An order for product "${product.name}" could not be created`
      );
    }

    if (!cartProduct.reserved) {
      product.countInStock -= orderItemModel.quantity;
      await product.save({ session });
    }

    orderItemIds.push(orderItemModel._id);

    await CartProduct.findbyIdAndDelete(orderItem.cartProductId).session(
      session
    );
    user.cart.pull(cartProduct.id);
    await user.save({ session });

    orderData["orderItems"] = orderItemIds;

    let order = new Order(orderData);
    order.status = "processed";
    order.statusHistory.push("processed");

    order = await order.save({ session });
    if (!order) {
      await session.abortTransaction();
      return console.trace(
        "ORDER CREATION FAILED: The order could not be created."
      );
    }

    await session.commitTransaction();
    return order;
  } catch (error) {
    await session.abortTransaction();
    console.trace(error);
    return res.status(500).json({ type: error.name, message: error.message });
  } finally {
    await session.endSession();
  }
};

exports.getUserOrders = async function (req, res) {
  try {
    const orders = await Order.findById({ user: req.params.userId })
      .select("orderItems status totalPrice dateOrdered")
      .populate({ path: "orderItems", select: "productName, productImage" })
      .sort({ dateOrdered: -1 });
    if (!orders) {
      return res.status(404).json({ message: "Product not found!" });
    }

    const completed = [];
    const active = [];
    const cancelled = [];
    for (const order of orders) {
      if (order.status === "delivered") {
        completed.push(order);
      } else if (["cancelled", "expired"].includes(order.status)) {
        cancelled.push(order);
      } else {
        active.push(order);
      }
    }
    return res.json({ total: orders.length, active, completed, cancelled });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.getOrderById = async function (req, res) {
  try {
    const order = await Order.findbyId(req.params.id).populate("orderItems");
    if (!order) {
      return res.status(404).json({ message: "Order not found!" });
    }
    return res.json(order);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};
