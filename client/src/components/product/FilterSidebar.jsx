import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import { cn } from "../..//lib/utils";

const FilterSidebar = ({ onFilterChange, products, className }) => {
  const [expandedSections, setExpandedSections] = useState(
    new Set(["subcategory", "brand", "color", "size", "sport"])
  );
  const [staticBrands, setStaticBrands] = useState([]);
  const [staticSports, setStaticSports] = useState([]);
  const [staticColors, setStaticColors] = useState([]);
  const [staticSizes, setStaticSizes] = useState([]);
  const [staticSubcategories, setStaticSubcategories] = useState([]);
  const [filters, setFilters] = useState({
    brands: [],
    colors: [],
    sizes: [],
    sports: [],
    subcategories: [],
    priceRange: [0, 10000000],
  });
  useEffect(() => {
    if (products.length > 0) {
      const brandMap = new Map();
      const sportMap = new Map();
      const colorMap = new Map();
      const sizeMap = new Map();
      const subcategoryMap = new Map();
      products.forEach((p) => {
        if (p.brand && p.brand._id && !brandMap.has(p.brand._id)) {
          brandMap.set(p.brand._id, p.brand.name);
        }
        if (p.sport && p.sport._id && !sportMap.has(p.sport._id)) {
          sportMap.set(p.sport._id, p.sport.name);
        }
        if (p.subcategory && p.subcategory._id && !subcategoryMap.has(p.subcategory._id)) {
          subcategoryMap.set(p.subcategory._id, p.subcategory.name);
        }
        p.colors?.forEach((c) => {
          if (c.name && !colorMap.has(c.name)) {
            colorMap.set(c.name, c.hex || "#ccc");
          }
          c.sizes?.forEach((s) => {
            if (s.size && !sizeMap.has(s.size)) {
              sizeMap.set(s.size, s.size);
            }
          });
        });
      });

      setStaticBrands(Array.from(brandMap, ([id, name]) => ({ id, name })));
      setStaticSports(Array.from(sportMap, ([id, name]) => ({ id, name })));
      setStaticColors(Array.from(colorMap, ([name, hex]) => ({ id: name, name, hex })));
      setStaticSizes(Array.from(sizeMap, ([id, name]) => ({ id, name })));
      setStaticSubcategories(Array.from(subcategoryMap, ([id, name]) => ({ id, name })));
    }
  }, [products]);
  console.log("subcategory map", staticSubcategories);
  const toggleSection = (section) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleFilterChange = (type, value) => {
    const newFilters = { ...filters };
    const currentArray = newFilters[type];

    if (currentArray.includes(value)) {
      newFilters[type] = currentArray.filter((item) => item !== value);
    } else {
      newFilters[type] = [...currentArray, value];
    }
    console.log("newFilters", newFilters);
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearAllFilters = () => {
    const newFilters = {
      brands: [],
      colors: [],
      sizes: [],
      sports: [],
      subcategories: [],
      priceRange: [0, 10000000],
    };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const FilterSection = ({ id, title, children }) => {
    const isExpanded = expandedSections.has(id);

    return (
      <div className="py-4">
        <button
          onClick={() => toggleSection(id)}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="font-semibold text-foreground">{title}</h3>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        {isExpanded && <div className="mt-4 space-y-3">{children}</div>}
      </div>
    );
  };

  return (
    <div className={cn("bg-card border border-border rounded-lg p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Bộ lọc</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="text-muted-foreground hover:text-primary"
        >
          <X className="h-4 w-4 mr-1" />
          Xóa tất cả
        </Button>
      </div>

      {/* Category filter */}
      {staticSubcategories.length > 1 && (
        <FilterSection id="subcategory" title="Danh mục con">
          {staticSubcategories.map((sub) => (
            <div key={sub.id} className="flex items-center space-x-2">
              <Checkbox
                id={`subcategory-${sub.id}`}
                checked={filters.subcategories.includes(sub.id)}
                onCheckedChange={() => handleFilterChange("subcategories", sub.id)}
              />
              <Label htmlFor={`subcategory-${sub.id}`}>{sub.name}</Label>
            </div>
          ))}
        </FilterSection>
      )}

      <Separator className="mb-4" />

      {/* Brand filter */}
      <FilterSection id="brand" title="Thương hiệu">
        {staticBrands.map((brand) => (
          <div key={brand.id} className="flex items-center space-x-2">
            <Checkbox
              id={`brand-${brand.id}`}
              checked={filters.brands.includes(brand.id)}
              onCheckedChange={() => handleFilterChange("brands", brand.id)}
            />
            <Label
              htmlFor={`brand-${brand.id}`}
              className="text-sm text-muted-foreground cursor-pointer hover:text-foreground"
            >
              {brand.name}
            </Label>
          </div>
        ))}
      </FilterSection>

      <Separator />

      {/* Color filter */}
      <FilterSection id="color" title="Màu sắc">
        {staticColors.map((color) => (
          <div key={color.name} className="flex items-center space-x-2">
            <Checkbox
              id={`color-${color.name}`}
              checked={filters.colors.includes(color.name)}
              onCheckedChange={() => handleFilterChange("colors", color.name)}
            />
            <Label
              htmlFor={`color-${color.name}`}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <div
                className="w-6 h-6 rounded-full border-2 border-border"
                style={{ backgroundColor: color.hex }}
              />
              <span className="text-sm text-muted-foreground hover:text-foreground">
                {color.name}
              </span>
            </Label>
          </div>
        ))}
      </FilterSection>

      <Separator />

      {/* Size filter */}
      <FilterSection id="size" title="Kích thước">
        <div className="grid grid-cols-3 gap-2">
          {staticSizes.map((size) => (
            <div key={size.id} className="flex items-center space-x-2">
              <Checkbox
                id={`size-${size.id}`}
                checked={filters.sizes.includes(size.id)}
                onCheckedChange={() => handleFilterChange("sizes", size.id)}
              />
              <Label
                htmlFor={`size-${size.id}`}
                className="text-sm text-muted-foreground cursor-pointer hover:text-foreground"
              >
                {size.name}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      <Separator />

      {/* Sport filter */}
      <FilterSection id="sport" title="Môn thể thao">
        {staticSports.map((sport) => (
          <div key={sport.id} className="flex items-center space-x-2">
            <Checkbox
              id={`sport-${sport.id}`}
              checked={filters.sports.includes(sport.id)}
              onCheckedChange={() => handleFilterChange("sports", sport.id)}
            />
            <Label
              htmlFor={`sport-${sport.id}`}
              className="text-sm text-muted-foreground cursor-pointer hover:text-foreground"
            >
              {sport.name}
            </Label>
          </div>
        ))}
      </FilterSection>
    </div>
  );
};

export default FilterSidebar;
