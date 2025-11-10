import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/dashboard/DashBoard";
import Overview from "./pages/dashboard/Overview";
import CategoryManagement from "./pages/dashboard/CategoryManagement";
import LoginPage from "./pages/login/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import UseAuthCheck from "./hooks/use-authcheck";
import BrandManagement from "./pages/dashboard/BrandManagement";
import SubcategoryManagement from "./pages/dashboard/SubCategoryManagement";
import SportManagement from "./pages/dashboard/SportManagement";
import ProductManagement from "./pages/dashboard/ProductManagement";
import Home from "./pages/home/Home";
import ProductDetail from "./pages/product/ProductDetail";
import Cart from "./pages/cart/Cart";
import Checkout from "./pages/checkout/Checkout";
import OrderSuccess from "./pages/checkout/OrderSuccess";
import OrderDetail from "./pages/order/OrderDetail";
import UserProfile from "./pages/AccountManage/UserProfile";
import AddressManage from "./pages/AccountManage/AddressManagement";
import AddEditAddress from "./pages/AccountManage/AddressAddEdit";
import OrderHistory from "./pages/AccountManage/OrderHistory";
import SecurityMain from "./pages/AccountManage/SecurityManagement";
import ChangePassword from "./pages/AccountManage/ChangePassword";
import PermissopnAccess from "./pages/AccountManage/PermissionAccessManagement";
import VoucherManagement from "./pages/dashboard/VoucherManagement";
import Products from "./pages/product/Products";
import BlogList from "./pages/blog/BlogList";
import BlogDetail from "./pages/blog/BlogDetail";
import BlogManagement from "./pages/dashboard/BlogManagement";
import BlogPostForm from "./pages/dashboard/BlogPostForm";
import BlogCategoryManagement from "./pages/dashboard/BlogCategoryManagement";

import StaffAccount from "./pages/AccountManage/AccountMangageStaff";
import UsersManagement from "./pages/dashboard/UsersManagement";

import OrderManagement from "./pages/dashboard/OrderManagement";
import WarrantyManagement from "./pages/dashboard/WarrantyManagement";
import WarrantyRequest from "./pages/AccountManage/WarrantyRequest";
import ReturnWarrantyPolicy from "./pages/support/ReturnWarrantyPolicy";
import Register from "./pages/register/Register";
import ForgetPasswordRoutes from "./pages/ForgetPassword/ForgetPasswordRoutes";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <UseAuthCheck />
          <Routes>
            <Route path="/*" element={<ForgetPasswordRoutes />} />

            {/* route login */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<Register />} />

            <Route path="/" element={<Home />} />
            <Route path="products" element={<Products />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success/:orderId" element={<OrderSuccess />} />
            <Route path="/order-detail/:orderId" element={<OrderDetail />} />
            <Route
              path="/orders"
              element={<Navigate to="/account/order" replace />}
            />
            <Route
              path="/support/returns-warranty"
              element={<ReturnWarrantyPolicy />}
            />
            {/* route admin dashboard */}
            <Route element={<ProtectedRoute roles={["admin"]} />}>
              <Route path="/dashboard" element={<Dashboard />}>
                <Route index element={<Overview />} />
                <Route path="products" element={<ProductManagement />} />
                <Route path="categories" element={<CategoryManagement />} />
                <Route
                  path="subcategories"
                  element={<SubcategoryManagement />}
                />
                <Route path="account" element={<StaffAccount />} />
                <Route path="brands" element={<BrandManagement />} />
                <Route path="sports" element={<SportManagement />} />
                <Route path="users" element={<UsersManagement />} />
              </Route>
            </Route>
            <Route element={<ProtectedRoute roles={["staff-sale"]} />}>
              <Route path="/staff-sale/dashboard" element={<Dashboard />}>
                <Route index element={<Overview />} />
                <Route path="orders" element={<OrderManagement />} />
                <Route path="account" element={<StaffAccount />} />
                <Route path="warranty" element={<WarrantyManagement />} />
              </Route>
            </Route>
            <Route element={<ProtectedRoute roles={["staff-content"]} />}>
              <Route path="/staff-content/dashboard" element={<Dashboard />}>
                <Route index element={<Overview />} />

                <Route path="account" element={<StaffAccount />} />

                <Route path="vouchers" element={<VoucherManagement />} />
                <Route path="blog" element={<BlogManagement />} />
                <Route path="blog/create" element={<BlogPostForm />} />
                <Route path="blog/edit/:id" element={<BlogPostForm />} />

                <Route
                  path="blog/categories"
                  element={<BlogCategoryManagement />}
                />
              </Route>
            </Route>
            <Route element={<ProtectedRoute roles={["user"]} />}>
              <Route path="/account/profile" element={<UserProfile />} />
              <Route path="/account/address" element={<AddressManage />} />
              <Route path="/account/address/add" element={<AddEditAddress />} />
              <Route
                path="/account/address/edit/:id"
                element={<AddEditAddress />}
              />
              <Route path="/account/order" element={<OrderHistory />} />
              <Route path="/account/warranty" element={<WarrantyRequest />} />
              <Route path="/account/security" element={<SecurityMain />} />
              <Route
                path="/account/security/password"
                element={<ChangePassword />}
              />
              <Route
                path="/account/security/permissions"
                element={<PermissopnAccess />}
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
