import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBlogPostBySlug, getFeaturedBlogPosts } from '../../api/blog/blogApi';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { Calendar, User, ArrowLeft, ArrowRight, Share2 } from 'lucide-react';
import Header from '../../components/Header';
import { MainNavigation } from '../../components/MainNavigation';
import Footer from '../../components/Footer';

const BlogDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchBlogPost();
      fetchRelatedPosts();
    }
  }, [slug]);

  const fetchBlogPost = async () => {
    try {
      setLoading(true);
      const response = await getBlogPostBySlug(slug);
      setPost(response.data);
    } catch (error) {
      console.error('Error fetching blog post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async () => {
    try {
      const response = await getFeaturedBlogPosts(4);
      setRelatedPosts(response.data);
    } catch (error) {
      console.error('Error fetching related posts:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderBlock = (block, index) => {
    switch (block.type) {
      case 'paragraph':
        return (
          <p key={index} className="mb-4 text-gray-700 leading-relaxed">
            {block.data.text}
          </p>
        );
      case 'subtitle':
        return (
          <h3 key={index} className="text-2xl font-semibold mb-4 mt-8 text-gray-900">
            {block.data.text}
          </h3>
        );
      case 'image':
        return (
          <div key={index} className="my-6">
            <img 
              src={block.data.url} 
              alt={block.data.caption || ''}
              className="w-full h-auto rounded-lg shadow-md"
            />
            {block.data.caption && (
              <p className="text-sm text-gray-600 mt-2 text-center italic">
                {block.data.caption}
              </p>
            )}
          </div>
        );
      case 'quote':
        return (
          <blockquote key={index} className="border-l-4 border-blue-500 pl-6 py-4 my-6 bg-gray-50 rounded-r-lg">
            <p className="text-lg italic text-gray-700">
              "{block.data.text}"
            </p>
            {block.data.author && (
              <cite className="text-sm text-gray-600 mt-2 block">
                — {block.data.author}
              </cite>
            )}
          </blockquote>
        );
      case 'video':
        return (
          <div key={index} className="my-6">
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Video: {block.data.url}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-4 w-1/2 mb-8" />
            <Skeleton className="aspect-video w-full mb-8" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Bài viết không tồn tại
          </h1>
          <p className="text-gray-600 mb-6">
            Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <Link to="/blog">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại danh sách
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */} 
      <Header />
      <MainNavigation />
      <main>
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <Link 
            to="/blog"
            className="inline-flex items-center text-primary hover:text-primary/80 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <article className="bg-card rounded-lg shadow-sm overflow-hidden border">
              {/* Cover Image */}
              {post.coverImage && (
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={post.coverImage} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-8">
                {/* Meta Information */}
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(post.publishedAt)}</span>
                  </div>
                  {post.author && (
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{post.author}</span>
                    </div>
                  )}
                  {post.categoryId && (
                    <Badge variant="secondary">
                      {post.categoryId.name}
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                  {post.title}
                </h1>

                {/* Summary */}
                {post.summary && (
                  <div className="text-xl text-gray-600 mb-8 leading-relaxed">
                    {post.summary}
                  </div>
                )}

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  {post.sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="mb-8">
                      {section.title && (
                        <h2 className="text-2xl font-semibold mb-4 text-gray-900">
                          {section.title}
                        </h2>
                      )}
                      {section.blocks.map((block, blockIndex) => 
                        renderBlock(block, `${sectionIndex}-${blockIndex}`)
                      )}
                    </div>
                  ))}
                </div>

                {/* Share Buttons */}
                <div className="border-t pt-6 mt-8">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700">Chia sẻ:</span>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Facebook
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Twitter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      LinkedIn
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Bài viết liên quan</h3>
                    <div className="space-y-4">
                      {relatedPosts
                        .filter(relatedPost => relatedPost._id !== post._id)
                        .slice(0, 3)
                        .map((relatedPost) => (
                          <Link 
                            key={relatedPost._id}
                            to={`/blog/${relatedPost.slug}`}
                            className="block group"
                          >
                            <div className="flex gap-3">
                              <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                {relatedPost.coverImage ? (
                                  <img 
                                    src={relatedPost.coverImage} 
                                    alt={relatedPost.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-xs text-gray-400">No Image</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2">
                                  {relatedPost.title}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatDate(relatedPost.publishedAt)}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Back to Blog */}
              <Card>
                <CardContent className="p-6">
                  <Link to="/blog">
                    <Button className="w-full">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Xem tất cả bài viết
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogDetail;
