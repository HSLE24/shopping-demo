const mongoose = require("mongoose");
const User = require("./User");
const Product = require("./Product");
const Schema = mongoose.Schema;
const orderSchema = Schema(
  {
    userId: { type: mongoose.ObjectId, ref: User },
    shipTo: { type: Object, required: true },
    contact: { type: Object, required: true },
    totalPrice: { type: Number, required: true },
    status: { type: String, default: "preparing" },
    orderNum: { type: String },
    items: [
      {
        productId: { type: mongoose.ObjectId, ref: Product },
        size: { type: String, required: true },
        qty: { type: Number, default: 1 },
        price: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

cartSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.__v;
  delete obj.updatedAt;
  return obj;
};

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
