import { useEffect, useState } from "react";
import { toast } from "../../hooks/use-toast";
import { addressApi } from "../../services/addressApi";
import { Trash, Edit } from "lucide-react";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { MainNavigation } from "../../components/MainNavigation";
import AccountSideBar from "../../components/AccountSideBar";
import { LoadingAnimation } from "../../components/ui/animation-loading";
import { Link } from "react-router-dom";

const AddressManage = () => {
  const [address, setAddress] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addForm, setAddForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [path, setPath] = useState("Quản lý địa chỉ");
  const [hover, setHover] = useState(false);

  // Form states
  const [form, setForm] = useState({
    type: "",
    country: "Việt Nam",
    city: "",
    district: "",
    ward: "",
    street: "",
    note: "",
    fullName: "",
    phone: "",
    isDefault: false,
  });

  // Location states
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [errors, setErrors] = useState({});

  const defaultForm = {
    type: "",
    country: "Việt Nam",
    city: "",
    district: "",
    ward: "",
    street: "",
    note: "",
    fullName: "",
    phone: "",
    isDefault: false,
  };

  const inputStyle = {
    width: "100%",
    padding: "8px",
    marginTop: "5px",
    border: "1px solid #ccc",
    borderRadius: "4px",
  };

  const overlayStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  };

  const spinnerStyle = {
    width: "20px",
    height: "20px",
    border: "2px solid #f3f3f3",
    borderTop: "2px solid #3498db",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  };

  const errorStyle = {
    color: "red",
    fontSize: "12px",
    marginTop: "2px",
  };

  const fetchAddress = async () => {
    try {
      const res = await addressApi.getAddress();
      setAddress(res);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const res = await addressApi.deleteAddress(id);
      if (res) {
        toast({
          title: "Xóa địa chỉ thành công!",
          description: "",
          variant: "default",
        });
        await fetchAddress();
      } else {
        toast({
          title: "Xóa địa chỉ thất bại!",
          description: "",
          variant: "danger",
        });
      }
    } catch (err) {
      console.log(err);
      toast({
        title: "Xóa địa chỉ thất bại!",
        description: "",
        variant: "danger",
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!form.city) newErrors.city = "Vui lòng chọn tỉnh/thành phố";
    if (!form.district) newErrors.district = "Vui lòng chọn quận/huyện";
    if (!form.ward) newErrors.ward = "Vui lòng chọn phường/xã";
    if (!form.street) newErrors.street = "Vui lòng nhập địa chỉ";
    if (!form.fullName) newErrors.fullName = "Vui lòng nhập họ tên";
    if (!form.phone) newErrors.phone = "Vui lòng nhập số điện thoại";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    const provinceName = provinces.find((p) => Number(p.code) === Number(selectedProvince))?.name || "";
    const districtName = districts.find((d) => Number(d.code) === Number(selectedDistrict))?.name || "";
    const wardName = wards.find((w) => Number(w.code) === Number(selectedWard))?.name || "";

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

    try {
      if (!editData) {
        const res = await addressApi.addAddress(data);
        if (res) {
          toast({
            title: "Thêm địa chỉ thành công!",
            description: "",
            variant: "default",
          });
          setPath("Quản lý địa chỉ");
          setAddForm(false);
          await fetchAddress();
        } else {
          toast({
            title: "Thêm địa chỉ thất bại",
            description: "",
            variant: "danger",
          });
        }
      } else {
        const res = await addressApi.updateAddress(editData._id, data);
        if (res) {
          toast({
            title: "Cập nhật địa chỉ thành công!",
            description: "",
            variant: "default",
          });
          setPath("Quản lý địa chỉ");
          setAddForm(false);
          await fetchAddress();
        } else {
          toast({
            title: "Cập nhật địa chỉ thất bại",
            description: "",
            variant: "danger",
          });
        }
      }
    } catch (err) {
      console.log(err);
      toast({
        title: "Có lỗi xảy ra",
        description: "",
        variant: "danger",
      });
    }
  };

  const openAddAddress = (update) => {
    if (addForm) {
      setPath("Quản lý địa chỉ");
      setAddForm(false);
    } else {
      if (!update) {
        setPath("Thêm địa chỉ");
        setEditData(null);
        setForm(defaultForm);
      } else {
        setPath("Cập nhật địa chỉ");
        setEditData(update);
        setForm({
          ...defaultForm,
          ...update,
          city: update.city.code,
          district: update.district.code,
          ward: update.ward.code,
        });
      }
      setAddForm(true);
    }
  };

  // Load provinces on mount
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const res = await addressApi.getProvinces();
        setProvinces(res);
      } catch (error) {
        console.log(error);
      }
    };
    loadProvinces();
  }, []);

  // Load districts when province changes
  useEffect(() => {
    if (selectedProvince) {
      const loadDistricts = async () => {
        try {
          const allDistricts = await addressApi.getDistricts();
          const filteredDistricts = allDistricts.filter(
            (d) => Number(d.province_code) === Number(selectedProvince)
          );
          setDistricts(filteredDistricts);
          setSelectedDistrict("");
          setSelectedWard("");
          setWards([]);
        } catch (error) {
          console.log(error);
        }
      };
      loadDistricts();
    }
  }, [selectedProvince]);

  // Load wards when district changes
  useEffect(() => {
    if (selectedDistrict) {
      const loadWards = async () => {
        try {
          const allWards = await addressApi.getWards();
          const filteredWards = allWards.filter(
            (w) => Number(w.district_code) === Number(selectedDistrict)
          );
          setWards(filteredWards);
          setSelectedWard("");
        } catch (error) {
          console.log(error);
        }
      };
      loadWards();
    }
  }, [selectedDistrict]);

  // Update form when location selections change
  useEffect(() => {
    setForm(prevForm => ({
      ...prevForm,
      city: selectedProvince,
      district: selectedDistrict,
      ward: selectedWard,
    }));
  }, [selectedProvince, selectedDistrict, selectedWard]);

  // Load address data
  useEffect(() => {
    setLoading(true);
    fetchAddress();
  }, []);

  // Handle edit data loading
  useEffect(() => {
    if (editData) {
      setSelectedProvince(editData.city.code);
      setSelectedDistrict(editData.district.code);
      setSelectedWard(editData.ward.code);
    }
  }, [editData]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MainNavigation />
      <main style={{ display: "flex" }}>
        <AccountSideBar path="address" />
        <div style={{ flex: 1, padding: "50px 150px" }}>
          <h1 style={{ fontSize: "25px", fontWeight: "bold" }}>
            {path}
          </h1>
          
          {addForm ? (
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "end" }}>
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
                  Quay lại trang quản lý địa chỉ
                </button>
              </div>
              
              <form
                onSubmit={handleSubmit}
                style={{
                  margin: "20px auto",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Loại địa chỉ */}
                <div style={{ display: "flex", justifyContent: "space-between" }}>
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

                  <label style={{ width: "49%" }}>
                    <span style={{ color: "red" }}>*</span> Quốc gia
                    {loading ? (
                      <div style={overlayStyle}>
                        <div style={spinnerStyle}></div>
                        <style>{`
                          @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                          }
                        `}</style>
                      </div>
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
                    style={inputStyle}
                  >
                    <option value="">-- Chọn Quận/Huyện --</option>
                    {districts.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  {errors.district && <p style={errorStyle}>{errors.district}</p>}
                </label>

                {/* Phường / Xã */}
                <label>
                  <span style={{ color: "red" }}>*</span> Phường / Xã / Thị trấn
                  <select
                    name="ward"
                    value={form.ward}
                    onChange={(e) => setSelectedWard(e.target.value)}
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
                  <span style={{ color: "red" }}>*</span> Ghi chú thêm (không bắt buộc)
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
                  {errors.fullName && <p style={errorStyle}>{errors.fullName}</p>}
                </label>

                <label>
                  <span style={{ color: "red" }}>*</span> Số điện thoại (định dạng: +84xxxxxxxxx)
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
          ) : (
            <>
              <div style={{ marginTop: "30px" }}>
                Vui lòng cập nhật chi tiết địa chỉ để lưu lại thông tin giao hàng.
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  marginTop: "20px",
                  position: "relative",
                }}
              >
                {loading ? (
                  <LoadingAnimation loading={loading} />
                ) : (
                  <>
                    {address?.map((a) => {
                      return (
                        <div
                          key={a._id}
                          style={{
                            width: "400px",
                            height: "190px",
                            border: "1px solid #ccc",
                            margin: "5px",
                            padding: "15px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "end",
                              height: "35px",
                              alignItems: "end",
                              marginRight: "15px",
                            }}
                          >
                            <button onClick={() => openAddAddress(a)}>
                              <Edit
                                size={20}
                                color="#60A5FA"
                                style={{ marginRight: "25px", cursor: "pointer" }}
                              />
                            </button>
                            <Trash
                              style={{ cursor: "pointer" }}
                              onClick={() => handleDeleteAddress(a._id)}
                              size={20}
                              color="#60A5FA"
                            />
                          </div>
                          <div style={{ marginTop: "18px" }}>
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
                      className="text-primary"
                      style={{
                        width: "400px",
                        height: "190px",
                        border: "1px solid #ccc",
                        margin: "5px",
                        fontSize: "17px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <button onClick={() => openAddAddress()}>
                        + Thêm địa chỉ mới
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AddressManage;