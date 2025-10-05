import { Button } from "../../components/ui/button";
import AccountManageLayout from "../../components/AccountManageLayout";
import {  useEffect, useState } from "react";
import { userApi } from "../../services/userApi";
import { toast } from "../../hooks/use-toast";
import { useSelector } from "react-redux";

const UserProfile = () => {
  const user = useSelector((state) => state.auth.user);

  const MainLayout = ({ user }) => {
    const [name, setName] = useState(user?.fullName);
    const [editName, setEditName] = useState(false);
    const [dob, setDob] = useState(user?.dateOfBirth);
    const [editDob, setEditDob] = useState(false);
    const [email, setEmail] = useState(user?.email);
    const [editEmail, setEditEmail] = useState(false);
    const [phone, setPhone] = useState(user?.phone);
    const [editPhone, setEditPhone] = useState(false);
    const [gender, setGender] = useState(user?.gender);
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

    useEffect(() => {
      if (user.fullName !== name) {
        setSaveNameBtn(false);
      } else {
        setSaveNameBtn(true);
      }
      if (user.dateOfBirth !== dob) {
        setSaveDobBtn(false);
      } else {
        setSaveDobBtn(true);
      }
      if (user.email !== email) {
        setSaveEmailBtn(false);
      } else {
        setSaveEmailBtn(true);
      }
      if (user.phone !== phone) {
        setSavePhoneBtn(false);
      } else {
        setSavePhoneBtn(true);
      }
      if (user.gender !== gender) {
        setSaveGenderBtn(false);
      } else {
        setSaveGenderBtn(true);
      }
    }, [name, dob, email, phone, gender]);

    const disableBtnEdit = (key, type) => {
      const list = ["Name", "Dob", "Email", "Phone", "Gender"];
      const disableList = list.filter((item) => item !== key);
      disableList.forEach((item) => {
        if (!type) {
          document.getElementById(item).disabled = true;
        } else {
          document.getElementById(item).disabled = false;
        }
      });
    };

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
    const ValidateInput = () => {
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
          } else if (selectedUpdate === "Phone") {
            if (!handleValidatePhone(phone)) {
              setErrorPhone(true);
              return false;
            }
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
    const handleUpdated = async (e) => {
      // console.log("he");
      e.preventDefault();
      // Call API to update user info
      if (!ValidateInput()) {
        return;
      }
      const data = {
        _id: user._id,
        fullName: name ? name : user?.fullName,
        dateOfBirth: dob ? dob : user?.dateOfBirth,
        email: email ? email : user?.email,
        phone: phone ? "0" + phone.replace(/^0/, "") : user?.phone,
        gender: gender ? gender : user?.gender,
      };

      const res = await userApi.updateUserInfo(data);
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
    const ResetError = () => {
      setErrorName(false);
      setErrorDob(false);
      setErrorEmail(false);
      setErrorPhone(false);
    };
    const handleOpenEdit = (type) => {
      ResetError();
      if (type === "Name") {
        if (!editName) {
          setSelectedUpdate("Name");
          disableBtnEdit("Name", false);
          setEditName(true);
        } else {
          setSelectedUpdate("");
          disableBtnEdit("Name", true);
          setName(user?.fullName);
          setEditName(false);
        }
      } else if (type === "Dob") {
        if (!editDob) {
          setSelectedUpdate("Dob");
          disableBtnEdit("Dob", false);
          setEditDob(true);
        } else {
          setSelectedUpdate("");
          disableBtnEdit("Dob", true);
          setDob(user?.dateOfBirth);
          setEditDob(false);
        }
      } else if (type === "Email") {
        if (!editEmail) {
          setSelectedUpdate("Email");
          disableBtnEdit("Email", false);
          setEditEmail(true);
        } else {
          setSelectedUpdate("");
          disableBtnEdit("Email", true);
          setEmail(user?.email);
          setEditEmail(false);
        }
      } else if (type === "Phone") {
        if (!editPhone) {
          setSelectedUpdate("Phone");
          disableBtnEdit("Phone", false);
          setEditPhone(true);
        } else {
          setSelectedUpdate("");
          disableBtnEdit("Phone", true);
          setPhone(user?.phone);
          setEditPhone(false);
        }
      } else if (type === "Gender") {
        if (!editGender) {
          setSelectedUpdate("Gender");
          disableBtnEdit("Gender", false);
          setEditGender(true);
        } else {
          setSelectedUpdate("");
          disableBtnEdit("Gender", true);
          setGender(user?.gender);
          setEditGender(false);
        }
      }
    };
    return (
      <>
        <h4
          style={{
            marginTop: "30px",
            fontWeight: "bold",
            fontSize: "18px",
          }}
        >
          Thông tin cá nhân
        </h4>
        <div
          style={{
            width: "100%",
            marginTop: "10px",
            backgroundColor: "#f0f0f0",
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
                <form id="formName">
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
                    onClick={(e) => handleUpdated(e)}
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
                id="Name"
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
                id="Dob"
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
                id="Gender"
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
                <form id="formPhone">
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
                      <p className="text-red-500">Số điện thoại hợp lệ!</p>
                    </>
                  ) : (
                    ""
                  )}
                  <Button
                    disabled={savePhoneBtn}
                    onClick={(e) => handleUpdated(e)}
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
                id="Phone"
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
                id="Email"
                onClick={() => handleOpenEdit("Email")}
                style={{ fontSize: "16px" }}
                variant="link"
              >
                {editEmail ? "Hủy" : "Chỉnh sửa"}
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  };
  return (
    <AccountManageLayout
      path={"Thông tin tài khoản"}
      children={<MainLayout user={user} />}
    />
  );
};

export default UserProfile;
