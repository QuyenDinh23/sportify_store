import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
// import { mockProducts } from '../../data/mockData';
import { getProducts } from '../../api/product/productApi';

const BestSelling = () => {
  const [bestSellers, setBestSellers] = useState([]);

  const fetchBestSellers = async () => {
    try {
      const product = await getProducts();
      setBestSellers(product);
      console.log("best seller", product);
    } catch (error) {
      console.error('Error fetching best sellers:', error);
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
            Sản phẩm bán chạy nhất
          </h2>
          <p className="text-muted-foreground">
            Những sản phẩm được yêu thích nhất tại SportShop
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestSelling;
