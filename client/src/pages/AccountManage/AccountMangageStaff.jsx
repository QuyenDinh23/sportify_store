import { Button } from "../../components/ui/button";
import { useEffect, useState } from "react";
import { userApi } from "../../services/userApi";
import { toast } from "../../hooks/use-toast";
import { useDispatch, useSelector } from "react-redux";

const StaffAccount = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");

  const [editName, setEditName] = useState(false);
  const [editDob, setEditDob] = useState(false);
  const [editEmail, setEditEmail] = useState(false);
  const [editPhone, setEditPhone] = useState(false);
  const [editGender, setEditGender] = useState(false);

  const [saveNameBtn, setSaveNameBtn] = useState(true);
  const [saveDobBtn, setSaveDobBtn] = useState(true);
  const [saveEmailBtn, setSaveEmailBtn] = useState(true);
  const [savePhoneBtn, setSavePhoneBtn] = useState(true);
  const [saveGenderBtn, setSaveGenderBtn] = useState(true);

  //error input
  const [errorName, setErrorName] = useState(false);
  const [errorDob, setErrorDob] = useState(false);
  const [errorPhone, setErrorPhone] = useState(false);
  const [errorEmail, setErrorEmail] = useState(false);

  const [selectedUpdate, setSelectedUpdate] = useState("");

  //Load data user
  useEffect(() => {
    if (!user) return;

    setName(user.fullName || "");
    setDob(user.dateOfBirth || "");
    setEmail(user.email || "");
    setPhone(user.phone || "");
    setGender(user.gender || "");

    // Reset toàn bộ edit + error + button
    setEditName(false);
    setEditDob(false);
    setEditEmail(false);
    setEditPhone(false);
    setEditGender(false);

    setSaveNameBtn(true);
    setSaveDobBtn(true);
    setSaveEmailBtn(true);
    setSavePhoneBtn(true);
    setSaveGenderBtn(true);

    setErrorName(false);
    setErrorDob(false);
    setErrorPhone(false);
    setErrorEmail(false);

    setSelectedUpdate("");
  }, [user]);

  //Check Change Input
  useEffect(() => {
    if (user?.fullName !== name) {
      setSaveNameBtn(false);
    } else {
      setSaveNameBtn(true);
    }
    if (user?.dateOfBirth !== dob) {
      setSaveDobBtn(false);
    } else {
      setSaveDobBtn(true);
    }
    if (user?.email !== email) {
      setSaveEmailBtn(false);
    } else {
      setSaveEmailBtn(true);
    }
    if (user?.phone !== phone) {
      setSavePhoneBtn(false);
    } else {
      setSavePhoneBtn(true);
    }
    if (user?.gender !== gender) {
      setSaveGenderBtn(false);
    } else {
      setSaveGenderBtn(true);
    }
  }, [name, dob, email, phone, gender, user]);

  const handleGender = (gender) => {
    let value = "";
    if (gender === "male") {
      value = "Nam";
    }
    if (gender === "female") {
      value = "Nữ";
    }
    if (gender === "other") {
      value = "Khác";
    }
    return <>{value}</>;
  };

  //Validate Dob Input
  const handleValidateDate = (date) => {
    if (!date) return false;

    const today = new Date();
    const selectedDate = new Date(date);

    // nếu là string thì parse sang Date object
    if (isNaN(selectedDate)) return false;

    // kiểm tra tương lai
    if (selectedDate > today) {
      return false;
    }

    const age = today.getFullYear() - selectedDate.getFullYear();
    const monthDiff = today.getMonth() - selectedDate.getMonth();
    const dayDiff = today.getDate() - selectedDate.getDate();

    const isTooYoung =
      age < 16 ||
      (age === 16 && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)));

    if (isTooYoung) {
      return false;
    }

    // giới hạn quá khứ (ví dụ tối đa 100 tuổi)
    const minDate = new Date(
      today.getFullYear() - 100,
      today.getMonth(),
      today.getDate()
    );
    if (selectedDate < minDate) {
      return false;
    }

    return true;
  };

  //Validate Phone Number Input
  const handleValidatePhone = (phone) => {
    if (!phone) return false;

    // Xóa khoảng trắng đầu cuối
    phone = "+84" + phone.trim().replace(/^0/, "");

    // Chấp nhận cả dạng +84 và 0
    const regex = /^(0|\+84)(3[2-9]|5[2689]|7[0-9]|8[1-9]|9[0-9])\d{7}$/;

    if (!regex.test(phone)) {
      return false;
    }

    return true;
  };

  //Validate Email Input
  const handleValidateEmail = (email) => {
    if (!email) return false;

    email = email.trim();

    // Regex chuẩn RFC 5322 cơ bản (đủ dùng cho web app)
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!regex.test(email)) {
      return false;
    }

    return true;
  };

  //Validate Form Edit
  const ValidateInput = () => {
    //return false if have no Field selected
    if (!selectedUpdate) {
      return false;
    } else {
      if (selectedUpdate === "Name") {
        if (!name.trim()) {
          setErrorName(true);
          return false;
        }
      } else if (selectedUpdate === "Dob") {
        if (!handleValidateDate(dob)) {
          setErrorDob(true);
          return false;
        }
      } else if (selectedUpdate === "Phone") {
        if (!handleValidatePhone(phone)) {
          setErrorPhone(true);
          return false;
        }
      } else if (selectedUpdate === "Email") {
        if (!handleValidateEmail(email)) {
          setErrorEmail(true);
          return false;
        }
      }
      return true;
    }
  };

  //Handle update user
  const handleUpdated = async (e) => {
    e.preventDefault();
    if (!ValidateInput()) {
      return;
    }
    const data = {
      fullName: name ? name : user?.fullName,
      dateOfBirth: dob ? dob : user?.dateOfBirth,
      email: email ? email : user?.email,
      phone: phone ? "0" + phone.replace(/^0/, "") : user?.phone,
      gender: gender ? gender : user?.gender,
    };

    const res = await userApi.updateUserInfo(data, dispatch);

    if (res) {
      toast({
        title: "Cập nhật thành công!",
        description: "",
        variant: "default",
      });
    } else {
      toast({
        title: "Cập nhật thất bại",
        description: "",
        variant: "danger",
      });
    }
  };

  //Reset Noti Invalid
  const ResetError = () => {
    setErrorName(false);
    setErrorDob(false);
    setErrorEmail(false);
    setErrorPhone(false);
  };

  //Open Edit form
  const handleOpenEdit = (type) => {
    ResetError();
    if (type === "Name") {
      if (!editName) {
        setSelectedUpdate("Name");
        setEditName(true);
      } else {
        setSelectedUpdate("");
        setName(user?.fullName);
        setEditName(false);
      }
    } else if (type === "Dob") {
      if (!editDob) {
        setSelectedUpdate("Dob");
        setEditDob(true);
      } else {
        setSelectedUpdate("");

        setDob(user?.dateOfBirth);
        setEditDob(false);
      }
    } else if (type === "Email") {
      if (!editEmail) {
        setSelectedUpdate("Email");
        setEditEmail(true);
      } else {
        setSelectedUpdate("");
        setEmail(user?.email);
        setEditEmail(false);
      }
    } else if (type === "Phone") {
      if (!editPhone) {
        setSelectedUpdate("Phone");
        setEditPhone(true);
      } else {
        setSelectedUpdate("");
        setPhone(user?.phone);
        setEditPhone(false);
      }
    } else if (type === "Gender") {
      if (!editGender) {
        setSelectedUpdate("Gender");
        setEditGender(true);
      } else {
        setSelectedUpdate("");
        setGender(user?.gender);
        setEditGender(false);
      }
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold">Thông tin tài khoản</h1>
      <div style={{ flex: 1, padding: "50px 150px" }}>
        <h4
          style={{
            marginTop: "20px",
            fontWeight: "bold",
            fontSize: "20px",
          }}
        >
          Thông tin cá nhân
        </h4>
        <div
          style={{
            width: "100%",
            marginTop: "10px",
            backgroundColor: "#f0f0f0",
            border: "1px solid #f0f0f0",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
          }}
        >
          <div
            style={{
              display: "flex",
              padding: "40px 40px 30px 40px",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h5
                style={{
                  fontWeight: "bold",
                  fontSize: "20px",
                  marginBottom: "10px",
                }}
              >
                Họ tên
              </h5>
              {editName ? (
                <form id="formName" onSubmit={handleUpdated}>
                  <input
                    style={{
                      padding: "8px",
                      fontSize: "16px",
                      border: "1px solid #ccc",
                      width: "300px",
                    }}
                    onClick={() => setErrorName(false)}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <br />
                  {errorName ? (
                    <>
                      <p className="text-red-500">Tên không hợp lệ!</p>
                    </>
                  ) : (
                    ""
                  )}
                  <Button
                    disabled={saveNameBtn}
                    style={{ fontSize: "16px", marginTop: "10px" }}
                  >
                    Lưu
                  </Button>
                </form>
              ) : (
                <p>{name ? name : "Không có thông tin"}</p>
              )}
            </div>

            <div>
              <Button
                q
                disabled={editEmail || editDob || editGender || editPhone}
                onClick={() => handleOpenEdit("Name")}
                style={{ fontSize: "16px" }}
                variant="link"
              >
                {editName ? "Hủy" : "Chỉnh sửa"}
              </Button>
            </div>
          </div>
          <div style={{ width: "100%", borderBottom: "2px solid #fff" }}></div>
          <div
            style={{
              display: "flex",
              padding: "40px 40px 30px 40px",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h5
                style={{
                  fontWeight: "bold",
                  fontSize: "20px",
                  marginBottom: "10px",
                }}
              >
                Ngày sinh
              </h5>
              {editDob ? (
                <form id="formDob">
                  <input
                    style={{
                      padding: "8px",
                      fontSize: "16px",
                      border: "1px solid #ccc",
                      width: "300px",
                    }}
                    type="date"
                    value={dob ? new Date(dob).toISOString().split("T")[0] : ""}
                    onChange={(e) => setDob(e.target.value)}
                    onClick={() => setErrorDob(false)}
                  />
                  <br />
                  {errorDob ? (
                    <>
                      <p className="text-red-500">Ngày sinh không hợp lệ!</p>
                    </>
                  ) : (
                    ""
                  )}
                  <Button
                    disabled={saveDobBtn}
                    onClick={(e) => handleUpdated(e)}
                    style={{ fontSize: "16px", marginTop: "10px" }}
                  >
                    Lưu
                  </Button>
                </form>
              ) : (
                <p>
                  {dob
                    ? new Date(dob).toLocaleDateString("vi-VN")
                    : "Không có thông tin"}
                </p>
              )}
            </div>

            <div>
              <Button
                disabled={editName || editEmail || editGender || editPhone}
                onClick={() => handleOpenEdit("Dob")}
                style={{ fontSize: "16px" }}
                variant="link"
              >
                {editDob ? "Hủy" : "Chỉnh sửa"}
              </Button>
            </div>
          </div>
          <div style={{ width: "100%", borderBottom: "2px solid #fff" }}></div>
          <div
            style={{
              display: "flex",
              padding: "40px 40px 30px 40px",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h5
                style={{
                  fontWeight: "bold",
                  fontSize: "20px",
                  marginBottom: "10px",
                }}
              >
                Giới tính
              </h5>
              {editGender ? (
                <form id="formGender">
                  <div>
                    <div>
                      <label>
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          checked={gender === "male"}
                          onChange={(e) => setGender(e.target.value)}
                          style={{ marginRight: "10px" }}
                        />
                        Nam
                      </label>
                    </div>

                    <div style={{ marginTop: "10px" }}>
                      <label>
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          checked={gender === "female"}
                          onChange={(e) => setGender(e.target.value)}
                          style={{ marginRight: "10px" }}
                        />
                        Nữ
                      </label>
                    </div>

                    <div style={{ marginTop: "10px" }}>
                      <label>
                        <input
                          type="radio"
                          name="gender"
                          value="other"
                          checked={gender === "other"}
                          onChange={(e) => setGender(e.target.value)}
                          style={{ marginRight: "10px" }}
                        />
                        Khác
                      </label>
                    </div>
                  </div>
                  <Button
                    disabled={saveGenderBtn}
                    onClick={(e) => handleUpdated(e)}
                    style={{ fontSize: "16px", marginTop: "10px" }}
                  >
                    Lưu
                  </Button>
                </form>
              ) : (
                <p>{gender ? handleGender(gender) : "Không có thông tin"}</p>
              )}
            </div>

            <div>
              <Button
                disabled={editName || editDob || editEmail || editPhone}
                onClick={() => handleOpenEdit("Gender")}
                style={{ fontSize: "16px" }}
                variant="link"
              >
                {editGender ? "Hủy" : "Chỉnh sửa"}
              </Button>
            </div>
          </div>
          <div style={{ width: "100%", borderBottom: "2px solid #fff" }}></div>
          <div
            style={{
              display: "flex",
              padding: "40px 40px 30px 40px",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h5
                style={{
                  fontWeight: "bold",
                  fontSize: "20px",
                  marginBottom: "10px",
                }}
              >
                Số điện thoại
              </h5>
              {editPhone ? (
                <form id="formPhone" onSubmit={handleUpdated}>
                  <input
                    style={{
                      padding: "8px",
                      fontSize: "16px",
                      border: "1px solid #ccc",
                      width: "100px",
                      marginRight: "10px",
                      backgroundColor: "white",
                    }}
                    type="text"
                    value={"+84"}
                    disabled={true}
                  />
                  <input
                    style={{
                      padding: "8px",
                      fontSize: "16px",
                      border: "1px solid #ccc",
                      width: "300px",
                    }}
                    type="text"
                    value={phone?.replace(/^0/, "")}
                    onChange={(e) => setPhone(e.target.value)}
                    onClick={() => setErrorPhone(false)}
                  />
                  <br />
                  {errorPhone ? (
                    <>
                      <p className="text-red-500">
                        Số điện thoại không hợp lệ!
                      </p>
                    </>
                  ) : (
                    ""
                  )}
                  <Button
                    disabled={savePhoneBtn}
                    style={{ fontSize: "16px", marginTop: "10px" }}
                  >
                    Lưu
                  </Button>
                </form>
              ) : (
                <p>{phone ? phone : "Không có thông tin"}</p>
              )}
            </div>

            <div>
              <Button
                disabled={editName || editDob || editGender || editEmail}
                onClick={() => handleOpenEdit("Phone")}
                style={{ fontSize: "16px" }}
                variant="link"
              >
                {editPhone ? "Hủy" : "Chỉnh sửa"}
              </Button>
            </div>
          </div>
          <div style={{ width: "100%", borderBottom: "2px solid #fff" }}></div>
          <div
            style={{
              display: "flex",
              padding: "40px 40px 30px 40px",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h5
                style={{
                  fontWeight: "bold",
                  fontSize: "20px",
                  marginBottom: "10px",
                }}
              >
                Địa chỉ email
              </h5>
              {editEmail ? (
                <form id="formEmail">
                  <input
                    style={{
                      padding: "8px",
                      fontSize: "16px",
                      border: "1px solid #ccc",
                      width: "300px",
                    }}
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onClick={() => setErrorEmail(false)}
                  />
                  <br />
                  {errorEmail ? (
                    <>
                      <p className="text-red-500">Email không hợp lệ!</p>
                    </>
                  ) : (
                    ""
                  )}
                  <Button
                    disabled={saveEmailBtn}
                    onClick={(e) => handleUpdated(e)}
                    style={{ fontSize: "16px", marginTop: "10px" }}
                  >
                    Lưu
                  </Button>
                </form>
              ) : (
                <p>{email ? email : "Không có thông tin"}</p>
              )}
            </div>

            <div>
              <Button
                disabled={editName || editDob || editGender || editPhone}
                onClick={() => handleOpenEdit("Email")}
                style={{ fontSize: "16px" }}
                variant="link"
              >
                {editEmail ? "Hủy" : "Chỉnh sửa"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default StaffAccount;
