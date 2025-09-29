
// Legacy categories for backward compatibility
export const categories = [
  {
    id: 'swimwear',
    name: 'Đồ bơi',
    icon: 'Waves',
    gender: 'Unisex',
    subcategories: [],
  },
  {
    id: 'shoes',
    name: 'Giày',
    icon: 'Footprints',
    gender: 'Unisex',
    subcategories: [],
  },
  {
    id: 'clothing',
    name: 'Quần áo',
    icon: 'Shirt',
    gender: 'Nam',
    subcategories: [],
  },
  {
    id: 'accessories',
    name: 'Phụ kiện',
    icon: 'Backpack',
    gender: 'Unisex',
    subcategories: [],
  }
];

// New hierarchical structure
export const subBrands = [
  { id: 'nike_pro', name: 'Nike Pro', description: 'Dòng sản phẩm chuyên nghiệp cao cấp', brandId: 'nike' },
  { id: 'nike_swim', name: 'Nike Swim', description: 'Dòng sản phẩm bơi lội', brandId: 'nike' },
  { id: 'adidas_originals', name: 'Adidas Originals', description: 'Dòng sản phẩm cổ điển', brandId: 'adidas' },
  { id: 'adidas_performance', name: 'Adidas Performance', description: 'Dòng sản phẩm thể thao cao cấp', brandId: 'adidas' },
];

// New hierarchical structure - Updated for subcategory management
export const subcategories = [
  {
    id: 'men_swimwear',
    name: 'Quần bơi nam',
    categoryId: 'swimwear',
    brands: [],
  },
  {
    id: 'women_swimwear',
    name: 'Đồ bơi nữ',
    categoryId: 'swimwear',
    brands: [],
  },
  {
    id: 'swimming_accessories',
    name: 'Phụ kiện bơi',
    categoryId: 'swimwear',
    brands: [],
  },
];

export const brands = [
  {
    id: 'nike',
    name: 'Nike',
    logo: 'https://logo.clearbit.com/nike.com',
    description: 'Thương hiệu thể thao hàng đầu thế giới',
    subcategoryId: 'men_swimwear',
    subBrands: subBrands.filter(sb => sb.brandId === 'nike'),
  },
  {
    id: 'adidas',
    name: 'Adidas',
    logo: 'https://logo.clearbit.com/adidas.com',
    description: 'Thương hiệu thể thao châu Âu nổi tiếng',
    subcategoryId: 'men_swimwear',
    subBrands: subBrands.filter(sb => sb.brandId === 'adidas'),
  },
  {
    id: 'speedo',
    name: 'Speedo',
    logo: 'https://logo.clearbit.com/speedo.com',  
    description: 'Chuyên gia về đồ bơi',
    subcategoryId: 'women_swimwear',
    subBrands: [],
  },
];

// Update subcategories with their brands
subcategories.forEach(subcategory => {
  subcategory.brands = brands.filter(brand => brand.subcategoryId === subcategory.id);
});

export const sportCategories = [
  { id: 'football', name: 'Bóng đá', icon: '⚽', description: 'Môn thể thao vua được yêu thích nhất thế giới' },
  { id: 'basketball', name: 'Bóng rổ', icon: '🏀', description: 'Môn thể thao đồng đội năng động và hấp dẫn' },
  { id: 'running', name: 'Chạy bộ', icon: '🏃‍♂️', description: 'Hoạt động thể thao cá nhân tốt cho sức khỏe' },
  { id: 'tennis', name: 'Tennis', icon: '🎾', description: 'Môn thể thao quý tộc đòi hỏi kỹ thuật cao' },
  { id: 'swimming', name: 'Bơi lội', icon: '🏊‍♂️', description: 'Môn thể thao toàn thân tốt nhất cho cơ thể' },
  { id: 'fitness', name: 'Gym & Fitness', icon: '💪', description: 'Tập luyện thể hình và duy trì sức khỏe' }
];

