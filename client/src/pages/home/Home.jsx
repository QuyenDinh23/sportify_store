import Header from '../../components/Header';
import HeroCarousel from '../../components/HeroCarousel';
import { MainNavigation } from '../../components/MainNavigation';
import BestSelling from '../../components/product/BestSelling';
import CategoryGrid from '../../components/product/CategoryGrid';
import ProductGrid from '../../components/product/ProductGrid';
import HomeBlogSection from '../../components/blog/HomeBlogSection';
import Footer from '../../components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MainNavigation />
      <main>
        <HeroCarousel />
        <BestSelling />
        <CategoryGrid />
        {/* <ProductGrid /> */}
        <HomeBlogSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;