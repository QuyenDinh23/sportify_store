import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from '../../components/ui/card';

// eslint-disable-next-line no-unused-vars
import { cn } from "../../lib/utils";

const ProductCard = ({ product }) => {
  const hasDiscount = product.discountPercentage > 0;
  const navigate = useNavigate();

  const handleAddToCart = () => {
    navigate(`/product/${product._id}`);
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-0 bg-card rounded-xl">
      {/* Product Image */}
      <Link to={`/product/${product._id}`} className="block relative overflow-hidden">
        <img
          src={
            product.colors[0]?.images[0] && product.colors[0].images[0].trim() !== ""
              ? product.colors[0].images[0]
              : "/no-image.png"
          }
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Badge Giảm giá */}
        {hasDiscount && (
          <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground text-xs font-bold px-2 py-0.5 shadow-md">
            -{product.discountPercentage}%
          </Badge>
        )}

        {/* Wishlist */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 bg-background/90 hover:bg-background hover:scale-110 transition-all duration-200 shadow-md opacity-0 group-hover:opacity-100"
        >
          <Heart className="h-4 w-4" />
        </Button>
      </Link>

      <CardContent className="p-3">
        {/* Thương hiệu + Đánh giá */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-primary uppercase tracking-wide">
            {product.brand?.name}
          </span>
        </div>

        {/* Tên sản phẩm */}
        <Link to={`/product/${product._id}`}>
          <h3 className="font-semibold text-sm mb-2 line-clamp-2 h-10 group-hover:text-primary transition-colors leading-tight">
            {product.name}
          </h3>
        </Link>

        {/* Màu sắc */}
        <div className="flex gap-1 mb-2">
          {product.colors.slice(0, 4).map((color, i) => (
            <div
              key={i}
              className="w-5 h-5 rounded-full border border-border hover:scale-110 transition-transform"
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
          {product.colors.length > 4 && (
            <div className="w-5 h-5 rounded-full border border-border flex items-center justify-center text-xs text-muted-foreground">
              +{product.colors.length - 4}
            </div>
          )}
        </div>

        {/* Giá */}
        <div className="flex items-center gap-2 mb-2.5">
          <span className="text-lg font-bold text-primary">
            {product.discountedPrice?.toLocaleString("vi-VN")}đ
          </span>
          {product.price && (
            <span className="text-xs text-muted-foreground line-through">
              {product.price.toLocaleString("vi-VN")}đ
            </span>
          )}
        </div>

        {/* Thêm vào giỏ */}
        <Button
          className="w-full h-9 text-xs font-semibold group-hover:scale-105 transition-transform"
          variant="sport"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
          Thêm vào giỏ
        </Button>
      </CardContent>
    </Card>
  );

};

export default ProductCard;
