import { sportCategories } from '../../data/mockData';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useState } from 'react';
import { getSportsShoes } from '../../api/product/productApi';
import { useEffect } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../../components/ui/carousel';
import ProductCard from './ProductCard';

const CategoryGrid = () => {
  const [sportShoes, setSportShoes] = useState([]);

  const fetchSportShoes = async () => {
    try {
      const product = await getSportsShoes(10);
      console.log("product in category grid", product);
      setSportShoes(product);
    } catch (error) {
      console.error('Error fetching best sellers:', error);
    }
  };

  useEffect(() => {
    fetchSportShoes();
  }, []);
  return (
    <section className="py-16 bg-sport-muted">
      <div className="container mx-auto px-4">
        {/* Product Categories */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-left mb-6 text-gray-900 border-l-4 border-gray-900 pl-3 leading-tight">
            Giày Thể Thao Giá Cực Tốt
          </h2>

          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card
                key={category.id}
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <CardContent className="p-8 text-center">
                  <div className="text-6xl mb-4">{category.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {category.subcategories.length} loại sản phẩm
                  </p>
                  <Button
                    variant="sport-outline"
                    size="sm"
                    className="group-hover:shadow-md"
                  >
                    Xem tất cả
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div> */}
          <div className="relative">
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

        {/* Sport Categories */}
        <div>
          <h2 className="text-3xl font-bold text-center mb-8">Môn thể thao</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {sportCategories.map((sport) => (
              <Card
                key={sport.id}
                className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    {sport.icon}
                  </div>
                  <h3 className="font-medium text-sm">{sport.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
