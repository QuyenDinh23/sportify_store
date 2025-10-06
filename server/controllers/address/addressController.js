import Address from "../../models/address/Address.js";

const addressController = {
  getAdress: async (req, res) => {
    try {
      const addressList = await Address.find({ user: req.user.id });
      res.status(200).json(addressList);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  addAddress: async (req, res) => {
    try {
      const errors = [];
      if (!req.body.fullName || req.body.fullName.trim() === "") {
        errors.push("Họ tên không được để trống");
      }
      if (!req.body.phone || !/^(0|\+84)[0-9]{9,10}$/.test(req.body.phone)) {
        errors.push("Số điện thoại không hợp lệ");
      }
      if (!req.body.street || req.body.street.trim() === "") {
        errors.push("Vui lòng nhập tên đường / số nhà");
      }
      const requiredFields = ["city", "district", "ward"];
      requiredFields.forEach((field) => {
        if (
          !req.body[field] ||
          !req.body[field].code ||
          !req.body[field].name
        ) {
          errors.push(`Thiếu thông tin ${field}`);
        }
      });
      if (errors.length > 0)
        return res.status(400).json({ message: errors.join(", ") });
      if (req.body.isDefault) {
        await Address.updateMany({ user: req.user.id }, { isDefault: false });
      }
      console.log(req.user.id);

      const address = new Address({
        user: req.user.id,
        fullName: req.body.fullName,
        phone: req.body.phone,
        street: req.body.street,
        city: req.body.city,
        district: req.body.district,
        ward: req.body.ward,
        note: req.body.note,
        type: req.body.type,
        isDefault: req.body.isDefault || false,
      });

      console.log(address);

      const savedAddress = await address.save();
      console.log(savedAddress);
      return res
        .status(201)
        .json({ message: "Thêm địa chỉ thành công", data: savedAddress });
    } catch (error) {}
  },
  deleteAddress: async (req, res) => {
    try {
      const { id } = req.params;
      const address = await Address.findById(id);
      if (!address)
        return res.status(404).json({ message: "Không tìm thấy địa chỉ" });

      await address.deleteOne();

      res.status(200).json({ message: "Xóa địa chỉ thành công" });
    } catch (err) {
      res.status(500).json({ message: "Lỗi server", error: err.message });
    }
  },
  editAddress: async (req, res) => {
    try {
      const { id } = req.params;
      const address = await Address.findById(id);
      if (!address)
        return res.status(404).json({ message: "Không tìm thấy địa chỉ" });

      const errors = [];
      if (!req.body.fullName || req.body.fullName.trim() === "") {
        errors.push("Họ tên không được để trống");
      }
      if (!req.body.phone || !/^(0|\+84)[0-9]{9,10}$/.test(req.body.phone)) {
        errors.push("Số điện thoại không hợp lệ");
      }
      if (!req.body.street || req.body.street.trim() === "") {
        errors.push("Vui lòng nhập tên đường / số nhà");
      }
      const requiredFields = ["city", "district", "ward"];
      requiredFields.forEach((field) => {
        if (
          !req.body[field] ||
          !req.body[field].code ||
          !req.body[field].name
        ) {
          errors.push(`Thiếu thông tin ${field}`);
        }
      });
      if (errors.length > 0)
        return res.status(400).json({ message: errors.join(", ") });

      // Nếu đặt default => bỏ default của địa chỉ khác
      if (req.body.isDefault) {
        await Address.updateMany({ user: address.user }, { isDefault: false });
      }

      Object.assign(address, {
        user: req.user.id,
        fullName: req.body.fullName,
        phone: req.body.phone,
        street: req.body.street,
        city: req.body.city,
        district: req.body.district,
        ward: req.body.ward,
        note: req.body.note,
        type: req.body.type,
        isDefault: req.body.isDefault || false,
      });
      const updated = await address.save();

      res
        .status(200)
        .json({ message: "Cập nhật địa chỉ thành công", data: updated });
    } catch (err) {
      res.status(500).json({ message: "Lỗi server", error: err.message });
    }
  },
};
export default addressController;
