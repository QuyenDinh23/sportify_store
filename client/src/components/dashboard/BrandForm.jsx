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
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';

const brandSchema = z.object({
  name: z.string().min(1, 'Tên thương hiệu là bắt buộc'),
  subcategoryId: z.string().min(1, 'Danh mục con là bắt buộc'),
  logo: z.string().optional(),
  description: z.string().optional(),
});

export const BrandForm = ({ open, onOpenChange, brand, subcategories, onSubmit }) => {
  const form = useForm({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: brand?.name || '',
      subcategoryId: brand?.subcategoryId || '',
      logo: brand?.logo || '',
      description: brand?.description || '',
    },
  });

  const handleSubmit = (values) => {
    const brandData = {
      ...(brand?.id && { id: brand.id }),
      name: values.name,
      subcategoryId: values.subcategoryId,
      logo: values.logo,
      description: values.description,
      subBrands: brand?.subBrands || [],
    };
    onSubmit(brandData);
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {brand ? 'Chỉnh sửa thương hiệu' : 'Thêm thương hiệu mới'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên thương hiệu</FormLabel>
                  <FormControl>
                    <Input placeholder="Ví dụ: Nike, Adidas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subcategoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Danh mục con</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục con" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subcategories.map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL (Tùy chọn)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả (Tùy chọn)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả ngắn về thương hiệu..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit">
                {brand ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
