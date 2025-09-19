import { Package, Grid3X3, Award, Trophy, ShoppingCart, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { dashboardStats } from '../../data/dashboardData';

const Overview = () => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const statsCards = [
    {
      title: 'Tổng sản phẩm',
      value: dashboardStats.totalProducts,
      icon: Package,
      color: 'text-blue-600'
    },
    {
      title: 'Danh mục',
      value: dashboardStats.totalCategories,
      icon: Grid3X3,
      color: 'text-green-600'
    },
    {
      title: 'Thương hiệu',
      value: dashboardStats.totalBrands,
      icon: Award,
      color: 'text-purple-600'
    },
    {
      title: 'Môn thể thao',
      value: dashboardStats.totalSports,
      icon: Trophy,
      color: 'text-orange-600'
    },
    {
      title: 'Đơn hàng',
      value: dashboardStats.totalOrders,
      icon: ShoppingCart,
      color: 'text-red-600'
    },
    {
      title: 'Doanh thu',
      value: formatCurrency(dashboardStats.revenue),
      icon: DollarSign,
      color: 'text-emerald-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tổng quan</h1>
        <p className="text-muted-foreground">Theo dõi hiệu suất và quản lý cửa hàng thể thao của bạn</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Thêm sản phẩm mới: Nike Air Max 270</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Cập nhật giá sản phẩm: Adidas Predator Edge</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Thêm thương hiệu mới: Under Armour</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Tạo danh mục: Phụ kiện bơi lội</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thống kê nhanh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Sản phẩm bán chạy nhất</span>
                <span className="font-medium">Nike Air Max 270</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Thương hiệu phổ biến</span>
                <span className="font-medium">Nike</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Môn thể thao hot</span>
                <span className="font-medium">Chạy bộ</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Đơn hàng hôm nay</span>
                <span className="font-medium">23</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Overview;
