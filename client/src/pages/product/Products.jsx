import { useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../../components/ui/sheet";
import FilterSidebar from "../../components/product/FilterSidebar";
import ProductCard from "../../components/product/ProductCard";
import { useSearchParams } from "react-router-dom";
import { getProductsByFilter } from "../../api/product/productApi";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { MainNavigation } from "../../components/MainNavigation";

const Products = () => {
    console.log("da chay vao day Products");
  const [filters, setFilters] = useState({
    brands: [],
    colors: [],
    sizes: [],
    sports: [],
    priceRange: [0, 10000000],
  });

  const [products, setProducts] = useState([]);
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("category");
  const subcategoryId = searchParams.get("sub");
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await getProductsByFilter({
          category: categoryId || "all",
          subcategory: subcategoryId || "all",
          brand: filters.brands.map((b) => (typeof b === "object" ? b.id : b)).join(",") ||"all",
          sport: filters.sports.map((s) => (typeof s === "object" ? s.id : s)).join(",") ||"all",
        });
        setProducts(res.products);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, [categoryId, subcategoryId, filters]);

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
                  products={products} />
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
      </div>
      <Footer />
    </div>
  );
};

export default Products;
