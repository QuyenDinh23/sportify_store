import { Home, ShieldCheck, ShoppingCart, User, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { authApi } from "../services/authApi";
import { useEffect } from "react";

const AccountSideBar = ({ path }) => {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  useEffect(() => {
    document.getElementById(path).style.color = "#F09342";
    document
      .getElementById(path)
      .firstElementChild.setAttribute(
        "class",
        "h-6 w-6 transition-all duration-300 stroke-[#F09342] fill-[#F09342]"
      );
  }, [path]);
  const handleLogOut = async () => {
    await authApi.logout();
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          position: "relative",
          left: "0",
          height: "100%",
          width: "350px",
          minHeight: "500px",
        }}
        className="bg-primary"
      >
        <div
          style={{
            width: "100%",
            height: "90px",
            display: "flex",
            backgroundColor: "#f0f0f0",
            alignItems: "center",
            justifyContent: "start",
          }}
        >
          <div style={{ margin: "0 20px" }}>
            <img
              width="40px"
              height="40px"
              style={{
                borderRadius: "50%",
                padding: "8px",
                cursor: "pointer",
                backgroundColor: "#F09342",
              }}
              src="https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png?20200919003010"
              alt=""
            />
          </div>
          <div style={{ color: "#F09342" }}>
            <div
              style={{
                fontSize: "20px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Cập nhật thông tin
            </div>
            <div>Số Tài Khoản: {user?.userNumber}</div>
          </div>
        </div>
        <ul
          style={{
            listStyle: "none",
            margin: "20px 0 0 0",
            padding: 0,
            color: "#fff",
            fontWeight: "bold",
          }}
        >
          <li
            onClick={() => navigate("/account/profile")}
            id="profile"
            style={{
              padding: "12px 20px",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <User className="h-6 w-6 text-white" />{" "}
            <p style={{ marginLeft: "20px" }}>Thông tin tài khoản</p>
          </li>
          <li
            onClick={() => navigate("/account/address")}
            id="address"
            style={{
              padding: "12px 20px",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <Home className="h-6 w-6 text-white" />
            <p style={{ marginLeft: "20px" }}>Địa chỉ của tôi</p>
          </li>
          <li
            onClick={() => navigate("/account/order")}
            id="order"
            style={{
              padding: "12px 20px",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <ShoppingCart className="h-6 w-6 text-white" />{" "}
            <p style={{ marginLeft: "20px" }}>Lịch sử mua hàng</p>
          </li>
          <li
            onClick={() => navigate("/account/warranty")}
            id="warranty"
            style={{
              padding: "12px 20px",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <Shield className="h-6 w-6 text-white" />{" "}
            <p style={{ marginLeft: "20px" }}>Yêu cầu bảo hành</p>
          </li>
          <li
            onClick={() => navigate("/account/security")}
            id="security"
            style={{
              padding: "12px 20px",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <ShieldCheck className="h-6 w-6 text-white" />{" "}
            <p style={{ marginLeft: "20px" }}>Bảo mật</p>
          </li>
        </ul>
        <button
          style={{
            position: "absolute",
            top: "440px",
            left: "20px",
            padding: "5px 20px",
            color: "#fff",
            border: "2px solid #fff",
            borderRadius: "50px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
          onClick={() => handleLogOut()}
        >
          Đăng xuất
        </button>
      </div>
      <div></div>
    </div>
  );
};
export default AccountSideBar;
