const User = require("../models/User");
const bcrypt = require("bcryptjs");

const userController = {};

userController.createUser = async (req, res) => {
  try {
    const { email, name, password, level } = req.body;

    const user = await User.findOne({ email });

    if (user) {
      throw new Error("이미 존재하는 유저입니다.");
    }

    const salt = await bcrypt.genSaltSync(10);
    const hash = await bcrypt.hash(password, salt);

    const newUser = new User({ email, name, password: hash, level });
    await newUser.save();

    res.status(200).json({ status: "ok" });
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};


module.exports = userController;
