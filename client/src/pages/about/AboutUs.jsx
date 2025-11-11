import { useEffect, useRef, useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { 
  Target, 
  Users, 
  Award, 
  Heart, 
  TrendingUp, 
  Shield,
  CheckCircle,
  Star,
  MapPin,
  Phone,
  Mail,
  Clock
} from 'lucide-react';
import styles from './AboutUs.module.css';

const AboutUs = () => {
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

  const values = [
    {
      icon: Target,
      title: 'Định hướng rõ ràng',
      description: 'Luôn đặt khách hàng làm trung tâm, cam kết mang đến sản phẩm và dịch vụ tốt nhất.',
    },
    {
      icon: Heart,
      title: 'Đam mê thể thao',
      description: 'Chúng tôi yêu thích thể thao và hiểu rõ nhu cầu của những người yêu vận động.',
    },
    {
      icon: Shield,
      title: 'Uy tín & Chất lượng',
      description: 'Sản phẩm chính hãng 100%, đảm bảo chất lượng và an toàn cho người sử dụng.',
    },
    {
      icon: Users,
      title: 'Phục vụ tận tâm',
      description: 'Đội ngũ nhân viên chuyên nghiệp, luôn sẵn sàng hỗ trợ khách hàng mọi lúc.',
    },
  ];

  const achievements = [
    { number: '50K+', label: 'Khách hàng tin tưởng', icon: Users },
    { number: '100K+', label: 'Sản phẩm đã bán', icon: TrendingUp },
    { number: '10+', label: 'Năm kinh nghiệm', icon: Award },
    { number: '4.8/5', label: 'Đánh giá trung bình', icon: Star },
  ];

  const features = [
    'Sản phẩm chính hãng 100%',
    'Giao hàng nhanh chóng toàn quốc',
    'Bảo hành chính hãng',
    'Đổi trả trong 7 ngày',
    'Hỗ trợ 24/7',
    'Thanh toán an toàn',
  ];

  return (
    <div className={styles.aboutContainer}>
      {/* Decorative background circles */}
      <div className={styles.decorativeCircle}></div>
      <div className={styles.decorativeCircle}></div>
      <div className={styles.decorativeCircle}></div>

      <Header />

      <main className={styles.mainContent}>
        {/* Hero Section */}
        <section
          ref={setSectionRef(0)}
          className={`${styles.heroSection} ${visibleSections.has(0) ? styles.fadeInOnScroll + ' ' + styles.visible : styles.fadeInOnScroll}`}
        >
          <div className={styles.container}>
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>Về Chúng Tôi</h1>
              <p className={styles.heroSubtitle}>
                SportShop - Đối tác tin cậy cho mọi hoạt động thể thao của bạn
              </p>
              <div className={styles.heroDescription}>
                <p>
                  Với hơn 10 năm kinh nghiệm trong ngành, SportShop tự hào là một trong những 
                  cửa hàng thể thao hàng đầu Việt Nam, chuyên cung cấp các sản phẩm thể thao 
                  chất lượng cao từ các thương hiệu uy tín trên thế giới.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section
          ref={setSectionRef(1)}
          className={`${styles.section} ${styles.sectionPrimary} ${visibleSections.has(1) ? styles.slideInLeft + ' ' + styles.visible : styles.slideInLeft}`}
        >
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Sứ Mệnh & Tầm Nhìn</h2>
              <p className={styles.sectionSubtitle}>
                Hướng đến một tương lai nơi mọi người đều có thể theo đuổi đam mê thể thao
              </p>
            </div>
            <div className={styles.missionGrid}>
              <div className={styles.missionCard}>
                <div className={styles.missionIcon}>
                  <Target className={styles.icon} />
                </div>
                <h3 className={styles.missionTitle}>Sứ Mệnh</h3>
                <p className={styles.missionText}>
                  Cung cấp những sản phẩm thể thao chất lượng cao, giúp mọi người 
                  theo đuổi đam mê và đạt được mục tiêu thể thao của mình. Chúng tôi 
                  cam kết mang đến trải nghiệm mua sắm tuyệt vời với dịch vụ khách hàng tận tâm.
                </p>
              </div>
              <div className={styles.missionCard}>
                <div className={styles.missionIcon}>
                  <Award className={styles.icon} />
                </div>
                <h3 className={styles.missionTitle}>Tầm Nhìn</h3>
                <p className={styles.missionText}>
                  Trở thành cửa hàng thể thao số 1 Việt Nam, được khách hàng tin tưởng 
                  và yêu mến. Chúng tôi hướng đến việc xây dựng một cộng đồng thể thao 
                  sôi động, nơi mọi người có thể chia sẻ đam mê và cảm hứng.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section
          ref={setSectionRef(2)}
          className={`${styles.section} ${styles.sectionMuted} ${visibleSections.has(2) ? styles.scaleIn + ' ' + styles.visible : styles.scaleIn}`}
        >
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Giá Trị Cốt Lõi</h2>
              <p className={styles.sectionSubtitle}>
                Những giá trị định hướng mọi hoạt động của chúng tôi
              </p>
            </div>
            <div className={styles.valuesGrid}>
              {values.map((value, index) => {
                const IconComponent = value.icon;
                return (
                  <div key={index} className={styles.valueCard}>
                    <div className={styles.valueIcon}>
                      <IconComponent className={styles.icon} />
                    </div>
                    <h3 className={styles.valueTitle}>{value.title}</h3>
                    <p className={styles.valueText}>{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Achievements Section */}
        <section
          ref={setSectionRef(3)}
          className={`${styles.section} ${styles.sectionPrimary} ${visibleSections.has(3) ? styles.fadeInOnScroll + ' ' + styles.visible : styles.fadeInOnScroll}`}
        >
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Thành Tựu</h2>
              <p className={styles.sectionSubtitle}>
                Những con số thể hiện sự tin tưởng của khách hàng
              </p>
            </div>
            <div className={styles.achievementsGrid}>
              {achievements.map((achievement, index) => {
                const IconComponent = achievement.icon;
                return (
                  <div key={index} className={styles.achievementCard}>
                    <div className={styles.achievementIcon}>
                      <IconComponent className={styles.icon} />
                    </div>
                    <div className={styles.achievementNumber}>{achievement.number}</div>
                    <div className={styles.achievementLabel}>{achievement.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          ref={setSectionRef(4)}
          className={`${styles.section} ${styles.sectionMuted} ${visibleSections.has(4) ? styles.slideInRight + ' ' + styles.visible : styles.slideInRight}`}
        >
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Tại Sao Chọn Chúng Tôi</h2>
              <p className={styles.sectionSubtitle}>
                Những lý do khiến SportShop trở thành lựa chọn hàng đầu
              </p>
            </div>
            <div className={styles.featuresGrid}>
              {features.map((feature, index) => (
                <div key={index} className={styles.featureItem}>
                  <CheckCircle className={styles.featureIcon} />
                  <span className={styles.featureText}>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section
          ref={setSectionRef(5)}
          className={`${styles.section} ${styles.sectionPrimary} ${visibleSections.has(5) ? styles.fadeInOnScroll + ' ' + styles.visible : styles.fadeInOnScroll}`}
        >
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Liên Hệ Với Chúng Tôi</h2>
              <p className={styles.sectionSubtitle}>
                Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
              </p>
            </div>
            <div className={styles.contactGrid}>
              <div className={styles.contactCard}>
                <MapPin className={styles.contactIcon} />
                <h3 className={styles.contactTitle}>Địa chỉ</h3>
                <p className={styles.contactText}>
                  123 Đường ABC, Quận 1, TP. Hồ Chí Minh
                </p>
              </div>
              <div className={styles.contactCard}>
                <Phone className={styles.contactIcon} />
                <h3 className={styles.contactTitle}>Điện thoại</h3>
                <p className={styles.contactText}>
                  1800 1234 (Miễn phí)
                </p>
              </div>
              <div className={styles.contactCard}>
                <Mail className={styles.contactIcon} />
                <h3 className={styles.contactTitle}>Email</h3>
                <p className={styles.contactText}>
                  support@sportshop.vn
                </p>
              </div>
              <div className={styles.contactCard}>
                <Clock className={styles.contactIcon} />
                <h3 className={styles.contactTitle}>Giờ làm việc</h3>
                <p className={styles.contactText}>
                  Thứ 2 - Chủ nhật: 8:00 - 21:00
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;

