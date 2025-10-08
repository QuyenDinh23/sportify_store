import { ChevronLeft, X, Check } from "lucide-react";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { MainNavigation } from "../../components/MainNavigation";
import AccountSideBar from "../../components/AccountSideBar";
import { Link } from "react-router-dom";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { useEffect, useState } from "react";
import { userApi } from "../../services/userApi";
import { toast } from "sonner";
const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [rule, setRule] = useState({
    rule1: false,
    rule2: false,
    rule3: false,
    rule4: false,
    rule5: false,
  });
  const [btnSaveStatus, setBtnSaveStatus] = useState(true);
  const [invalidPassword, setInvalidPassword] = useState(false);
  const [errorConfirmPassword, setErrorConfirmPassword] = useState(false);
  const [wrongOldPassword, setWrongOldPassword] = useState(false);

  const handlePasswordChange = (password) => {
    setRule({
      rule1: /[A-Z]/.test(password), // Có chữ hoa
      rule2: /[a-z]/.test(password), // Có chữ thường
      rule3: /[0-9]/.test(password), // Có chữ số
      rule4: /[^A-Za-z0-9]/.test(password), // Có ký tự đặc biệt
      rule5: password.trim().length >= 8, // Dài ít nhất 8 ký tự
    });
  };

  const handleReset = () => {
  setOldPassword("");
  setPassword("");
  setPasswordConfirm("");
  setRule({
    rule1: false,
    rule2: false,
    rule3: false,
    rule4: false,
    rule5: false,
  });
  setBtnSaveStatus(true);
  setInvalidPassword(false);
  setErrorConfirmPassword(false);
  setWrongOldPassword(false);
};
  useEffect(() => {
    handlePasswordChange(password);
  }, [password]);

  const validate = () => {
    if (
      !/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password)
    ) {
      setInvalidPassword(true);
      return false;
    }
    if (password.trim() !== passwordConfirm.trim()) {
      setErrorConfirmPassword(true);
      return false;
    }
    return true;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await userApi.ChangePassword(oldPassword, password);
      toast.success("Đổi mật khẩu thành công!", {
        style: {
          background: "#e6ffed", // nền xanh nhạt
          color: "#0f5132", // chữ xanh đậm
          border: "1px solid #badbcc",
        },
      });
      handleReset();
    } catch (error) {
      setWrongOldPassword(true);
      toast.error("Đổi mật khẩu thất bại!", {
        description: "Mật khẩu hiện tại không đúng!",
        style: {
          background: "#f8d7da",
          color: "#842029",
          border: "1px solid #f5c2c7",
        },
      });
    }
  };
  useEffect(() => {
    if (
      !/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(
        password
      ) ||
      !oldPassword.trim() ||
      !passwordConfirm.trim()
    ) {
      setBtnSaveStatus(true);
      return;
    }
    setBtnSaveStatus(false);
  }, [password, oldPassword, passwordConfirm]);
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MainNavigation />
      <main style={{ display: "flex" }}>
        <AccountSideBar path="security" />
        <div style={{ flex: 1, padding: "50px 150px" }}>
          <h1 style={{ fontSize: "25px", fontWeight: "bold" }}>Mật khẩu</h1>
          <Link
            to={"/account/security"}
            className="text-primary"
            style={{
              marginTop: "10px",
              display: "flex",
              alignItems: "center",
              fontWeight: "bold",
            }}
          >
            <ChevronLeft />{" "}
            <span style={{ marginLeft: "5px", fontSize: "18px" }}>Bảo mật</span>
          </Link>
          <div
            style={{
              width: "100%",
              marginTop: "30px",
              backgroundColor: "#f0f0f0",
              border: "1px solid #f0f0f0",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
            }}
          >
            <div
              style={{
                display: "flex",
                padding: "48px 48px 48px 48px",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h6
                  style={{
                    marginBottom: "17px",
                    color: "#000",
                    fontSize: "17px",
                  }}
                >
                  Mật khẩu phải đảm bảo độ bảo mật tối thiểu.
                </h6>
                <p style={{ fontSize: "15px", marginBottom: "17px" }}>
                  Tất cả các mục đều bắt buộc
                </p>
                <form onSubmit={handleChangePassword}>
                  <div style={{ marginBottom: "40px" }}>
                    <label
                      style={{
                        color: "#000",
                        fontSize: "17px",
                      }}
                    >
                      Mật khẩu hiện tại
                      <Input
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        style={{ marginTop: "5px" }}
                        type="password"
                        onInput={() => setWrongOldPassword(false)}
                      />
                      {wrongOldPassword ? (
                        <p style={{ color: "red", fontSize: "13px" }}>
                          Vui lòng nhập đúng mật khẩu!
                        </p>
                      ) : (
                        ""
                      )}
                    </label>
                  </div>
                  <div style={{ marginBottom: "20px" }}>
                    <label
                      style={{
                        color: "#000",
                        fontSize: "17px",
                      }}
                    >
                      Mật khẩu mới
                      <Input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ marginTop: "5px" }}
                        type="password"
                        onInput={() => setInvalidPassword(false)}
                      />
                      {invalidPassword ? (
                        <p style={{ color: "red", fontSize: "13px" }}>
                          Vui lòng nhập mật khẩu mới đảm bảo bảo mật!
                        </p>
                      ) : (
                        ""
                      )}
                    </label>
                  </div>

                  <div style={{ marginBottom: "40px" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {!rule.rule1 ? (
                        <X size={16} color="#E3262F" />
                      ) : (
                        <Check size={16} color="#149A64" />
                      )}
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          marginLeft: "10px",
                        }}
                      >
                        1 ký tự viết hoa
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {!rule.rule2 ? (
                        <X size={16} color="#E3262F" />
                      ) : (
                        <Check size={16} color="#149A64" />
                      )}
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          marginLeft: "10px",
                        }}
                      >
                        1 ký tự viết thường
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {!rule.rule3 ? (
                        <X size={16} color="#E3262F" />
                      ) : (
                        <Check size={16} color="#149A64" />
                      )}
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          marginLeft: "10px",
                        }}
                      >
                        1 chữ số
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {!rule.rule4 ? (
                        <X size={16} color="#E3262F" />
                      ) : (
                        <Check size={16} color="#149A64" />
                      )}
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          marginLeft: "10px",
                        }}
                      >
                        1 kí tự đặc biệt
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {!rule.rule5 ? (
                        <X size={16} color="#E3262F" />
                      ) : (
                        <Check size={16} color="#149A64" />
                      )}
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          marginLeft: "10px",
                        }}
                      >
                        Tối thiểu 8 ký tự
                      </span>
                    </div>
                  </div>
                  <div style={{ marginBottom: "40px" }}>
                    <label
                      style={{
                        color: "#000",
                        fontSize: "17px",
                      }}
                    >
                      Xác nhận mật khẩu mới
                      <Input
                        onInput={() => setErrorConfirmPassword(false)}
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        style={{ marginTop: "5px" }}
                        type="password"
                      />
                      {errorConfirmPassword ? (
                        <p style={{ color: "red", fontSize: "13px" }}>
                          Mật khẩu phải giống nhau!
                        </p>
                      ) : (
                        ""
                      )}
                    </label>
                  </div>
                  <Button disabled={btnSaveStatus}>Đổi mật khẩu</Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
export default ChangePassword;
