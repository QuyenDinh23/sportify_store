import { Link } from "react-router-dom";
import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
// eslint-disable-next-line no-unused-vars
import { cn } from "../../lib/utils";

const ProductCard = ({ product }) => {
  const hasDiscount = product.discountPercentage > 0;

  return (
    <div className="group relative bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-in">
      {/* Product image */}
      <Link to={`/product/${product._id}`} className="block relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.colors[0]?.images[0] || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {hasDiscount && (
            <Badge className="bg-secondary text-secondary-foreground">
              -{product.discountPercentage}%
            </Badge>
          )}
          {/* {product.isBestSeller && (
            <Badge className="bg-primary text-primary-foreground">
              Bán chạy
            </Badge>
          )} */}
        </div>

        {/* Wishlist button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart className="h-4 w-4" />
        </Button>
      </Link>

      {/* Product info */}
      <div className="p-4">
        <Link to={`/product/${product._id}`}>
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>
        </Link>

        <p className="text-sm text-muted-foreground mb-2">{product.brand.name}</p>

        {/* Color options */}
        <div className="flex gap-1 mb-3">
          {product.colors.slice(0, 5).map((color, index) => (
            <div
              key={index}
              className="w-6 h-6 rounded-full border-2 border-border cursor-pointer hover:scale-110 transition-transform"
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
          {product.colors.length > 5 && (
            <div className="w-6 h-6 rounded-full border-2 border-border flex items-center justify-center text-xs text-muted-foreground">
              +{product.colors.length - 5}
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg font-bold text-primary">
            {product.discountedPrice.toLocaleString("vi-VN")}đ
          </span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {product.price.toLocaleString("vi-VN")}đ
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <Button className="w-full" variant="sport">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Thêm vào giỏ
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
