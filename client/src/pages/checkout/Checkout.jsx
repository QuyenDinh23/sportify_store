import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, CreditCard, Truck, MapPin, User, Phone, Mail } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Separator } from "../../components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import Header from '../../components/Header';
import { MainNavigation } from '../../components/MainNavigation';
import Footer from '../../components/Footer';
import AddressSelector from '../../components/AddressSelector';
import { createOrder } from "../../api/order/orderApi";
import { clearCart, fetchCart } from "../../store/cartSlice";
import { addressApi } from "../../services/addressApi";
import { getAvailableVouchers } from "../../api/voucher/voucherApi";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { items: allCartItems, totalQuantity, totalPrice } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  
  // Lấy danh sách sản phẩm được chọn từ location state
  const selectedItemIds = location.state?.selectedItemIds || [];
  
  // Filter chỉ lấy những sản phẩm được chọn
  const items = selectedItemIds.length > 0 
    ? allCartItems.filter(item => selectedItemIds.includes(item._id))
    : allCartItems;

  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: { code: '', name: '' },
    district: { code: '', name: '' },
    ward: { code: '', name: '' },
    note: '',
    type: 'Nhà',
    isDefault: false
  });

  // Initialize shipping address with user info
  useEffect(() => {
    if (user) {
      setShippingAddress(prev => ({
        ...prev,
        fullName: user.fullName || user.name || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [notes, setNotes] = useState('');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [voucherDiscount, setVoucherDiscount] = useState(0);

  // Tính toán lại tổng tiền dựa trên items được chọn
  const selectedItemsTotal = items.reduce((total, item) => {
    return total + (item.priceAtAdd * item.quantity);
  }, 0);
  
  const selectedItemsQuantity = items.reduce((total, item) => {
    return total + item.quantity;
  }, 0);
  
  // Tính phí ship
  const shippingFee = selectedItemsTotal >= 500000 ? 0 : 30000;
  const finalTotal = selectedItemsTotal + shippingFee - voucherDiscount;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (allCartItems.length === 0) {
      navigate('/cart');
      return;
    }
    // Nếu không có selectedItemIds và có items trong cart, nên quay về cart để chọn
    if (selectedItemIds.length === 0 && allCartItems.length > 0) {
      navigate('/cart');
      return;
    }
  }, [user, allCartItems, selectedItemIds, navigate]);

  // Load saved addresses
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const addresses = await addressApi.getAddress();
        setSavedAddresses(addresses);
      } catch (error) {
        console.error('Failed to load addresses:', error);
      }
    };
    
    if (user) {
      loadAddresses();
    }
  }, [user]);

  // Load available vouchers
  useEffect(() => {
    const loadVouchers = async () => {
      try {
        const vouchers = await getAvailableVouchers();
        setAvailableVouchers(vouchers);
      } catch (error) {
        console.error('Failed to load vouchers:', error);
      }
    };
    
    loadVouchers();
  }, []);


  const validateForm = () => {
    const requiredFields = ['fullName', 'phone', 'street'];
    
    for (const field of requiredFields) {
      if (!shippingAddress[field]?.trim()) {
        toast.error(`Vui lòng nhập ${getFieldLabel(field)}`);
        return false;
      }
    }

    // Validate location fields
    if (!shippingAddress.city?.name || !shippingAddress.district?.name || !shippingAddress.ward?.name) {
      toast.error('Vui lòng nhập đầy đủ Tỉnh/Thành phố, Quận/Huyện và Phường/Xã');
      return false;
    }

    // Validate phone number
    const phoneRegex = /^(\+84|0)[0-9]{9,10}$/;
    if (!phoneRegex.test(shippingAddress.phone)) {
      toast.error('Số điện thoại không hợp lệ (định dạng: +84XXXXXXXX hoặc 0XXXXXXXX)');
      return false;
    }

    return true;
  };

  const getFieldLabel = (field) => {
    const labels = {
      fullName: 'họ tên',
      phone: 'số điện thoại',
      street: 'địa chỉ chi tiết',
      city: 'tỉnh/thành phố',
      district: 'quận/huyện',
      ward: 'phường/xã'
    };
    return labels[field] || field;
  };

  // Tính toán voucher discount
  const calculateVoucherDiscount = (voucher, orderAmount) => {
    if (!voucher) return 0;
    
    // Kiểm tra điều kiện tối thiểu
    if (orderAmount < voucher.minOrderAmount) return 0;
    
    let discount = 0;
    if (voucher.discountType === 'percentage') {
      discount = (orderAmount * voucher.discountValue) / 100;
    } else if (voucher.discountType === 'fixed') {
      discount = voucher.discountValue;
    }
    
    // Đảm bảo discount không vượt quá order amount
    return Math.min(discount, orderAmount);
  };

  // Xử lý chọn voucher
  const handleVoucherSelect = (voucher) => {
    setSelectedVoucher(voucher);
    const discount = calculateVoucherDiscount(voucher, selectedItemsTotal);
    setVoucherDiscount(discount);
  };

  // Xử lý bỏ chọn voucher
  const handleVoucherRemove = () => {
    setSelectedVoucher(null);
    setVoucherDiscount(0);
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const orderData = {
        shippingAddress,
        paymentMethod,
        notes,
        voucherCode: selectedVoucher?.code || null,
        selectedItemIds: selectedItemIds.length > 0 ? selectedItemIds : items.map(item => item._id)
      };

      const response = await createOrder(orderData);
      
      // Nếu là VNPay, redirect đến payment URL
      if (paymentMethod === 'vnpay') {
        // Backend sẽ trả về paymentUrl trong response
        if (response.data?.paymentUrl) {
          window.location.href = response.data.paymentUrl;
          return;
        } else {
          toast.error('Không thể tạo link thanh toán VNPay');
          setLoading(false);
          return;
        }
      }
      
      // Refresh cart after successful order (backend đã xóa các items được chọn)
      // Nếu tất cả items đã được đặt, cart sẽ trống
      await dispatch(fetchCart()).unwrap();
      
      toast.success('Đặt hàng thành công!');
      navigate(`/order-detail/${response.data._id}`);
      
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra khi đặt hàng');
    } finally {
      setLoading(false);
    }
  };

  if (!user || items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* <MainNavigation /> */}
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/cart')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Thanh toán</h1>
            <p className="text-muted-foreground mt-2">
              Hoàn tất đơn hàng của bạn
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Thông tin khách hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="userFullName">Họ và tên</Label>
                    <Input
                      id="userFullName"
                      value={user?.fullName || user?.name || ''}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="userEmail">Email</Label>
                    <Input
                      id="userEmail"
                      value={user?.email || ''}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userPhone">Số điện thoại</Label>
                  <Input
                    id="userPhone"
                    value={user?.phone || ''}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Thông tin này được lấy từ tài khoản của bạn. Để thay đổi, vui lòng cập nhật trong phần "Thông tin tài khoản".</p>
                </div>
              </CardContent>
            </Card>

            {/* Saved Addresses */}
            {savedAddresses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Địa chỉ đã lưu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {savedAddresses.map((address) => (
                      <div
                        key={address._id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedAddress?._id === address._id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => {
                          setSelectedAddress(address);
                          setShippingAddress({
                            fullName: address.fullName,
                            phone: address.phone,
                            street: address.street,
                            city: address.city,
                            district: address.district,
                            ward: address.ward,
                            note: address.note || '',
                            type: address.type || 'Nhà',
                            isDefault: address.isDefault || false
                          });
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">{address.fullName}</span>
                              {address.isDefault && (
                                <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                                  Mặc định
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              {address.phone}
                            </p>
                            <p className="text-sm">
                              {address.street}, {address.ward?.name}, {address.district?.name}, {address.city?.name}
                            </p>
                            {address.note && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Ghi chú: {address.note}
                              </p>
                            )}
                          </div>
                          <div className="ml-4">
                            <input
                              type="radio"
                              checked={selectedAddress?._id === address._id}
                              onChange={() => {}}
                              className="w-4 h-4"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Địa chỉ giao hàng
                </CardTitle>
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShippingAddress(prev => ({
                        ...prev,
                        fullName: user?.fullName || user?.name || '',
                        phone: user?.phone || ''
                      }));
                    }}
                  >
                    Sử dụng thông tin tài khoản
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedAddress(null);
                      setShippingAddress({
                        fullName: '',
                        phone: '',
                        street: '',
                        city: { code: '', name: '' },
                        district: { code: '', name: '' },
                        ward: { code: '', name: '' },
                        note: '',
                        type: 'Nhà',
                        isDefault: false
                      });
                    }}
                  >
                    Nhập địa chỉ mới
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Họ và tên *</Label>
                    <Input
                      id="fullName"
                      value={shippingAddress.fullName}
                      onChange={(e) => setShippingAddress(prev => ({...prev, fullName: e.target.value}))}
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Số điện thoại *</Label>
                    <Input
                      id="phone"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress(prev => ({...prev, phone: e.target.value}))}
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="street">Địa chỉ chi tiết *</Label>
                  <Input
                    id="street"
                    value={shippingAddress.street}
                    onChange={(e) => setShippingAddress(prev => ({...prev, street: e.target.value}))}
                    placeholder="Số nhà, tên đường"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Tỉnh/Thành phố *</Label>
                    <Input
                      id="city"
                      value={shippingAddress.city?.name || ''}
                      onChange={(e) => setShippingAddress(prev => ({...prev, city: {code: '', name: e.target.value}}))}
                      placeholder="Ví dụ: TP. Hồ Chí Minh"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district">Quận/Huyện *</Label>
                    <Input
                      id="district"
                      value={shippingAddress.district?.name || ''}
                      onChange={(e) => setShippingAddress(prev => ({...prev, district: {code: '', name: e.target.value}}))}
                      placeholder="Ví dụ: Quận 1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ward">Phường/Xã *</Label>
                    <Input
                      id="ward"
                      value={shippingAddress.ward?.name || ''}
                      onChange={(e) => setShippingAddress(prev => ({...prev, ward: {code: '', name: e.target.value}}))}
                      placeholder="Ví dụ: Phường Bến Nghé"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="note">Ghi chú</Label>
                  <Textarea
                    id="note"
                    value={shippingAddress.note}
                    onChange={(e) => setShippingAddress(prev => ({...prev, note: e.target.value}))}
                    placeholder="Ghi chú thêm cho đơn hàng (tùy chọn)"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Phương thức thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div 
                    className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    onClick={() => setPaymentMethod('cod')}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="text-primary"
                    />
                    <Truck className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Thanh toán khi nhận hàng (COD)</p>
                      <p className="text-sm text-muted-foreground">Thanh toán bằng tiền mặt khi nhận hàng</p>
                    </div>
                  </div>
                  
                  <div 
                    className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'bank_transfer' ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    onClick={() => setPaymentMethod('bank_transfer')}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="bank_transfer"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={() => setPaymentMethod('bank_transfer')}
                      className="text-primary"
                    />
                    <CreditCard className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Chuyển khoản ngân hàng</p>
                      <p className="text-sm text-muted-foreground">Chuyển khoản trước khi giao hàng</p>
                    </div>
                  </div>
                  
                  <div 
                    className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'vnpay' ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                    onClick={() => setPaymentMethod('vnpay')}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="vnpay"
                      checked={paymentMethod === 'vnpay'}
                      onChange={() => setPaymentMethod('vnpay')}
                      className="text-primary"
                    />
                    <CreditCard className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Thanh toán qua VNPay</p>
                      <p className="text-sm text-muted-foreground">Thanh toán online qua cổng VNPay</p>
                    </div>
                  </div>
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
                {/* Order Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item._id} className="flex gap-3">
                      <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        {item.images && item.images[0] ? (
                          <img
                            src={item.images[0]}
                            alt={item.productId?.name || item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                            <span>No image</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-2">
                          {item.productId?.name || item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.selectedColor?.name} - {item.selectedSize}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Số lượng: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">
                          {item.priceAtAdd?.toLocaleString("vi-VN") || '0'}đ
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tạm tính ({selectedItemsQuantity} sản phẩm)</span>
                    <span>{selectedItemsTotal.toLocaleString("vi-VN")}đ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Phí vận chuyển</span>
                    <span className={shippingFee === 0 ? "text-green-600" : ""}>
                      {shippingFee === 0 ? "Miễn phí" : `${shippingFee.toLocaleString("vi-VN")}đ`}
                    </span>
                  </div>
                  
                  {/* Voucher Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Mã giảm giá</span>
                      {selectedVoucher && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleVoucherRemove}
                          className="text-red-500 hover:text-red-700"
                        >
                          Bỏ chọn
                        </Button>
                      )}
                    </div>
                    
                    {selectedVoucher ? (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-green-800">{selectedVoucher.code}</p>
                            <p className="text-sm text-green-600">{selectedVoucher.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-green-800">
                              -{voucherDiscount.toLocaleString("vi-VN")}đ
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {availableVouchers.length > 0 ? (
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {availableVouchers.map((voucher) => {
                              const discount = calculateVoucherDiscount(voucher, selectedItemsTotal);
                              const isEligible = selectedItemsTotal >= voucher.minOrderAmount;
                              
                              return (
                                <div
                                  key={voucher._id}
                                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                    isEligible 
                                      ? 'border-border hover:border-primary/50' 
                                      : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                                  }`}
                                  onClick={() => isEligible && handleVoucherSelect(voucher)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-medium">{voucher.code}</p>
                                      <p className="text-sm text-muted-foreground">{voucher.description}</p>
                                      {!isEligible && (
                                        <p className="text-xs text-red-500">
                                          Tối thiểu {voucher.minOrderAmount.toLocaleString("vi-VN")}đ
                                        </p>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-medium">
                                        {voucher.discountType === 'percentage' 
                                          ? `-${voucher.discountValue}%`
                                          : `-${voucher.discountValue.toLocaleString("vi-VN")}đ`
                                        }
                                      </p>
                                      {isEligible && discount > 0 && (
                                        <p className="text-xs text-green-600">
                                          Tiết kiệm {discount.toLocaleString("vi-VN")}đ
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-2">
                            Không có mã giảm giá khả dụng
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng</span>
                    <span className="text-primary">{finalTotal.toLocaleString("vi-VN")}đ</span>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                >
                  {loading ? "Đang xử lý..." : "Đặt hàng"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Checkout;
