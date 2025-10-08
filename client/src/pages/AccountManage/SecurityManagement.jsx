import { ChevronRight } from "lucide-react";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { MainNavigation } from "../../components/MainNavigation";
import AccountSideBar from "../../components/AccountSideBar";
import { Link } from "react-router-dom";
const SecurityMain = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MainNavigation />
      <main style={{ display: "flex" }}>
        <AccountSideBar path="security" />
        <div style={{ flex: 1, padding: "50px 150px" }}>
          <h1 style={{ fontSize: "25px", fontWeight: "bold" }}>Bảo mật</h1>
          <div style={{ marginTop: "10px" }}>
            Bảo mật tài khoản của bạn là ưu tiên hàng đầu của chúng tôi. Tìm tất
            cả công cụ kiểm soát quyền truy cập dưới đây.
          </div>
          <div
            style={{
              width: "100%",
              marginTop: "30px",
              backgroundColor: "#f0f0f0",
              border: "1px solid #f0f0f0",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
            }}
          >
            <Link to={'/account/security/password'}>
              <div
                style={{
                  display: "flex",
                  padding: "48px 48px 24px 48px",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ minHeight: "56px" }}>
                  <h5
                    style={{
                      fontWeight: "bold",
                      fontSize: "20px",
                      marginBottom: "2px",
                    }}
                  >
                    Mật khẩu
                  </h5>
                  <p>
                    Thường xuyên thay đổi mật khẩu của bạn để tăng cường mức độ
                    bảo mật dữ liệu.
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <ChevronRight />
                </div>
              </div>
            </Link>
            <div
              style={{ width: "100%", borderBottom: "2px solid #fff" }}
            ></div>
            <Link to={'/account/security/permissions'}>
              <div
                style={{
                  display: "flex",
                  padding: "24px 48px 48px 48px",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ minHeight: "56px" }}>
                  <h5
                    style={{
                      fontWeight: "bold",
                      fontSize: "20px",
                      marginBottom: "2px",
                    }}
                  >
                    Quản lý quyền truy cập của bên thứ ba
                  </h5>

                  <p>
                    Đảm bảo quyền kiểm soát phương pháp xác thực với dịch vụ bên
                    thứ ba.
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <ChevronRight />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
export default SecurityMain;
