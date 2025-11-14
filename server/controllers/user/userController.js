import bcrypt from "bcrypt";
import User from "../../models/user/User.js";
import jwt from "jsonwebtoken";

const userController = {
  checkEmailExists: async (email) => {
    if (!email) throw new Error("Thiếu email");
    const existingUser = await User.findOne({ email });
    return !!existingUser; // true nếu tồn tại, false nếu chưa
  },
  checkEmailDuplicate: async (req, res) => {
    try {
      const { email } = req.body;

      const exists = await userController.checkEmailExists(email);

      if (exists) {
        return res
          .status(400)
          .json({ exists: true, message: "Email đã được đăng ký" });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email đã được đăng ký" });
      }

      return res.status(200).json({ message: "Email hợp lệ", exists: false });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server khi kiểm tra email", error });
    }
  },
  checkEmailDuplicateMiddleware: async (req, res, next) => {
    try {
      const { email } = req.body;
      const exists = await userController.checkEmailExists(email);

      if (exists) {
        return res.status(400).json({ message: "Email đã được đăng ký" });
      }

      next(); // ✅ cho phép đi tiếp sang controller tạo tài khoản
    } catch (error) {
      return res
        .status(500)
        .json({ message: error.message || "Lỗi server khi kiểm tra email" });
    }
  },
  //CREATEACCOUNT
  createAccount: async (req, res) => {
    try {
      const { fullName, email, phone, dateOfBirth, gender, role, password } =
        req.body;

      // Validate cơ bản
      if (!fullName || !email) {
        return res
          .status(400)
          .json({ message: "Thiếu tên hoặc email người dùng" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(req.body.password, salt);

      //create new user
      const newUser = await new User({
        fullName,
        email,
        password: password.trim() !== "" ? hashed : undefined,
        phone,
        dateOfBirth,
        gender,
        role: role || "user",
      });

      const savedUser = await newUser.save();

      res.status(201).json({
        message: "Tạo tài khoản thành công",
        user: savedUser,
      });
    } catch (error) {
      res.status(500).json(error);
    }
  },

  //EDIT ACCOUNT
  editAccount: async (req, res) => {
    try {
      const id = req.params.id;
      const updatedData = { ...req.body };
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(req.body.password, salt);
        updatedData.password = hashed;
      }
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: updatedData },
        { new: true }
      ).select("-password");
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  //GET ALL CUSTOMER
  getAllCustomers: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || "";
      const status = req.query.status;

      const skip = (page - 1) * limit;
      let query = search
        ? { fullName: { $regex: search, $options: "i" }, role: "user" }
        : { role: "user" };
      if (status && status !== "all") {
        query.status = status;
      }

      const total = await User.countDocuments(query);
      const totalPages = Math.ceil(total / limit);

      const customers = await User.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      res.status(200).json({ customers, totalPages });
    } catch (error) {
      res.status(500).json(error);
    }
  },
  getAllStaffs: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || "";
      const status = req.query.status;
      const role = req.query.role;
      const skip = (page - 1) * limit;
      let query = search
        ? {
            fullName: {
              $regex: search,
              $options: "i",
            },
            role: { $in: ["staff-sale", "staff-content"] },
          }
        : { role: { $in: ["staff-sale", "staff-content"] } };
      if (status && status !== "all") {
        query.status = status;
      }
      if (role && role !== "all") {
        query.role = role;
      }
      const total = await User.countDocuments(query);
      const totalPages = Math.ceil(total / limit);

      const staffs = await User.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      res.status(200).json({ staffs, totalPages });
    } catch (error) {
      res.status(500).json(error);
    }
  },
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
      const { email } = req.body;
      const user = req.user;
      const existingUser = await User.findById(user.id);
      if (email && email !== existingUser.email) {
        const emailExists = await User.findOne({ email });
        if (emailExists) {
          return res.status(400).json({ codeName: "DuplicateKey" });
        }
      }
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
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
      if (user.password) {
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(400).json("Current password is incorrect");
        }
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
  //Ban and Unban a user
  toggleStatusCustomer: async (req, res) => {
    try {
      const id = req.params.id;
      let message = "";
      if (!id) {
        return res.status(404).json("empty id!");
      }
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json("user not found!");
      }
      if (user.status === "active") {
        user.status = "banned";
        message = "Đã chặn người dùng";
      } else if (user.status === "banned") {
        user.status = "active";
        message = "Đã bỏ chặn người dùng";
      }
      const updatedUser = await user.save();
      res.status(200).json({ message, updatedUser });
    } catch (error) {
      res.status(500).json(error);
    }
  },
};

export default userController;
