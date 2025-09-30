import { useState } from 'react';
import { mockProducts, categories, sportCategories } from '../../data/mockData';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import ProductCard from './ProductCard';

const ProductGrid = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSport, setSelectedSport] = useState('all');

  const filteredProducts = mockProducts.filter(product => {
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
    const sportMatch = selectedSport === 'all' || product.sport === selectedSport;
    return categoryMatch && sportMatch;
  });

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h2 className="text-3xl font-bold">Sản phẩm nổi bật</h2>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSport} onValueChange={setSelectedSport}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Chọn môn thể thao" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả môn thể thao</SelectItem>
                {sportCategories.map(sport => (
                  <SelectItem key={sport.id} value={sport.id}>
                    {sport.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Không tìm thấy sản phẩm nào phù hợp với bộ lọc.</p>
          </div>
        )}

        <div className="text-center mt-12">
          <Button variant="sport-outline" size="lg">
            Xem thêm sản phẩm
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
