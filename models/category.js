const { Schema, model } = require("mongoose");

const categorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  image: { type: String, required: true },
  colour: { type: String, default: "#000000" },
  markedForDeletion: { type: Boolean, default: false },
});

categorySchema.set("toJSON", { virtuals: true });
categorySchema.set("toObject", { virtuals: true });

exports.Category = model("Category", categorySchema);
