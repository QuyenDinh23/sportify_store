import { useEffect, useState } from 'react';
import { DataTable } from '../../components/dashboard/DataTable';
import { ProductForm } from '../../components/dashboard/ProductForm';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useToast } from '../../hooks/use-toast';
import { createProduct, getProductsByFilter, toggleProductStatusApi, updateProduct } from '../../api/product/productApi';
import { fetchAllCategories } from '../../api/category/categoryApi';
import { getSports } from '../../api/sport/sportApi';
import Pagination from '../../components/pagination/Pagination';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '../../components/ui/alert-dialog';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState();
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [sports, setSports] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isReadOnly, setIsReadOnly] = useState(false);
  const itemsPerPage = 10;
  const [toggleDialogOpen, setToggleDialogOpen] = useState(false);
  const [productToToggle, setProductToToggle] = useState(null);
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
      console.log("category list", res);
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
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || "",
      };

      if (selectedCategory !== "all") params.category = selectedCategory;
      if (selectedSubcategory !== "all") params.subcategory = selectedSubcategory;
      if (selectedBrand !== "all") params.brand = selectedBrand;
      if (selectedSport !== "all") params.sport = selectedSport;
      if (selectedStatus !== "all") params.status = selectedStatus;
      const res = await getProductsByFilter(params);
      setProducts(res.products);
      setTotalPages(res.totalPages);
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
    const newBrands = sub?.brands || [];
    console.log("sub", subcategories);
    console.log("newBrands", newBrands);
    setBrands(newBrands); // cập nhật state
  };

  useEffect(() => {
    loadCategories();
    loadSports();
    loadProducts();
  }, [selectedCategory, selectedSubcategory, selectedBrand, selectedSport, selectedStatus, searchTerm, currentPage]);

  useEffect(() => {

  }, [subcategories, brands]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const handleAdd = () => {
    setEditingProduct(undefined);
    setIsFormOpen(true);
    setIsReadOnly(false);
  };

  const handleEdit = (product) => {
    console.log("Product to edit:", product);
    setEditingProduct(product);
    setIsFormOpen(true);
    setIsReadOnly(false);
  };

  const handleToggleStatus = (product) => {
    setProductToToggle(product);
    setToggleDialogOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!productToToggle) return;

    try {
      const res = await toggleProductStatusApi(productToToggle._id);
      const updatedProduct = res.product;

      setProducts((prev) => {
        const filtered = prev.filter(p => p._id !== updatedProduct._id);
        return [...filtered, updatedProduct];
      });

      toast({
        title: "Thành công",
        description: res.message,
      });
      setToggleDialogOpen(false);
      setProductToToggle(null);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật trạng thái sản phẩm",
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async (productData) => {
    try {
      if (productData.id) {
        //Editing existing product
        await updateProduct(productData.id, productData);
        // setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
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
      loadProducts();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: `${error}`,
        variant: "destructive",
      });
    }
  };

  const handleView = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
    setIsReadOnly(true);
  };

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
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Danh mục chính</label>
              <Select value={selectedCategory} onValueChange={(val) => {
                setSelectedCategory(val);
                handleCategoryChange(val); // load subcategories theo category
                setSelectedSubcategory("all"); // reset subcategory
                setSelectedBrand("all"); // reset brand
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục chính" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục chính</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Danh mục con</label>
              <Select value={selectedSubcategory} onValueChange={(val) => {
                setSelectedSubcategory(val);
                handleSubcategoryChange(val); // load brands theo subcategory
                setSelectedBrand("all"); // reset brand khi đổi subcategory
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục con" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục con</SelectItem>
                  {subcategories.map(sub => (
                    <SelectItem key={sub._id} value={sub._id}>{sub.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Thương hiệu</label>
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn thương hiệu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả thương hiệu</SelectItem>
                  {brands.map(brand => (
                    <SelectItem key={brand._id} value={brand._id}>{brand.name}</SelectItem>
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
                  {sports.map(sport => (
                    <SelectItem key={sport._id} value={sport._id}>{sport.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="w-1/5 min-w-[150px]">
            <label className="text-sm font-medium">Trạng thái</label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Không hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <DataTable
        title={`Danh sách sản phẩm (${products.length})`}
        data={products}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onToggleStatus={handleToggleStatus}
        onView={handleView}
        searchPlaceholder="Tìm kiếm sản phẩm..."
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
      />

      <ProductForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProduct(undefined);
        }}
        onSubmit={handleFormSubmit}
        readonly={isReadOnly}
        product={editingProduct}
        categories={categories}
        subcategories={subcategories}
        onCategoryChange={handleCategoryChange}
        brands={brands}
        onSubCategoryChange={handleSubcategoryChange}
        sports={sports}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <AlertDialog open={toggleDialogOpen} onOpenChange={setToggleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Xác nhận {productToToggle?.status === 'active' ? 'vô hiệu hóa' : 'kích hoạt'} sản phẩm
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn {productToToggle?.status === 'active' ? 'vô hiệu hóa' : 'kích hoạt'} sản phẩm "{productToToggle?.name}"?
              {productToToggle?.status === 'active'
                ? ' Sản phẩm sẽ chuyển sang trạng thái không hoạt động và không hiển thị cho khách hàng.'
                : ' Sản phẩm sẽ được kích hoạt và hiển thị cho khách hàng.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggleStatus}>Xác nhận</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductManagement;
