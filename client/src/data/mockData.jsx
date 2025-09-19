export const categories = [
  {
    id: 'shoes',
    name: 'Giày',
    icon: '👟',
    subcategories: ['Giày chạy bộ', 'Giày bóng đá', 'Giày bóng rổ', 'Giày tennis', 'Giày tập gym']
  },
  {
    id: 'clothing',
    name: 'Quần áo',
    icon: '👕',
    subcategories: ['Áo thể thao', 'Quần short', 'Quần dài', 'Áo khoác', 'Đồ bơi']
  },
  {
    id: 'accessories',
    name: 'Phụ kiện',
    icon: '🎒',
    subcategories: ['Túi thể thao', 'Găng tay', 'Mũ nón', 'Đồng hồ', 'Thiết bị bảo hộ']
  }
];

export const sportCategories = [
  { id: 'football', name: 'Bóng đá', icon: '⚽', color: 'bg-green-500' },
  { id: 'basketball', name: 'Bóng rổ', icon: '🏀', color: 'bg-orange-500' },
  { id: 'running', name: 'Chạy bộ', icon: '🏃‍♂️', color: 'bg-blue-500' },
  { id: 'tennis', name: 'Tennis', icon: '🎾', color: 'bg-yellow-500' },
  { id: 'swimming', name: 'Bơi lội', icon: '🏊‍♂️', color: 'bg-cyan-500' },
  { id: 'fitness', name: 'Gym & Fitness', icon: '💪', color: 'bg-red-500' }
];

export const mockProducts = [
  {
    id: '1',
    name: 'Nike Air Max 270',
    price: 2990000,
    originalPrice: 3500000,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    category: 'shoes',
    subcategory: 'Giày chạy bộ',
    brand: 'Nike',
    subBrand: 'Nike Running',
    sport: 'running',
    rating: 4.5,
    reviewCount: 128,
    isOnSale: true
  },
  {
    id: '2',
    name: 'Adidas Predator Edge',
    price: 4200000,
    image: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=400&h=400&fit=crop',
    category: 'shoes',
    subcategory: 'Giày bóng đá',
    brand: 'Adidas',
    subBrand: 'Adidas Football',
    sport: 'football',
    rating: 4.8,
    reviewCount: 95,
    isNew: true
  },
  {
    id: '3',
    name: 'Jordan Basketball Jersey',
    price: 1590000,
    image: 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=400&h=400&fit=crop',
    category: 'clothing',
    subcategory: 'Áo thể thao',
    brand: 'Jordan',
    subBrand: 'Jordan Pro',
    sport: 'basketball',
    rating: 4.6,
    reviewCount: 76
  },
  {
    id: '4',
    name: 'Under Armour Gym Bag',
    price: 890000,
    originalPrice: 1200000,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
    category: 'accessories',
    subcategory: 'Túi thể thao',
    brand: 'Under Armour',
    sport: 'fitness',
    rating: 4.3,
    reviewCount: 54,
    isOnSale: true
  },
  {
    id: '5',
    name: 'Puma Running Shorts',
    price: 650000,
    image: 'https://images.unsplash.com/photo-1506629905607-21e4d4b91a39?w=400&h=400&fit=crop',
    category: 'clothing',
    subcategory: 'Quần short',
    brand: 'Puma',
    subBrand: 'Puma Sport',
    sport: 'running',
    rating: 4.4,
    reviewCount: 89
  },
  {
    id: '6',
    name: 'Wilson Tennis Racket',
    price: 2200000,
    image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400&h=400&fit=crop',
    category: 'accessories',
    subcategory: 'Vợt tennis',
    brand: 'Wilson',
    sport: 'tennis',
    rating: 4.7,
    reviewCount: 43,
    isNew: true
  }
];