export const mockProducts = [
  {
    id: '1',
    name: 'Nike Air Max 270',
    description: 'Giày chạy bộ Nike Air Max 270 với công nghệ đệm khí Max Air mang lại sự thoải mái tối đa cho từng bước chạy.',
    category: 'shoes',
    subcategory: 'men_swimwear',
    brand: 'Nike',
    sport: 'running',
    price: 3500000,
    discountPercentage: 15,
    discountedPrice: 2990000,
    stockQuantity: 50,
    sizes: ['37', '38', '39', '40', '41', '42', '43', '44'],
    colors: [
      {
        name: 'Đen',
        hex: '#000000',
        images: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop'
        ]
      },
      {
        name: 'Trắng',
        hex: '#FFFFFF',
        images: [
          'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop'
        ]
      }
    ],
    materials: ['Da tổng hợp', 'Mesh', 'Cao su'],
    status: 'active',
    technicalSpecs: {
      'Trọng lượng': '310g',
      'Chiều cao đế': '32mm',
      'Drop': '10mm',
      'Công nghệ': 'Max Air, React Foam'
    },
    // Legacy fields
    originalPrice: 3500000,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    subBrand: 'Nike Running',
    gender: 'Unisex',
    rating: 4.5,
    reviewCount: 128,
    isOnSale: true,
    isNew: false
  },
  {
    id: '2',
    name: 'Adidas Predator Edge',
    description: 'Giày bóng đá Adidas Predator Edge với công nghệ Control Frame giúp kiểm soát bóng tốt hơn.',
    category: 'shoes',
    subcategory: 'men_swimwear',
    brand: 'Adidas',
    sport: 'football',
    price: 4200000,
    discountPercentage: 0,
    discountedPrice: 4200000,
    stockQuantity: 30,
    sizes: ['38', '39', '40', '41', '42', '43', '44', '45'],
    colors: [
      {
        name: 'Đỏ',
        hex: '#FF0000',
        images: [
          'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=400&h=400&fit=crop'
        ]
      }
    ],
    materials: ['Da kangaroo', 'Cao su', 'TPU'],
    status: 'active',
    technicalSpecs: {
      'Loại sân': 'Cỏ tự nhiên',
      'Công nghệ': 'Control Frame, Primeknit',
      'Trọng lượng': '245g'
    },
    // Legacy fields
    image: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=400&h=400&fit=crop',
    subBrand: 'Adidas Football',
    gender: 'Nam',
    rating: 4.8,
    reviewCount: 95,
    isNew: true,
    isOnSale: false
  },
  {
    id: '3',
    name: 'Jordan Basketball Jersey',
    description: 'Áo bóng rổ Jordan với chất liệu Dri-FIT thấm hút mồ hôi tốt, thiết kế năng động.',
    category: 'clothing',
    subcategory: 'men_swimwear',
    brand: 'Jordan',
    sport: 'basketball',
    price: 1590000,
    discountPercentage: 0,
    discountedPrice: 1590000,
    stockQuantity: 75,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      {
        name: 'Xanh dương',
        hex: '#0000FF',
        images: [
          'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=400&h=400&fit=crop'
        ]
      }
    ],
    materials: ['Polyester', 'Cotton'],
    status: 'active',
    technicalSpecs: {
      'Công nghệ': 'Dri-FIT',
      'Kiểu dáng': 'Regular fit',
      'Cổ áo': 'Cổ tròn'
    },
    // Legacy fields
    image: 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=400&h=400&fit=crop',
    subBrand: 'Jordan Pro',
    gender: 'Nam',
    rating: 4.6,
    reviewCount: 76,
    isNew: false,
    isOnSale: false
  },
  {
    id: '4',
    name: 'Under Armour Gym Bag',
    description: 'Túi thể thao Under Armour với nhiều ngăn tiện dụng, chất liệu chống nước.',
    category: 'accessories',
    subcategory: 'swimming_accessories',
    brand: 'Under Armour',
    sport: 'fitness',
    price: 1200000,
    discountPercentage: 25,
    discountedPrice: 900000,
    stockQuantity: 25,
    sizes: ['One Size'],
    colors: [
      {
        name: 'Đen',
        hex: '#000000',
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop'
        ]
      }
    ],
    materials: ['Nylon', 'Polyester'],
    status: 'active',
    technicalSpecs: {
      'Dung tích': '35L',
      'Kích thước': '50x25x25cm',
      'Tính năng': 'Chống nước, nhiều ngăn'
    },
    // Legacy fields
    originalPrice: 1200000,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
    gender: 'Unisex',
    rating: 4.3,
    reviewCount: 54,
    isOnSale: true,
    isNew: false
  },
  {
    id: '5',
    name: 'Puma Running Shorts',
    description: 'Quần short chạy bộ Puma với chất liệu co giãn, thoáng khí.',
    category: 'clothing',
    subcategory: 'men_swimwear',
    brand: 'Puma',
    sport: 'running',
    price: 650000,
    discountPercentage: 0,
    discountedPrice: 650000,
    stockQuantity: 60,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      {
        name: 'Hồng',
        hex: '#FFC0CB',
        images: [
          'https://images.unsplash.com/photo-1506629905607-21e4d4b91a39?w=400&h=400&fit=crop'
        ]
      }
    ],
    materials: ['Polyester', 'Elastane'],
    status: 'active',
    technicalSpecs: {
      'Công nghệ': 'DryCELL',
      'Kiểu dáng': 'Slim fit',
      'Chiều dài': '5 inch'
    },
    // Legacy fields
    image: 'https://images.unsplash.com/photo-1506629905607-21e4d4b91a39?w=400&h=400&fit=crop',
    subBrand: 'Puma Sport',
    gender: 'Nữ',
    rating: 4.4,
    reviewCount: 89,
    isNew: false,
    isOnSale: false
  },
  {
    id: '6',
    name: 'Wilson Tennis Racket',
    description: 'Vợt tennis Wilson Pro Staff với trọng lượng cân bằng, phù hợp cho người chơi trung cấp.',
    category: 'accessories',
    subcategory: 'swimming_accessories',
    brand: 'Wilson',
    sport: 'tennis',
    price: 2200000,
    discountPercentage: 0,
    discountedPrice: 2200000,
    stockQuantity: 15,
    sizes: ['One Size'],
    colors: [
      {
        name: 'Đen/Trắng',
        hex: '#000000',
        images: [
          'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400&h=400&fit=crop'
        ]
      }
    ],
    materials: ['Carbon fiber', 'Graphite'],
    status: 'active',
    technicalSpecs: {
      'Trọng lượng': '315g',
      'Kích thước đầu': '100 sq in',
      'Chiều dài': '27 inch',
      'Pattern': '16x19'
    },
    // Legacy fields
    image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400&h=400&fit=crop',
    gender: 'Unisex',
    rating: 4.7,
    reviewCount: 43,
    isNew: true,
    isOnSale: false
  }
];