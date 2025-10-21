const { Schema, model } = require("mongoose");

const orderSchema = new Schema({
  orderItems: [
    {
      type: Schema.Types.ObjectId,
      ref: "OrderItem",
      required: true,
    },
  ],
  shippingAddress: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: String,
  country: { type: String, required: true },
  phone: { type: String, required: true },
  paymentId: String,
  status: {
    type: String,
    required: true,
    default: "Pending",
    enum: [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
      "On Hold",
      "Expired",
    ],
  },
  statusHistory: {
    type: [String],
    enum: [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
      "On Hold",
      "Expired",
    ],
    required: true,
    default: ["Pending"],
  },
  totalPrice: { type: Number, required: true },
  user: { type: Schema.Types.ObjectId, ref: "User" },
  dateOrdered: { type: Date, default: Date.now },
});

orderSchema.set("toJSON", { virtuals: true });
orderSchema.set("toObject", { virtuals: true });

exports.Order = model("Order", orderSchema);
