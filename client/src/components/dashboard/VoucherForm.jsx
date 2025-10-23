import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

// ✅ Schema xác thực cho voucher
const voucherSchema = z
  .object({
    code: z.string().min(3, "Mã voucher phải có ít nhất 3 ký tự").trim(),

    description: z.string().optional(),

    discountType: z.enum(["fixed", "percentage"], {
      required_error: "Vui lòng chọn loại giảm giá",
    }),

    discountValue: z
      .number({ invalid_type_error: "Giá trị giảm phải là số" })
      .min(1, "Giá trị giảm phải lớn hơn 0"),

    minOrderAmount: z
      .number({ invalid_type_error: "Giá trị đơn hàng tối thiểu phải là số" })
      .min(0, "Giá trị đơn hàng tối thiểu không hợp lệ"),

    usageLimit: z
      .number({ invalid_type_error: "Giới hạn sử dụng phải là số" })
      .min(0, "Giới hạn sử dụng không hợp lệ"),

    usagePerUser: z
      .number({ invalid_type_error: "Số lần sử dụng mỗi người phải là số" })
      .min(1, "Phải >= 1 lần cho mỗi người dùng"),

    startDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
    endDate: z.string().min(1, "Vui lòng chọn ngày kết thúc"),

    targetUserGroup: z.enum(["all", "new", "vip"]).default("all"),
    isActive: z.boolean().default(true),
  })

  // ✅ Rule 1: Ngày bắt đầu ≥ hôm nay
  .refine(
    (data) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(data.startDate);
      return start >= today;
    },
    {
      path: ["startDate"],
      message: "Ngày bắt đầu phải từ hôm nay trở đi",
    }
  )

  // ✅ Rule 2: Ngày kết thúc ≥ ngày bắt đầu
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end >= start;
    },
    {
      path: ["endDate"],
      message: "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu",
    }
  )

  // ✅ Rule 3: Nếu discountType = 'percentage' thì discountValue ≤ 100
  .refine(
    (data) => {
      if (data.discountType === "percentage") {
        return data.discountValue <= 100;
      }
      return true;
    },
    {
      path: ["discountValue"],
      message: "Giá trị giảm phần trăm không được vượt quá 100%",
    }
  );

export const VoucherForm = ({ isOpen, onClose, onSubmit, voucher }) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(voucherSchema),
    defaultValues: {
      code: "",
      description: "",
      discountType: "fixed",
      discountValue: 0,
      minOrderAmount: 0,
      usageLimit: 0,
      usagePerUser: 1,
      startDate: "",
      endDate: "",
      targetUserGroup: "all",
      isActive: true,
    },
  });

  useEffect(() => {
    if (voucher) {
      reset({
        code: voucher.code || "",
        description: voucher.description || "",
        discountType: voucher.discountType || "fixed",
        discountValue: voucher.discountValue || 0,
        minOrderAmount: voucher.minOrderAmount || 0,
        usageLimit: voucher.usageLimit || 0,
        usagePerUser: voucher.usagePerUser || 1,
        startDate: voucher.startDate
          ? new Date(voucher.startDate).toISOString().slice(0, 10)
          : "",
        endDate: voucher.endDate
          ? new Date(voucher.endDate).toISOString().slice(0, 10)
          : "",
        targetUserGroup: voucher.targetUserGroup || "all",
        isActive: voucher.isActive ?? true,
      });
    }
  }, [voucher, reset]);

  const onFormSubmit = (data) => {
    onSubmit({
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {voucher ? "Cập nhật voucher" : "Thêm voucher mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
          {/* Code + Trạng thái */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Mã voucher</Label>
              <Controller
                name="code"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="VD: SUMMER10" />
                )}
              />
              {errors.code && (
                <p className="text-sm text-destructive">
                  {errors.code.message}
                </p>
              )}
            </div>

            <div>
              <Label>Trạng thái</Label>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ? "active" : "inactive"}
                    onValueChange={(val) => field.onChange(val === "active")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Hoạt động</SelectItem>
                      <SelectItem value="inactive">Không hoạt động</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <Label>Mô tả</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder="VD: Giảm 10% cho đơn hàng trên 500k"
                />
              )}
            />
          </div>

          {/* Loại giảm & Giá trị */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Loại giảm giá</Label>
              <Controller
                name="discountType"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại giảm giá" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Giảm theo số tiền</SelectItem>
                      <SelectItem value="percentage">
                        Giảm theo phần trăm
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.discountType && (
                <p className="text-sm text-destructive">
                  {errors.discountType.message}
                </p>
              )}
            </div>

            <div>
              <Label>Giá trị giảm</Label>
              <Controller
                name="discountValue"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    placeholder="VD: 100000 hoặc 10 (%)"
                  />
                )}
              />
              {errors.discountValue && (
                <p className="text-sm text-destructive">
                  {errors.discountValue.message}
                </p>
              )}
            </div>
          </div>

          {/* Giới hạn & điều kiện */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Giá trị đơn hàng tối thiểu</Label>
              <Controller
                name="minOrderAmount"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    placeholder="VD: 500000"
                  />
                )}
              />
            </div>

            <div>
              <Label>Giới hạn sử dụng (toàn hệ thống)</Label>
              <Controller
                name="usageLimit"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    placeholder="0 = Không giới hạn"
                  />
                )}
              />
            </div>

            <div>
              <Label>Số lần / người dùng</Label>
              <Controller
                name="usagePerUser"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
            </div>
          </div>

          {/* Thời gian áp dụng */}
          {/* Thời gian áp dụng */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Ngày bắt đầu</Label>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="date"
                    placeholder="Chọn ngày bắt đầu"
                  />
                )}
              />
              {errors.startDate && (
                <p className="text-sm text-destructive mt-1">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            <div>
              <Label>Ngày kết thúc</Label>
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="date"
                    placeholder="Chọn ngày kết thúc"
                  />
                )}
              />
              {errors.endDate && (
                <p className="text-sm text-destructive mt-1">
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Nhóm người dùng áp dụng */}
          <div>
            <Label>Nhóm người dùng áp dụng</Label>
            <Controller
              name="targetUserGroup"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nhóm người dùng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả người dùng</SelectItem>
                    <SelectItem value="new">Khách hàng mới</SelectItem>
                    <SelectItem value="vip">Khách hàng VIP</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit">{voucher ? "Cập nhật" : "Thêm mới"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
