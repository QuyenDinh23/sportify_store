import { Button } from "../../components/ui/button";
import { Home, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "../../hooks/use-toast";
import { authApi } from "../../services/authApi";
import { useNavigate } from "react-router-dom";
import MyFacebookBtn from "../../components/customFBLoginBtn";
import { Link } from "react-router-dom";

const Register = () => {
  // Initialize useNavigate
  const navigate = useNavigate();

  //regex for email and password validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,64}$/;

  // State riêng cho form đăng ký
  const [fullName, setFullName] = useState("");
  const [emailRegister, setEmailRegister] = useState("");
  const [passwordRegister, setPasswordRegister] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordRegister, setShowPasswordRegister] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  //add Mail for login FB
  const [fbId, setFbId] = useState("");
  const [nameForFb, setNameForFb] = useState("");
  const [emailForFb, setEmailForFb] = useState("");
  const [showEmailForFb, setShowEmailForFb] = useState(false);
  const [errorEmailForFb, setErrorEmailForFb] = useState(false);
  // Error states
  const [errorName, setErrorName] = useState(false);
  const [errorEmailRegister, setErrorEmailRegister] = useState(false);
  const [errorPasswordRegister, setErrorPasswordRegister] = useState(false);
  const [errorConfirmPassword, setErrorConfirmPassword] = useState(false);

  const handleResponseFbLogin = async (response) => {
    const userData = {
      name: response.name,
      email: response.email,
      facebookId: response.id,
    };

    const res = await authApi.loginWithFb(
      userData.name,
      userData.email,
      userData.facebookId
    );
    if (res && res.needEmail) {
      setShowEmailForFb(true);
      setNameForFb(res.name);
      setFbId(res.fbId);
      setEmailForFb("");
    }
    if (res && res.accessToken) {
      const userInfo = await authApi.authMe();
      if (userInfo) {
        toast({
          title: "Đăng nhập thành công",
          description: "Chào mừng bạn đến với Sportify!",
          variant: "default",
        });
        if (userInfo.role === "admin") {
          navigate("/dashboard");
        } else if (userInfo.role === "staff") {
          navigate("/staff");
        } else {
          navigate("/");
        }
      }
    }
  };
  const RegisByFb = async (e) => {
    e.preventDefault();
    let hasError = false;
    if (!emailForFb.trim() || !emailRegex.test(emailForFb)) {
      setErrorEmailForFb(true);
      hasError = true;
    }
    if (hasError) {
      toast({
        title: "Thất bại",
        description: "Vui lòng nhập email hợp lệ!",
        variant: "destructive",
      });
      return;
    }
    const res = await authApi.loginWithFb(nameForFb, emailForFb, fbId);
    if (res && res.accessToken) {
      const userInfo = await authApi.authMe();
      if (userInfo) {
        toast({
          title: "Đăng nhập thành công",
          description: "Chào mừng bạn đến với Sportify!",
          variant: "default",
        });
        if (userInfo.role === "admin") {
          navigate("/dashboard");
        } else if (userInfo.role === "staff") {
          navigate("/staff");
        } else {
          navigate("/");
        }
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    // Validation đơn giản
    let hasError = false;

    if (!fullName.trim()) {
      setErrorName(true);
      hasError = true;
    } else {
      setErrorName(false);
    }

    if (!emailRegister.trim() || !emailRegex.test(emailRegister)) {
      setErrorEmailRegister(true);
      hasError = true;
    } else {
      setErrorEmailRegister(false);
    }
    if (!passwordRegister.trim() || !passwordRegex.test(passwordRegister)) {
      setErrorPasswordRegister(true);
      hasError = true;
    } else {
      setErrorPasswordRegister(false);
    }
    if (passwordRegister !== confirmPassword) {
      setErrorConfirmPassword(true);
      hasError = true;
    } else {
      setErrorConfirmPassword(false);
    }

    if (hasError) {
      toast({
        title: "Đăng ký thất bại",
        description: "Thông tin không hợp lệ, vui lòng kiểm tra lại!",
        variant: "destructive",
      });
      return;
    }
    const registerResponse = await authApi.register(
      fullName,
      emailRegister,
      passwordRegister
    );
    if (registerResponse) {
      toast({
        title: "Đăng ký thành công",
        description: "Bạn đã đăng ký tài khoản thành công!",
        variant: "default",
      });
      navigate("/login");
    }
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
          {showEmailForFb ? (
            <div className="w-full max-w-lg bg-white rounded-lg  p-8">
              <h1 className="text-2xl font-semibold text-gray-800 text-center mb-6">
                Nhập Email của bạn
              </h1>
              <form onSubmit={RegisByFb}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Email"
                    value={emailForFb}
                    onChange={(e) => setEmailForFb(e.target.value)}
                    onClick={() => {
                      setErrorEmailForFb(false);
                    }}
                    className="w-full px-4 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {errorEmailForFb && (
                  <div className="text-red-500 text-sm mb-5">
                    Vui lòng nhập email hợp lệ
                  </div>
                )}
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2  font-medium">
                  Thêm
                </button>
              </form>
            </div>
          ) : (
            <div className="w-full max-w-lg bg-white rounded-lg  p-8">
              <form onSubmit={handleRegister}>
                <h1 className="text-2xl font-semibold text-gray-800 text-center mb-6">
                  Đăng ký
                </h1>

                {/* Full Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập họ và tên"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onClick={() => setErrorName(false)}
                    className="w-full px-4 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {errorName && (
                  <div className="text-red-500 text-sm mb-5">
                    Vui lòng nhập họ và tên
                  </div>
                )}

                {/* Email */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Nhập email"
                    value={emailRegister}
                    onChange={(e) => setEmailRegister(e.target.value)}
                    onClick={() => setErrorEmailRegister(false)}
                    className="w-full px-4 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {errorEmailRegister && (
                  <div className="text-red-500 text-sm mb-5">
                    Vui lòng nhập email hợp lệ
                  </div>
                )}

                {/* Password */}
                <div className="mb-4 relative">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Mật khẩu
                  </label>
                  <input
                    type={showPasswordRegister ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={passwordRegister}
                    onChange={(e) => setPasswordRegister(e.target.value)}
                    onClick={() => setErrorPasswordRegister(false)}
                    className="w-full px-4 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswordRegister(!showPasswordRegister)
                    }
                    className="absolute right-2 top-1/2  text-gray-500 hover:text-gray-700"
                  >
                    {showPasswordRegister ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
                {errorPasswordRegister && (
                  <div className="text-red-500 text-sm mb-5">
                    Vui lòng nhập mật khẩu
                  </div>
                )}

                {/* Confirm Password */}
                <div className="mb-4 relative">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Xác nhận mật khẩu
                  </label>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onClick={() => setErrorConfirmPassword(false)}
                    className="w-full px-4 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2  text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
                {errorConfirmPassword && (
                  <div className="text-red-500 text-sm mb-5">
                    Mật khẩu xác nhận không khớp
                  </div>
                )}
                {/* Register button */}
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 font-medium">
                  Đăng ký
                </button>
              </form>
              {/* Separator */}
              <div className="flex items-center my-6">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="px-3 text-gray-500 text-sm">hoặc</span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>

              {/* Social logins */}
              <button className="w-full border border-gray-300 py-2  mb-3 flex items-center justify-center hover:bg-gray-200">
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="h-5 mr-2"
                />
                Đăng nhập với Google
              </button>

              <MyFacebookBtn onFbSuccess={handleResponseFbLogin} />
            </div>
          )}

          {/* Footer */}
          {!showEmailForFb ? (
            <div className="text-sm text-gray-600">
              Đã có tài khoản?{" "}
              <button
                variant="link"
                onClick={() => {
                  navigate("/login");
                }}
                className="text-blue-600 hover:underline"
              >
                Đăng nhập
              </button>
            </div>
          ) : (
            ""
          )}
          <div className="mt-6">
            Đăng nhập để luôn nắm bắt thông tin mới nhất từ Sportify
          </div>
          <ul className="list-disc space-y-2 w-full max-w-sm pl-3 text-gray-700 text-sm mt-4">
            <li>Tham gia Chương trình tích điểm miễn phí</li>
            <li>Chương trình giảm giá và ưu đãi độc quyền</li>
            <li>365 ngày đổi trả miễn phí với sản phẩm Sportify</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Register;
