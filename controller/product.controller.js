const Product = require("../models/Product");

const PAGE_SIZE = 1;
const productController = {};

productController.createProduct = async (req, res) => {
  try {
    const {
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    } = req.body;

    const product = new Product({
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    });
    await product.save();

    return res.status(200).json({ status: "ok", data: product });
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

productController.getProducts = async (req, res) => {
  try {
    const { page, name } = req.query;
    const cond = name ? { name: { $regex: name, $options: "i" } } : {};
    let query = Product.find(cond);
    let response = { status: "ok" };

    if (page) {
      query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);
      const totalItemNum = await Product.find(cond).count();
      const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);

      response.totalPageNum = totalPageNum;
    }

    const productList = await query.exec();

    response.data = productList;

    res.status(200).json(response);
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

productController.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const {
      sku,
      name,
      size,
      image,
      category,
      description,
      price,
      stock,
      status,
    } = req.body;

    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      {
        sku,
        name,
        size,
        image,
        category,
        description,
        price,
        stock,
        status,
      },
      { new: true }
    );

    if (!product) {
      throw new Error("item doesn't exist");
    }

    return res.status(200).json({ status: "ok", data: product });
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

productController.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.deleteOne({ _id: productId });

    return res.status(200).json({ status: "ok", data: product });
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

productController.checkStock = async (item) => {
  //내가 사려는 아이템 재고 정보 -> 비교
  //불충분하다면 불충분 메세지와 함께 데이터 반환

  const product = await Product.findById(item.productId);
  if (product.stock[item.size] < item.qty) {
    return {
      isVerify: false,
      message: `${product.name}의 ${item.size}재고가 부족합니다.`,
    };
  }

  //충분하다면 재고에서 -qty 성공
  const newStock = { ...product.stock };
  newStock[item.size] -= item.qty;
  product.stock = newStock;

  await product.save();
  return { isVerify: true };
};

productController.checkItemListStock = async (itemList) => {
  const insufficientStockItems = [];

  //재고를 확인하는 로직
  await Promise.all(
    itemList.map(async (item) => {
      const stockCheck = await productController.checkStock(item);
      if (!stockCheck.isVerify) {
        insufficientStockItems.push({ item, message: stockCheck.message });
      }
      return stockCheck;
    })
  );

  return insufficientStockItems;
};

module.exports = productController;
