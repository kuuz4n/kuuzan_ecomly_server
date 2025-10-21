const express = require("express");
const router = express.Router();

const usersController = require("../controllers/admin/users");
const categoriesController = require("../controllers/admin/categories");
const ordersController = require("../controllers/admin/orders");

//USERS
router.get("users/count", usersController.getUserCount);
router.delete("/users/:id", usersController.deleteUser);

//CATEGORIES
router.post("/categories/", categoriesController.addCategory);
router.put("/categories/:id", categoriesController.editCategory);
router.delete("/categories/:id", categoriesController.deleteCategory);

//PRODUCTS
// router.get("/products/count", adminController.getProductCount);
// router.put("/products/:id", adminController.editProduct);
// router.post("/products/", adminController.addProduct);
// router.delete("/products/:id/images", adminController.deleteProductImages);
// router.delete("/products/:id", adminController.deleteProduct);

//ORDERS
router.get("/orders/", ordersController.getOrders);
router.get("/orders/count", ordersController.getOrdersCount);
router.put("/orders/:id", ordersController.changeOrderStatus);
router.delete("/orders/:id", ordersController.deleteOrder);

module.exports = router;
