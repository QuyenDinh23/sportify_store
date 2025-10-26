import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  X,
  Eye,
  Calendar,
  CreditCard,
  MapPin
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getUserOrders } from "../../api/order/orderApi";

const Orders = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getUserOrders();
        setOrders(response.data?.orders || []);
      } catch (error) {
        console.error('Failed to load orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { 
        label: 'Chờ xác nhận', 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: Clock 
      },
      confirmed: { 
        label: 'Đã xác nhận', 
        color: 'bg-blue-100 text-blue-800', 
        icon: CheckCircle 
      },
      processing: { 
        label: 'Đang xử lý', 
        color: 'bg-purple-100 text-purple-800', 
        icon: Package 
      },
      shipped: { 
        label: 'Đang giao', 
        color: 'bg-orange-100 text-orange-800', 
        icon: Truck 
      },
      delivered: { 
        label: 'Đã giao', 
        color: 'bg-green-100 text-green-800', 
        icon: CheckCircle 
      },
      cancelled: { 
        label: 'Đã hủy', 
        color: 'bg-red-100 text-red-800', 
        icon: X 
      },
      returned: { 
        label: 'Đã trả', 
        color: 'bg-gray-100 text-gray-800', 
        icon: X 
      }
    };
    return statusMap[status] || statusMap.pending;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getPaymentMethodText = (method) => {
    const methods = {
      cod: 'Thanh toán khi nhận hàng',
      bank_transfer: 'Chuyển khoản ngân hàng',
      credit_card: 'Thẻ tín dụng'
    };
    return methods[method] || method;
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const filterOptions = [
    { value: 'all', label: 'Tất cả đơn hàng' },
    { value: 'pending', label: 'Chờ xác nhận' },
    { value: 'confirmed', label: 'Đã xác nhận' },
    { value: 'processing', label: 'Đang xử lý' },
    { value: 'shipped', label: 'Đang giao' },
    { value: 'delivered', label: 'Đã giao' },
    { value: 'cancelled', label: 'Đã hủy' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Đang tải danh sách đơn hàng...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Đơn hàng của tôi</h1>
          <p className="text-muted-foreground">
            Theo dõi và quản lý các đơn hàng của bạn
          </p>
        </div>

        {/* Filter */}
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

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Chưa có đơn hàng nào</h3>
              <p className="text-muted-foreground mb-4">
                {filter === 'all' 
                  ? 'Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!'
                  : `Không có đơn hàng nào với trạng thái "${filterOptions.find(f => f.value === filter)?.label}"`
                }
              </p>
              <Button onClick={() => navigate('/')}>
                Bắt đầu mua sắm
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <Card key={order._id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <StatusIcon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <CardTitle className="text-lg">
                            Đơn hàng #{order.orderNumber}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Đặt lúc: {formatDate(order.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={statusInfo.color}>
                          {statusInfo.label}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/order-detail/${order._id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Xem chi tiết
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Order Items */}
                      <div className="md:col-span-2">
                        <h4 className="font-semibold mb-3">Sản phẩm</h4>
                        <div className="space-y-2">
                          {order.items.map((item, index) => {
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
                              <div key={index} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                                  {productImage ? (
                                    <img 
                                      src={productImage} 
                                      alt={productName}
                                      className="w-full h-full object-cover rounded-lg"
                                    />
                                  ) : (
                                    <Package className="h-6 w-6 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{productName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Số lượng: {item.quantity} | 
                                    Giá: {formatCurrency(item.price)}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-3">Thông tin đơn hàng</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Tạm tính:</span>
                              <span>{formatCurrency(order.subtotal)}</span>
                            </div>
                            {order.shippingFee > 0 && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Phí vận chuyển:</span>
                                <span>{formatCurrency(order.shippingFee)}</span>
                              </div>
                            )}
                            {order.voucherDiscount > 0 && (
                              <div className="flex justify-between text-green-600">
                                <span>Giảm giá ({order.voucherCode}):</span>
                                <span>-{formatCurrency(order.voucherDiscount)}</span>
                              </div>
                            )}
                            <Separator />
                            <div className="flex justify-between font-semibold">
                              <span>Tổng cộng:</span>
                              <span>{formatCurrency(order.totalAmount)}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-3">Thông tin giao hàng</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="font-medium">{order.shippingAddress.fullName}</p>
                                <p className="text-muted-foreground">{order.shippingAddress.phone}</p>
                                <p className="text-muted-foreground text-xs">
                                  {order.shippingAddress.street}, {order.shippingAddress.ward?.name}, {order.shippingAddress.district?.name}, {order.shippingAddress.city?.name}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{getPaymentMethodText(order.paymentMethod)}</span>
                            </div>
                          </div>
                        </div>

                        {order.trackingNumber && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm font-medium text-blue-800">
                              Mã vận đơn: {order.trackingNumber}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Orders;
