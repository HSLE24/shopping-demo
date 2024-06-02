const Order = require("../models/Order");
const productController = require("./product.controller");
const { randomStringGenerator } = require("../utils/randomStringGenerator");

const orderController = {};

orderController.createOrder = async (req, res) => {
  try {
    const { userId } = req;

    const { totalPrice, shipTo, contact, orderList } = req.body;

    //재고 확인 & 재고 업데이트
    const insufficientStockItems = await productController.checkItemListStock(
      orderList
    );

    //재고가 불충분한 아이템이 있었다. => 에러
    if (insufficientStockItems.length > 0) {
      const errorMessage = insufficientStockItems.reduce(
        (total, item) => (total += item.message),
        ""
      );
      throw new Error(errorMessage);
    }

    const newOrder = await new Order({
      userId,
      totalPrice,
      shipTo,
      contact,
      items: orderList,
      orderNum: randomStringGenerator(),
    });

    await newOrder.save();
    //세이브 후에 카트를 비워주자

    res.status(200).json({ status: "ok", orderNum: newOrder.orderNum });
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

module.exports = orderController;
