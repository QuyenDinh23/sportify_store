import { useEffect, useState } from "react";
import { Search, Package, Calendar, DollarSign, MapPin, Eye } from "lucide-react";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { MainNavigation } from "../../components/MainNavigation";
import AccountSideBar from "../../components/AccountSideBar";
import { LoadingAnimation } from "../../components/ui/animation-loading";
import { getUserOrders } from "../../api/order/orderApi";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const OrderHistory = () => {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await getUserOrders({ status: 'delivered' });
      setOrders(response?.data?.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Không thể tải lịch sử đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-purple-100 text-purple-800";
      case "shipped":
        return "bg-cyan-100 text-cyan-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "returned":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: "Chờ xử lý",
      confirmed: "Đã xác nhận",
      processing: "Đang xử lý",
      shipped: "Đã gửi hàng",
      delivered: "Đã giao hàng",
      cancelled: "Đã hủy",
      returned: "Đã hoàn trả",
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items?.some((item) =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MainNavigation />
      <main style={{ display: "flex" }}>
        <AccountSideBar path="order" />
        <div style={{ flex: 1, padding: "50px 150px" }}>
          <h1 className="text-3xl font-bold mb-6">Lịch sử mua hàng</h1>

          {/* Search bar */}
          <div style={{ marginTop: "30px", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "start" }}>
              <div style={{ position: "relative" }}>
                <Search
                  style={{ position: "absolute", top: "11px", left: "10px" }}
                  size={25}
                  className="text-muted-foreground"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm mã đơn hàng hoặc tên sản phẩm"
                  style={{
                    padding: "10px",
                    border: "1px solid #ccc",
                    width: "400px",
                    fontSize: "16px",
                    paddingLeft: "45px",
                    borderRadius: "8px",
                  }}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <LoadingAnimation loading={loading} />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-20">
              <Package className="mx-auto h-24 w-24 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm ? "Không tìm thấy đơn hàng" : "Chưa có đơn hàng nào"}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Thử tìm kiếm với từ khóa khác"
                  : "Khi bạn đặt hàng, lịch sử sẽ hiển thị ở đây"}
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-card border border-border rounded-lg p-6 space-y-4"
                >
                  {/* Order header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          Đơn hàng: {order.orderNumber}
                        </h3>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span>
                            {order.totalAmount?.toLocaleString("vi-VN")}đ
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <Link to={`/order-detail/${order._id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        Xem chi tiết
                      </Link>
                    </Button>
                  </div>

                  {/* Order items */}
                                     <div className="border-t border-border pt-4">
                     <div className="space-y-3">
                       {order.items?.map((item, index) => {
                         // Get image from multiple possible sources
                         const productImage = item.image 
                           || item.productId?.images?.[0] 
                           || (typeof item.productId === 'object' && item.productId?.images?.[0])
                           || null;
                         
                         const productName = item.name 
                           || item.productId?.name 
                           || (typeof item.productId === 'object' && item.productId?.name)
                           || 'Sản phẩm không tồn tại';

                         return (
                           <div
                             key={index}
                             className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg"
                           >
                             <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                               {productImage ? (
                                 <img
                                   src={productImage}
                                   alt={productName}
                                   className="w-full h-full object-cover rounded"
                                 />
                               ) : (
                                 <Package className="h-8 w-8 text-muted-foreground" />
                               )}
                             </div>
                             <div className="flex-1">
                               <h4 className="font-medium">{productName}</h4>
                               <div className="text-sm text-muted-foreground mt-1">
                                 <span>Số lượng: {item.quantity}</span>
                                 {item.selectedColor && (
                                   <span className="ml-4">
                                     Màu: {item.selectedColor}
                                   </span>
                                 )}
                                 {item.selectedSize && (
                                   <span className="ml-4">
                                     Size: {item.selectedSize}
                                   </span>
                                 )}
                               </div>
                             </div>
                             <div className="text-right">
                               <p className="font-semibold">
                                 {item.price?.toLocaleString("vi-VN")}đ
                               </p>
                               <p className="text-sm text-muted-foreground">
                                 Tổng:{" "}
                                 {(item.price * item.quantity)?.toLocaleString(
                                   "vi-VN"
                                 )}
                                 đ
                               </p>
                             </div>
                           </div>
                         );
                       })}
                     </div>
                   </div>

                  {/* Shipping address */}
                  {order.shippingAddress && (
                    <div className="border-t border-border pt-4">
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mt-1" />
                        <div>
                          <p className="font-medium text-foreground mb-1">
                            Địa chỉ giao hàng
                          </p>
                          <p>{order.shippingAddress.fullName}</p>
                          <p>{order.shippingAddress.phone}</p>
                          <p className="line-clamp-2">
                            {order.shippingAddress.street},{" "}
                            {order.shippingAddress.ward?.name},{" "}
                            {order.shippingAddress.district?.name},{" "}
                            {order.shippingAddress.city?.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderHistory;
