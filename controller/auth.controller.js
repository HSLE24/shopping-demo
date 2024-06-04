const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
require("dotenv").config;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

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

authController.authenticate = async (req, res, next) => {
  try {
    const tokenString = req.headers.authorization;

    if (!tokenString) {
      throw new Error("Token not found");
    }

    const token = tokenString.replace("Bearer ", "");
    jwt.verify(token, JWT_SECRET_KEY, (error, payload) => {
      if (error) {
        throw new Error("invalid token");
      }
      req.userId = payload._id;
    });
    next();
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

authController.checkAdminPermission = async (req, res, next) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId);

    if (user.level !== "admin") {
      throw new Error("no permission");
    }
    if (!user) {
      throw new Error("invalid token / user");
    }

    next();
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};

// authController.checkAdminPermission = async (req, res, next) => {
//   try {
//     return res.status(200).json({ status: "ok" });
//   } catch (err) {
//     res.status(400).json({ status: "fail", error: err.message });
//   }
// };

authController.loginWithGoogle = async (req, res) => {
  try {
    const { token } = req.body;
    const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const { email, name } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      // 유저를 새로 생성
      const randomPassword = "" + Math.floor(Math.random() * 100000000);
      const salt = await bcrypt.genSaltSync(10);
      const newPassword = await bcrypt.hash(randomPassword, salt);
      user = new User({ name, email, password: newPassword });
      await user.save();
    }
    //토큰을 발행하고 리턴
    const sessionToken = await user.generateToken();

    return res.status(200).json({ status: "ok", user, token: sessionToken });
  } catch (err) {
    res.status(400).json({ status: "fail", error: err.message });
  }
};
module.exports = authController;
