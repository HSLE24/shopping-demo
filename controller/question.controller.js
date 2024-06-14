require("dotenv").config();
const Product = require("../models/Product");

const questionController = {};

questionController.askQuestion = async (req, res) => {
  const { user_input, productId } = req.body;
  console.log(user_input, productId);
};

questionController.askSimpleQuestion = async (req, res) => {
  try {
    const { user_input, productId } = req.body;
    console.log(user_input, productId);

    const product = await Product.findById({ _id: productId });
    let response = "";

    console.log(product.stock);

    if (user_input === "재고") {
      response = `재고는 다음과 같습니다.\n`;
      for (const [size, quantity] of Object.entries(product.stock)) {
        response += `${size.toUpperCase()} 사이즈: ${quantity}개\n`;
      }
    } else if (user_input === "배송") {
      response = `수도권: 평균 1일 소요/n
      기타 지역: 평균 3일 소요/n
      산간지방: 평균 7일 소요/n
      고객님께서 주문하신 상품은 위의 예상 배송 기간 내에 도착할 예정입니다.`;
    } else if (user_input.includes("입고 요청")) {
      const size = user_input.substring(user_input.lastIndexOf(":") + 2);
      if (!product.asked) {
        product.asked = [];
      }
      if (!product.asked.includes(size)) {
        product.asked.push(size);

        await product.save();
      }
      response = `${size} 입고 요청이 완료되었습니다.`;
    }

    return res.status(200).json({ status: "ok", response });
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

module.exports = questionController;
