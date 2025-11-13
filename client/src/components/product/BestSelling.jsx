import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { getProducts } from '../../api/product/productApi';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../../components/ui/carousel';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';

const BestSelling = () => {
  const [bestSellers, setBestSellers] = useState([]);
  const navigate = useNavigate();
  const fetchBestSellers = async () => {
    try {
      const product = await getProducts();
      setBestSellers(product);
    } catch (error) {
      console.error('Error fetching best sellers:', error);
    }
  };

  const handleShowAllProducts = async () => {
    try {
      const allProducts = await getProducts();
      navigate("/products", { state: { products: allProducts } });
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Error fetching all sport shoes:", error);
    }
  };

  useEffect(() => {
    fetchBestSellers();
  }, []);

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Danh sách tất cả sản phẩm
          </h2>
          <p className="text-muted-foreground">
            Những sản phẩm được yêu thích nhất tại SportShop
          </p>
        </div>
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div> */}
        <div className="relative">
          <div className="flex justify-between items-center mb-4">
            <Button onClick={handleShowAllProducts} variant="outline" className="text-sm">
              Tất cả sản phẩm
            </Button>
          </div>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {bestSellers.map((product) => (
                <CarouselItem key={product._id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/4">
                  <ProductCard product={product} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0" />
            <CarouselNext className="right-0" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default BestSelling;
