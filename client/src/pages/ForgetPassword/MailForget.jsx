import { Button } from "../../components/ui/button";
import { Home, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "../../hooks/use-toast";
import { authApi } from "../../services/authApi";
import { useNavigate } from "react-router-dom";
import MyFacebookBtn from "../../components/customFBLoginBtn";
import { Link } from "react-router-dom";
import { useAuthFlow } from "../../hooks/AuthFlowContext";

const MailForget = () => {
  // Initialize useNavigate
  const navigate = useNavigate();

  //regex for email and password validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const { setEmail, setStep } = useAuthFlow();
  const [inputEmail, setInputEmail] = useState("");
  const [errorEmail, setErrorEmail] = useState(false);

  const handleNext = () => {
    // có thể validate email
    setEmail(inputEmail);
    setStep(2); // chuyển sang OTP
    navigate("/otp");
  };

  const validateEmail = () => {
    if (!inputEmail || !emailRegex.test(inputEmail)) {
      toast({
        title: "Không thể gửi OTP",
        description: "Email không hợp lệ, vui lòng kiểm tra lại!",
        variant: "destructive",
      });
      setErrorEmail(true);
      return false;
    }
    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;
    const res = await authApi.sendMail(inputEmail);
    console.log(res);

    if (res.status !== 200) {
      toast({
        title: "Không thể gửi OTP",
        description: res?.data.message,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Gửi OTP thành công",
      description: res?.data.message,
      variant: "primary",
    });
    handleNext()
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
              Nhập Email của bạn
            </h1>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Email"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  onClick={() => {
                    setErrorEmail(false);
                  }}
                  className="w-full px-4 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {errorEmail && (
                <div className="text-red-500 text-sm mb-5">
                  Vui lòng nhập email hợp lệ
                </div>
              )}
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2  font-medium">
                Gửi
              </button>
            </form>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-white hover:text-blue-700 text-blue-600 py-2  font-medium"
            >
              Hủy
            </button>
          </div>

          <div className="w-full max-w-lg bg-white rounded-lg  p-8">
            Chúng tôi sẽ gửi cho bạn một mã otp và email để kích hoạt việc đặt
            lại mật khẩu.
          </div>

        </div>
      </div>
    </div>
  );
};

export default MailForget;
