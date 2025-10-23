import { useState } from 'react';
import { Input } from '../ui/input';
import { Search } from 'lucide-react';

const BlogSearch = ({ value, onChange, placeholder = "Tìm kiếm bài viết..." }) => {
  const [searchTerm, setSearchTerm] = useState(value || '');

  const handleSearch = (term) => {
    setSearchTerm(term);
    onChange(term);
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};

export default BlogSearch;

