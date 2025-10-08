import { useEffect, useState } from "react";
import { addressApi } from "../../services/addressApi";
import { Search } from "lucide-react";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { MainNavigation } from "../../components/MainNavigation";
import AccountSideBar from "../../components/AccountSideBar";
import { LoadingAnimation } from "../../components/ui/animation-loading";
const OrderHistory = () => {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MainNavigation />
      <main style={{ display: "flex" }}>
        <AccountSideBar path="order" />
        <div style={{ flex: 1, padding: "50px 150px" }}>
          <h1 style={{ fontSize: "25px", fontWeight: "bold" }}>
            Lịch sử mua hàng
          </h1>
          <>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                marginTop: "30px",
                position: "relative",
              }}
            >
              <div style={{ display: "flex", justifyContent: "start" }}>
                <div style={{ position: "relative" }}>
                  <Search
                    style={{ position: "absolute", top: "11px", left: "10px" }}
                    size={25}
                  />
                  <input
                    name="type"
                    placeholder="Tìm mã đơn hàng"
                    style={{
                      padding: "10px",
                      border: "1px solid #ccc",
                      width: "400px",
                      fontSize: "16px",
                      paddingLeft: "45px",
                    }}
                  />
                </div>
              </div>
              {loading ? <LoadingAnimation loading={loading} /> : <></>}
            </div>
          </>
        </div>
      </main>
      <Footer />
    </div>
  );
};
export default OrderHistory;
