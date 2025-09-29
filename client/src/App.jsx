import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/dashboard/DashBoard";
import Overview from "./pages/dashboard/Overview";
import CategoryManagement from "./pages/dashboard/CategoryManagement";
import LoginPage from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import UseAuthCheck from "./hooks/use-authcheck";import BrandManagement from "./pages/dashboard/BrandManagement";
import SubcategoryManagement from "./pages/dashboard/SubCategoryManagement";
import SportManagement from "./pages/dashboard/SportManagement";
import ProductManagement from "./pages/dashboard/ProductManagement";


const queryClient = new QueryClient();

const App = () => {
  // useAuthCheck();
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
    
            {/* route dashboard */}
            <Route element={<ProtectedRoute roles={["admin", "staff"]} />}>
              <Route path="/" element={<Dashboard />}>
                <Route index element={<Overview />} />
                <Route path="/dashboard/products" element={<ProductManagement />} />
                <Route
                  path="/dashboard/categories"
                  element={<CategoryManagement />}
                />
                <Route path="/dashboard/subcategories" element={<SubcategoryManagement />} />
                <Route path="/dashboard/brands" element={<BrandManagement />} />
                <Route path="/dashboard/sports" element={<SportManagement />} />
              </Route>
            </Route>
            <Route element={<ProtectedRoute roles={["user"]} />}></Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
