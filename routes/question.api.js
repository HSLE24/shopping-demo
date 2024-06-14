const express = require("express");
const questionController = require("../controller/question.controller");
const authController = require("../controller/auth.controller");
const router = express.Router();

router.post("/", authController.authenticate, questionController.askQuestion);
router.post(
  "/Simple",
  authController.authenticate,
  questionController.askSimpleQuestion
);

module.exports = router;
