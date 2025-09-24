import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import RefreshToken from "../models/RefreshToken.js";
const authController = {
  //REGISTER
  registerUser: async (req, res) => {
    try {
      const findUser = await User.findOne({ email: req.body.email });
      if (findUser) {
        return res.status(400).json("Email đã được đăng ký");
      }

      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(req.body.password, salt);
      //create new user
      const newUser = await new User({
        fullName: req.body.fullName,
        email: req.body.email,
        password: hashed,
      });
      //save to db

      const user = await newUser.save();
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json(error);
    }
  },

  //GENERATE ACCESS TOKEN
  generateAccessToken: (user) => {
    return jwt.sign({ id: user?._id || user?.id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
  },
  //GENERATE REFRESH TOKEN
  generateRefreshToken: (user) => {
    return jwt.sign(
      { id: user?._id || user?.id },
      process.env.JWT_REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d",
      }
    );
  },

  //LOGIN
  loginUser: async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) return res.status(404).send("Không tìm thấy người dùng");

      const isMatch = await bcrypt.compare(req.body.password, user.password);
      if (!isMatch) return res.status(404).send("Sai mật khẩu");
      const accessToken = authController.generateAccessToken(user);
      const refreshToken = authController.generateRefreshToken(user);
      await RefreshToken.create({
        userId: user._id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false, // set to true if using https
        sameSite: "strict",
      });
      res.status(200).json({ accessToken });
    } catch (error) {
      res.status(500).json(error);
    }
  },

  //AUTH ME
  authMe: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select("-password");
      if (!user) return res.status(404).send("Không tìm thấy người dùng");
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json(error);
    }
  },

  //REFRESH TOKEN
  requestRefreshToken: async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).send("Unauthorized");

    const token = await RefreshToken.findOne({ token: refreshToken });
    if (!token) return res.status(403).send("Forbidden");

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET,
      (err, user) => {
        if (err) return res.status(403).send("Forbidden");
        const newAccessToken = authController.generateAccessToken(user);
        res.status(200).json({ accessToken: newAccessToken });
      }
    );
  },
  //LOGOUT
  logoutUser: async (req, res) => {
    res.clearCookie("refreshToken");
    await RefreshToken.deleteOne({ token: req.cookies.refreshToken });
    res.status(200).send("Logged out");
  },
};
export default authController;
