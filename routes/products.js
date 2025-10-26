const express = require("express");
const router = express.Router();
const productController = require("../controllers/products");
const reviewsController = require("../controllers/reviews");

router.get("/", productController.getProducts);
router.get("/search", productController.searchProduct);

router.get("/:id", productController.getProductId);
router.post("/:id/reviews", reviewsController.leaveReview);
router.get("/:id/reviews", reviewsController.getProductReviews);

module.exports = router;
