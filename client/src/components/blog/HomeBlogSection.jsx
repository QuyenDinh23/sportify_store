import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { ArrowRight, BookOpen } from 'lucide-react';
import FeaturedBlogPosts from './FeaturedBlogPosts';

const HomeBlogSection = () => {
  return (
    <section className="py-16 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-6 h-6 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">Tin Tức Thể Thao</h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Cập nhật những tin tức mới nhất về thể thao, xu hướng thời trang thể thao và các sản phẩm hot nhất
          </p>
        </div>

        <FeaturedBlogPosts limit={3} title="" />
        
        <div className="text-center mt-8">
          <Link to="/blog">
            <Button size="lg" className="inline-flex items-center gap-2">
              Xem tất cả tin tức
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeBlogSection;
