import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { X, Plus, Shirt, Waves, Footprints, Watch, Glasses, Backpack, Trophy, Target, Dumbbell, Bike, Users, Calendar, MapPin } from 'lucide-react';
import { availableIcons } from '../../data/icons';
import { checkCategoryNameExists } from '../../api/category/categoryApi';

const categorySchema = z.object({
  name: z.string().min(1, 'Tên danh mục là bắt buộc'),
  icon: z.string().min(1, 'Icon là bắt buộc'),
  gender: z.enum(['male', 'female', 'kids'], {
    required_error: "Giới tính là bắt buộc",
  }),
  type: z.enum(['clothing', 'shoes', 'accessories'], {
    required_error: "Loại sản phẩm là bắt buộc",
  }),
});

export const CategoryForm = ({ open, readonly, editing, onOpenChange, category, onSubmit }) => {
  const [subcategories, setSubcategories] = useState(category?.subcategories || []);
  const [newSubcategory, setNewSubcategory] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(category?.icon || '');

  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      icon: category?.icon || '',
      gender: category?.gender || '',
      type : category?.type || '',
    },
  });

  useEffect(() => {
    form.reset({
      name: category?.name || '',
      icon: category?.icon || '',
      gender: category?.gender || '',
      type: category?.type || '',
    });
    setSelectedIcon(category?.icon || '');
    setSubcategories(category?.subcategories || []);
    setNewSubcategory('');
  }, [category, form]);

  const handleAddSubcategory = () => {
    if (newSubcategory.trim() && !subcategories.includes(newSubcategory.trim())) {
      setSubcategories([...subcategories, newSubcategory.trim()]);
      setNewSubcategory('');
    }
  };

  const handleRemoveSubcategory = (index) => {
    setSubcategories(subcategories.filter((_, i) => i !== index));
  };

  const handleIconSelect = (iconName) => {
    setSelectedIcon(iconName);
    form.setValue('icon', iconName);
  };

  const handleSubmit = async (values) => {
    // Kiểm tra tên category tồn tại chưa
    const res = await checkCategoryNameExists(values.name, category?._id);
    if (res) {
      form.setError("name", { type: "manual", message: "Tên danh mục đã tồn tại" });
      return;
    }
    const categoryData = {
      // ...(category?.id && { id: category.id }),
      id: category?._id,
      name: values.name,
      icon: values.icon,
      gender : values.gender,
      type : values.type,
      subcategories,
    };
    onSubmit(categoryData);
    onOpenChange(false);
    form.reset();
    setSubcategories([]);
    setNewSubcategory('');
    setSelectedIcon('');
  };

  const selectedIconData = availableIcons.find(icon => icon.name === selectedIcon);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {readonly
                ? 'Xem chi tiết danh mục'
                : category
                ? 'Chỉnh sửa danh mục'
                : 'Thêm danh mục mới'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên danh mục</FormLabel>
                  <FormControl>
                    <Input placeholder="Ví dụ: Đồ bơi nam" {...field} disabled={readonly}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="icon"
              render={() => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 border rounded-lg">
                        {selectedIconData && (
                          <selectedIconData.icon className="h-5 w-5" />
                        )}
                        <span className="text-sm text-muted-foreground">
                          {selectedIconData ? selectedIconData.label : 'Chọn icon'}
                        </span>
                      </div>
                      <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto">
                        {availableIcons.map((iconData) => {
                          const IconComponent = iconData.icon;
                          return (
                            <Button
                              key={iconData.name}
                              type="button"
                              variant={selectedIcon === iconData.name ? "default" : "outline"}
                              size="sm"
                              className="h-10 w-10 p-0"
                              onClick={() => handleIconSelect(iconData.name)}
                              disabled={readonly}
                            >
                              <IconComponent className="h-4 w-4" />
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại sản phẩm</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={readonly}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại sản phẩm" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="clothing">Quần áo</SelectItem>
                      <SelectItem value="shoes">Giày dép</SelectItem>
                      <SelectItem value="accessories">Phụ kiện</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dành cho</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={readonly}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn đối tượng" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Nam</SelectItem>
                      <SelectItem value="female">Nữ</SelectItem>
                      <SelectItem value="kids">Trẻ em</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Danh mục con</FormLabel>
              {!readonly && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Ví dụ: Quần bơi nam"
                    value={newSubcategory}
                    onChange={(e) => setNewSubcategory(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubcategory())}
                  />
                  <Button type="button" onClick={handleAddSubcategory} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              {subcategories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {subcategories.map((sub, index) => {
                    // const label = readonly ? sub.name : sub;
                    const label = (readonly || editing) 
                    ? (typeof sub === 'object' && sub !== null ? sub.name : sub) 
                    : sub;
                    return (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {label}
                      {!readonly && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={() => handleRemoveSubcategory(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </Badge>
                  );
                })}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => {
                onOpenChange(false);
                if (!readonly && !editing) {
                  form.reset({
                    name: '',
                    icon: '',
                    gender: '',
                    type: ''
                  });
                  setSelectedIcon('');
                  setSubcategories([]);
                  setNewSubcategory('');
                }
              }}>
                Hủy
              </Button>
              {!readonly && (
                <Button type="submit">
                  {category ? 'Cập nhật' : 'Thêm mới'}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
