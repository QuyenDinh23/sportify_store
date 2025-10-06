import bcrypt from "bcrypt";
import User from "../../models/user/User.js";
import jwt from "jsonwebtoken";

const userController = {
  //GET USER INFO
  getUserInfo: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select("-password");
      if (!user) {
        return res.status(404).json("User not found");
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  //UPDATE USER INFO
  updateUserInfo: async (req, res) => {
    try {
      const updatedData = { ...req.body };

      const updatedUser = await User.findByIdAndUpdate(
        updatedData._id,
        { $set: updatedData },
        { new: true }
      ).select("-password");

      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json(error);
    }
  },

  //Change Password
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json("User not found");
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json("Current password is incorrect");
      }
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(newPassword, salt);
      user.password = hashed;
      await user.save();
      res.status(200).json("Password changed successfully");
    } catch (error) {
      res.status(500).json(error);
    }
  },
};

export default userController;
