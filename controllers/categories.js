const express = require("express");
const { Category } = require("../models/category");

exports.getCategories = async function (_, res) {
  try {
    const categories = await Category.find();
    if (!categories) {
      return res.status(404).json({ message: "Categories not found" });
    }
    return res.json(categories);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};

exports.getCategoryByid = async function (req, res) {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Categories not found" });
    }
    res.json(category);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ type: error.name, message: error.message });
  }
};
