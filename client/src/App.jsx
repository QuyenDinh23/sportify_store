import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
            {/* route login */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Home />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success/:orderId" element={<OrderSuccess />} />
            <Route path="/order-detail/:orderId" element={<OrderDetail />} />
            {/* route dashboard */}
            <Route element={<ProtectedRoute roles={["admin", "staff"]} />}>
              <Route path="/dashboard" element={<Dashboard />}>
                <Route index element={<Overview />} />
                <Route path="products" element={<ProductManagement />} />
                <Route path="categories" element={<CategoryManagement />} />
                <Route
                  path="subcategories"
                  element={<SubcategoryManagement />}
                />
                <Route path="brands" element={<BrandManagement />} />
                <Route path="sports" element={<SportManagement />} />
              </Route>
            </Route>
            <Route element={<ProtectedRoute roles={["user"]} />}>
              <Route path="/account/profile" element={<UserProfile />} />
              <Route path="/account/address" element={<AddressManage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
