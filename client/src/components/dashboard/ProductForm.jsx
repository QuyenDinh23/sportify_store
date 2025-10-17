import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { X, Plus, Palette } from 'lucide-react';
import { uploadToBackend } from '../../api/image/uploadImageApi';

const productSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm không được để trống'),
  description: z.string().min(1, 'Mô tả không được để trống'),
  category: z.string().min(1, 'Vui lòng chọn danh mục'),
  subcategory: z.string().min(1, 'Vui lòng chọn danh mục con'),
  brand: z.string().min(1, 'Vui lòng chọn thương hiệu'),
  sport: z.string().optional(),
  price: z.number().min(1, 'Giá phải lớn hơn 0'),
  importPrice: z.number().min(1, 'Giá nhập phải lớn hơn 0'),
  discountPercentage: z.number().min(0).max(100, 'Phần trăm giảm giá từ 0-100'),
  stockQuantity: z.number().min(0, 'Số lượng không được âm'),
  status: z.enum(['active', 'inactive']),
});

export const ProductForm = ({ isOpen, onClose, onSubmit, product, categories, subcategories, onCategoryChange, brands, onSubCategoryChange, sports, readonly }) => {
  const [sizes, setSizes] = useState([]);
  const [newSize, setNewSize] = useState('');
  const [colors, setColors] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [newMaterial, setNewMaterial] = useState('');
  const [technicalSpecs, setTechnicalSpecs] = useState({});
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newSizeInputs, setNewSizeInputs] = useState({});
  const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    mode: 'onChange',
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      subcategory: '',
      brand: '',
      sport: '',
      price: 0,
      importPrice: 0,
      discountPercentage: 0,
      stockQuantity: 0,
      status: 'active',
    }
  });
  console.log("sports", sports);
  const watchedPrice = watch('price');
  const importPrice = Number(watch("importPrice")) || 0;
  const watchedDiscount = watch('discountPercentage');
  const discountedPrice = watchedPrice - (watchedPrice * watchedDiscount / 100);

  const getDefaultSizes = (category) => {
    console.log(" category default size", category);
    if (category.includes('giày') || category.includes('shoes')) return ['37', '38', '39', '40', '41', '42', '43', '44', '45'];
    if (category.includes('áo') || category.includes('quần') || category.includes('clothing')) return ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    return ['One Size'];
  };

  useEffect(() => {
    if (product) {
      console.log("Sport value:", product.sport);
      reset({
        name: product.name,
        description: product.description,
        category: product.category?._id || '',
        subcategory: product.subcategory?._id || '',
        brand: product.brand?._id || '',
        sport: product.sport?._id || '',
        price: product.price,
        importPrice: product.importPrice,
        discountPercentage: product.discountPercentage,
        stockQuantity: product.stockQuantity,
        status: product.status,
      });
      if (product.category?._id) {
        onCategoryChange(product.category._id);
      }
      if (product.subcategory?._id) {
        onSubCategoryChange(product.subcategory._id);
      }
      setSizes(product.sizes || []);
      setColors(product.colors || []);
      setMaterials(product.materials || []);
      setTechnicalSpecs(product.technicalSpecs || {});
      setSelectedCategory(product.category);
    } else {
      reset({
        name: '',
        description: '',
        category: '',
        subcategory: '',
        brand: '',
        sport: '',
        price: 0,
        importPrice: 0,
        discountPercentage: 0,
        stockQuantity: 0,
        status: 'active',
      });
      setSizes([]);
      setColors([]);
      setMaterials([]);
      setTechnicalSpecs({});
    }
  }, [isOpen, product]);

  const addColor = () => {
    // Lấy sizes mặc định dựa trên category hiện tại
    const categoryObj = categories.find(cat => cat._id === selectedCategory);
    const categoryName = categoryObj?.name?.toLowerCase() || '';
    const defaultSizes = getDefaultSizes(categoryName);
    const defaultSizesWithQuantity = defaultSizes.map(size => ({
      size: size,
      quantity: 0
    }));

    const newColor = {
      name: 'Màu mới',
      hex: '#000000',
      images: [],
      sizes: defaultSizesWithQuantity
    };
    setColors([...colors, newColor]);
  };

  const updateColor = (index, field, value) => {
    const updatedColors = [...colors];
    updatedColors[index] = { ...updatedColors[index], [field]: value };
    setColors(updatedColors);
  };

  const removeColor = (index) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  const addImagesToColor = async (colorIndex, files) => {
    const updatedColors = [...colors];
    for (const file of Array.from(files)) {
      if (file.type.startsWith("image/")) {
        try {
          const url = await uploadToBackend(file); // call backend
          console.log("URL cloudinary", url);
          updatedColors[colorIndex].images.push(url); // push url cloudinary
          setColors([...updatedColors]);
        } catch (err) {
          console.error("Upload thất bại:", err);
        }
      }
    }
  };


  const removeImageFromColor = (colorIndex, imageIndex) => {
    const updatedColors = [...colors];
    updatedColors[colorIndex].images.splice(imageIndex, 1);
    setColors(updatedColors);
  };
  const addSizeToColor = (colorIndex) => {
    const size = newSizeInputs[colorIndex]?.trim();
    if (!size) return;

    const updatedColors = [...colors];
    if (!updatedColors[colorIndex].sizes.find(s => s.size === size)) {
      updatedColors[colorIndex].sizes.push({ size, quantity: 0 });
      setColors(updatedColors);
      setNewSizeInputs({ ...newSizeInputs, [colorIndex]: '' });
    }
  };

  const removeSizeFromColor = (colorIndex, sizeIndex) => {
    const updatedColors = [...colors];
    updatedColors[colorIndex].sizes.splice(sizeIndex, 1);
    setColors(updatedColors);
  };

  const updateSizeQuantity = (colorIndex, sizeIndex, quantity) => {
    const updatedColors = [...colors];
    updatedColors[colorIndex].sizes[sizeIndex].quantity = quantity;
    setColors(updatedColors);
  };

  const addMaterial = () => {
    if (newMaterial && !materials.includes(newMaterial)) {
      setMaterials([...materials, newMaterial]);
      setNewMaterial('');
    }
  };

  const removeMaterial = (material) => {
    setMaterials(materials.filter(m => m !== material));
  };

  const addTechnicalSpec = () => {
    if (newSpecKey && newSpecValue) {
      setTechnicalSpecs({ ...technicalSpecs, [newSpecKey]: newSpecValue });
      setNewSpecKey('');
      setNewSpecValue('');
    }
  };

  const removeTechnicalSpec = (key) => {
    const updated = { ...technicalSpecs };
    delete updated[key];
    setTechnicalSpecs(updated);
  };

  const totalStockQuantity = colors.reduce((total, color) => {
    return total + color.sizes.reduce((sum, sizeVariant) => sum + sizeVariant.quantity, 0);
  }, 0);

  const onFormSubmit = (data) => {
    console.log("data", data);
    const allSizes = Array.from(new Set(colors.flatMap(color => color.sizes.map(s => s.size))));
    const productData = {
      id: product?._id,
      name: data.name,
      description: data.description,
      category: data.category,
      subcategory: data.subcategory,
      brand: data.brand,
      sport: data.sport,
      price: data.price,
      importPrice: data.importPrice,
      discountPercentage: data.discountPercentage,
      discountedPrice,
      stockQuantity: totalStockQuantity,
      status: data.status,
      sizes: allSizes,
      colors,
      materials,
      technicalSpecs,
      originalPrice: data.discountPercentage > 0 ? data.price : undefined,
      image: colors[0]?.images[0] || '',
      rating: product?.rating || 0,
      reviewCount: product?.reviewCount || 0,
      isNew: !product,
      isOnSale: data.discountPercentage > 0,
    };
    console.log("Product data", productData);
    onSubmit(productData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {readonly ? 'Xem thống tin sản phẩm' : product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
              <TabsTrigger value="variants">Biến thể</TabsTrigger>
              <TabsTrigger value="materials">Vật liệu</TabsTrigger>
              <TabsTrigger value="specs">Thông số kỹ thuật</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Tên sản phẩm</Label>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => <Input {...field} disabled={readonly} />}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>

                <div>
                  <Label htmlFor="status">Trạng thái</Label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger disabled={readonly}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Hoạt động</SelectItem>
                          <SelectItem value="inactive">Không hoạt động</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Mô tả</Label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => <Textarea {...field} rows={3} disabled={readonly} />}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Danh mục chính</Label>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={(value) => {
                        field.onChange(value);
                        onCategoryChange(value);
                        setSelectedCategory(value);
                      }}>
                        <SelectTrigger disabled={readonly}>
                          <SelectValue placeholder="Chọn danh mục" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category._id} value={category._id}>{category.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
                </div>

                <div>
                  <Label htmlFor="subcategory">Danh mục con</Label>
                  <Controller
                    name="subcategory"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={(val) => {
                        onSubCategoryChange(val);
                        field.onChange(val);
                      }}>
                        <SelectTrigger disabled={readonly}>
                          <SelectValue placeholder="Chọn danh mục con" />
                        </SelectTrigger>
                        <SelectContent>
                          {subcategories.map(sub => (
                            <SelectItem key={sub._id} value={sub._id}>{sub.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.subcategory && <p className="text-sm text-destructive">{errors.subcategory.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brand">Thương hiệu</Label>
                  <Controller
                    name="brand"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger disabled={readonly}>
                          <SelectValue placeholder="Chọn thương hiệu" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.map(brand => (
                            <SelectItem key={brand._id} value={brand._id}>{brand.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.brand && <p className="text-sm text-destructive">{errors.brand.message}</p>}
                </div>

                <div>
                  <Label htmlFor="sport">Môn thể thao</Label>
                  <Controller
                    name="sport"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={(value) => {
                        console.log("Selected sport:", value);
                        field.onChange(value);
                      }}>
                        <SelectTrigger disabled={readonly}>
                          <SelectValue placeholder="Chọn môn thể thao" />
                        </SelectTrigger>
                        <SelectContent>
                          {sports.map(sport => (
                            <SelectItem key={sport._id} value={sport._id}>{sport.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.sport && <p className="text-sm text-destructive">{errors.sport.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="importPrice">Giá nhập</Label>
                  <Controller
                    name="importPrice"
                    control={control}
                    render={({ field }) => (
                      <Input
                        // {...field} 
                        // type="number" 
                        value={
                          field.value
                            ? field.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                            : ""
                        }
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/\D/g, "");
                          const numberValue = rawValue ? parseInt(rawValue, 10) : "";
                          field.onChange(numberValue);
                        }}
                        inputMode="numeric"
                        disabled={readonly}
                      />
                    )}
                  />
                  {errors.importPrice && <p className="text-sm text-destructive">{errors.importPrice.message}</p>}
                </div>

                <div>
                  <Label htmlFor="price">Giá bán</Label>
                  {/* <Controller
                    name="price"
                    control={control}
                    rules={{
                      validate: (value) =>
                        !importPrice || Number(value) > importPrice || "Giá bán phải lớn hơn giá nhập",
                    }}
                    render={({ field }) => (
                      <Input
                        // {...field} 
                        // type="number" 
                        // onChange={e => field.onChange(Number(e.target.value))}
                        value={
                          field.value
                            ? field.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                            : ""
                        }
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/\D/g, "");
                          const numberValue = rawValue ? parseInt(rawValue, 10) : "";
                          field.onChange(numberValue);
                        }}
                        inputMode="numeric"
                        disabled={readonly}
                      />
                    )}
                  /> */}
                  <Controller
                    name="price"
                    control={control}
                    render={({ field }) => {
                      const importPrice = Number(watch("importPrice")) || 0; // 👈 đặt bên trong
                      const value = Number(field.value) || 0;
                      const isValid = !importPrice || value > importPrice;

                      console.log("importPrice:", importPrice, "price:", value, "valid:", isValid);

                      return (
                        <>
                          <Input
                            value={
                              field.value
                                ? field.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                                : ""
                            }
                            onChange={(e) => {
                              const rawValue = e.target.value.replace(/\D/g, "");
                              const numberValue = rawValue ? parseInt(rawValue, 10) : "";
                              field.onChange(numberValue);
                            }}
                            inputMode="numeric"
                            disabled={readonly}
                          />
                          {!isValid && (
                            <p className="text-sm text-destructive">
                              Giá bán phải lớn hơn giá nhập
                            </p>
                          )}
                        </>
                      );
                    }}
                  />
                  {/* {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>} */}
                </div>

                <div>
                  <Label htmlFor="discountPercentage">% Giảm giá</Label>
                  <Controller
                    name="discountPercentage"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        // type="number" 
                        // min="0" 
                        // max="100"
                        // onChange={e => field.onChange(Number(e.target.value))}
                        value={field.value === 0 ? "" : field.value} // không hiển thị 0 khi trống
                        onChange={(e) => {
                          const raw = e.target.value.replace(/^0+/, "");
                          const num = raw === "" ? "" : Math.min(100, parseInt(raw, 10));
                          field.onChange(num);
                        }}
                        inputMode="numeric"
                        placeholder="Nhập % giảm"
                        disabled={readonly}
                      />
                    )}
                  />
                  {errors.discountPercentage && <p className="text-sm text-destructive">{errors.discountPercentage.message}</p>}
                </div>

                <div>
                  <Label>Giá sau giảm</Label>
                  <Input value={discountedPrice.toLocaleString('vi-VN')} disabled />
                </div>

                <div>
                  <Label htmlFor="stockQuantity">Số lượng tồn kho</Label>
                  <Controller
                    name="stockQuantity"
                    control={control}
                    // eslint-disable-next-line no-unused-vars
                    render={({ field }) => (
                      <Input value={totalStockQuantity} disabled className="bg-muted" />
                    )}
                  />
                  {errors.stockQuantity && <p className="text-sm text-destructive">{errors.stockQuantity.message}</p>}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="variants" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Màu sắc
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button type="button" onClick={addColor} className="mb-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm màu
                  </Button>
                  <div className="space-y-4">
                    {colors.map((color, index) => (
                      <div key={index} className="border p-4 rounded-lg">
                        <div className="flex items-center gap-4 mb-3">
                          <Input
                            value={color.name}
                            onChange={(e) => updateColor(index, 'name', e.target.value)}
                            placeholder="Tên màu"
                          />
                          <Input
                            type="color"
                            value={color.hex}
                            onChange={(e) => updateColor(index, 'hex', e.target.value)}
                            className="w-16"
                          />
                          <Button type="button" variant="destructive" size="sm" onClick={() => removeColor(index)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Size variants for this color */}
                        <div className="space-y-2 mb-3">
                          <Label>Kích thước và số lượng</Label>

                          {/* Add new size input */}
                          <div className="flex gap-2 mb-2">
                            <Input
                              value={newSizeInputs[index] || ''}
                              onChange={(e) => setNewSizeInputs({ ...newSizeInputs, [index]: e.target.value })}
                              placeholder="Nhập size (VD: M, 40, XL)"
                              className="flex-1"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addSizeToColor(index);
                                }
                              }}
                            />
                            <Button
                              type="button"
                              onClick={() => addSizeToColor(index)}
                              size="sm"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Existing sizes */}
                          {!color.sizes || color.sizes.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Chưa có size nào. Thêm size bằng ô nhập bên trên.</p>
                          ) : (
                            <div className="space-y-2 border rounded-md p-3 bg-muted/20">
                              {color.sizes.map((sizeVariant, sizeIndex) => (
                                <div key={sizeIndex} className="flex items-center gap-2">
                                  <div className="w-20">
                                    <Badge variant="outline" className="w-full justify-center">
                                      {sizeVariant.size}
                                    </Badge>
                                  </div>
                                  <Input
                                    type="number"
                                    value={sizeVariant.quantity === 0 ? "" : sizeVariant.quantity}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      updateSizeQuantity(index, sizeIndex, value === "" ? 0 : Number(value));
                                    }}
                                    placeholder="Số lượng"
                                    className="flex-1"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeSizeFromColor(index, sizeIndex)}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Hình ảnh</Label>
                          <div className="flex gap-2">
                            <Input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                  addImagesToColor(index, e.target.files);
                                  e.target.value = '';
                                }
                              }}
                              className="cursor-pointer"
                            />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {color.images.map((image, imgIndex) => (
                              <div key={imgIndex} className="relative">
                                <img src={image} alt="" className="w-16 h-16 object-cover rounded" />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute -top-2 -right-2 w-6 h-6 p-0"
                                  onClick={() => removeImageFromColor(index, imgIndex)}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="materials" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Vật liệu</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    <Input
                      value={newMaterial}
                      onChange={(e) => setNewMaterial(e.target.value)}
                      placeholder="Nhập vật liệu"
                      disabled={readonly}
                    />
                    <Button type="button" onClick={addMaterial} disabled={readonly}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {materials.map(material => (
                      <Badge key={material} variant="secondary" className="flex items-center gap-1">
                        {material}
                        {!readonly && (
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => removeMaterial(material)}
                          />
                        )}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specs" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Thông số kỹ thuật</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    <Input
                      value={newSpecKey}
                      onChange={(e) => setNewSpecKey(e.target.value)}
                      placeholder="Tên thông số"
                      disabled={readonly}
                    />
                    <Input
                      value={newSpecValue}
                      onChange={(e) => setNewSpecValue(e.target.value)}
                      placeholder="Giá trị"
                      disabled={readonly}
                    />
                    <Button type="button" onClick={addTechnicalSpec} disabled={readonly}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(technicalSpecs).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between bg-muted p-2 rounded">
                        <span><strong>{key}:</strong> {value}</span>
                        {!readonly && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTechnicalSpec(key)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            {!readonly && (
              <Button type="submit">
                {product ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
