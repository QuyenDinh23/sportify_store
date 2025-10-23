import { useState, useEffect } from 'react';
import { getFeaturedBlogPosts } from '../../api/blog/blogApi';
import BlogCard from './BlogCard';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent } from '../ui/card';

const FeaturedBlogPosts = ({ limit = 6, title = "Bài viết nổi bật" }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedPosts();
  }, [limit]);

  const fetchFeaturedPosts = async () => {
    try {
      setLoading(true);
      const response = await getFeaturedBlogPosts(limit);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching featured posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: limit }).map((_, index) => (
            <Card key={index}>
              <Skeleton className="aspect-video w-full rounded-t-lg" />
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <BlogCard key={post._id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default FeaturedBlogPosts;

