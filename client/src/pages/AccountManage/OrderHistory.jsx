import { useEffect, useState } from "react";
import { Search, Package, Calendar, DollarSign, MapPin, Eye, ShieldCheck } from "lucide-react";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { MainNavigation } from "../../components/MainNavigation";
import AccountSideBar from "../../components/AccountSideBar";
import { LoadingAnimation } from "../../components/ui/animation-loading";
import { getUserOrders } from "../../api/order/orderApi";
import { getMyWarrantyRequests } from "../../api/warranty/warrantyApi";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const OrderHistory = () => {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [warranties, setWarranties] = useState([]);
  const [warrantyMap, setWarrantyMap] = useState(new Map());
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
    fetchWarranties();
  }, [filter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Only pass status filter to API if it's not 'has_warranty' or 'all'
      const params = (filter === 'all' || filter === 'has_warranty') 
        ? {} 
        : { status: filter };
      const response = await getUserOrders(params);
      setOrders(response?.data?.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Không thể tải lịch sử đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const fetchWarranties = async () => {
    try {
      const data = await getMyWarrantyRequests({});
      setWarranties(data || []);
      
      // Create a map for easy lookup: key = "orderId_productId"
      const map = new Map();
      data.forEach((warranty) => {
        // Convert to string for consistent comparison
        const orderId = warranty.orderId 
          ? (warranty.orderId._id?.toString() || warranty.orderId.toString())
          : null;
        const productId = warranty.productId 
          ? (warranty.productId._id?.toString() || warranty.productId.toString())
          : null;
        if (orderId && productId) {
          const key = `${orderId}_${productId}`;
          // Store all warranties for this product in order (in case there are multiple)
          if (!map.has(key)) {
            map.set(key, []);
          }
          map.get(key).push(warranty);
        }
      });
      setWarrantyMap(map);
    } catch (error) {
      console.error("Error fetching warranties:", error);
      // Don't show error toast for warranties, as it's not critical
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
      pending: "Chờ xác nhận",
      confirmed: "Đã xác nhận",
      processing: "Đang xử lý",
      shipped: "Đang giao",
      delivered: "Đã giao",
      cancelled: "Đã hủy",
      returned: "Đã trả",
    };
    return statusMap[status] || status;
  };

  const getWarrantyStatusConfig = (status) => {
    const config = {
      pending: { label: "Đang chờ", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
      processing: { label: "Đang xử lý", color: "bg-blue-100 text-blue-800 border-blue-300" },
      completed: { label: "Hoàn thành", color: "bg-green-100 text-green-800 border-green-300" },
      rejected: { label: "Từ chối", color: "bg-red-100 text-red-800 border-red-300" },
    };
    return config[status] || config.pending;
  };

  const getWarrantyForItem = (orderId, productId) => {
    // Convert to string for consistent comparison
    const productIdStr = productId 
      ? (typeof productId === 'object' ? (productId._id?.toString() || productId.toString()) : productId.toString())
      : null;
    const orderIdStr = orderId 
      ? (typeof orderId === 'object' ? (orderId._id?.toString() || orderId.toString()) : orderId.toString())
      : null;
    
    if (!orderIdStr || !productIdStr) return [];
    
    const key = `${orderIdStr}_${productIdStr}`;
    return warrantyMap.get(key) || [];
  };

  // Get all warranties for an order
  const getOrderWarranties = (orderId) => {
    const orderIdStr = orderId 
      ? (typeof orderId === 'object' ? (orderId._id?.toString() || orderId.toString()) : orderId.toString())
      : null;
    
    if (!orderIdStr) return [];

    // Get all warranties for this order from all items
    const orderWarranties = [];
    warrantyMap.forEach((warranties, key) => {
      if (key.startsWith(`${orderIdStr}_`)) {
        orderWarranties.push(...warranties);
      }
    });

    return orderWarranties;
  };

  // Get the primary warranty status for an order (most recent or most important)
  const getOrderWarrantyStatus = (order) => {
    const orderWarranties = getOrderWarranties(order._id);
    if (orderWarranties.length === 0) return null;

    // Sort by date (newest first) and get the most recent one
    const sortedWarranties = orderWarranties.sort((a, b) => 
      new Date(b.createdAt || b.submitDate) - new Date(a.createdAt || a.submitDate)
    );

    // Priority: processing > pending > completed > rejected
    const priority = { processing: 3, pending: 2, completed: 1, rejected: 0 };
    const highestPriority = sortedWarranties.reduce((prev, curr) => {
      const prevPriority = priority[prev.status] || 0;
      const currPriority = priority[curr.status] || 0;
      return currPriority > prevPriority ? curr : prev;
    });

    return highestPriority.status;
  };

  // Check if order has any warranties
  const orderHasWarranty = (order) => {
    return getOrderWarranties(order._id).length > 0;
  };

  const filterOptions = [
    { value: 'all', label: 'Tất cả đơn hàng' },
    { value: 'pending', label: 'Chờ xác nhận' },
    { value: 'confirmed', label: 'Đã xác nhận' },
    { value: 'processing', label: 'Đang xử lý' },
    { value: 'shipped', label: 'Đang giao' },
    { value: 'delivered', label: 'Đã giao' },
    { value: 'cancelled', label: 'Đã hủy' },
    { value: 'has_warranty', label: 'Có bảo hành' }
  ];

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

  const filteredOrders = orders.filter((order) => {
    // Filter by search term
    const matchesSearch = 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items?.some((item) =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );

    if (!matchesSearch) return false;

    // Filter by status or warranty
    if (filter === 'has_warranty') {
      // Only show orders that have at least one product with warranty
      // This includes ALL orders with warranty, including delivered ones
      return orderHasWarranty(order);
    } else if (filter === 'all') {
      return true;
    } else if (filter === 'delivered') {
      // For delivered filter, only show delivered orders that DON'T have warranty
      // Delivered orders with warranty should only appear in "Có bảo hành" filter
      return order.status === filter && !orderHasWarranty(order);
    } else {
      // For other status filters, show orders with matching status
      // Note: delivered orders with warranty are excluded from all status filters except "Có bảo hành"
      if (orderHasWarranty(order) && order.status === 'delivered') {
        return false; // Don't show delivered orders with warranty in status filters
      }
      return order.status === filter;
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MainNavigation />
      <main style={{ display: "flex" }}>
        <AccountSideBar path="order" />
        <div style={{ flex: 1, padding: "50px 150px" }}>
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Lịch sử mua hàng</h1>
            <p className="text-muted-foreground">
              Theo dõi và quản lý các đơn hàng của bạn
            </p>
          </div>

          {/* Filter buttons */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={filter === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

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
                {searchTerm 
                  ? "Không tìm thấy đơn hàng" 
                  : filter === 'all'
                    ? "Chưa có đơn hàng nào"
                    : filter === 'has_warranty'
                      ? "Không có đơn hàng nào có sản phẩm bảo hành"
                      : `Không có đơn hàng nào với trạng thái "${filterOptions.find(f => f.value === filter)?.label}"`
                }
              </h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Thử tìm kiếm với từ khóa khác"
                  : filter === 'all'
                    ? "Khi bạn đặt hàng, lịch sử sẽ hiển thị ở đây"
                    : filter === 'has_warranty'
                      ? "Bạn chưa có đơn hàng nào có sản phẩm đang yêu cầu bảo hành"
                      : "Thử chọn bộ lọc khác hoặc xem tất cả đơn hàng"
                }
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
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold">
                          Đơn hàng: {order.orderNumber}
                        </h3>
                        {/* Show warranty status as primary status if order is delivered and has warranty */}
                        {orderHasWarranty(order) && order.status === 'delivered' ? (
                          <Badge className={getWarrantyStatusConfig(getOrderWarrantyStatus(order)).color}>
                            <ShieldCheck className="h-3 w-3 mr-1" />
                            {getWarrantyStatusConfig(getOrderWarrantyStatus(order)).label}
                          </Badge>
                        ) : (
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusText(order.status)}
                          </Badge>
                        )}
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

                        // Get product ID for warranty lookup
                        const productId = typeof item.productId === 'object' 
                          ? (item.productId?._id || item.productId) 
                          : item.productId;
                        const itemWarranties = getWarrantyForItem(order._id, productId);
                        const hasWarranty = itemWarranties.length > 0;
                        // Get the most recent warranty (sorted by createdAt desc)
                        const latestWarranty = itemWarranties.length > 0 
                          ? itemWarranties.sort((a, b) => new Date(b.createdAt || b.submitDate) - new Date(a.createdAt || a.submitDate))[0]
                          : null;
                        const warrantyStatusConfig = latestWarranty ? getWarrantyStatusConfig(latestWarranty.status) : null;

                        return (
                          <div
                            key={index}
                            className={`flex items-center gap-4 p-3 rounded-lg ${
                              hasWarranty 
                                ? "bg-blue-50/50 border border-blue-200 dark:bg-blue-950/20 dark:border-blue-800" 
                                : "bg-muted/30"
                            }`}
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
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{productName}</h4>
                                {hasWarranty && (
                                  <Badge 
                                    variant="outline" 
                                    className={`${warrantyStatusConfig.color} text-xs flex items-center gap-1`}
                                  >
                                    <ShieldCheck className="h-3 w-3" />
                                    {warrantyStatusConfig.label}
                                  </Badge>
                                )}
                              </div>
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
                              {hasWarranty && latestWarranty && (
                                <div className="mt-2 flex items-center gap-2 flex-wrap">
                                  <Link 
                                    to="/account/warranty" 
                                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                  >
                                    <ShieldCheck className="h-3 w-3" />
                                    <span>Yêu cầu bảo hành: {latestWarranty._id.slice(0, 8)}</span>
                                  </Link>
                                  {latestWarranty.result && (
                                    <span className="text-xs text-muted-foreground">
                                      • Kết quả: {
                                        latestWarranty.result === 'completed' ? 'Đã bảo hành' :
                                        latestWarranty.result === 'replaced' ? 'Đổi mới' :
                                        latestWarranty.result === 'rejected' ? 'Từ chối' : latestWarranty.result
                                      }
                                    </span>
                                  )}
                                </div>
                              )}
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
                    {/* Show warranty info summary if order has warranties */}
                    {order.items?.some((item) => {
                      const productId = typeof item.productId === 'object' 
                        ? (item.productId?._id || item.productId) 
                        : item.productId;
                      return getWarrantyForItem(order._id, productId).length > 0;
                    }) && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ShieldCheck className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-blue-600">
                            Đơn hàng này có sản phẩm đang yêu cầu bảo hành
                          </span>
                        </div>
                      </div>
                    )}
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
