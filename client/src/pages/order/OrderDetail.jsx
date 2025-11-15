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
import { getOrderDetail, cancelOrder } from "../../api/order/orderApi";
import { createWarrantyRequest, getMyWarrantyRequests } from "../../api/warranty/warrantyApi";
import { WarrantyRequestDialog } from "../../components/warranty/WarrantyRequestDialog";
import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { toast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isWarrantyDialogOpen, setIsWarrantyDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [zaloPhone, setZaloPhone] = useState("");
  const [qrCodeFile, setQrCodeFile] = useState(null);
  const [qrCodePreview, setQrCodePreview] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [warranties, setWarranties] = useState([]);
  const [warrantyMap, setWarrantyMap] = useState(new Map());

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
        navigate('/account/order');
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
          const warrantyOrderId = warranty.orderId 
            ? (warranty.orderId._id?.toString() || warranty.orderId.toString())
            : null;
          const warrantyProductId = warranty.productId 
            ? (warranty.productId._id?.toString() || warranty.productId.toString())
            : null;
          if (warrantyOrderId && warrantyProductId) {
            const key = `${warrantyOrderId}_${warrantyProductId}`;
            // Store all warranties for this product in order (in case there are multiple)
            if (!map.has(key)) {
              map.set(key, []);
            }
            map.get(key).push(warranty);
          }
        });
        setWarrantyMap(map);
      } catch (error) {
        console.error('Error fetching warranties:', error);
        // Don't show error toast for warranties, as it's not critical
      }
    };

    fetchOrderDetail();
    fetchWarranties();
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
      
      // Refresh warranties after submitting new request
      const data = await getMyWarrantyRequests({});
      setWarranties(data || []);
      
      // Rebuild warranty map
      const map = new Map();
      data.forEach((warranty) => {
        const warrantyOrderId = warranty.orderId 
          ? (warranty.orderId._id?.toString() || warranty.orderId.toString())
          : null;
        const warrantyProductId = warranty.productId 
          ? (warranty.productId._id?.toString() || warranty.productId.toString())
          : null;
        if (warrantyOrderId && warrantyProductId) {
          const key = `${warrantyOrderId}_${warrantyProductId}`;
          if (!map.has(key)) {
            map.set(key, []);
          }
          map.get(key).push(warranty);
        }
      });
      setWarrantyMap(map);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể gửi yêu cầu",
        variant: "destructive",
      });
      throw error; // Re-throw to let the form handle it
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;

    try {
      setIsCancelling(true);
      
      // For VNPay orders, always require Zalo phone and QR code
      if (order.paymentMethod === 'vnpay') {
        if (!zaloPhone.trim()) {
          toast({
            title: "Lỗi",
            description: "Vui lòng nhập số điện thoại Zalo",
            variant: "destructive",
          });
          setIsCancelling(false);
          return;
        }
        if (!qrCodeFile) {
          toast({
            title: "Lỗi",
            description: "Vui lòng upload mã QR",
            variant: "destructive",
          });
          setIsCancelling(false);
          return;
        }
        
        await cancelOrder(order._id, cancelReason, zaloPhone, qrCodeFile);
      } else {
        // For other orders, send regular JSON
        await cancelOrder(order._id, cancelReason);
      }
      
      toast({
        title: "Thành công",
        description: order.paymentMethod === 'vnpay'
          ? "Hủy đơn hàng thành công. Yêu cầu hoàn tiền đã được ghi nhận."
          : "Hủy đơn hàng thành công",
      });

      setIsCancelDialogOpen(false);
      setCancelReason("");
      setZaloPhone("");
      setQrCodeFile(null);
      setQrCodePreview(null);
      
      // Refresh order data
      const response = await getOrderDetail(orderId);
      setOrder(response.data);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể hủy đơn hàng",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleQrCodeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setQrCodeFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrCodePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Check if order can be cancelled
  const canCancelOrder = () => {
    if (!order) return false;
    
    // COD orders: can cancel if status is pending
    if (order.paymentMethod === 'cod') {
      return order.status === 'pending';
    }
    
    // VNPay orders: can cancel if pending OR if already paid (status !== 'pending')
    // For paid VNPay orders, cancellation requires refund info (zaloPhone + QR code)
    if (order.paymentMethod === 'vnpay') {
      // Can cancel if pending (not paid yet) or if already paid (status !== 'pending')
      // But cannot cancel if already cancelled or delivered
      return order.status !== 'cancelled' && order.status !== 'delivered' && order.status !== 'returned';
    }
    
    // Other payment methods: can cancel if pending
    return order.status === 'pending';
  };

  // Get warranty for a specific order item
  const getWarrantyForItem = (orderId, productId) => {
    if (!orderId || !productId) return [];
    
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

  // Get warranty status config
  const getWarrantyStatusConfig = (status) => {
    const config = {
      pending: { label: "Đang chờ", color: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-300" },
      processing: { label: "Đang xử lý", color: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/20 dark:text-blue-300" },
      completed: { label: "Hoàn thành", color: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-300" },
      rejected: { label: "Từ chối", color: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-300" },
    };
    return config[status] || config.pending;
  };

  // Get warranty reason label in Vietnamese
  const getWarrantyReasonLabel = (reason) => {
    const reasonConfig = {
      missing_item: "Thiếu hàng",
      wrong_item: "Người bán gửi sai hàng",
      broken_damaged: "Hàng bể vỡ",
      defective_not_working: "Hàng lỗi, không hoạt động",
      expired: "Hàng hết hạn sử dụng",
      different_from_description: "Khác với mô tả",
      used_item: "Hàng đã qua sử dụng",
      fake_counterfeit: "Hàng giả, nhái",
      intact_no_longer_needed: "Hàng nguyên vẹn nhưng không còn nhu cầu",
    };
    return reasonConfig[reason] || reason;
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
            <Button onClick={() => navigate('/account/order')}>
              Quay lại lịch sử mua hàng
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
            onClick={() => navigate('/account/order')}
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
                  {order.items.map((item, index) => {
                    // Get image from multiple possible sources
                    let productImage = null;

                    // Try different paths to get the image
                    if (item.image) {
                      productImage = item.image;
                    } else if (item.productId) {
                      // If productId is populated (object)
                      if (typeof item.productId === 'object' && item.productId.images) {
                        productImage = item.productId.images[0];
                      }
                      // If productId is just an ID string, we can't access images
                    }

                    // Get product name
                    const productName = item.name
                      || (item.productId && typeof item.productId === 'object' ? item.productId.name : null)
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
                        className={`flex gap-4 p-4 border rounded-lg ${
                          hasWarranty 
                            ? "bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800" 
                            : ""
                        }`}
                      >
                        <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {productImage ? (
                            <img
                              src={productImage}
                              alt={productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <Package className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{productName}</h3>
                            {hasWarranty && warrantyStatusConfig && (
                              <Badge 
                                variant="outline" 
                                className={`${warrantyStatusConfig.color} text-xs flex items-center gap-1`}
                              >
                                <ShieldCheck className="h-3 w-3" />
                                {warrantyStatusConfig.label}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {item.selectedColor} - {item.selectedSize}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Số lượng: {item.quantity}
                          </p>

                          {/* Warranty Information */}
                          {hasWarranty && latestWarranty && (
                            <div className="mt-3 p-3 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 rounded-lg space-y-2">
                              <div className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-600">
                                  Yêu cầu bảo hành: {latestWarranty._id.slice(0, 8)}
                                </span>
                                <Link 
                                  to="/account/warranty" 
                                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline ml-2"
                                >
                                  Xem chi tiết
                                </Link>
                              </div>
                              
                              {/* Show reason for warranty */}
                              {latestWarranty.reason && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Lý do bảo hành:</p>
                                  <p className="text-sm text-foreground bg-muted/50 p-2 rounded">
                                    {getWarrantyReasonLabel(latestWarranty.reason)}
                                  </p>
                                </div>
                              )}

                              {/* Show description if available (mô tả chi tiết) */}
                              {latestWarranty.description && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Mô tả chi tiết:</p>
                                  <p className="text-xs text-foreground bg-muted/30 p-2 rounded">
                                    {latestWarranty.description}
                                  </p>
                                </div>
                              )}

                              {/* Show result if available */}
                              {latestWarranty.result && (
                                <div className="text-xs">
                                  <span className="text-muted-foreground">Kết quả: </span>
                                  <span className="font-medium">
                                    {latestWarranty.result === 'completed' ? 'Đã bảo hành' :
                                     latestWarranty.result === 'replaced' ? 'Đổi mới' :
                                     latestWarranty.result === 'rejected' ? 'Từ chối' :
                                     latestWarranty.result === 'refunded' ? 'Đã hoàn tiền' :
                                     latestWarranty.result}
                                  </span>
                                </div>
                              )}

                              {/* Show admin note if available */}
                              {latestWarranty.adminNote && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Ghi chú từ admin:</p>
                                  <p className="text-xs text-foreground bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border border-yellow-200 dark:border-yellow-800">
                                    {latestWarranty.adminNote}
                                  </p>
                                </div>
                              )}

                              {/* Show rejection reason if rejected */}
                              {latestWarranty.rejectReason && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium text-red-600 mb-1">Lý do từ chối:</p>
                                  <p className="text-xs text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800">
                                    {latestWarranty.rejectReason}
                                  </p>
                                </div>
                              )}

                              {/* Show replacement order if available */}
                              {latestWarranty.result === 'replaced' && latestWarranty.replacementOrderId && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                  Đơn hàng thay thế: {
                                    typeof latestWarranty.replacementOrderId === 'object' && latestWarranty.replacementOrderId.orderNumber
                                      ? latestWarranty.replacementOrderId.orderNumber
                                      : latestWarranty.replacementOrderId
                                  }
                                </div>
                              )}

                              {/* Show attachments if available */}
                              {latestWarranty.attachments && Array.isArray(latestWarranty.attachments) && latestWarranty.attachments.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Hình ảnh/video đính kèm:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {latestWarranty.attachments.slice(0, 3).map((url, idx) => (
                                      <a 
                                        key={idx} 
                                        href={url} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="w-16 h-16 rounded border overflow-hidden"
                                      >
                                        <img 
                                          src={url} 
                                          alt={`attachment-${idx}`} 
                                          className="w-full h-full object-cover" 
                                          onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                                        />
                                      </a>
                                    ))}
                                    {latestWarranty.attachments.length > 3 && (
                                      <span className="text-xs text-muted-foreground self-center">
                                        +{latestWarranty.attachments.length - 3} hình khác
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Show warranty request button only if delivered and no warranty exists */}
                          {order.status === 'delivered' && !hasWarranty && (
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
                    );
                  })}
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
                  <p className="font-medium">{order.shippingAddress?.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    <Phone className="inline h-4 w-4 mr-1" />
                    {order.shippingAddress?.phone}
                  </p>
                  <p className="text-sm">
                    {order.shippingAddress?.street}, {order.shippingAddress?.ward?.name}, {order.shippingAddress?.district?.name}, {order.shippingAddress?.city?.name}
                  </p>
                  {order.shippingAddress?.note && (
                    <p className="text-sm text-muted-foreground">
                      Ghi chú: {order.shippingAddress?.note}
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
                    <span>Thanh toán: {
                      order.paymentMethod === 'cod' ? 'COD' : 
                      order.paymentMethod === 'vnpay' ? 'VNPay' : 
                      'Chuyển khoản'
                    }</span>
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

                {canCancelOrder() && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setIsCancelDialogOpen(true)}
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

      {/* Cancel Order Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Hủy đơn hàng</DialogTitle>
            <DialogDescription>
              {order?.paymentMethod === 'vnpay' 
                ? "Đơn hàng thanh toán qua VNPay. Vui lòng nhập thông tin để hoàn tiền."
                : "Bạn có chắc chắn muốn hủy đơn hàng này? Vui lòng nhập lý do hủy đơn."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cancelReason">Lý do hủy đơn *</Label>
              <Textarea
                id="cancelReason"
                placeholder="Nhập lý do hủy đơn hàng..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
              />
            </div>
            
            {/* Show Zalo phone and QR code fields for VNPay orders */}
            {order?.paymentMethod === 'vnpay' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="zaloPhone">Số điện thoại Zalo *</Label>
                  <Input
                    id="zaloPhone"
                    type="tel"
                    placeholder="Nhập số điện thoại Zalo để hoàn tiền"
                    value={zaloPhone}
                    onChange={(e) => setZaloPhone(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Số điện thoại Zalo của bạn để chúng tôi liên hệ hoàn tiền
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="qrCode">Mã QR hoàn tiền *</Label>
                  <Input
                    id="qrCode"
                    type="file"
                    accept="image/*"
                    onChange={handleQrCodeChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    Vui lòng upload mã QR code để nhận hoàn tiền
                  </p>
                  {qrCodePreview && (
                    <div className="mt-2">
                      <img
                        src={qrCodePreview}
                        alt="QR Code Preview"
                        className="w-32 h-32 object-contain border rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCancelDialogOpen(false);
                setCancelReason("");
                setZaloPhone("");
                setQrCodeFile(null);
                setQrCodePreview(null);
              }}
              disabled={isCancelling}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelOrder}
              disabled={
                isCancelling || 
                !cancelReason.trim() || 
                (order?.paymentMethod === 'vnpay' && (!zaloPhone.trim() || !qrCodeFile))
              }
            >
              {isCancelling ? "Đang xử lý..." : "Xác nhận hủy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default OrderDetail;
