import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/dashboard/DashBoard";
import Overview from "./pages/dashboard/Overview";
import CategoryManagement from "./pages/dashboard/CategoryManagement";
import BrandManagement from "./pages/dashboard/BrandManagement";
import SubcategoryManagement from "./pages/dashboard/SubCategoryManagement";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />}>
            <Route index element={<Overview />} />
            <Route path="/dashboard/categories" element={<CategoryManagement />} />
            <Route path="/dashboard/subcategories" element={<SubcategoryManagement />} />
            <Route path="/dashboard/brands" element={<BrandManagement />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
