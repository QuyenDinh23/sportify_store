import { ChevronLeft, X, Check } from "lucide-react";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { MainNavigation } from "../../components/MainNavigation";
import AccountSideBar from "../../components/AccountSideBar";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { userApi } from "../../services/userApi";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import { Button } from "../..//components/ui/button";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
const PermissopnAccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [listAccess, setListAccess] = useState([]);
  const [open, setOpen] = useState(false);

  const handleCancel = () => {
    setOpen(false);
  };

  useEffect(() => {
    // if (!user) return;
    setListAccess((prev) => {
      const next = [...prev];

      if (user.fbId && !next.find((item) => item.key === "fbId")) {
        next.push({ key: "fbId", value: user.fbId });
      }

      if (user.googleId && !next.find((item) => item.key === "googleId")) {
        next.push({ key: "googleId", value: user.googleId });
      }

      return next;
    });
  }, [user]);

  const handleDeleteAccess = async (e, key) => {
    e.preventDefault();
    setOpen(false);
    let data = {};
    if (key === "fbId") {
      data = { fbId: "" };
    }
    if (key === "googleId") {
      data = { googleId: "" };
    }
    try {
      await userApi.updateUserInfo(data, dispatch);
      toast.success("Xóa liên kết thành công!", {
        style: {
          background: "#e6ffed", // nền xanh nhạt
          color: "#0f5132", // chữ xanh đậm
          border: "1px solid #badbcc",
        },
      });
      setTimeout(() => {
        navigate(0); // reload trang hiện tại
      }, 1000);
    } catch (error) {
      toast.error("Xóa liên kết thất bại!", {
        style: {
          background: "#f8d7da",
          color: "#842029",
          border: "1px solid #f5c2c7",
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MainNavigation />
      <main style={{ display: "flex" }}>
        <AccountSideBar path="security" />
        <div style={{ flex: 1, padding: "50px 150px" }}>
          <h1 style={{ fontSize: "25px", fontWeight: "bold" }}>
            Quản lý quyền truy cập của bên thứ ba
          </h1>
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
                <p
                  style={{
                    marginBottom: "17px",
                    color: "#000",
                    fontSize: "16px",
                  }}
                >
                  Vui lòng kiểm tra các dịch vụ bên thứ 3 có liên kết với tài
                  khoản Sportify để xác nhận bên dưới. Những dịch vụ này đang
                  truy cập thông tin tài khoản Sportify của bạn. Xóa quyền truy
                  cập nếu bạn không tin tưởng dịch vụ này. Điều này là cần thiết
                  nếu bạn phát hiện có người truy cập tài khoản Sportify của bạn
                  sử dụng dịch vụ của bên thứ 3 hoặc bạn không muốn chia sẻ
                  thông tin giữa Sportify và dịch vụ của một bên thứ 3.
                </p>
                {listAccess.length === 0 ? (
                  <p style={{ fontSize: "15px" }}>
                    Hiện không có dịch vụ của bên thứ ba liên kết với tài khoản
                    Sportify của bạn.
                  </p>
                ) : (
                  ""
                )}
                <ul>
                  {listAccess?.map((item) => {
                    return (
                      <form>
                        <li
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                          key={item.value}
                        >
                          <div>
                            <div
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <div
                                style={{
                                  width: "48px",
                                  height: "48px",
                                  backgroundColor: "#ccc",
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  boxSizing: "border-box",
                                  borderRadius: "5px",
                                }}
                              >
                                <img
                                  style={{
                                    width: "20px",
                                    height: "20px",
                                    margin: "0px",
                                  }}
                                  src={
                                    item.key === "googleId"
                                      ? "https://www.svgrepo.com/show/475656/google-color.svg"
                                      : "https://www.svgrepo.com/show/448224/facebook.svg"
                                  }
                                  alt=""
                                  className="h-5 mr-2"
                                />
                              </div>
                              <span
                                style={{
                                  marginLeft: "15px",
                                  fontWeight: "500",
                                  fontSize: "16px",
                                }}
                              >
                                {item.key === "googleId"
                                  ? "Google"
                                  : "Facebook"}
                              </span>
                            </div>
                          </div>
                          <div>
                            <Dialog open={open} onOpenChange={setOpen}>
                              <DialogTrigger asChild>
                                <button
                                  onClick={() => setOpen(true)}
                                  className="text-primary"
                                  style={{
                                    padding: "11px 23px",
                                    fontSize: "16px",
                                    fontWeight: "bold",
                                    border: "2px solid #ccc",
                                    maxHeight: "48px",
                                  }}
                                >
                                  Hủy
                                </button>
                              </DialogTrigger>

                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>
                                    Hủy{" "}
                                    {item.key === "googleId"
                                      ? "Google"
                                      : "Facebook"}
                                  </DialogTitle>
                                  <DialogDescription>
                                    Bạn đang yêu cầu hủy quyền truy cập của{" "}
                                    {item.key === "googleId"
                                      ? "Google"
                                      : "Facebook"}{" "}
                                    vào tài khoản của bạn. Vui lòng xác nhận.
                                    Thao tác này sẽ không xóa tài khoản Sportify
                                    của bạn.
                                  </DialogDescription>
                                </DialogHeader>

                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={handleCancel}
                                  >
                                    Hủy
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    type="submit"
                                    onClick={(e) =>
                                      handleDeleteAccess(e, item.key)
                                    }
                                  >
                                    Xác nhận
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </li>
                      </form>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
export default PermissopnAccess;
