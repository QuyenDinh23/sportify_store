
// MainNavigation.jsx
import React, { useEffect, useState } from "react";
import { fetchAllCategories } from "../api/category/categoryApi";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../components/ui/navigation-menu";
import { toast } from "../hooks/use-toast";
import { Link } from "react-router-dom";

export function MainNavigation() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await fetchAllCategories();
        // fetchAllCategories có thể trả về res hoặc res.data tùy implementation
        const data = res?.data ?? res;
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        toast({
          title: "Lỗi tải danh mục",
          description: `${error?.message ?? error}`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []); // chạy 1 lần

  // Định nghĩa các nhóm menu và filter tương ứng (ưu tiên thứ tự)
  const groupDefs = [
    { key: "male", label: "Nam", filter: (c) => c.gender === "male" },
    { key: "female", label: "Nữ", filter: (c) => c.gender === "female" },
    { key: "boy", label: "Bé trai", filter: (c) => c.gender === "boy" },
    { key: "girl", label: "Bé gái", filter: (c) => c.gender === "girl" },
    { key: "accessories", label: "Phụ kiện", filter: (c) => c.type === "accessories" },
  ];

  // Xây dựng nhóm, đảm bảo mỗi category chỉ xuất hiện 1 lần (theo thứ tự groupDefs)
  const buildGroups = (allCategories) => {
    const assigned = new Set();
    return groupDefs.map((g) => {
      const items = (allCategories || [])
        .filter((c) => !assigned.has(c._id) && g.filter(c))
        .map((c) => {
          assigned.add(c._id);
          return c;
        });
      return { ...g, items };
    });
  };

  const groups = buildGroups(categories);

  if (loading) {
    return (
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 text-center">Đang tải danh mục...</div>
      </div>
    );
  }

  return (
    <div className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <NavigationMenu className="max-w-full">
          <NavigationMenuList>
            {groups.map((group) => {
              // ẩn nhóm nếu không có category nào
              if (!group.items || group.items.length === 0) return null;

              return (
                <NavigationMenuItem key={group.key}>
                  <NavigationMenuTrigger className="h-14 text-base font-semibold">
                    {group.label}
                  </NavigationMenuTrigger>

                  <NavigationMenuContent>
                    <div className="w-screen max-w-6xl p-6 bg-card">
                      <div className="grid md:grid-cols-3 gap-6">
                        {group.items.map((category) => (
                          <div key={category._id}>
                            <h3 className="mb-3 text-sm font-semibold text-foreground">{category.name}</h3>

                            {/* subcategories */}
                            {Array.isArray(category.subcategories) && category.subcategories.length > 0 ? (
                              <ul className="space-y-2">
                                {category.subcategories.map((sub) => (
                                  <li key={sub._id}>
                                    <Link 
                                      to={`/products?category=${category._id}&sub=${sub._id}`}
                                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                    >
                                      <div className="text-sm font-medium leading-none">{sub.name}</div>
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-muted-foreground">Chưa có phân mục con</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
}
