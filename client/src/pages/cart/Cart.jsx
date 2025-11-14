import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Truck, Gift, X, Copy } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import { Checkbox } from "../../components/ui/checkbox";
import { Input } from "../../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { toast } from "sonner";
import Header from '../../components/Header';
import { MainNavigation } from '../../components/MainNavigation';
import Footer from '../../components/Footer';
import { removeFromCart, updateCartItem, clearCart, fetchCart } from "../../store/cartSlice";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAvailableVouchers } from "../../api/voucher/voucherApi";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalQuantity } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  
  // State for checkbox functionality
  const [selectAll, setSelectAll] = useState(true);
  const [selectedItems, setSelectedItems] = useState(new Set());
  
  // State for voucher functionality
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [voucherInput, setVoucherInput] = useState('');

  // Fetch cart khi component mount (chỉ khi user đã đăng nhập)
  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    }
  }, [dispatch, user]);

  // Initialize selected items when cart items change
  useEffect(() => {
    if (items.length > 0) {
      setSelectedItems(new Set(items.map(item => item._id)));
      setSelectAll(true);
    }
  }, [items]);

  // Load available vouchers from API
  useEffect(() => {
    const loadVouchers = async () => {
      try {
        console.log('Loading vouchers from API...');
        const vouchers = await getAvailableVouchers();
        console.log('Loaded vouchers:', vouchers);
        
        // Ensure vouchers is an array
        if (Array.isArray(vouchers)) {
          setAvailableVouchers(vouchers);
        } else {
          console.error('Vouchers is not an array:', vouchers);
          throw new Error('Invalid vouchers data format');
        }
      } catch (error) {
        console.error('Failed to load vouchers:', error);
        toast.error('Không thể tải danh sách voucher');
        
        // Fallback to mock data if API fails
        const mockVouchers = [
          {
            _id: '1',
            code: 'WMOFF5',
            description: 'Giảm 5% (max 40.000) (cho đơn từ 300.000₫)',
            discountType: 'percentage',
            discountValue: 5,
            minOrderAmount: 300000,
            maxDiscount: 40000
          },
          {
            _id: '2',
            code: 'WMOFF9',
            description: 'Giảm 9% (max 100.000) (cho đơn từ 800.000₫)',
            discountType: 'percentage',
            discountValue: 9,
            minOrderAmount: 800000,
            maxDiscount: 100000
          }
        ];
        setAvailableVouchers(mockVouchers);
      }
    };

    loadVouchers();
  }, []);

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để sử dụng giỏ hàng");
      return;
    }
    
    try {
      if (newQuantity <= 0) {
        await dispatch(removeFromCart(itemId)).unwrap();
        toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
      } else {
        await dispatch(updateCartItem({ itemId, quantity: newQuantity })).unwrap();
      }
    } catch (error) {
      toast.error(error || "Có lỗi xảy ra");
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để sử dụng giỏ hàng");
      return;
    }
    
    try {
      await dispatch(removeFromCart(itemId)).unwrap();
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
    } catch (error) {
      toast.error(error || "Có lỗi xảy ra khi xóa sản phẩm");
    }
  };

  const handleClearCart = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để sử dụng giỏ hàng");
      return;
    }
    
    try {
      await dispatch(clearCart()).unwrap();
      toast.success("Đã xóa tất cả sản phẩm khỏi giỏ hàng");
    } catch (error) {
      toast.error(error || "Có lỗi xảy ra khi xóa giỏ hàng");
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }
    
    if (selectedItems.size === 0) {
      toast.error("Vui lòng chọn ít nhất một sản phẩm để thanh toán");
      return;
    }
    
    // Truyền danh sách các sản phẩm được chọn qua location state
    navigate('/checkout', { 
      state: { 
        selectedItemIds: Array.from(selectedItems) 
      } 
    });
  };

  // Handle select all checkbox
  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedItems(new Set(items.map(item => item._id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  // Handle individual item checkbox
  const handleSelectItem = (itemId, checked) => {
    const newSelectedItems = new Set(selectedItems);
    if (checked) {
      newSelectedItems.add(itemId);
    } else {
      newSelectedItems.delete(itemId);
    }
    setSelectedItems(newSelectedItems);
    
    // Update select all state
    setSelectAll(newSelectedItems.size === items.length);
  };

  // Calculate selected items total
  const selectedItemsTotal = items
    .filter(item => selectedItems.has(item._id))
    .reduce((total, item) => total + (item.priceAtAdd * item.quantity), 0);

  const selectedItemsQuantity = items
    .filter(item => selectedItems.has(item._id))
    .reduce((total, item) => total + item.quantity, 0);

  // Voucher handlers
  const handleVoucherSelect = (voucher) => {
    setSelectedVoucher(voucher);
    setVoucherInput(voucher.code);
    setVoucherModalOpen(false);
    toast.success(`Đã chọn voucher ${voucher.code}`);
  };

  const handleVoucherRemove = () => {
    setSelectedVoucher(null);
    setVoucherInput('');
    toast.success('Đã bỏ chọn voucher');
  };

  const handleVoucherInputChange = (value) => {
    setVoucherInput(value);
    // Auto-select voucher if code matches
    const matchingVoucher = availableVouchers.find(v => v.code === value);
    if (matchingVoucher) {
      setSelectedVoucher(matchingVoucher);
    } else {
      setSelectedVoucher(null);
    }
  };

  const handleCopyVoucher = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã copy mã ${code}`);
  };

  // Calculate voucher discount
  const calculateVoucherDiscount = (voucher, orderAmount) => {
    if (!voucher) return 0;
    
    if (orderAmount < voucher.minOrderAmount) return 0;
    
    let discount = 0;
    if (voucher.discountType === 'percentage') {
      discount = (orderAmount * voucher.discountValue) / 100;
      // Use maxDiscount if available, otherwise no limit
      if (voucher.maxDiscount) {
        discount = Math.min(discount, voucher.maxDiscount);
      }
    } else if (voucher.discountType === 'fixed') {
      discount = voucher.discountValue;
    }
    
    return Math.min(discount, orderAmount);
  };

  const voucherDiscount = calculateVoucherDiscount(selectedVoucher, selectedItemsTotal);
  
  // Tính phí ship (giống như Checkout)
  const shippingFee = selectedItemsTotal >= 500000 ? 0 : 30000;
  const finalTotal = selectedItemsTotal + shippingFee - voucherDiscount;

  // Show login message if user is not logged in
  if (!user || user.role !== 'user') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <MainNavigation />
        
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-foreground mb-4">Vui lòng đăng nhập</h1>
            <p className="text-muted-foreground mb-8">Bạn cần đăng nhập để xem giỏ hàng</p>
            <Link to="/login">
              <Button size="lg" variant="sport">
                Đăng nhập
              </Button>
            </Link>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <MainNavigation />
        
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-foreground mb-4">Giỏ hàng trống</h1>
            <p className="text-muted-foreground mb-8">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
            <Link to="/">
              <Button size="lg" variant="sport">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Tiếp tục mua sắm
              </Button>
            </Link>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Giỏ hàng</h1>
              <p className="text-muted-foreground mt-2">
                {totalQuantity} sản phẩm trong giỏ hàng
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleClearCart}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa tất cả
            </Button>
          </div>
          
          {/* Select All Checkbox */}
          <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
            <Checkbox
              id="select-all"
              checked={selectAll}
              onCheckedChange={handleSelectAll}
            />
            <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
              Chọn tất cả sản phẩm
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item._id} className="bg-card border border-border rounded-lg p-6">
                <div className="flex gap-4">
                  {/* Checkbox */}
                  <div className="flex items-start pt-2">
                    <Checkbox
                      id={`item-${item._id}`}
                      checked={selectedItems.has(item._id)}
                      onCheckedChange={(checked) => handleSelectItem(item._id, checked)}
                    />
                  </div>
                  
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    {item.images && item.images[0] && item.images[0].trim() !== "" ? (
                      <img
                        src={item.images[0]}
                        alt={item.productId?.name || 'Product'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        <span>No image</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link 
                      to={`/product/${item.productId?._id || item.productId}`}
                      className="hover:text-primary transition-colors"
                    >
                      <h3 className="font-semibold text-foreground line-clamp-2 mb-2">
                        {item.productId?.name || item.name}
                      </h3>
                    </Link>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      Thương hiệu: {item.productId?.brand?.name || 'N/A'}
                    </p>
                    
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-2">
                        <span>Màu:</span>
                        <div 
                          className="w-4 h-4 rounded-full border border-border"
                          style={{ backgroundColor: item.selectedColor?.hex || '#ccc' }}
                          title={item.selectedColor?.name || 'N/A'}
                        />
                        <span>{item.selectedColor?.name || 'N/A'}</span>
                      </div>
                      <div>
                        <span>Kích thước: </span>
                        <span className="font-medium">{item.selectedSize || 'N/A'}</span>
                      </div>
                      {item.availableStock && (
                        <div className="text-xs text-muted-foreground">
                          Còn {item.availableStock} sản phẩm
                        </div>
                      )}
                    </div>

                    {/* Price and Quantity */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold text-primary">
                          {item.priceAtAdd?.toLocaleString("vi-VN") || '0'}đ
                        </span>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-border rounded-lg">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                            className="rounded-r-none h-8 w-8"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="px-4 font-semibold min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                            className="rounded-l-none h-8 w-8"
                            disabled={item.quantity >= (item.availableStock || 999)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item._id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            {/* Freeship Banner */}
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">
                  {selectedItemsTotal < 500000
                    ? `Thêm ${(500000 - selectedItemsTotal).toLocaleString("vi-VN")}đ vào giỏ hàng để được freeship!`
                    : 'Bạn đã được freeship!'
                  }
                </span>
              </div>
              {selectedItemsTotal < 500000 && (
                <>
                  <div className="w-full bg-blue-100 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((selectedItemsTotal / 500000) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">
                    Còn {(500000 - selectedItemsTotal).toLocaleString("vi-VN")}đ để được freeship
                  </p>
                </>
              )}
            </div>

            {/* Promotion Banner */}
            <div className="mb-4 p-4 bg-pink-50 border border-pink-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="h-5 w-5 text-pink-600" />
                <span className="font-medium text-pink-800">MỪNG NGÀY PHỤ NỮ 13.10 - 17.10</span>
              </div>
              <p className="text-sm text-pink-700 mb-2">
                Nhập mã WMOFF9 giảm 9% (tối đa 100K) + freeship đơn hàng từ 800K
              </p>
              <Button size="sm" variant="outline" className="text-pink-600 border-pink-300 hover:bg-pink-50">
                SAO CHÉP MÃ
              </Button>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold text-foreground mb-6">Tóm tắt đơn hàng</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Tạm tính ({selectedItemsQuantity} sản phẩm)</span>
                  <span>{selectedItemsTotal.toLocaleString("vi-VN")}đ</span>
                </div>
                
                <div className="flex justify-between text-muted-foreground">
                  <span>Phí vận chuyển</span>
                  <span className={shippingFee === 0 ? "text-green-600" : ""}>
                    {shippingFee === 0 ? "Miễn phí" : `${shippingFee.toLocaleString("vi-VN")}đ`}
                  </span>
                </div>
                
                {voucherDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá ({selectedVoucher?.code})</span>
                    <span>-{voucherDiscount.toLocaleString("vi-VN")}đ</span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold text-foreground">
                  <span>Tổng cộng</span>
                  <span className="text-primary">{finalTotal.toLocaleString("vi-VN")}đ</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button 
                  size="lg" 
                  className="w-full" 
                  variant="sport"
                  onClick={handleCheckout}
                  disabled={selectedItemsQuantity === 0}
                >
                  Thanh toán
                </Button>
                
                <Link to="/">
                  <Button size="lg" variant="outline" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Tiếp tục mua sắm
                  </Button>
                </Link>
              </div>

              {/* Voucher Section */}
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="font-semibold text-foreground mb-3">Mã giảm giá</h3>
                
                {selectedVoucher ? (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-green-800">{selectedVoucher.code}</p>
                        <p className="text-sm text-green-600">{selectedVoucher.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleVoucherRemove}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Nhập mã voucher"
                        value={voucherInput}
                        onChange={(e) => handleVoucherInputChange(e.target.value)}
                        className="flex-1"
                      />
                      <Button variant="outline" size="sm">
                        Áp dụng
                      </Button>
                    </div>
                    
                    <Dialog open={voucherModalOpen} onOpenChange={setVoucherModalOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                          Xem danh sách voucher
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Nhập mã voucher</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Giảm giá/phiếu vận chuyển đủ điều kiện áp dụng sẽ được hiển thị ở trang tiếp theo. 
                            Voucher chưa sử dụng vẫn còn trong tài khoản của bạn.
                          </p>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Nhập mã voucher</label>
                            <div className="flex gap-2">
                              <Input
                                type="text"
                                placeholder="Nhập mã voucher"
                                value={voucherInput}
                                onChange={(e) => handleVoucherInputChange(e.target.value)}
                                className="flex-1"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setVoucherInput('')}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <h4 className="font-medium">MÃ ƯU ĐÃI - SỐ LƯỢNG CÓ HẠN</h4>
                            <div className="space-y-2">
                              {Array.isArray(availableVouchers) && availableVouchers.length > 0 ? (
                                availableVouchers.map((voucher) => {
                                  const isEligible = selectedItemsTotal >= voucher.minOrderAmount;
                                  const discount = calculateVoucherDiscount(voucher, selectedItemsTotal);
                                  
                                  return (
                                    <div
                                      key={voucher._id}
                                      className={`p-3 border-2 border-dashed rounded-lg ${
                                        isEligible 
                                          ? 'border-blue-300 bg-blue-50' 
                                          : 'border-gray-300 bg-gray-50'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-blue-600">{voucher.code}</span>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleCopyVoucher(voucher.code)}
                                              className="text-blue-600 hover:text-blue-800"
                                            >
                                              <Copy className="h-3 w-3 mr-1" />
                                              Sao chép
                                            </Button>
                                          </div>
                                          <p className="text-sm text-muted-foreground">{voucher.description}</p>
                                          <div className="text-xs text-muted-foreground mt-1">
                                            {voucher.discountType === 'percentage' 
                                              ? `Giảm ${voucher.discountValue}%`
                                              : `Giảm ${voucher.discountValue.toLocaleString("vi-VN")}đ`
                                            }
                                            {voucher.maxDiscount && (
                                              <span> (tối đa {voucher.maxDiscount.toLocaleString("vi-VN")}đ)</span>
                                            )}
                                          </div>
                                          {!isEligible && (
                                            <p className="text-xs text-red-500 mt-1">
                                              Cần đơn hàng tối thiểu {voucher.minOrderAmount.toLocaleString("vi-VN")}đ
                                            </p>
                                          )}
                                          {isEligible && discount > 0 && (
                                            <p className="text-xs text-green-600 mt-1">
                                              Tiết kiệm {discount.toLocaleString("vi-VN")}đ
                                            </p>
                                          )}
                                        </div>
                                        <Button
                                          variant={isEligible ? "default" : "outline"}
                                          size="sm"
                                          onClick={() => isEligible && handleVoucherSelect(voucher)}
                                          disabled={!isEligible}
                                        >
                                          Áp dụng
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="text-center py-4 text-muted-foreground">
                                  <p>Không có voucher khả dụng</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Cart;
