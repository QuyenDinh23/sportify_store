import {
  Search,
  ShoppingCart,
  User,
  Menu,
  Settings,
  HeadphonesIcon,
  Package,
  RotateCcw,
  Home,
  ShieldCheck,
  LogOut,
  BookOpen,
  Info,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchCart } from "../store/cartSlice";
import { useEffect, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuHover,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

import { authApi } from "../services/authApi";
import { searchActiveProducts } from "../api/product/productApi";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { totalQuantity } = useSelector((state) => state.cart);
  const user = useSelector((state) => state.auth.user);
  const [keyword, setKeyword] = useState("");

  const handleKeyDown = async (e) => {
    if (e.key === "Enter") {
      try {
        const products = await searchActiveProducts(keyword);
        navigate("/products", { state: { products } });
        window.scrollTo(0, 0);
      } catch (error) {
        console.error("Error searching products:", error);
      }
    }
  };

  // Fetch cart khi component mount (chỉ khi user đã đăng nhập)
  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    }
  }, [dispatch, user]);

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-xl text-foreground hidden sm:block">
                SportShop
              </span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Tìm kiếm sản phẩm thể thao..."
                className="pl-10 pr-4 w-full"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* About Us Link */}
            <Button
              variant="ghost"
              className="hidden md:flex items-center gap-2"
              asChild
            >
              <Link to="/about">
                <Info className="h-5 w-5" />
                <span className="text-sm">Về chúng tôi</span>
              </Link>
            </Button>

            {/* Blog Link */}
            <Button
              variant="ghost"
              className="hidden md:flex items-center gap-2"
              asChild
            >
              <Link to="/blog">
                <BookOpen className="h-5 w-5" />
                <span className="text-sm">Tin tức</span>
              </Link>
            </Button>

            {/* Support Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="hidden md:flex items-center gap-2"
                >
                  <HeadphonesIcon className="h-5 w-5" />
                  <span className="text-sm">Hỗ trợ</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card z-[100]">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    if (user) {
                      navigate("/account/order");
                    } else {
                      navigate("/login");
                    }
                  }}
                >
                  <Package className="mr-2 h-4 w-4" />
                  <span>Theo dõi đơn hàng</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => navigate("/support/returns-warranty")}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  <span>Đổi trả và bảo hành</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <HeadphonesIcon className="mr-2 h-4 w-4" />
                  <span>Hỗ trợ CSKH</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {user && (user.role === "admin" || user.role === "staff") && (
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex"
                asChild
              >
                <Link to="/dashboard">
                  <Settings className="h-5 w-5" />
                </Link>
              </Button>
            )}

            <DropdownMenuHover>
              <DropdownMenuTrigger asChild>
                <Link to={user ? `/account/profile` : "/login"}>
                  <Button
                    title={user ? "" : "Đăng nhập"}
                    variant="ghost"
                    size="icon"
                    className="hidden md:flex"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              </DropdownMenuTrigger>
              {user ? (
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-card z-[100]"
                >
                  <Link to={"/account/profile"}>
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Thông tin tài khoản</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link to={"/account/address"}>
                    <DropdownMenuItem className="cursor-pointer">
                      <Home className="mr-2 h-4 w-4" />
                      <span>Địa chỉ của tôi</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link to={"/account/order"}>
                    <DropdownMenuItem className="cursor-pointer">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      <span>Lịch sử mua hàng</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link to={"/account/warranty"}>
                    <DropdownMenuItem className="cursor-pointer">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      <span>Yêu cầu bảo hành</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link to={"/account/security"}>
                    <DropdownMenuItem className="cursor-pointer">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      <span>Bảo mật</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem
                    onClick={authApi.logout}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              ) : (
                ""
              )}
            </DropdownMenuHover>

            {/* Cart Button */}

            <Button variant="ghost" size="icon" className="relative" asChild>
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
                {user && totalQuantity > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-accent">
                    {totalQuantity}
                  </Badge>
                )}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
