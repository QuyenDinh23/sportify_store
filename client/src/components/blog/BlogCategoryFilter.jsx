import { useState, useEffect } from 'react';
import { getBlogCategories } from '../../api/blog/blogApi';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const BlogCategoryFilter = ({ value, onChange, placeholder = "Chọn danh mục" }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getBlogCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger className="w-full sm:w-64">
          <SelectValue placeholder="Đang tải..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value || 'all'} onValueChange={onChange}>
      <SelectTrigger className="w-full sm:w-64">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Tất cả danh mục</SelectItem>
        {categories.map((category) => (
          <SelectItem key={category._id} value={category._id}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default BlogCategoryFilter;

