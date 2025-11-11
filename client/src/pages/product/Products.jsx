import { useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../../components/ui/sheet";
import FilterSidebar from "../../components/product/FilterSidebar";
import ProductCard from "../../components/product/ProductCard";
import { useSearchParams, useLocation } from "react-router-dom";
import { getProductsByFilter } from "../../api/product/productApi";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { MainNavigation } from "../../components/MainNavigation";
import Pagination from '../../components/pagination/Pagination';

const Products = () => {
  const location = useLocation();
  const [filters, setFilters] = useState({
    brands: [],
    colors: [],
    sizes: [],
    sports: [],
    subcategories: [],
    priceRange: [0, 10000000],
  });

  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("category");
  const subcategoryId = searchParams.get("sub");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (location.state?.products) {
          setAllProducts(location.state.products);
          setProducts(location.state.products);
        } else {
          const res = await getProductsByFilter({
            category: categoryId || "all",
            subcategory: subcategoryId || "all",
          });
          setAllProducts(res.products);
          setProducts(res.products);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, [location.state, categoryId, subcategoryId]);
  useEffect(() => {
    const filtered = allProducts.filter((p) => {
      const brandMatch = filters.brands.length === 0 || filters.brands.includes(p.brand?._id);
      const sportMatch = filters.sports.length === 0 || filters.sports.includes(p.sport?._id);
      const colorMatch = filters.colors.length === 0 || p.colors?.some((c) => filters.colors.includes(c.name));
      const sizeMatch = filters.sizes.length === 0 || p.colors?.some((c) => c.sizes?.some((s) => filters.sizes.includes(s.size)));
      const subcategoryMatch = filters.subcategories.length === 0 || filters.subcategories.includes(p.subcategory?._id);
      return brandMatch && sportMatch && colorMatch && sizeMatch && subcategoryMatch;
    });

    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setProducts(filtered.slice(startIndex, endIndex));
  }, [filters, allProducts, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  return (
    <div className="min-h-screen bg-background">
      <Header title="Sản phẩm" />
      <MainNavigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <FilterSidebar
                onFilterChange={setFilters}
                products={allProducts} />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-6">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Bộ lọc
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                  <FilterSidebar onFilterChange={setFilters} className="border-none" />
                </SheetContent>
              </Sheet>
            </div>

            {/* Products Grid */}
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">
                  Không tìm thấy sản phẩm phù hợp với bộ lọc của bạn
                </p>
              </div>
            )}
          </div>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
      <Footer />
    </div>
  );
};

export default Products;
