import { useEffect, useRef, useState } from 'react';
import Header from '../../components/Header';
import HeroCarousel from '../../components/HeroCarousel';
import { MainNavigation } from '../../components/MainNavigation';
import BestSelling from '../../components/product/BestSelling';
import CategoryGrid from '../../components/product/CategoryGrid';
import ProductGrid from '../../components/product/ProductGrid';
import HomeBlogSection from '../../components/blog/HomeBlogSection';
import Footer from '../../components/Footer';
import styles from './Home.module.css';

const Index = () => {
  const [visibleSections, setVisibleSections] = useState(new Set());
  const sectionRefs = useRef([]);

  useEffect(() => {
    const observers = sectionRefs.current.map((ref, index) => {
      if (!ref) return null;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleSections((prev) => new Set([...prev, index]));
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px',
        }
      );

      observer.observe(ref);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, []);

  const setSectionRef = (index) => (el) => {
    if (el) {
      sectionRefs.current[index] = el;
    }
  };

  return (
    <div className={styles.homeContainer}>
      {/* Decorative background circles */}
      <div className={styles.decorativeCircle}></div>
      <div className={styles.decorativeCircle}></div>
      <div className={styles.decorativeCircle}></div>

      <Header />
      <MainNavigation />
      
      <main className={styles.mainContent}>
        {/* Hero Section */}
        <section 
          ref={setSectionRef(0)}
          className={`${styles.section} ${styles.sectionPrimary} ${visibleSections.has(0) ? styles.fadeInOnScroll + ' ' + styles.visible : styles.fadeInOnScroll}`}
        >
          <HeroCarousel />
        </section>

        {/* Best Selling Section */}
        <section 
          ref={setSectionRef(1)}
          className={`${styles.section} ${styles.sectionPrimary} ${visibleSections.has(1) ? styles.slideInLeft + ' ' + styles.visible : styles.slideInLeft}`}
        >
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Sản phẩm bán chạy</h2>
              <p className={styles.sectionSubtitle}>
                Những sản phẩm được yêu thích nhất tại SportShop
              </p>
            </div>
            <BestSelling />
          </div>
        </section>

        <div className={styles.divider}></div>

        {/* Category Grid Section */}
        <section 
          ref={setSectionRef(2)}
          className={`${styles.section} ${styles.sectionMuted} ${visibleSections.has(2) ? styles.scaleIn + ' ' + styles.visible : styles.scaleIn}`}
        >
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Danh mục sản phẩm</h2>
              <p className={styles.sectionSubtitle}>
                Khám phá bộ sưu tập đa dạng của chúng tôi
              </p>
            </div>
            <CategoryGrid />
          </div>
        </section>

        <div className={styles.divider}></div>

        {/* Blog Section */}
        <section 
          ref={setSectionRef(3)}
          className={`${styles.section} ${styles.sectionPrimary} ${visibleSections.has(3) ? styles.slideInRight + ' ' + styles.visible : styles.slideInRight}`}
        >
          <div className={styles.container}>
            <HomeBlogSection />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;