import { Link } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Calendar, User, ArrowRight } from 'lucide-react';

const BlogCard = ({ post, variant = 'default' }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (variant === 'compact') {
    return (
      <Link to={`/blog/${post.slug}`} className="block group">
        <div className="flex gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
          <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
            {post.coverImage ? (
              <img 
                src={post.coverImage} 
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-400">No Image</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2 mb-2">
              {post.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(post.publishedAt)}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300">
      <div className="aspect-video overflow-hidden rounded-t-lg">
        {post.coverImage ? (
          <img 
            src={post.coverImage} 
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
      </div>
      <CardContent className="p-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(post.publishedAt)}</span>
            {post.author && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{post.author}</span>
                </div>
              </>
            )}
          </div>
          
          <h3 className="text-xl font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors">
            {post.title}
          </h3>
          
          {post.summary && (
            <p className="text-gray-600 line-clamp-3">
              {post.summary}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            {post.categoryId && (
              <Badge variant="secondary">
                {post.categoryId.name}
              </Badge>
            )}
            <Link 
              to={`/blog/${post.slug}`}
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
            >
              Đọc thêm
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogCard;

