import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gradient-hero">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-xl">SportShop</span>
            </div>
            <p className="text-primary-foreground/80 mb-4">
              Cửa hàng thể thao hàng đầu Việt Nam, cung cấp đầy đủ trang thiết bị cho mọi hoạt động thể thao.
            </p>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-accent">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-accent">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-accent">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-accent">
                <Youtube className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><Link to="/about" className="hover:text-accent transition-colors">Về chúng tôi</Link></li>
              <li><Link to="/support/returns-warranty" className="hover:text-accent transition-colors">Chính sách đổi trả</Link></li>
              <li><a href="#" className="hover:text-accent transition-colors">Hướng dẫn mua hàng</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Câu hỏi thường gặp</a></li>
              <li><Link to="/blog" className="hover:text-accent transition-colors">Tin tức</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold mb-4">Hỗ trợ khách hàng</h3>
            <ul className="space-y-3 text-primary-foreground/80">
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>1800 1234</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>support@sportshop.vn</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>123 Đường ABC, Quận 1, TP.HCM</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold mb-4">Nhận tin khuyến mãi</h3>
            <p className="text-primary-foreground/80 mb-4">
              Đăng ký để nhận thông tin về sản phẩm mới và ưu đãi đặc biệt.
            </p>
            <div className="flex space-x-2">
              <Input
                placeholder="Email của bạn"
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
              <Button variant="accent">
                Đăng ký
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/60">
          <p>&copy; 2024 SportShop. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;