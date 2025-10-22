const express = require("express");
const router = express.Router();

const usersController = require("../controllers/admin/users");
const categoriesController = require("../controllers/admin/categories");
const ordersController = require("../controllers/admin/orders");
const productController = require("../controllers/admin/product");

//USERS
router.get("users/count", usersController.getUserCount);
router.delete("/users/:id", usersController.deleteUser);

//CATEGORIES
router.post("/categories/", categoriesController.addCategory);
router.put("/categories/:id", categoriesController.editCategory);
router.delete("/categories/:id", categoriesController.deleteCategory);

//PRODUCTS
router.get("/products/count", productController.getProductCount);
router.get("/products/", productController.getProducts);
router.put("/products/:id", productController.editProduct);
router.post("/products/", productController.addProduct);
router.delete("/products/:id/images", productController.deleteProductImages);
router.delete("/products/:id", productController.deleteProduct);

//ORDERS
router.get("/orders/", ordersController.getOrders);
router.get("/orders/count", ordersController.getOrdersCount);
router.put("/orders/:id", ordersController.changeOrderStatus);
router.delete("/orders/:id", ordersController.deleteOrder);

module.exports = router;
