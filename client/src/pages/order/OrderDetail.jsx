import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin, 
  CreditCard,
  Phone,
  Mail,
  Calendar,
  Shield
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { useToast } from "../../hooks/use-toast";
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getOrderDetail } from "../../api/order/orderApi";
import { createWarrantyRequest } from "../../api/warranty/warrantyApi";
import { WarrantyRequestDialog } from "../../components/warranty/WarrantyRequestDialog";

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { toast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isWarrantyDialogOpen, setIsWarrantyDialogOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrderDetail = async () => {
      try {
        const response = await getOrderDetail(orderId);
        setOrder(response.data);
      } catch (error) {
        console.error('Failed to load order detail:', error);
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [orderId, user, navigate]);

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      processing: { label: 'Đang xử lý', color: 'bg-purple-100 text-purple-800', icon: Package },
      shipped: { label: 'Đang giao', color: 'bg-orange-100 text-orange-800', icon: Truck },
      delivered: { label: 'Đã giao', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800', icon: Clock },
      returned: { label: 'Đã trả', color: 'bg-gray-100 text-gray-800', icon: Clock }
    };
    return statusMap[status] || statusMap.pending;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleOpenWarrantyDialog = (product) => {
    setSelectedProduct(product);
    setIsWarrantyDialogOpen(true);
  };

  const handleSubmitWarranty = async (warrantyData) => {
    try {
      await createWarrantyRequest(warrantyData);
      
      toast({
        title: "Thành công",
        description: "Gửi yêu cầu bảo hành thành công",
      });
      
      setIsWarrantyDialogOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể gửi yêu cầu",
        variant: "destructive",
      });
      throw error; // Re-throw to let the form handle it
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Đang tải thông tin đơn hàng...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Không tìm thấy đơn hàng</h1>
            <Button onClick={() => navigate('/orders')}>
              Quay lại danh sách đơn hàng
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/orders')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Chi tiết đơn hàng</h1>
            <p className="text-muted-foreground mt-2">
              Mã đơn hàng: {order.orderNumber}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <StatusIcon className="h-5 w-5" />
                  Trạng thái đơn hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Badge className={statusInfo.color}>
                    {statusInfo.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Đặt lúc: {formatDate(order.createdAt)}
                  </span>
                </div>
                
                {order.trackingNumber && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Mã vận đơn: {order.trackingNumber}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Sản phẩm đã đặt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex gap-4 p-4 border rounded-lg">
                      <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                            <span>No image</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.selectedColor} - {item.selectedSize}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Số lượng: {item.quantity}
                        </p>
                        {order.status === 'delivered' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => handleOpenWarrantyDialog(item)}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Yêu cầu bảo hành
                          </Button>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {item.price.toLocaleString("vi-VN")}đ
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Tổng: {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Địa chỉ giao hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{order.shippingAddress.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    <Phone className="inline h-4 w-4 mr-1" />
                    {order.shippingAddress.phone}
                  </p>
                  <p className="text-sm">
                    {order.shippingAddress.street}, {order.shippingAddress.ward?.name}, {order.shippingAddress.district?.name}, {order.shippingAddress.city?.name}
                  </p>
                  {order.shippingAddress.note && (
                    <p className="text-sm text-muted-foreground">
                      Ghi chú: {order.shippingAddress.note}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Tóm tắt đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tạm tính ({order.items.length} sản phẩm)</span>
                    <span>{order.subtotal.toLocaleString("vi-VN")}đ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Phí vận chuyển</span>
                    <span className={order.shippingFee === 0 ? "text-green-600" : ""}>
                      {order.shippingFee === 0 ? "Miễn phí" : `${order.shippingFee.toLocaleString("vi-VN")}đ`}
                    </span>
                  </div>
                  {order.voucherDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Giảm giá ({order.voucherCode})</span>
                      <span>-{order.voucherDiscount.toLocaleString("vi-VN")}đ</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng</span>
                    <span className="text-primary">{order.totalAmount.toLocaleString("vi-VN")}đ</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4" />
                    <span>Thanh toán: {order.paymentMethod === 'cod' ? 'COD' : 'Chuyển khoản'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>Đặt lúc: {formatDate(order.createdAt)}</span>
                  </div>
                  {order.estimatedDelivery && (
                    <div className="flex items-center gap-2 text-sm">
                      <Truck className="h-4 w-4" />
                      <span>Dự kiến giao: {formatDate(order.estimatedDelivery)}</span>
                    </div>
                  )}
                </div>

                {order.status === 'pending' && (
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={() => {
                      // TODO: Implement cancel order
                      console.log('Cancel order');
                    }}
                  >
                    Hủy đơn hàng
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Warranty Request Dialog */}
      {order && (
        <WarrantyRequestDialog
          isOpen={isWarrantyDialogOpen}
          onClose={() => {
            setIsWarrantyDialogOpen(false);
            setSelectedProduct(null);
          }}
          onSubmit={handleSubmitWarranty}
          product={selectedProduct}
          order={order}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default OrderDetail;
