import { useState, useEffect } from 'react';
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

const sportIcons = [
  '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏓', '🏸', '🏒', '🏑',
  '🥍', '🏊‍♂️', '🏃‍♂️', '🚴‍♂️', '🏋️‍♂️', '🤸‍♂️', '🧘‍♂️', '🥊', '🤼‍♂️', '💪'
];

const sportFormSchema = z.object({
  name: z.string().trim().min(1, { message: "Tên môn thể thao không được để trống" })
    .max(100, { message: "Tên môn thể thao không được quá 100 ký tự" }),
  icon: z.string().min(1, { message: "Vui lòng chọn biểu tượng" }),
  description: z.string().trim().min(1, { message: "Mô tả không được để trống" })
    .max(500, { message: "Mô tả không được quá 500 ký tự" })
});

export function SportForm({ sport, isOpen, onClose, onSubmit }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(sportFormSchema),
    defaultValues: {
      name: '',
      icon: '',
      description: ''
    }
  });

  useEffect(() => {
    if (sport) {
      form.reset({
        name: sport.name,
        icon: sport.icon,
        description: sport.description
      });
    } else {
      form.reset({
        name: '',
        icon: '',
        description: ''
      });
    }
  }, [sport, form]);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const sportData = {
        id: sport?.id || `sport-${Date.now()}`,
        name: data.name,
        icon: data.icon,
        description: data.description
      };

      onSubmit(sportData);
      onClose();
      form.reset();
    } catch (error) {
      console.error('Lỗi khi lưu môn thể thao:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-background border shadow-lg">
        <DialogHeader>
          <DialogTitle>
            {sport ? 'Chỉnh sửa môn thể thao' : 'Thêm môn thể thao mới'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên môn thể thao</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập tên môn thể thao..."
                      {...field}
                      className="bg-background border"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biểu tượng</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <div className="grid grid-cols-10 gap-2 p-3 border rounded-md bg-background max-h-32 overflow-y-auto">
                        {sportIcons.map((icon) => (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => field.onChange(icon)}
                            className={`p-2 text-xl hover:bg-accent rounded ${
                              field.value === icon ? 'bg-primary text-primary-foreground' : ''
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                      {field.value && (
                        <div className="text-center">
                          <span className="text-2xl">{field.value}</span>
                        </div>
                      )}
                    </div>
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
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập mô tả môn thể thao..."
                      {...field}
                      className="bg-background border"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                variant="sport"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang lưu...' : (sport ? 'Cập nhật' : 'Thêm mới')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
