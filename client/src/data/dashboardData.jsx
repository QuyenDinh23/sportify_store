import { mockProducts, categories, sportCategories } from './mockData';

export const mockBrands = [
  {
    id: '1',
    name: 'Nike',
    logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop',
    description: 'Thương hiệu thể thao hàng đầu thế giới',
    subBrands: [
      { id: '1-1', name: 'Nike Running', brandId: '1', description: 'Chuyên về giày chạy bộ' },
      { id: '1-2', name: 'Nike Basketball', brandId: '1', description: 'Chuyên về bóng rổ' },
      { id: '1-3', name: 'Nike Football', brandId: '1', description: 'Chuyên về bóng đá' }
    ],
    createdAt: new Date('2020-01-15')
  },
  {
    id: '2',
    name: 'Adidas',
    logo: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=100&h=100&fit=crop',
    description: 'Thương hiệu thể thao nổi tiếng từ Đức',
    subBrands: [
      { id: '2-1', name: 'Adidas Originals', brandId: '2', description: 'Dòng sản phẩm cổ điển' },
      { id: '2-2', name: 'Adidas Performance', brandId: '2', description: 'Dòng sản phẩm hiệu suất cao' },
      { id: '2-3', name: 'Adidas Football', brandId: '2', description: 'Chuyên về bóng đá' }
    ],
    createdAt: new Date('2020-02-10')
  },
  {
    id: '3',
    name: 'Puma',
    logo: 'https://images.unsplash.com/photo-1506629905607-21e4d4b91a39?w=100&h=100&fit=crop',
    description: 'Thương hiệu thể thao đa dạng',
    subBrands: [
      { id: '3-1', name: 'Puma Sport', brandId: '3', description: 'Dòng thể thao chuyên nghiệp' },
      { id: '3-2', name: 'Puma Lifestyle', brandId: '3', description: 'Dòng thời trang thể thao' }
    ],
    createdAt: new Date('2020-03-05')
  }
];

export const dashboardStats = {
  totalProducts: mockProducts.length,
  totalCategories: categories.length,
  totalBrands: mockBrands.length,
  totalSports: sportCategories.length,
  totalOrders: 1247,
  revenue: 2580000000
};
