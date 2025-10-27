import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const WARRANTY_REASONS = [
  "missing_item",
  "wrong_item",
  "broken_damaged",
  "defective_not_working",
  "expired",
  "different_from_description",
  "used_item",
  "fake_counterfeit",
  "intact_no_longer_needed"
];

const warrantyRequestSchema = z.object({
  reason: z.string({
    required_error: "Vui lòng chọn lý do",
  }).refine(
    (val) => WARRANTY_REASONS.includes(val),
    {
      message: "Vui lòng chọn lý do",
    }
  ),
  description: z.string().min(10, "Mô tả phải có ít nhất 10 ký tự").max(1000, "Mô tả không được quá 1000 ký tự"),
  issueDate: z.string().optional(),
  contactInfo: z.string().optional(),
  attachments: z.string().min(1, "Vui lòng nhập ít nhất 1 URL file đính kèm"),
}).refine(
  (data) => {
    const urls = data.attachments
      .split(",")
      .map((url) => url.trim())
      .filter((url) => url);
    return urls.length > 0;
  },
  {
    path: ["attachments"],
    message: "Cần ít nhất 1 file đính kèm",
  }
);

const reasonConfig = {
  missing_item: "Thiếu hàng",
  wrong_item: "Người bán gửi sai hàng",
  broken_damaged: "Hàng bể vỡ",
  defective_not_working: "Hàng lỗi, không hoạt động",
  expired: "Hàng hết hạn sử dụng",
  different_from_description: "Khác với mô tả",
  used_item: "Hàng đã qua sử dụng",
  fake_counterfeit: "Hàng giả, nhái",
  intact_no_longer_needed: "Hàng nguyên vẹn nhưng không còn nhu cầu",
};

export const WarrantyRequestDialog = ({ isOpen, onClose, onSubmit, product, order }) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(warrantyRequestSchema),
    defaultValues: {
      reason: "",
      description: "",
      issueDate: "",
      contactInfo: "",
      attachments: "",
    },
  });

  useEffect(() => {
    if (!isOpen) {
      reset({
        reason: "",
        description: "",
        issueDate: "",
        contactInfo: "",
        attachments: "",
      });
    }
  }, [isOpen, reset]);

  const onFormSubmit = (data) => {
    const attachments = data.attachments
      .split(",")
      .map((url) => url.trim())
      .filter((url) => url);

    const warrantyData = {
      orderId: order._id,
      productId: product.productId?._id || product.productId,
      reason: data.reason,
      description: data.description,
      issueDate: data.issueDate || undefined,
      contactInfo: data.contactInfo || undefined,
      attachments,
    };

    onSubmit(warrantyData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Yêu cầu bảo hành</DialogTitle>
          <DialogDescription>
            Điền thông tin về sản phẩm cần bảo hành
          </DialogDescription>
        </DialogHeader>

        {product && (
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Sản phẩm: {product.name}</p>
              <p className="text-xs text-muted-foreground">
                {product.selectedColor} - {product.selectedSize}
              </p>
            </div>

            <div>
              <Label>
                Lý do yêu cầu bảo hành <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="reason"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn lý do" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(reasonConfig).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.reason && (
                <p className="text-sm text-destructive mt-1">{errors.reason.message}</p>
              )}
            </div>

            <div>
              <Label>
                Mô tả chi tiết <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    rows={4}
                    placeholder="Mô tả chi tiết về lỗi gặp phải..."
                  />
                )}
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <Label>Ngày phát hiện lỗi (tùy chọn)</Label>
              <Controller
                name="issueDate"
                control={control}
                render={({ field }) => <Input type="date" {...field} />}
              />
              {errors.issueDate && (
                <p className="text-sm text-destructive mt-1">{errors.issueDate.message}</p>
              )}
            </div>

            <div>
              <Label>Thông tin liên hệ thêm (tùy chọn)</Label>
              <Controller
                name="contactInfo"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Số điện thoại hoặc email" />
                )}
              />
              {errors.contactInfo && (
                <p className="text-sm text-destructive mt-1">{errors.contactInfo.message}</p>
              )}
            </div>

            <div>
              <Label>
                File đính kèm (URL) <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="attachments"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Nhập URL hình ảnh/video (phân cách bởi dấu phẩy)"
                  />
                )}
              />
              {errors.attachments && (
                <p className="text-sm text-destructive mt-1">{errors.attachments.message}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Cần ít nhất 1 file đính kèm (ảnh hoặc video minh chứng lỗi)
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
