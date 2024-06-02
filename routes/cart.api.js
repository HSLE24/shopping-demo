const express = require("express");
const cartController = require("../controller/cart.controller");
const authController = require("../controller/auth.controller");
const router = express.Router();

router.post("/", authController.authenticate, cartController.addItemToCart);
router.get("/", authController.authenticate, cartController.getCart);

//카트 아이템 개수 수정, 삭제, 주문내역 가격 변동
router.put("/:id", authController.authenticate, cartController.editCartItem);
router.delete(
  "/:id",
  authController.authenticate,
  cartController.deleteCartItem
);
router.get("/qty", authController.authenticate, cartController.getCartQty);

module.exports = router;
