import { useEffect, useState } from "react";
import { toast } from "../../hooks/use-toast";
import { addressApi } from "../../services/addressApi";
import { Trash, Edit } from "lucide-react";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { MainNavigation } from "../../components/MainNavigation";
import AccountSideBar from "../../components/AccountSideBar";
import { LoadingAnimation } from "../../components/ui/animation-loading";
import { Link } from "react-router-dom";
const AddressManage = () => {
  const [address, setAddress] = useState([]);
  const [loading, setLoading] = useState(false);
  const fetchAddress = async () => {
    try {
      const res = await addressApi.getAddress();
      setAddress(res);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    setLoading(true);
    fetchAddress();
  }, []);

  useEffect(() => {
    if (address.length === 0) return;
  }, [address]);

  const handleDeleteAddress = async (id) => {
    const res = await addressApi.deleteAddress(id);
    if (res) {
      toast({
        title: "Xóa địa chỉ thành công!",
        description: "",
        variant: "default",
      });
      await fetchAddress();
    } else {
      toast({
        title: "Xóa địa chỉ thất bại!",
        description: "",
        variant: "danger",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MainNavigation />
      <main style={{ display: "flex" }}>
        <AccountSideBar path="address" />
        <div style={{ flex: 1, padding: "50px 150px" }}>
          <h1 style={{ fontSize: "25px", fontWeight: "bold" }}>
            Quản lý địa chỉ
          </h1>
          <>
            <div style={{ marginTop: "30px" }}>
              Vui lòng cập nhật chi tiết địa chỉ để lưu lại thông tin giao hàng.
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                marginTop: "20px",
                position: "relative",
              }}
            >
              {loading ? (
                <LoadingAnimation loading={loading} />
              ) : (
                <>
                  {address?.map((a) => {
                    return (
                      <div
                        key={a._id}
                        style={{
                          width: "400px",
                          height: "190px",
                          border: "1px solid #ccc",
                          margin: "5px",
                          padding: "15px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "end",
                            height: "35px",
                            alignItems: "end",
                            marginRight: "15px",
                          }}
                        >
                          <Link to={`/account/address/edit/${a._id}`}>
                            <Edit
                              size={20}
                              color="#60A5FA"
                              style={{ marginRight: "25px", cursor: "pointer" }}
                            />
                          </Link>
                          <Trash
                            style={{ cursor: "pointer" }}
                            onClick={() => handleDeleteAddress(a._id)}
                            size={20}
                            color="#60A5FA"
                          />
                        </div>
                        <div style={{ marginTop: "18px" }}>
                          <div style={{ fontWeight: "bold" }}>{a?.type}</div>
                          <div
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {a?.note +
                              " " +
                              a?.street +
                              " " +
                              a?.ward.name +
                              " " +
                              a?.district.name +
                              " " +
                              a?.city.name}
                          </div>
                          <div>{a?.country}</div>
                          <div style={{ display: "flex", marginTop: "10px" }}>
                            <p className="bg-primary text-white pl-2 pr-2">
                              {a?.isDefault ? "Địa chỉ mặc định" : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div
                    className="text-primary"
                    style={{
                      width: "400px",
                      height: "190px",
                      border: "1px solid #ccc",
                      margin: "5px",
                      fontSize: "17px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Link to={"/account/address/add"}>
                      <button>+ Thêm địa chỉ mới</button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </>
        </div>
      </main>
      <Footer />
    </div>
  );
};
export default AddressManage;
