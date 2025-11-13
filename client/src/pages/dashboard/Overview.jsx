import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Package, Grid3X3, Award, Trophy, ShoppingCart, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { getOrderStatistics, getRevenueByMonth, getOrdersByStatus } from '../../api/order/orderApi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getProducts } from '../../api/product/productApi';
import { fetchAllCategories } from '../../api/category/categoryApi';
import { getBrands } from '../../api/brand/brandApi';
import { getSports } from '../../api/sport/sportApi';


const Overview = () => {
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    loading: true
  });

  const [data, setData] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalBrands: 0,
    totalSports: 0,
  });

  const navigate = useNavigate();
  const [revenueData, setRevenueData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  // Màu sắc cho pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch tổng quan
        const statsResponse = await getOrderStatistics();
        if (statsResponse.success) {
          setOrderStats({
            totalOrders: statsResponse.data.totalOrders,
            totalRevenue: statsResponse.data.totalRevenue,
            loading: false
          });
        }

        // Fetch doanh thu theo tháng
        const revenueResponse = await getRevenueByMonth();
        if (revenueResponse.success) {
          setRevenueData(revenueResponse.data);
        }

        // Fetch đơn hàng theo trạng thái
        const statusResponse = await getOrdersByStatus();
        if (statusResponse.success) {
          setStatusData(statusResponse.data);
        }

        setChartsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setOrderStats(prev => ({ ...prev, loading: false }));
        setChartsLoading(false);
      }
    };

    const fetchOverviewData = async () => {
      try {
        setLoading(true);
        const [products, categories, brands, sports] = await Promise.all([
          getProducts(),
          fetchAllCategories(),
          getBrands(),
          getSports(),
        ]);
        console.log("products in overview", products);
        setData({
          totalProducts: products.length,
          totalCategories: categories.length,
          totalBrands: brands.length,
          totalSports: sports.length,
        });
        console.log("overview data", data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu tổng quan:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
    fetchAllData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const statsCards = [
    {
      title: 'Tổng sản phẩm',
      value: data.totalProducts,
      icon: Package,
      color: 'text-blue-600',
      route: "/dashboard/products",
    },
    {
      title: 'Danh mục',
      value: data.totalCategories,
      icon: Grid3X3,
      color: 'text-green-600',
      route: "/dashboard/categories",
    },
    {
      title: 'Thương hiệu',
      value: data.totalBrands,
      icon: Award,
      color: 'text-purple-600',
      route: "/dashboard/brands",
    },
    {
      title: 'Môn thể thao',
      value: data.totalSports,
      icon: Trophy,
      color: 'text-orange-600',
      route: "/dashboard/sports",
    },
    {
      title: 'Đơn hàng',
      value: orderStats.loading ? '...' : orderStats.totalOrders.toLocaleString('vi-VN'),
      icon: ShoppingCart,
      color: 'text-red-600'
    },
    {
      title: 'Doanh thu',
      value: orderStats.loading ? '...' : formatCurrency(orderStats.totalRevenue),
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
          <Card key={stat.title}
            onClick={() => stat.route && navigate(stat.route)}
            className={`hover:shadow-lg transition-shadow cursor-pointer ${stat.route ? "hover:bg-gray-50" : ""
              }`}>
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doanh thu theo tháng */}
        <Card>
          <CardHeader>
            <CardTitle>Doanh thu theo tháng</CardTitle>
          </CardHeader>
          <CardContent>
            {chartsLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <span className="text-muted-foreground">Đang tải dữ liệu...</span>
              </div>
            ) : revenueData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center">
                <span className="text-muted-foreground">Chưa có dữ liệu</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    labelStyle={{ color: '#000' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="Doanh thu"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Đơn hàng theo trạng thái */}
        <Card>
          <CardHeader>
            <CardTitle>Đơn hàng theo trạng thái</CardTitle>
          </CardHeader>
          <CardContent>
            {chartsLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <span className="text-muted-foreground">Đang tải dữ liệu...</span>
              </div>
            ) : statusData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center">
                <span className="text-muted-foreground">Chưa có dữ liệu</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ label, percent }) => `${label} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="label"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Overview;
