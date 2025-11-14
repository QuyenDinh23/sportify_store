import {
  BarChart3,
  Package,
  Grid3X3,
  Award,
  Trophy,
  Settings,
  Home,
  LogOut,
  Ticket,
  Newspaper,
  User,
  Users,
  ShoppingCart,
  Shield,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "../ui/sidebar";
import { Button } from "../ui/button";
import { authApi } from "../../services/authApi";
import { useSelector } from "react-redux";

let menuItems = [];
const menuItemsAdmin = [
  { title: "Tổng quan", url: "/dashboard", icon: BarChart3 },
  { title: "Quản lý sản phẩm", url: "/dashboard/products", icon: Package },
  { title: "Quản lý danh mục", url: "/dashboard/categories", icon: Grid3X3 },
  {
    title: "Quản lý danh mục con",
    url: "/dashboard/subcategories",
    icon: Award,
  },
  { title: "Quản lý thương hiệu", url: "/dashboard/brands", icon: Award },
  { title: "Quản lý môn thể thao", url: "/dashboard/sports", icon: Trophy },
  { title: "Quản lý người dùng", url: "/dashboard/users", icon: Users },
];

const menuItemSaleStaff = [
  {
    title: "Quản lý đơn hàng",
    url: "/staff-sale/dashboard/orders",
    icon: ShoppingCart,
  },
  {
    title: "Quản lý bảo hành",
    url: "/staff-sale/dashboard/warranty",
      icon: Shield,
  },
];
const menuItemsContentStaff = [
  {
    title: "Quản lý mã giảm giá",
    url: "/staff-content/dashboard/vouchers",
    icon: Ticket,
  },
  {
    title: "Quản lý blog",
    url: "/staff-content/dashboard/blog",
    icon: Newspaper,
  },
];
export function DashboardSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";
  const user = useSelector((state) => state.auth.user);

  if (user.role === "admin") {
    menuItems = menuItemsAdmin;
  } else if (user.role === "staff-sale") {
    menuItems = menuItemSaleStaff;
  } else if (user.role === "staff-content") {
    menuItems = menuItemsContentStaff;
  }
  // eslint-disable-next-line no-unused-vars
  const isActive = (path) => currentPath === path;

  const handleLogOut = async () => {
    await authApi.logout();
  };

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent>
        {/* Logo */}
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            {!isCollapsed && (
              <span className="font-bold text-lg">SportShop Admin</span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Quản lý</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent hover:text-accent-foreground"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Bottom Actions */}
        <div className="mt-auto p-4 border-t">
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              asChild
            >
              <NavLink to="/">
                <Home className="h-4 w-4" />
                {!isCollapsed && <span className="ml-2">Về trang chủ</span>}
              </NavLink>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              asChild
            >
              <NavLink to={user.role === "admin" ? "/dashboard/account" : user.role === "staff-sale" ? "/staff-sale/dashboard/account" : "/staff-content/dashboard/account"}>
                <User className="h-4 w-4" />
                {!isCollapsed && <span className="ml-2">Tài khoản</span>}
              </NavLink>
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <Settings className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Cài đặt</span>}
            </Button>
            <Button
              onClick={handleLogOut}
              variant="ghost"
              size="sm"
              className="w-full justify-start"
            >
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Đăng xuất</span>}
            </Button>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
