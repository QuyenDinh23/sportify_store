import { Button } from "../../components/ui/button";
import { Home } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "../../hooks/use-toast";
import { authApi } from "../../services/authApi";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useAuthFlow } from "../../hooks/AuthFlowContext";

const OtpScreen = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputsRef = useRef([]);
  const [timeLeft, setTimeLeft] = useState(1 * 60);
  const { email, step, setStep } = useAuthFlow();
  // Initialize useNavigate
  const navigate = useNavigate();
  // chặn truy cập tự do

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  if (step < 2 || !email) {
    navigate("/force-reset-password");
  }

  const editEmailInput = () => {
    setStep(1);
    navigate("/force-reset-password");
  };

  const handleSubmitOtp = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (!otpString) {
      toast({
        title: "Không thể xác thực OTP",
        description: "OTP không hợp lệ, vui lòng kiểm tra lại!",
        variant: "destructive",
      });
      return;
    }
    const res = await authApi.verifyOtp({ email, otpString });
    if (res.status !== 200) {
      toast({
        title: "xác thực OTP thất bại",
        description: res?.data.message,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Xác thực OTP thành công",
      description: res?.data.message,
      variant: "primary",
    });
    setStep(3);
    navigate("/reset-password");
  };

  const handleResendOtp = async () => {
    const res = await authApi.sendMail(email);

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
    setTimeLeft(60);
  };

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return; // chỉ cho phép số
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // chỉ lấy 1 ký tự
    setOtp(newOtp);
    console.log(otp);

    // focus ô tiếp theo
    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const inputContainerStyle = {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "24px",
  };

  const inputStyle = {
    width: "60px",
    height: "60px",
    textAlign: "center",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "18px",
    outline: "none",
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
              Quên mật khẩu?
            </h1>
            <p style={{ marginBottom: "16px" }}>
              Bạn sẽ nhận được mã để đặt lại mật khẩu
            </p>
            <form onSubmit={handleSubmitOtp}>
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
              <div>
                <p>Mã đã được gửi đi</p>
              </div>
              <div style={inputContainerStyle}>
                {otp.map((value, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputsRef.current[idx] = el)}
                    type="text"
                    maxLength={1}
                    value={value}
                    onChange={(e) => handleChange(e, idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    style={inputStyle}
                  />
                ))}
              </div>
              <button
                disabled={otp.includes("")}
                className="w-full bg-blue-600 text-white py-2 font-medium 
             hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
              >
                TIẾP TỤC
              </button>
            </form>
            <button
              disabled={timeLeft !== 0}
              onClick={handleResendOtp}
              className="w-full bg-white text-blue-600 py-2 font-medium 
             hover:text-blue-700 
             disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:text-blue-600"
            >
              Gửi mã mới ({timeLeft})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpScreen;
