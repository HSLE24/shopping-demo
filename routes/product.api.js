const express = require("express");
const productController = require("../controller/product.controller");
const authController = require("../controller/auth.controller");
const router = express.Router();

router.post(
  "/",
  authController.authenticate,
  authController.checkAdminPermission,
  productController.createProduct
); //admin인지 확인하는
router.get("/", productController.getProducts);
router.put(
  "/:id",
  authController.authenticate,
  authController.checkAdminPermission,
  productController.updateProduct
);
router.delete(
  "/:id",
  authController.authenticate,
  authController.checkAdminPermission,
  productController.deleteProduct
);

module.exports = router;
