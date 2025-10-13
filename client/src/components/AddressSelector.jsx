import { useState, useEffect } from "react";
import { useAddress } from "../hooks/use-selectLocation";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const AddressSelector = ({ 
  value, 
  onChange, 
  showFullForm = true,
  className = "" 
}) => {
  const {
    provinces,
    districts,
    wards,
    selectedProvince,
    selectedDistrict,
    selectedWard,
    setSelectedProvince,
    setSelectedDistrict,
    setSelectedWard,
  } = useAddress();

  const [formData, setFormData] = useState({
    fullName: value?.fullName || "",
    phone: value?.phone || "",
    street: value?.street || "",
    city: value?.city || "",
    district: value?.district || "",
    ward: value?.ward || "",
    note: value?.note || "",
    type: value?.type || "Nhà",
    isDefault: value?.isDefault || false,
  });

  // Update form when value prop changes
  useEffect(() => {
    if (value) {
      setFormData({
        fullName: value.fullName || "",
        phone: value.phone || "",
        street: value.street || "",
        city: value.city || "",
        district: value.district || "",
        ward: value.ward || "",
        note: value.note || "",
        type: value.type || "Nhà",
        isDefault: value.isDefault || false,
      });
    }
  }, [value]);

  // Update parent component when form changes
  useEffect(() => {
    const addressData = {
      ...formData,
      city: {
        code: selectedProvince,
        name: provinces.find(p => Number(p.code) === Number(selectedProvince))?.name || "",
      },
      district: {
        code: selectedDistrict,
        name: districts.find(d => Number(d.code) === Number(selectedDistrict))?.name || "",
      },
      ward: {
        code: selectedWard,
        name: wards.find(w => Number(w.code) === Number(selectedWard))?.name || "",
      },
    };
    onChange?.(addressData);
  }, [formData, selectedProvince, selectedDistrict, selectedWard]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationChange = (type, value) => {
    if (type === "province") {
      setSelectedProvince(value);
      setSelectedDistrict("");
      setSelectedWard("");
    } else if (type === "district") {
      setSelectedDistrict(value);
      setSelectedWard("");
    } else if (type === "ward") {
      setSelectedWard(value);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {showFullForm && (
        <>
          {/* Loại địa chỉ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Loại địa chỉ</Label>
              <Input
                id="type"
                value={formData.type}
                onChange={(e) => handleInputChange("type", e.target.value)}
                placeholder="Ví dụ: Nhà, Công ty, v.v."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Quốc gia</Label>
              <Input
                id="country"
                value="Việt Nam"
                readOnly
                className="bg-muted"
              />
            </div>
          </div>
        </>
      )}

      {/* Họ tên và Số điện thoại */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Họ và tên *</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
            placeholder="Nhập họ và tên"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Số điện thoại *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="+84XXXXXXXX"
            required
          />
        </div>
      </div>

      {/* Địa chỉ chi tiết */}
      <div className="space-y-2">
        <Label htmlFor="street">Địa chỉ chi tiết *</Label>
        <Input
          id="street"
          value={formData.street}
          onChange={(e) => handleInputChange("street", e.target.value)}
          placeholder="Số nhà, tên đường..."
          required
        />
      </div>

      {/* Tỉnh/Thành phố */}
      <div className="space-y-2">
        <Label htmlFor="city">Tỉnh/Thành phố *</Label>
        <Select value={selectedProvince} onValueChange={(value) => handleLocationChange("province", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn Tỉnh/Thành phố" />
          </SelectTrigger>
          <SelectContent>
            {provinces.map((province) => (
              <SelectItem key={province.code} value={province.code.toString()}>
                {province.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quận/Huyện */}
      <div className="space-y-2">
        <Label htmlFor="district">Quận/Huyện *</Label>
        <Select 
          value={selectedDistrict} 
          onValueChange={(value) => handleLocationChange("district", value)}
          disabled={!selectedProvince}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn Quận/Huyện" />
          </SelectTrigger>
          <SelectContent>
            {districts.map((district) => (
              <SelectItem key={district.code} value={district.code.toString()}>
                {district.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Phường/Xã */}
      <div className="space-y-2">
        <Label htmlFor="ward">Phường/Xã *</Label>
        <Select 
          value={selectedWard} 
          onValueChange={(value) => handleLocationChange("ward", value)}
          disabled={!selectedDistrict || !selectedProvince}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn Phường/Xã" />
          </SelectTrigger>
          <SelectContent>
            {wards.map((ward) => (
              <SelectItem key={ward.code} value={ward.code.toString()}>
                {ward.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Ghi chú */}
      <div className="space-y-2">
        <Label htmlFor="note">Ghi chú thêm (không bắt buộc)</Label>
        <Textarea
          id="note"
          value={formData.note}
          onChange={(e) => handleInputChange("note", e.target.value)}
          placeholder="Tên tòa nhà, số tầng..."
          rows={3}
        />
      </div>

      {/* Địa chỉ mặc định */}
      {showFullForm && (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isDefault"
            checked={formData.isDefault}
            onChange={(e) => handleInputChange("isDefault", e.target.checked)}
            className="rounded"
          />
          <Label htmlFor="isDefault">Chọn làm địa chỉ mặc định</Label>
        </div>
      )}
    </div>
  );
};

export default AddressSelector;
