import { Button } from "../../components/ui/button";
import { X, Check } from "lucide-react";
import { Home, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "../../hooks/use-toast";
import { authApi } from "../../services/authApi";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuthFlow } from "../../hooks/AuthFlowContext";

const ResetPasswordScreen = () => {
  // Initialize useNavigate
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { email, step, setStep } = useAuthFlow();
  const [errorPassword, setErrorPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [rule, setRule] = useState({
    rule1: false,
    rule2: false,
    rule3: false,
    rule4: false,
    rule5: false,
  });

  const handlePasswordChange = (password) => {
    setRule({
      rule1: /[A-Z]/.test(password), // Có chữ hoa
      rule2: /[a-z]/.test(password), // Có chữ thường
      rule3: /[0-9]/.test(password), // Có chữ số
      rule4: /[^A-Za-z0-9]/.test(password), // Có ký tự đặc biệt
      rule5: password.trim().length >= 8, // Dài ít nhất 8 ký tự
    });
  };

  useEffect(() => {
    handlePasswordChange(password);
  }, [password]);

  if (step < 3) {
    return <p>Bạn chưa xác thực OTP!</p>;
  }
  const validatePassword = () => {
    if (
      !password ||
      !/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password)
    ) {
      toast({
        title: "Đổi mật khẩu thất bại",
        description: "Mật khẩu không hợp lệ, vui lòng kiểm tra lại!",
        variant: "destructive",
      });
      setErrorPassword(true);
      return false;
    }
    return true;
  };
  const editEmailInput = () => {
    setStep(1);
    navigate("/force-reset-password");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    const res = await authApi.resetPassword({ email, password });
    if (res.status !== 200) {
      toast({
        title: "Đổi mật khẩu thất bại",
        description: res?.data.message,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Đổi mật khẩu thành công",
      description: res?.data.message,
      variant: "primary",
    });
    navigate("/login");
  };

  return (
    <div style={{ backgroundColor: "#fefdfe ", height: "100vh" }}>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px",
          backgroundColor: "#fefdfe",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
        id="navbar-login"
      >
        <Link to={"/"}>
          <Button style={{ color: "black" }} variant="link" size="lg">
            <Home className="w-5 h-5" />
            <p className="text-sm">Quay lại</p>
          </Button>
        </Link>
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            width: "250px",
            cursor: "pointer",
          }}
        >
          <img src="logo.png" alt="" />
        </div>
        <div></div>
      </div>
      <div
        style={{
          marginTop: "85px",
          display: "flex",
        }}
        id="login-features"
      >
        <div style={{ position: "static", width: "50vw" }}>
          <div
            style={{
              position: "fixed",
              left: 0,
              backgroundImage: "url('thumnailLogin.png')",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              width: "50vw",
              height: "100vh",
            }}
          ></div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "50vw",
            padding: "0 40px",
          }}
        >
          <div className="w-full max-w-lg bg-white rounded-lg  p-8">
            <h1 className="text-2xl font-semibold text-gray-800 text-center mb-6">
              Nhập mật khẩu
            </h1>
            <div
              style={{
                marginBottom: "16px",
                fontWeight: "bold",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <p>{email}</p>
              <button
                onClick={editEmailInput}
                style={{ textDecoration: "underline" }}
              >
                Chỉnh sửa
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4 relative">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Điền mật khẩu mới
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onClick={() => {
                    setErrorPassword(false);
                  }}
                  className="w-full px-4 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="  text-gray-500 hover:text-gray-700"
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "10px",
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errorPassword && (
                <div className="text-red-500 text-sm mb-5">
                  Mật khẩu chưa hợp lệ. Đảm bảo đáp ứng các yêu cầu cho mật
                  khẩu.
                </div>
              )}
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
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2  font-medium">
                Xác nhận
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordScreen;
