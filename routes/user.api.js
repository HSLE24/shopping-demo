const express = require("express");
const userController = require("../controller/user.controller");
const authController = require("../controller/auth.controller");
const router = express.Router();

router.post("/", userController.createUser);
router.get("/me", authController.authenticate, userController.getUser); //토큰이 valid한 토큰인지, 이 token을 가지고 유저를 찾아서 리턴

module.exports = router;
