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
import { Checkbox } from '../../components/ui/checkbox';
import { useState, useEffect } from 'react';

const subcategorySchema = z.object({
  name: z.string().min(1, 'Tên danh mục con là bắt buộc'),
  // categoryId: z.string().min(1, 'Danh mục chính là bắt buộc'),
  brandIds: z.array(z.string()).min(0),
});

export const SubcategoryForm = ({
  open,
  readonly,
  editing,
  onOpenChange,
  subcategory,
  // eslint-disable-next-line no-unused-vars
  categories,
  brands,
  onSubmit,
}) => {
  const [selectedBrandIds, setSelectedBrandIds] = useState([]);
  const form = useForm({
    resolver: zodResolver(subcategorySchema),
    defaultValues: {
      name: subcategory?.name || '',
      categoryId: subcategory?.categoryId || '',
      brandIds: subcategory?.brands.map((b) => b.id) || [],
    },
  });

  useEffect(() => {
    form.reset({
      name: subcategory?.name || '',
      categoryId: subcategory?.categoryId || '',
      brandIds: subcategory?.brands.map((b) => b.id) || [],
    });
  }, [form, subcategory]);

  // Update selected brands when subcategory changes
  useEffect(() => {
    if (subcategory) {
      const brandIds = subcategory.brands.map((b) => b._id);
      setSelectedBrandIds(brandIds);
      form.setValue('brandIds', brandIds);
    } else {
      setSelectedBrandIds([]);
      form.setValue('brandIds', []);
    }
  }, [subcategory, readonly, editing, form]);

  const handleBrandToggle = (brandId, checked) => {
    const newSelectedIds = checked
      ? [...selectedBrandIds, brandId]
      : selectedBrandIds.filter((id) => id !== brandId);

    setSelectedBrandIds(newSelectedIds);
    form.setValue('brandIds', newSelectedIds);
  };

  const handleSubmit = (values) => {
    const selectedBrands = brands.filter((brand) => values.brandIds.includes(brand._id));
    const subcategoryData = {
      id : subcategory?._id,
      name: values.name,
      categoryId: subcategory?.category?._id,
      brandIds: selectedBrands,
    };

    onSubmit(subcategoryData);
    onOpenChange(false);
    form.reset();
    setSelectedBrandIds([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {readonly 
              ?'Chi tiết danh mục con' 
              : subcategory
              ? 'Chỉnh sửa danh mục con' 
              : 'Thêm danh mục con mới'
            }
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên danh mục con</FormLabel>
                  <FormControl>
                    <Input placeholder="Ví dụ: Quần bơi nam, Đồ bơi nữ" {...field} disabled={readonly}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Danh mục chính</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập danh mục chính"
                      {...field}
                      disabled={readonly || editing} 
                      value={
                        subcategory?.category?.name || ''
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="brandIds"
              render={() => (
                <FormItem>
                  <FormLabel>Thương hiệu</FormLabel>
                  <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                    {brands.length > 0 ? (
                      brands.map((brand) => (
                        <div key={brand._id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`brand-${brand._id}`}
                            checked={selectedBrandIds.includes(brand._id)}
                            onCheckedChange={(checked) =>
                              handleBrandToggle(brand._id, checked)
                            }
                            disabled={readonly}
                          />
                          <label
                            htmlFor={`brand-${brand._id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {brand.name}
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Chưa có thương hiệu nào được tạo
                      </p>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              {!readonly && (
                <Button type="submit">{subcategory ? 'Cập nhật' : 'Thêm mới'}</Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
