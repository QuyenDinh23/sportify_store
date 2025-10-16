import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ChevronRight, ShoppingCart, Heart, Share2, Minus, Plus, Star } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { cn } from "../../lib/utils";
import { toast } from "sonner";
import Header from '../../components/Header';
import { MainNavigation } from '../../components/MainNavigation';
import Footer from '../../components/Footer';
import { getProductById } from "../../api/product/productApi";
import { addToCart } from "../../store/cartSlice";


const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState("");
  const [availableStock, setAvailableStock] = useState(0);

  const fetchProduct = useCallback(async () => {
    try {
      const data = await getProductById(id);
      console.log("data in product detail", data);
      console.log("product sizes:", data.sizes);
      console.log("colors data:", data.colors);
      if (data.colors && data.colors.length > 0) {
        console.log("first color sizes:", data.colors[0].sizes);
      }
      setProduct(data);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: `${error}`,
        variant: "destructive",
      });
    }
  }, [id]);
  useEffect(() => {
    fetchProduct();
  }, [id, fetchProduct]);

  useEffect(() => {
    if (product && product.colors && product.colors[selectedColor]) {
      const firstImage = product.colors[selectedColor].images?.[0];
      setMainImage(firstImage && firstImage.trim() !== "" ? firstImage : "/logo.png");
    }
  }, [product, selectedColor]);
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Không tìm thấy sản phẩm</h1>
        <Link to="/products" className="text-primary hover:underline">
          Quay lại trang sản phẩm
        </Link>
      </div>
    );
  }
  const handleSelectSize = (variant) => {
    console.log("Selected size variant:", variant);
    setSelectedSize(variant);
    setAvailableStock(variant.quantity || 0);
    console.log("Available stock set to:", variant.quantity);
    setQuantity(1);
  };

  const hasDiscount = product.discountPercentage > 0;

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.error("Vui lòng chọn kích thước");
      return;
    }

    // Check if user is logged in
    if (!user) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
      return;
    }

    try {
      // Dispatch async action để thêm vào giỏ hàng
      await dispatch(addToCart({
        productId: product._id,
        selectedColor: product.colors[selectedColor].name,
        selectedSize,
        quantity
      })).unwrap();

      toast.success("Đã thêm vào giỏ hàng!");
    } catch (error) {
      toast.error(error || "Có lỗi xảy ra khi thêm vào giỏ hàng");
    }
  };

  return (

    <div className="min-h-screen bg-background">
      <Header />
      <MainNavigation />
      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Trang chủ</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/products" className="hover:text-primary">Sản phẩm</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              {mainImage && mainImage.trim() !== "" ? (
                <img
                  src={mainImage}
                  alt={`${product.name} - ${product.colors[selectedColor]?.name || 'Product'}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <span>No image available</span>
                </div>
              )}
            </div>
            {/* Thumbnail images */}
            <div className="flex gap-2 overflow-x-auto mt-2">
              {product.colors[selectedColor].images.map((img, index) => (
                img && img.trim() !== "" ? (
                  <img
                    key={index}
                    src={img}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className={cn(
                      "w-20 h-20 object-cover rounded-lg border cursor-pointer",
                      mainImage === img ? "border-primary" : "border-border"
                    )}
                    onClick={() => setMainImage(img)} // click thumbnail thay đổi ảnh chính
                  />
                ) : null
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and badges */}
            <div>
              <div className="flex gap-2 mb-3">
                {hasDiscount && <Badge className="bg-secondary text-secondary-foreground">-{product.discountPercentage}%</Badge>}
                {/* {product.isBestSeller && <Badge className="bg-primary text-primary-foreground">Bán chạy</Badge>} */}
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
              <p className="text-muted-foreground text-lg">{product.brand.name}</p>

              {/* Rating */}
              {/* <div className="flex items-center gap-2 mt-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-5 w-5",
                        i < 4 ? "fill-secondary text-secondary" : "text-muted"
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">(128 đánh giá)</span>
              </div> */}
            </div>

            {/* Price */}
            {/* <div>
              <div className="flex items-baseline gap-3">
                <div className={cn("text-3xl font-bold", hasDiscount && "text-secondary")}>
                  {product.discountedPrice.toLocaleString("vi-VN")}đ
                </div>
                {hasDiscount && (
                  <div className="text-xl text-muted-foreground line-through">
                    {product.price.toLocaleString("vi-VN")}đ
                  </div>
                )}
              </div>
            </div> */}
            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span
                className={cn(
                  "text-3xl font-extrabold text-foreground",
                  hasDiscount && "text-red-600"
                )}
              >
                {product.discountedPrice.toLocaleString("vi-VN")}đ
              </span>
              {hasDiscount && (
                <span className="text-lg text-muted-foreground line-through relative top-1">
                  {product.price.toLocaleString("vi-VN")}đ
                </span>
              )}
            </div>

            <Separator />

            {/* Color selection */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">
                Màu sắc: <span className="text-muted-foreground font-normal">{product.colors[selectedColor].name}</span>
              </h3>
              <div className="flex gap-3">
                {product.colors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedColor(index)}
                    className={cn(
                      "w-12 h-12 rounded-full border-2 transition-all hover:scale-110",
                      selectedColor === index
                        ? "border-primary ring-2 ring-primary ring-offset-2"
                        : "border-border"
                    )}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Size selection */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Kích thước</h3>
              {product.colors[selectedColor]?.sizes?.length > 0 ? (
                <div className="grid grid-cols-5 gap-2">
                  {product.colors[selectedColor].sizes.map((variant, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectSize(variant)}
                      className={cn(
                        "py-3 rounded-lg border-2 font-medium transition-all hover:border-primary",
                        selectedSize?.size === variant.size
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-foreground"
                      )}
                    >
                      {variant.size}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">
                  Không có kích thước nào có sẵn
                </div>
              )}
            </div>

            {/* Quantity */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Số lượng</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      console.log("Minus clicked, current quantity:", quantity);
                      setQuantity(Math.max(1, quantity - 1));
                    }}
                    className="rounded-r-none"
                    disabled={!selectedSize}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-6 font-semibold">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      console.log("Plus clicked, current quantity:", quantity, "availableStock:", availableStock, "selectedSize:", selectedSize);
                      setQuantity((prev) =>
                        selectedSize
                          ? Math.min(prev + 1, availableStock)
                          : prev
                      );
                    }}
                    className="rounded-l-none"
                    disabled={!selectedSize}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {selectedSize
                    ? `${availableStock} sản phẩm có sẵn`
                    : "Vui lòng chọn kích thước"}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button size="lg" className="w-full" variant="sport" onClick={handleAddToCart}>
                <ShoppingCart className="h-5 w-5 mr-2" />
                Thêm vào giỏ
              </Button>
              <Button size="lg" variant="outline">
                <Heart className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Product highlights */}
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span>Miễn phí vận chuyển cho đơn từ 1.000.000đ</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span>Đổi trả trong 30 ngày</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span>Cam kết chính hãng 100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product details tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                Mô tả sản phẩm
              </TabsTrigger>
              <TabsTrigger value="specs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                Thông số kỹ thuật
              </TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                Đánh giá (128)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <div className="prose max-w-none">
                <p className="text-muted-foreground">{product.description}</p>
                <div className="mt-4">
                  <h4 className="font-semibold text-foreground mb-2">Vật liệu:</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {product.materials.map((material, index) => (
                      <li key={index}>{material}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="specs" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(product.technicalSpecs).map(([key, value]) => (
                  <div key={key} className="flex justify-between border-b border-border py-3">
                    <span className="font-medium text-foreground">{key}</span>
                    <span className="text-muted-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <p className="text-muted-foreground">Phần đánh giá sẽ được cập nhật sau.</p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetail;
