import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../components/ui/navigation-menu";
import { cn } from "../lib/utils";
import React from "react";

const categories = [
  {
    name: "Nam",
    subcategories: [
      {
        title: "Quần áo thể thao",
        items: ["Áo thun", "Quần short", "Áo khoác", "Quần dài", "Bộ đồ"],
      },
      {
        title: "Giày dép",
        items: ["Giày chạy bộ", "Giày bóng đá", "Giày tennis", "Dép", "Giày đa năng"],
      },
      {
        title: "Phụ kiện",
        items: ["Balo", "Túi đựng đồ", "Mũ", "Tất", "Găng tay"],
      },
    ],
  },
  {
    name: "Nữ",
    subcategories: [
      {
        title: "Quần áo thể thao",
        items: ["Áo yoga", "Quần legging", "Áo khoác", "Áo bra", "Bộ đồ tập"],
      },
      {
        title: "Giày dép",
        items: ["Giày chạy bộ", "Giày tập gym", "Giày yoga", "Dép", "Giày đa năng"],
      },
      {
        title: "Phụ kiện",
        items: ["Balo", "Túi yoga", "Băng đô", "Tất", "Găng tay"],
      },
    ],
  },
  {
    name: "Trẻ em",
    subcategories: [
      {
        title: "Quần áo",
        items: ["Áo thun", "Quần short", "Áo khoác", "Bộ đồ", "Váy"],
      },
      {
        title: "Giày dép",
        items: ["Giày chạy bộ", "Giày bóng đá", "Giày đa năng", "Dép"],
      },
      {
        title: "Phụ kiện",
        items: ["Balo", "Mũ", "Tất", "Găng tay"],
      },
    ],
  },
  {
    name: "Thể thao",
    subcategories: [
      {
        title: "Bóng đá",
        items: ["Quả bóng", "Giày bóng đá", "Áo đấu", "Bảo vệ ống đồng", "Găng tay thủ môn"],
      },
      {
        title: "Chạy bộ",
        items: ["Giày chạy bộ", "Đồng hồ GPS", "Áo chạy bộ", "Quần short", "Túi đeo"],
      },
      {
        title: "Bơi lội",
        items: ["Đồ bơi", "Kính bơi", "Mũ bơi", "Phao", "Ván lướt"],
      },
      {
        title: "Gym & Fitness",
        items: ["Tạ", "Thảm yoga", "Dây kháng lực", "Găng tay", "Bình nước"],
      },
    ],
  },
  {
    name: "Phụ kiện",
    subcategories: [
      {
        title: "Túi & Balo",
        items: ["Balo thể thao", "Túi gym", "Túi đeo chéo", "Túi đựng giày"],
      },
      {
        title: "Thiết bị",
        items: ["Đồng hồ thể thao", "Vòng đeo tay", "Tai nghe", "Bình nước"],
      },
      {
        title: "Bảo vệ",
        items: ["Mũ bảo hiểm", "Bảo vệ đầu gối", "Băng cổ tay", "Găng tay"],
      },
    ],
  },
];

const ListItem = React.forwardRef(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          {children && (
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          )}
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export function MainNavigation() {
  return (
    <div className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <NavigationMenu className="max-w-full">
          <NavigationMenuList>
            {categories.map((category) => (
              <NavigationMenuItem key={category.name}>
                <NavigationMenuTrigger className="h-14 text-base font-semibold">
                  {category.name}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-screen max-w-6xl p-6 bg-card">
                    <div className="grid grid-cols-3 gap-6">
                      {category.subcategories.map((subcategory) => (
                        <div key={subcategory.title}>
                          <h3 className="mb-3 text-sm font-semibold text-foreground">
                            {subcategory.title}
                          </h3>
                          <ul className="space-y-2">
                            {subcategory.items.map((item) => (
                              <ListItem key={item} title={item} href="#" />
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
}
