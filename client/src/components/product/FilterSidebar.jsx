import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import { cn } from "../..//lib/utils";

const FilterSidebar = ({ onFilterChange, products, className }) => {
  const [expandedSections, setExpandedSections] = useState(
    new Set(["brand", "color", "size", "sport"])
  );
  const [staticBrands, setStaticBrands] = useState([]);
  const [filters, setFilters] = useState({
    brands: [],
    colors: [],
    sizes: [],
    sports: [],
    priceRange: [0, 10000000],
  });

  //Dùng useMemo để tránh tính lại nhiều lần
  // const uniqueBrands = useMemo(() => {
  //   const map = new Map();
  //   products.forEach((p) => {
  //     if (p.brand && p.brand._id && !map.has(p.brand._id)) {
  //       map.set(p.brand._id, p.brand.name);
  //     }
  //   });
  //   return Array.from(map, ([id, name]) => ({ id, name }));
  // }, [products]);
  useEffect(() => {
    if (products.length > 0 && staticBrands.length === 0) {
      const map = new Map();
      products.forEach((p) => {
        if (p.brand && p.brand._id && !map.has(p.brand._id)) {
          map.set(p.brand._id, p.brand.name);
        }
      });
      setStaticBrands(Array.from(map, ([id, name]) => ({ id, name })));
    }
  }, [products]);
  // console.log("uniqueBrands", uniqueBrands);
  const uniqueSports = useMemo(() => {
    const map = new Map();
    products.forEach((p) => {
      if (p.sport && p.sport._id && !map.has(p.sport._id)) {
        map.set(p.sport._id, p.sport.name);
      }
    });
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [products]);
  const uniqueColors = useMemo(() => {
    const colorMap = new Map();
    products.forEach((p) => {
      p.colors?.forEach((color) => {
        if (!colorMap.has(color.name)) {
          colorMap.set(color.name, color.hex || "#ccc");
        }
      });
    });
    return Array.from(colorMap, ([name, hex]) => ({ name, hex }));
  }, [products]);
  const uniqueSizes = useMemo(() => {
    const sizeSet = new Set();
    products.forEach((p) => {
      p.colors?.forEach((color) => {
        color.sizes?.forEach((s) => sizeSet.add(s.size));
      });
    });
    return Array.from(sizeSet);
  }, [products]);
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

      <Separator className="mb-4" />

      {/* Brand filter */}
      <FilterSection id="brand" title="Thương hiệu">
        {staticBrands.map((brand) => (
          <div key={brand.id} className="flex items-center space-x-2">
            <Checkbox
              id={`brand-${brand}`}
              checked={filters.brands.includes(brand)}
              onCheckedChange={() => handleFilterChange("brands", brand)}
            />
            <Label
              htmlFor={`brand-${brand}`}
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
        {uniqueColors.map((color) => (
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
          {uniqueSizes.map((size) => (
            <div key={size} className="flex items-center space-x-2">
              <Checkbox
                id={`size-${size}`}
                checked={filters.sizes.includes(size)}
                onCheckedChange={() => handleFilterChange("sizes", size)}
              />
              <Label
                htmlFor={`size-${size}`}
                className="text-sm text-muted-foreground cursor-pointer hover:text-foreground"
              >
                {size}
              </Label>
            </div>
          ))}
        </div>
      </FilterSection>

      <Separator />

      {/* Sport filter */}
      <FilterSection id="sport" title="Môn thể thao">
        {uniqueSports.map((sport) => (
          <div key={sport} className="flex items-center space-x-2">
            <Checkbox
              id={`sport-${sport}`}
              checked={filters.sports.includes(sport)}
              onCheckedChange={() => handleFilterChange("sports", sport)}
            />
            <Label
              htmlFor={`sport-${sport}`}
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
