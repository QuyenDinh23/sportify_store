import { Button } from "../../components/ui/button";
import AccountManageLayout from "../../components/AccountManageLayout";
import { useEffect, useState } from "react";
import { toast } from "../../hooks/use-toast";
import { addressApi } from "../../services/addressApi";
import { Trash, Edit } from "lucide-react";
import { useAddress } from "../../hooks/use-selectLocation";
const AddressManage = () => {
  const overlayStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "#FAFAFA", // ✅ chú ý là backgroundColor chứ không phải background
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  };
  const spinnerStyle = {
    border: "6px solid #f3f3f3", // màu nền vòng tròn
    borderTop: "6px solid #F09342", // màu viền quay
    borderRadius: "50%",
    width: "50px",
    height: "50px",
    animation: "spin 1s linear infinite",
  };
  const [path, setPath] = useState("Quản lý địa chỉ");
  const [editData, setEditData] = useState(null);
  const defaultForm = {
    type: "",
    country: "Việt Nam",
    city: "",
    district: "",
    ward: "",
    street: "",
    note: "",
    fullName: "",
    phone: "+84",
    isDefault: false,
  };
  const MainLayout = () => {
    const [loading, setLoading] = useState(false);
    const regexMobileVN =
      /^(0|\+84)(3[2-9]|5[2689]|7[0-9]|8[1-9]|9[0-9])\d{7}$/;
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
      setDistricts, // ✅ Bạn phải return ra nếu muốn dùng ở ngoài
      setWards,
      setProvinces,
    } = useAddress();
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
    useEffect(() => {
      const loadEditAddress = async () => {
        if (!editData) return;
        setLoading(true);
        // 1️⃣ Load danh sách tỉnh (nếu chưa có)
        if (provinces.length === 0) {
          const data = await addressApi.getProvines();
          setProvinces(data);
        }

        // 2️⃣ Đặt tỉnh
        setSelectedProvince(editData.city.code);

        // 3️⃣ Load huyện theo tỉnh
        const allDistricts = await addressApi.getDistricts();
        const filteredDistricts = allDistricts.filter(
          (d) => Number(d.province_code) === Number(editData.city.code)
        );
        setDistricts(filteredDistricts);
        setSelectedDistrict(editData.district.code);

        // 4️⃣ Load phường theo huyện
        const allWards = await addressApi.getWards();
        const filteredWards = allWards.filter(
          (w) => Number(w.district_code) === Number(editData.district.code)
        );
        setWards(filteredWards);
        setSelectedWard(editData.ward.code);
      };

      loadEditAddress();
    }, [editData]);
    useEffect(() => {
      if (wards.length && editData) {
        setSelectedWard(editData.ward.code);
        setLoading(false);
      }
    }, [wards, editData]);

    useEffect(() => {
      setForm({
        ...form,
        city: selectedProvince,
        district: selectedDistrict,
        ward: selectedWard,
      });
    }, [selectedProvince, selectedDistrict, selectedWard]);
    const handleChange = (e) => {
      const { name, type, value, checked } = e.target;
      setForm({
        ...form,
        [name]: type === "checkbox" ? checked : value, // ✅ xử lý riêng cho checkbox
      });
    };
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

      if (!editData) {
        const res = await addressApi.addAddress(data);
        if (res) {
          toast({
            title: "Thêm địa chỉ thành công!",
            description: "",
            variant: "default",
          });
          setPath("Quản lý địa chỉ");
        } else {
          toast({
            title: "Thêm địa chỉ thất bại",
            description: "",
            variant: "danger",
          });
        }
      } else if (editData) {
        const res = addressApi.updateAddress(editData._id, data);
        if (res) {
          toast({
            title: "Thêm địa chỉ thành công!",
            description: "",
            variant: "default",
          });
          setPath("Quản lý địa chỉ");
        } else {
          toast({
            title: "Thêm địa chỉ thất bại",
            description: "",
            variant: "danger",
          });
        }
      }
    };

    const handleDeleteAddress = async (id) => {
      console.log(id);

      const res = await addressApi.deleteAddress(id);
      if (res) {
        toast({
          title: "Xóa địa chỉ thành công!",
          description: "",
          variant: "default",
        });
        setPath("Quản lý địa chỉ");
      } else {
        toast({
          title: "Xóa địa chỉ thất bại!",
          description: "",
          variant: "danger",
        });
      }
    };

    const [hover, setHover] = useState(false);
    const [addForm, setAddForm] = useState(false);
    const openAddAddress = (update) => {
      if (addForm) {
        setPath("Quản lý địa chỉ");
      } else if (!addForm) {
        if (!update) {
          setPath("Thêm địa chỉ");
          setEditData(null);
        } else {
          console.log(update);
          setPath("Cập nhật địa chỉ");
          setEditData(update);
        }
      }
    };
    useEffect(() => {
      if (editData) {
        setForm({
          ...defaultForm,
          ...editData,
          city: editData.city.code,
          district: editData.district.code,
          ward: editData.ward.code,
        });
      } else {
        setForm(defaultForm);
      }
    }, [editData]);
    useEffect(() => {
      if (path === "Thêm địa chỉ" || path === "Cập nhật địa chỉ") {
        setAddForm(true);
      } else {
        setAddForm(false);
      }
    }, [path]);
    const [address, setAddress] = useState([]);
    useEffect(() => {
      const fetchAddress = async () => {
        try {
          const res = await addressApi.getAddress();
          setAddress(res);
        } catch (error) {
          console.log(error);
        }
      };
      fetchAddress();
    }, []);

    return (
      <>
        {addForm ? (
          <div style={{ position: "relative" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "end",
              }}
            >
              <button
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                style={{
                  padding: "5px 15px",
                  border: "1px solid #000",
                  textTransform: "uppercase",
                  fontSize: "13px",
                  fontWeight: "500",
                  backgroundColor: hover ? "#f0f0f0" : "transparent",
                }}
                onClick={() => openAddAddress()}
              >
                {" "}
                quay lại trang quản lý địa chỉ{" "}
              </button>
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
                    {loading ? (
                      <>
                        <div style={overlayStyle}>
                          <div style={spinnerStyle}></div>
                          <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
                        </div>
                      </>
                    ) : (
                      ""
                    )}
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
                    {provinces.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  {errors.city && <p style={errorStyle}>{errors.city}</p>}
                </label>

                {/* Quận / Huyện */}
                <label>
                  <span style={{ color: "red" }}>*</span> Quận / Huyện / Thị xã
                  <select
                    name="district"
                    value={form.district}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    // disabled={!selectedProvince}
                    style={inputStyle}
                  >
                    <option value="">-- Chọn Quận/Huyện --</option>
                    {districts.map((d) => (
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
                  <span style={{ color: "red" }}>*</span> Phường / Xã / Thị trấn
                  <select
                    name="ward"
                    value={form.ward}
                    onChange={(e) => setSelectedWard(e.target.value)}
                    // disabled={!selectedDistrict || !selectedProvince}
                    style={inputStyle}
                  >
                    <option value="">-- Chọn Phường/Xã --</option>
                    {wards.map((w) => (
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
                    borderRadius: "4px",
                  }}
                >
                  Lưu địa chỉ
                </button>
              </form>
            </div>
          </div>
        ) : (
          <>
            <div style={{ marginTop: "30px" }}>
              Vui lòng cập nhật chi tiết địa chỉ để lưu lại thông tin giao hàng.
            </div>
            <div
              style={{ display: "flex", flexWrap: "wrap", marginTop: "20px" }}
            >
              {address?.map((a) => {
                return (
                  <div
                    key={a._id}
                    style={{
                      width: "280px",
                      height: "180px",
                      border: "1px solid #ccc",
                      margin: "3px",
                      padding: "15px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "end",
                        height: "35px",
                        alignItems: "end",
                      }}
                    >
                      <Edit
                        onClick={() => openAddAddress(a)}
                        size={20}
                        color="#60A5FA"
                        style={{ marginRight: "25px", cursor: "pointer" }}
                      />
                      <Trash
                        style={{ cursor: "pointer" }}
                        onClick={() => handleDeleteAddress(a._id)}
                        size={20}
                        color="#60A5FA"
                      />
                    </div>
                    <div style={{ marginTop: "10px" }}>
                      <div style={{ fontWeight: "bold" }}>{a?.type}</div>
                      <div
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {a?.note +
                          " " +
                          a?.street +
                          " " +
                          a?.ward.name +
                          " " +
                          a?.district.name +
                          " " +
                          a?.city.name}
                      </div>
                      <div>{a?.country}</div>
                      <div style={{ display: "flex", marginTop: "10px" }}>
                        <p className="bg-primary text-white pl-2 pr-2">
                          {a?.isDefault ? "Địa chỉ mặc định" : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div
                onClick={() => openAddAddress()}
                className="text-primary"
                style={{
                  width: "280px",
                  height: "180px",
                  border: "1px solid #ccc",
                  margin: "3px",
                  fontSize: "17px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <button>+ Thêm địa chỉ mới</button>
              </div>
            </div>
          </>
        )}
      </>
    );
  };
  return <AccountManageLayout path={path} children={<MainLayout />} />;
};
export default AddressManage;
