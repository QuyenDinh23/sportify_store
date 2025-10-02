import { useEffect, useState } from 'react';
import { mockProducts, sportCategories } from '../../data/mockData';
import { DataTable } from '../../components/dashboard/DataTable';
import { ProductForm } from '../../components/dashboard/ProductForm';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useToast } from '../../hooks/use-toast';
import { createProduct, getProducts, updateProduct } from '../../api/product/productApi';
import { fetchAllCategories } from '../../api/category/categoryApi';
import { getSports } from '../../api/sport/sportApi';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState();
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [sports, setSports] = useState([]);
  const { toast } = useToast();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const columns = [
    {
      key: 'colors',
      label: 'Hình ảnh',
      render: (value, item) => {
        const firstImage = item.colors && item.colors[0] && item.colors[0].images && item.colors[0].images[0] || item.image || '';
        return firstImage ? (
          <img src={firstImage} alt="Product" className="w-12 h-12 object-cover rounded-md" />
        ) : (
          <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
            <span className="text-xs text-muted-foreground">No Image</span>
          </div>
        );
      }
    },
    { key: 'name', label: 'Tên sản phẩm', sortable: true },
    {
      key: 'brand',
      label: 'Thương hiệu',
      sortable: true,
      render: (value, item) => (
        <div className="flex items-center gap-2">
          {item.brand?.logo && (
            <img
              src={item.brand.logo}
              alt={item.brand.name}
              className="w-6 h-6 object-contain"
            />
          )}
          <span>{item.brand?.name || '-'}</span>
        </div>
      ),
    },
    {
      key: 'sport',
      label: 'Môn thể thao',
      sortable: true,
      render: (value, item) => <span>{item.sport?.name || '-'}</span>,
    },
    {
      key: 'discountedPrice',
      label: 'Giá bán',
      sortable: true,
      render: (value, item) => (
        <div>
          <div className="font-medium">{formatPrice(value)}</div>
          {item.discountPercentage > 0 && (
            <div className="text-xs text-muted-foreground line-through">
              {formatPrice(item.price)}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'stockQuantity',
      label: 'Tồn kho',
      sortable: true,
      render: (value) => (
        <Badge variant={value > 10 ? 'secondary' : value > 0 ? 'outline' : 'destructive'}>
          {value}
        </Badge>
      )
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value, item) => (
        <div className="flex gap-1 flex-wrap">
          <Badge variant={value === 'active' ? 'default' : 'secondary'}>
            {value === 'active' ? 'Hoạt động' : 'Không hoạt động'}
          </Badge>
          {item.discountPercentage > 0 && (
            <Badge variant="destructive">-{item.discountPercentage}%</Badge>
          )}
          {item.isNew && <Badge variant="outline">Mới</Badge>}
        </div>
      )
    }
  ];

  const loadCategories = async () => {
    try {
      const res = await fetchAllCategories(); 
      setCategories(res);
      console.log("category list" , res);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: `${error}`,
        variant: "destructive",
      });
    }
  };

  const loadSports = async () => {
    try { 
      const res = await getSports(); 
      setSports(res);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: `${error}`,
        variant: "destructive",
      });
    }
  }

  const loadProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res);
      console.log("Danh sách sản phẩm:", res);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: `${error.message || error}`,
        variant: "destructive",
      });
    }
  };

  const handleCategoryChange = async (categoryId) => {
    const category = categories.find(c => c._id === categoryId);
    setSubcategories(category?.subcategories || []);
  }

  const handleSubcategoryChange = (subcategoryId) => {
  const sub = subcategories.find(s => s._id === subcategoryId);
  setBrands(sub?.brands || []);
};

  useEffect(() => {
    loadCategories();
    loadSports();
    loadProducts();
  }, []);

  useEffect(() => {
  
}, [subcategories, brands]);

  const handleAdd = () => {
    setEditingProduct(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (product) => {
    console.log("Product to edit:", product);
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = (product) => {
    const updatedProducts = products.map(p => 
      p.id === product.id ? { ...p, status: 'inactive' } : p
    );
    setProducts(updatedProducts);
    toast({
      title: "Đã vô hiệu hóa sản phẩm",
      description: `${product.name} đã được vô hiệu hóa`,
    });
  };

  const handleFormSubmit = async (productData) => {
    if (productData.id) {
      //Editing existing product
      const updatedProduct = await updateProduct(productData.id, productData);
      setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      toast({
        title: "Đã cập nhật sản phẩm",
        description: `${productData.name} đã được cập nhật thành công`,
      });
    } else {
      //Adding new product
      const newProduct = await createProduct(productData);
      setProducts([...products, newProduct]);
      toast({
        title: "Đã thêm sản phẩm",
        description: `${productData.name} đã được thêm vào danh sách`,
      });
    }
  };

  const handleView = (product) => {
    toast({
      title: "Chi tiết sản phẩm",
      description: `Xem chi tiết ${product.name}`,
    });
  };

  // const filteredProducts = products.filter(product => {
  //   const brandMatch = selectedBrand === 'all' || product.brand === selectedBrand;
  //   const sportMatch = selectedSport === 'all' || product.sport === selectedSport;
  //   const subcategoryMatch = selectedSubcategory === 'all' || product.subcategory === selectedSubcategory;
  //   return brandMatch && sportMatch && subcategoryMatch;
  // });

  const uniqueBrands = Array.from(new Set(products.map(p => p.brand)));
  const uniqueSports = Array.from(new Set(products.map(p => p.sport)));
  const uniqueSubcategories = Array.from(new Set(products.map(p => p.subcategory)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý sản phẩm</h1>
        <p className="text-muted-foreground">Quản lý tất cả sản phẩm trong cửa hàng</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc sản phẩm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {/* <div>
              <label className="text-sm font-medium">Thương hiệu</label>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn thương hiệu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả thương hiệu</SelectItem>
                  {uniqueBrands.map(brand => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Môn thể thao</label>
              <Select value={selectedSport} onValueChange={setSelectedSport}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn môn thể thao" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả môn thể thao</SelectItem>
                  {sportCategories.map(sport => (
                    <SelectItem key={sport.id} value={sport.id}>{sport.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Danh mục con</label>
              <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục con" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục con</SelectItem>
                  {subcategories.map(sub => (
                    <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div> */}
          </div>
        </CardContent>
      </Card>

      <DataTable
        title={`Danh sách sản phẩm (${products.length})`}
        data={products}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        searchPlaceholder="Tìm kiếm sản phẩm..."
      />

      <ProductForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProduct(undefined);
        }}
        onSubmit={handleFormSubmit}
        product={editingProduct}
        categories={categories}
        subcategories={subcategories}
        onCategoryChange={handleCategoryChange}
        brands={brands}
        onSubCategoryChange={handleSubcategoryChange}
        sports={sports}
      />
    </div>
  );
};

export default ProductManagement;
