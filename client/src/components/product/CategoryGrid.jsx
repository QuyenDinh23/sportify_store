import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useState } from 'react';
import { getDiscountedProducts, getProductsBySport, getSportsShoes } from '../../api/product/productApi';
import { useEffect } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../../components/ui/carousel';
import ProductCard from './ProductCard';
import { getSports } from '../../api/sport/sportApi';
import { useNavigate } from "react-router-dom";

const CategoryGrid = () => {
  const [sportShoes, setSportShoes] = useState([]);
  const [sports, setSports] = useState([]);
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const navigate = useNavigate();
  const fetchSportShoes = async (limit = "all") => {
    try {
      const product = await getSportsShoes(limit);
      setSportShoes(product);
    } catch (error) {
      console.error('Error fetching best sellers:', error);
    }
  };

  const fetchDiscounted = async () => {
    try {
      const data = await getDiscountedProducts("all");
      setDiscountedProducts(data);
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm giảm giá:", error);
    }
  };

  const fetchSports = async () => {
    try {
      const res = await getSports();
      setSports(res);
    } catch (error) {
      console.error('Error fetching best sellers:', error);
    }
  };

  const handleShowAllSportShoes = async () => {
    try {
      const allProducts = await getSportsShoes("all");
      navigate("/products", { state: { products: allProducts } });
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Error fetching all sport shoes:", error);
    }
  };
  const handleShowAllDiscounted = async () => {
    try {
      const allProducts = await getDiscountedProducts("all");
      navigate("/products", { state: { products: allProducts } });
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Error fetching all sport shoes:", error);
    }
  };
  const handleShowProductsBySport = async (sportId) => {
    try {
      const products = await getProductsBySport(sportId, "all");
      navigate("/products", { state: { products } });
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm theo môn thể thao:", error);
    }
  };
  useEffect(() => {
    fetchSportShoes();
    fetchDiscounted();
    fetchSports();
  }, []);
  return (
    <section className="py-16 bg-sport-muted">
      <div className="container mx-auto px-4">
        {/* Product Categories */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-left mb-6 text-gray-900 border-l-4 border-gray-900 pl-3 leading-tight">
            Giày Thể Thao Giá Cực Tốt
          </h2>

          <div className="relative">
            <div className="flex justify-between items-center mb-4">
              <Button onClick={handleShowAllSportShoes} variant="outline" className="text-sm">
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
                {sportShoes.map((product) => (
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

        {/* Product Discounted */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-left mb-6 text-gray-900 border-l-4 border-gray-900 pl-3 leading-tight">
            Sản phẩm giảm giá
          </h2>

          <div className="relative">
            <div className="flex justify-between items-center mb-4">
              <Button onClick={handleShowAllDiscounted} variant="outline" className="text-sm">
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
                {discountedProducts.map((product) => (
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

        {/* Sport Categories */}
        <div>
          <h2 className="text-3xl font-bold text-left mb-6 text-gray-900 border-l-4 border-gray-900 pl-3 leading-tight">
            Môn Thể Thao
          </h2>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {sports.map((sport) => (
                <CarouselItem
                  key={sport.id}
                  className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/6"
                >
                  <Card
                    key={sport._id}
                    onClick={() => handleShowProductsBySport(sport._id)}
                    className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                        {sport.icon}
                      </div>
                      <h3 className="font-medium text-sm">{sport.name}</h3>
                    </CardContent>
                  </Card>
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

export default CategoryGrid;
