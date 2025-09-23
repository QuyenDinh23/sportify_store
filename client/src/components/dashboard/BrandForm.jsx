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

export const BrandForm = ({ open, onOpenChange, brand, onSubmit }) => {
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

            {/* <FormField name="image" control={form.control} rules={{ required: "Vui lòng chọn hình ảnh" }} render={({ field }) => (
                <FormItem>
                  <FormLabel>Hình ảnh</FormLabel>
                  <FormControl>
                    <>
                      <Input type="file" accept="image/*" ref={fileInputRef} onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setPreview(URL.createObjectURL(file));
                          setUploading(true);
                          try {
                            const url = await uploadToCloudinary(file);
                            console.log("URL hình ảnh:", url);
                            form.setValue("image", url);
                          } catch (err) {
                            console.error("Lỗi upload ảnh:", err);
                          } finally {
                            setUploading(false);
                          }
                        }
                      }} />
                      {uploading && <p className="text-sm text-muted">Đang tải ảnh...</p>}
                      {preview && (
                        <img src={preview} alt="Preview" className="mt-2 h-32 rounded-md object-cover border" />
                      )}
                    </>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} /> */}

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
