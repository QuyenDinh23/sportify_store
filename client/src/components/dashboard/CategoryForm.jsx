import { useState } from 'react';
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
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { X, Plus, Shirt, Waves, Footprints, Watch, Glasses, Backpack, Trophy, Target, Dumbbell, Bike, Users, Calendar, MapPin } from 'lucide-react';

const availableIcons = [
  { name: 'Shirt', icon: Shirt, label: 'Áo quần' },
  { name: 'Waves', icon: Waves, label: 'Đồ bơi' },
  { name: 'Footprints', icon: Footprints, label: 'Giày dép' },
  { name: 'Watch', icon: Watch, label: 'Phụ kiện' },
  { name: 'Glasses', icon: Glasses, label: 'Kính' },
  { name: 'Backpack', icon: Backpack, label: 'Túi xách' },
  { name: 'Trophy', icon: Trophy, label: 'Thể thao' },
  { name: 'Target', icon: Target, label: 'Mục tiêu' },
  { name: 'Dumbbell', icon: Dumbbell, label: 'Gym' },
  { name: 'Bike', icon: Bike, label: 'Xe đạp' },
  { name: 'Users', icon: Users, label: 'Nhóm' },
  { name: 'Calendar', icon: Calendar, label: 'Lịch' },
  { name: 'MapPin', icon: MapPin, label: 'Địa điểm' },
];

const categorySchema = z.object({
  name: z.string().min(1, 'Tên danh mục là bắt buộc'),
  icon: z.string().min(1, 'Icon là bắt buộc'),
});

export const CategoryForm = ({ open, onOpenChange, category, onSubmit }) => {
  const [subcategories, setSubcategories] = useState(category?.subcategories || []);
  const [newSubcategory, setNewSubcategory] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(category?.icon || '');

  const form = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      icon: category?.icon || '',
    },
  });

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

  const handleSubmit = (values) => {
    const categoryData = {
      ...(category?.id && { id: category.id }),
      name: values.name,
      icon: values.icon,
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
            {category ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
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
                    <Input placeholder="Ví dụ: Đồ bơi nam" {...field} />
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

            <div className="space-y-2">
              <FormLabel>Danh mục con</FormLabel>
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
              
              {subcategories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {subcategories.map((sub, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {sub}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                        onClick={() => handleRemoveSubcategory(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit">
                {category ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
