const User = require("../models/User");
const bcrypt = require("bcryptjs");

const authController = {};

// 1. 유저에게 이메일과 패스워드를 받아온다.
// 2. 유저 이메일이 데이터베이스에 존재하는 이메일인지 확인한다.
// 3. 유저의 패스워드가 일치하는 지 확인한다.
// 4. 일치한다면 토큰을 생성해서 응답에 유저와 토큰값을 보낸다.
// 5. 일치하지 않는다면 에러를 보낸다.

authController.loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });

    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);

      if (isMatch) {
        const token = await user.generateToken();

        return res.status(200).json({ status: "ok", user, token });
      }
    }

    throw new Error("invalid email or password");
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

module.exports = authController;
