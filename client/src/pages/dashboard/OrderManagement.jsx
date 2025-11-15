import { useEffect, useState } from 'react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useToast } from '../../hooks/use-toast';
import { getAllOrdersAdmin, updateOrderStatusAdmin } from '../../api/order/orderApi';
import Pagination from '../../components/pagination/Pagination';
import { Search, Package, Calendar, DollarSign, User, Truck, Phone, QrCode } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [orderToUpdate, setOrderToUpdate] = useState(null);
  const [statusValue, setStatusValue] = useState('');
  const [returnCondition, setReturnCondition] = useState('intact');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const itemsPerPage = 10;
  const { toast } = useToast();

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-cyan-100 text-cyan-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'return_requested':
        return 'bg-orange-100 text-orange-800';
      case 'returned':
        return 'bg-orange-100 text-orange-800';
      case 'refund_requested':
        return 'bg-pink-100 text-pink-800';
      case 'refunded':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Chờ xử lý',
      confirmed: 'Đã xác nhận',
      processing: 'Đang xử lý',
      shipped: 'Đã gửi hàng',
      delivered: 'Đã giao hàng',
      cancelled: 'Đã hủy',
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (searchTerm) params.search = searchTerm;

      const res = await getAllOrdersAdmin(params);
      setOrders(res.data.orders);
      setTotalPages(res.data.pagination.pages);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể tải danh sách đơn hàng',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [currentPage, selectedStatus, searchTerm]);

  const handleOpenUpdateDialog = (order) => {
    setOrderToUpdate(order);
    setStatusValue(order.status);
    setTrackingNumber(order.trackingNumber || '');
    setEstimatedDelivery(order.estimatedDelivery ? order.estimatedDelivery.split('T')[0] : '');
    setIsUpdateDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!orderToUpdate || !statusValue) return;

    try {
      const statusData = {
        status: statusValue,
      };

      if (trackingNumber) statusData.trackingNumber = trackingNumber;
      if (estimatedDelivery) statusData.estimatedDelivery = estimatedDelivery;
      if (['returned', 'refunded'].includes(statusValue)) statusData.returnCondition = returnCondition;

      await updateOrderStatusAdmin(orderToUpdate._id, statusData);
      
      toast({
        title: 'Thành công',
        description: 'Cập nhật trạng thái đơn hàng thành công',
      });

      setIsUpdateDialogOpen(false);
      setOrderToUpdate(null);
      loadOrders();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể cập nhật trạng thái đơn hàng',
        variant: 'destructive',
      });
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý đơn hàng</h1>
        <p className="text-muted-foreground">Quản lý tất cả đơn hàng trong hệ thống</p>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc đơn hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search">Tìm kiếm</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Mã đơn hàng hoặc tên khách hàng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Trạng thái</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="pending">Chờ xử lý</SelectItem>
                  <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                  <SelectItem value="processing">Đang xử lý</SelectItem>
                  <SelectItem value="shipped">Đã gửi hàng</SelectItem>
                  <SelectItem value="delivered">Đã giao hàng</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Package className="h-12 w-12 text-muted-foreground animate-pulse" />
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <Package className="h-24 w-24 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Không có đơn hàng</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedStatus !== 'all'
                ? 'Không tìm thấy đơn hàng phù hợp'
                : 'Chưa có đơn hàng nào'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order._id}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Order Header */}
                  <div className="flex justify-between items-start border-b pb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">
                          {order.orderNumber}
                        </h3>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>
                            {order.shippingAddress?.fullName || order.userId?.fullName || 'Không có'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Tổng tiền</p>
                        <p className="text-lg font-semibold">
                          {formatPrice(order.totalAmount)}đ
                        </p>
                      </div>
                      <Button
                        onClick={() => handleOpenUpdateDialog(order)}
                        size="sm"
                        variant="outline"
                      >
                        Cập nhật trạng thái
                      </Button>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Sản phẩm trong đơn hàng:</h4>
                    {order.items?.map((item, index) => {
                      const productImage =
                        item.image ||
                        item.productId?.images?.[0] ||
                        (typeof item.productId === 'object' && item.productId?.images?.[0]) ||
                        null;

                      const productName =
                        item.name ||
                        item.productId?.name ||
                        (typeof item.productId === 'object' && item.productId?.name) ||
                        'Sản phẩm không tồn tại';

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
                                <span className="ml-4">Màu: {item.selectedColor}</span>
                              )}
                              {item.selectedSize && (
                                <span className="ml-4">Size: {item.selectedSize}</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatPrice(item.price)}đ</p>
                            <p className="text-sm text-muted-foreground">
                              Tổng: {formatPrice(item.price * item.quantity)}đ
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Shipping Address */}
                  {order.shippingAddress && (
                    <div className="border-t pt-4">
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Truck className="h-4 w-4 mt-1" />
                        <div>
                          <p className="font-medium text-foreground mb-1">Địa chỉ giao hàng</p>
                          <p>{order.shippingAddress.fullName}</p>
                          <p>{order.shippingAddress.phone}</p>
                          <p className="line-clamp-2">
                            {order.shippingAddress.street},{' '}
                            {order.shippingAddress.ward?.name},{' '}
                            {order.shippingAddress.district?.name},{' '}
                            {order.shippingAddress.city?.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Method */}
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span>
                        Phương thức thanh toán:{' '}
                        {order.paymentMethod === 'cod'
                          ? 'Thanh toán khi nhận hàng'
                          : order.paymentMethod === 'bank_transfer'
                          ? 'Chuyển khoản ngân hàng'
                          : order.paymentMethod === 'vnpay'
                          ? 'VNPay'
                          : 'Thẻ tín dụng'}
                      </span>
                    </div>
                  </div>

                  {/* Refund Info for VNPay cancelled orders */}
                  {order.paymentMethod === 'vnpay' && 
                   order.status === 'cancelled' && 
                   order.refundInfo && 
                   (order.refundInfo.zaloPhone || order.refundInfo.qrCode) && (
                    <div className="border-t pt-4">
                      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
                        <h4 className="font-medium text-sm text-blue-900 dark:text-blue-100 flex items-center gap-2">
                          <QrCode className="h-4 w-4" />
                          Thông tin hoàn tiền
                        </h4>
                        {order.refundInfo.zaloPhone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-blue-600" />
                            <span className="text-muted-foreground">Số điện thoại Zalo:</span>
                            <span className="font-medium">{order.refundInfo.zaloPhone}</span>
                          </div>
                        )}
                        {order.refundInfo.qrCode && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <QrCode className="h-4 w-4 text-blue-600" />
                              <span className="text-muted-foreground">Mã QR hoàn tiền:</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <img
                                src={order.refundInfo.qrCode}
                                alt="QR Code hoàn tiền"
                                className="w-32 h-32 object-contain border border-blue-200 dark:border-blue-800 rounded-lg bg-white p-2"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              <a
                                href={order.refundInfo.qrCode}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 underline"
                              >
                                Xem ảnh gốc
                              </a>
                            </div>
                          </div>
                        )}
                        {order.cancelReason && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Lý do hủy:</span>
                            <p className="mt-1 text-foreground bg-white dark:bg-gray-800 p-2 rounded border">
                              {order.cancelReason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      {/* Update Status Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật trạng thái đơn hàng</DialogTitle>
            <DialogDescription>
              Đơn hàng: {orderToUpdate?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status-select">Trạng thái</Label>
              <Select value={statusValue} onValueChange={setStatusValue}>
                <SelectTrigger id="status-select">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
              <SelectContent>
                  <SelectItem value="pending">Chờ xử lý</SelectItem>
                  <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                  <SelectItem value="processing">Đang xử lý</SelectItem>
                  <SelectItem value="shipped">Đã gửi hàng</SelectItem>
                  <SelectItem value="delivered">Đã giao hàng</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          {['returned', 'refunded'].includes(statusValue) && (
            <div className="space-y-2">
              <Label>Điều kiện hàng hoàn về</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="returnCondition"
                    value="intact"
                    checked={returnCondition === 'intact'}
                    onChange={() => setReturnCondition('intact')}
                  />
                  <span>Nguyên vẹn</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="returnCondition"
                    value="damaged"
                    checked={returnCondition === 'damaged'}
                    onChange={() => setReturnCondition('damaged')}
                  />
                  <span>Rách/Hỏng</span>
                </label>
              </div>
            </div>
          )}
            <div className="space-y-2">
              <Label htmlFor="tracking">Mã vận đơn</Label>
              <Input
                id="tracking"
                placeholder="Nhập mã vận đơn (tùy chọn)"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimated">Ngày giao hàng dự kiến</Label>
              <Input
                id="estimated"
                type="date"
                value={estimatedDelivery}
                onChange={(e) => setEstimatedDelivery(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUpdateDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button onClick={handleUpdateStatus}>Cập nhật</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderManagement;

