import { useEffect, useState } from "react";
import { useAddress } from "../../hooks/use-selectLocation";
import { addressApi } from "../../services/addressApi";
import { toast } from "sonner";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { MainNavigation } from "../../components/MainNavigation";
import AccountSideBar from "../../components/AccountSideBar";
import { Link, useNavigate, useParams } from "react-router-dom";
import { LoadingAnimation } from "../../components/ui/animation-loading";
import { ChevronLeft } from "lucide-react";

const AddEditAddress = () => {
  const inputStyle = {
    display: "block",
    width: "100%",
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "14px",
    marginBottom: "10px",
  };

  const errorStyle = {
    color: "red",
    fontSize: "12px",
    marginTop: "2px",
  };
  const regexMobileVN = /^(0|\+84)(3[2-9]|5[2689]|7[0-9]|8[1-9]|9[0-9])\d{7}$/;
  const { id } = useParams();
  const navigate = useNavigate();

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

  const [address, setAddress] = useState(null);
  const [hover, setHover] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: "",
    country: "Việt Nam",
    city: selectedProvince,
    district: selectedDistrict,
    ward: selectedWard,
    street: "",
    note: "",
    fullName: "",
    phone: "+84",
    isDefault: false,
  });
  const [errors, setErrors] = useState({});

  //function call API get Address Edit
  const getAdressById = async (id) => {
    const res = await addressApi.getAddressById(id);
    setAddress(res);
  };

  //Load addressEdit to state and set on loading status
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getAdressById(id);
  }, [id]);

  //Load addressEdit to form ,with city
  useEffect(() => {
    if (!id) return;
    if (!loading) return;
    setForm({
      ...form,
      type: address?.type,
      street: address?.street,
      note: address?.note,
      fullName: address?.fullName,
      phone: address?.phone,
      isDefault: address?.isDefault,
    });
    if (provinces.length === 0) return;
    if (!loading) return;
    setSelectedProvince(address?.city.code);
  }, [address, provinces]);

  //Load districtEdit to form
  useEffect(() => {
    if (!id || districts.length === 0) return;
    if (!loading) return;
    setSelectedDistrict(address?.district.code);
  }, [districts]);

  //Load wardEdit to form and set off loading
  useEffect(() => {
    if (!id || wards.length === 0) return;
    if (!loading) return;
    setSelectedWard(address?.ward.code);
    setLoading(false);
  }, [wards]);

  //handle set value location select to form
  useEffect(() => {
    if (loading) return;
    setForm({
      ...form,
      city: selectedProvince,
      district: selectedDistrict,
      ward: selectedWard,
    });
  }, [selectedProvince, selectedDistrict, selectedWard]);

  const validate = () => {
    const newErrors = {};
    if (!form.city) newErrors.city = "Vui lòng chọn Tỉnh / Thành phố";
    if (!form.district) newErrors.district = "Vui lòng nhập Quận / Huyện";
    if (!form.ward) newErrors.ward = "Vui lòng nhập Phường / Xã";
    if (!form.street) newErrors.street = "Vui lòng nhập Địa chỉ nhận hàng";
    if (!form.fullName.trim()) {
      newErrors.fullName = "Tên không hợp lệ!";
    }
    if (!form.phone.trim() || !regexMobileVN.test(form.phone.trim())) {
      newErrors.phone = "Số điện thoại không hợp lệ!";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    const provinceName =
      provinces.find((p) => Number(p.code) === Number(selectedProvince))
        ?.name || "";

    const districtName =
      districts.find((d) => Number(d.code) === Number(selectedDistrict))
        ?.name || "";

    const wardName =
      wards.find((w) => Number(w.code) === Number(selectedWard))?.name || "";

    const data = {
      ...form,
      city: {
        code: selectedProvince,
        name: provinceName,
      },
      district: {
        code: selectedDistrict,
        name: districtName,
      },
      ward: {
        code: selectedWard,
        name: wardName,
      },
    };

    if (!id) {
      const res = await addressApi.addAddress(data);
      if (res) {
        toast.success("Thêm địa chỉ thành công!");
        setTimeout(() => {
          navigate("/account/address");
        }, 1000);
      }
    } else if (id) {
      const res = addressApi.updateAddress(id, data);
      console.log(res);
      if (res) {
        toast.success("Sửa địa chỉ thành công!");
        setTimeout(() => {
          navigate("/account/address");
        }, 1000);
      }
    }
  };
  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value, // ✅ xử lý riêng cho checkbox
    });
  };
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MainNavigation />
      <main style={{ display: "flex" }}>
        <AccountSideBar path="address" />
        <div style={{ flex: 1, padding: "50px 150px" }}>
          <h1 style={{ fontSize: "25px", fontWeight: "bold" }}>
            {!id ? "Thêm địa chỉ" : "Sửa địa chỉ"}
          </h1>
          <>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "end",
                }}
              >
                <Link to={"/account/address"}>
                  <button
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                    style={{
                      padding: "5px 20px 5px 15px",
                      border: "1px solid #000",
                      textTransform: "uppercase",
                      fontSize: "13px",
                      fontWeight: "500",
                      backgroundColor: hover ? "#f0f0f0" : "transparent",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <ChevronLeft /> <span>quay lại trang quản lý địa chỉ </span>
                  </button>
                </Link>
              </div>
              <div>
                <form
                  onSubmit={(e) => handleSubmit(e)}
                  style={{
                    margin: "20px auto",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Loại địa chỉ */}
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <label style={{ width: "49%" }}>
                      Loại địa chỉ
                      <input
                        name="type"
                        placeholder="Ví dụ: Nhà, Công ty, v.v."
                        value={form.type}
                        onChange={handleChange}
                        style={inputStyle}
                      />
                    </label>

                    {/* Quốc gia */}
                    <label style={{ width: "49%" }}>
                      <span style={{ color: "red" }}>*</span> Quốc gia{" "}
                      <LoadingAnimation loading={loading} />
                      <input
                        name="country"
                        value={form.country}
                        readOnly
                        style={{ ...inputStyle, backgroundColor: "#f9f9f9" }}
                      />
                    </label>
                  </div>

                  {/* Thành phố / Tỉnh */}
                  <label>
                    <span style={{ color: "red" }}>*</span> Thành phố / Tỉnh
                    <select
                      name="city"
                      value={form.city}
                      onChange={(e) => setSelectedProvince(e.target.value)}
                      style={inputStyle}
                    >
                      <option value="">-- Chọn Tỉnh/Thành phố --</option>
                      {provinces?.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    {errors.city && <p style={errorStyle}>{errors.city}</p>}
                  </label>

                  {/* Quận / Huyện */}
                  <label>
                    <span style={{ color: "red" }}>*</span> Quận / Huyện / Thị
                    xã
                    <select
                      name="district"
                      value={form.district}
                      onChange={(e) => setSelectedDistrict(e.target.value)}
                      disabled={!selectedProvince}
                      style={inputStyle}
                    >
                      <option value="">-- Chọn Quận/Huyện --</option>
                      {districts?.map((d) => (
                        <option key={d.code} value={d.code}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    {errors.district && (
                      <p style={errorStyle}>{errors.district}</p>
                    )}
                  </label>

                  {/* Phường / Xã */}
                  <label>
                    <span style={{ color: "red" }}>*</span> Phường / Xã / Thị
                    trấn
                    <select
                      name="ward"
                      value={form.ward}
                      onChange={(e) => setSelectedWard(e.target.value)}
                      disabled={!selectedDistrict || !selectedProvince}
                      style={inputStyle}
                    >
                      <option value="">-- Chọn Phường/Xã --</option>
                      {wards?.map((w) => (
                        <option key={w.code} value={w.code}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                    {errors.ward && <p style={errorStyle}>{errors.ward}</p>}
                  </label>

                  {/* Địa chỉ nhận hàng */}
                  <label>
                    <span style={{ color: "red" }}>*</span> Địa chỉ nhận hàng
                    <input
                      name="street"
                      placeholder="Số nhà, tên đường..."
                      value={form.street}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                    {errors.street && <p style={errorStyle}>{errors.street}</p>}
                  </label>
                  <label>
                    <span style={{ color: "red" }}>*</span> Ghi chú thêm (không
                    bắt buộc)
                    <input
                      name="note"
                      placeholder="Tên tòa nhà, số tầng..."
                      value={form.note}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  </label>
                  <label>
                    <span style={{ color: "red" }}>*</span> Họ Tên
                    <input
                      name="fullName"
                      placeholder="Tên"
                      value={form.fullName}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                    {errors.fullName && (
                      <p style={errorStyle}>{errors.fullName}</p>
                    )}
                  </label>
                  <label>
                    <span style={{ color: "red" }}>*</span> Số điện thoại (định
                    dạng: +84xxxxxxxxx)
                    <input
                      name="phone"
                      placeholder="+84XXXXXXXX"
                      value={form.phone}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                    {errors.phone && <p style={errorStyle}>{errors.phone}</p>}
                  </label>
                  <label
                    style={{
                      display: "flex",
                      justifyContent: "start",
                      marginBottom: "10px",
                    }}
                  >
                    <input
                      type="checkbox"
                      name="isDefault"
                      checked={form.isDefault}
                      onChange={handleChange}
                      style={{ padding: "8px", marginRight: "10px" }}
                    />
                    Chọn làm địa chỉ mặc định
                  </label>
                  <button
                    type="submit"
                    style={{
                      padding: "8px 20px",
                      border: "none",
                      background: "#F09342",
                      color: "#fff",
                      textTransform: "uppercase",
                      fontWeight: "bold",
                      cursor: "pointer",
                      borderRadius: "50px",
                      width: "130px",
                      fontSize: "13px",
                      marginTop: "20px",
                    }}
                  >
                    Lưu địa chỉ
                  </button>
                </form>
              </div>
            </div>
          </>
        </div>
      </main>
      <Footer />
    </div>
  );
};
export default AddEditAddress;
