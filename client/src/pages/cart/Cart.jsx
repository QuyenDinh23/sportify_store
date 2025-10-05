import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import { cn } from "../../lib/utils";
import { toast } from "sonner";
import Header from '../../components/Header';
import { MainNavigation } from '../../components/MainNavigation';
import Footer from '../../components/Footer';
import { removeFromCart, updateCartItem, clearCart, fetchCart } from "../../store/cartSlice";
import { useEffect } from "react";

const Cart = () => {
  const dispatch = useDispatch();
  const { items, totalQuantity, totalPrice, loading, error } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  // Fetch cart khi component mount (chỉ khi user đã đăng nhập)
  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    }
  }, [dispatch, user]);

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
    // TODO: Implement checkout logic
    toast.success("Chức năng thanh toán sẽ được cập nhật sau");
  };

  // Show login message if user is not logged in
  if (!user) {
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
        <div className="flex items-center justify-between mb-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <div key={item._id || index} className="bg-card border border-border rounded-lg p-6">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    {item.images?.[0] && item.images[0].trim() !== "" ? (
                      <img
                        src={item.images[0]}
                        alt={item.name || 'Product'}
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
                      to={`/product/${item.productId || '#'}`}
                      className="hover:text-primary transition-colors"
                    >
                      <h3 className="font-semibold text-foreground line-clamp-2 mb-2">
                        {item.name || 'Product'}
                      </h3>
                    </Link>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      Thương hiệu: {item.productId?.brand?.name || 'Unknown'}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-2">
                        <span>Màu:</span>
                        <div 
                          className="w-4 h-4 rounded-full border border-border"
                          style={{ backgroundColor: item.selectedColor?.hex || '#ccc' }}
                          title={item.selectedColor?.name || 'Unknown'}
                        />
                        <span>{item.selectedColor?.name || 'Unknown'}</span>
                      </div>
                      <div>
                        <span>Kích thước: </span>
                        <span className="font-medium">{item.selectedSize}</span>
                      </div>
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
            <div className="bg-card border border-border rounded-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold text-foreground mb-6">Tóm tắt đơn hàng</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Tạm tính ({totalQuantity} sản phẩm)</span>
                  <span>{totalPrice.toLocaleString("vi-VN")}đ</span>
                </div>
                
                <div className="flex justify-between text-muted-foreground">
                  <span>Phí vận chuyển</span>
                  <span className="text-green-600">Miễn phí</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold text-foreground">
                  <span>Tổng cộng</span>
                  <span className="text-primary">{totalPrice.toLocaleString("vi-VN")}đ</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button 
                  size="lg" 
                  className="w-full" 
                  variant="sport"
                  onClick={handleCheckout}
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

              {/* Promo Code */}
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="font-semibold text-foreground mb-3">Mã giảm giá</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập mã giảm giá"
                    className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button variant="outline" size="sm">
                    Áp dụng
                  </Button>
                </div>
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
