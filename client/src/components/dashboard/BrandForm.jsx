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
import { useEffect, useState } from 'react';
import { uploadToBackend } from '../../api/image/uploadImageApi';

  const brandSchema = z.object({
    name: z.string().min(1, 'Tên thương hiệu là bắt buộc'),
    logo: z.string().optional(),
    description: z.string().optional(),
  });

  export const BrandForm = ({ open, readonly, editing, onOpenChange, brand, onSubmit }) => {
    const [preview, setPreview] = useState(brand?.logo || '');
    const [uploading, setUploading] = useState(false);
    const form = useForm({
      resolver: zodResolver(brandSchema),
      defaultValues: {
        name: brand?.name || '',
        logo: brand?.logo || '',
        description: brand?.description || '',
      },
    });

    useEffect(() => {
      form.reset({
        name: brand?.name || '',
        logo: brand?.logo || '',
        description: brand?.description || '',
      });
      setPreview(brand?.logo || '');
    }, [brand, form]);

    const handleSubmit = (values) => {
      const brandData = {
        id : brand?._id,
        name: values.name,
        logo: values.logo,
        description: values.description,
      };
      onSubmit(brandData);
      onOpenChange(false);
      form.reset();
    };
    const handleFileChange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      try {
        const url = await uploadToBackend(file); // gọi api backend
        console.log("URL: ", url);
        setPreview(url);          // hiển thị preview
        form.setValue("logo", url); // cập nhật giá trị logo vào react-hook-form
      } catch (err) {
        console.error("Upload thất bại2:", err);
      } finally {
        setUploading(false);
      }
    };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {readonly
                ? 'Xem chi tiết thương hiệu'
                : brand
                ? 'Chỉnh sửa thương hiệu'
                : 'Thêm thương hiệu mới'}
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
                    <Input placeholder="Ví dụ: Nike, Adidas" {...field} disabled={readonly}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
              <FormField
                control={form.control}
                name="logo"
              // eslint-disable-next-line no-unused-vars
                render={({ field }) => (
                <FormItem>
                  <FormLabel>Hình ảnh</FormLabel>
                  <FormControl>
                    <>
                      <Input type="file" accept="image/*" onChange={handleFileChange} disabled={readonly}/>
                      {uploading && <p className="text-sm text-muted">Đang tải ảnh...</p>}
                      {preview && (
                        <img
                          src={preview}
                          alt="Preview"
                          className="mt-2 h-32 rounded-md object-cover border"
                        />
                      )}
                    </>
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
                      disabled={readonly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() =>{
                  onOpenChange(false);
                  if (!readonly && !editing) {
                  form.reset({
                    name: '',
                    logo: '',
                    description: '',
                  });
                  setPreview('');
                }
              }}>
                Hủy
              </Button>
              {!readonly && (
                <Button type="submit">
                  {brand ? 'Cập nhật' : 'Thêm mới'}
                </Button>
              )}              
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
