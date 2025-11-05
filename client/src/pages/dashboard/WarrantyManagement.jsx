import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DataTable } from '../../components/dashboard/DataTable';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import Pagination from '../../components/pagination/Pagination';
import { useToast } from '../../hooks/use-toast';
import {
  getAllWarrantyRequests,
  processWarrantyRequest,
  updateWarrantyStatus,
  deleteWarrantyRequest,
} from '../../api/warranty/warrantyApi';
import { Check, X, Clock, FileText, TrendingUp, ShieldCheck, ShieldX } from 'lucide-react';

const warrantyResponseSchema = z.object({
  action: z.string({
    required_error: "Vui lòng chọn hành động",
  }).refine(
    (val) => ["approve", "replace", "reject"].includes(val),
    {
      message: "Vui lòng chọn hành động",
    }
  ),
  adminNote: z.string().optional(),
  rejectReason: z.string().optional(),
  replacementOrderId: z.string().optional(),
}).refine(
  (data) => {
    if (data.action === 'reject' && !data.rejectReason) {
      return false;
    }
    return true;
  },
  {
    path: ["rejectReason"],
    message: "Vui lòng nhập lý do từ chối",
  }
).refine(
  (data) => {
    if (data.action === 'replace' && !data.replacementOrderId) {
      return false;
    }
    return true;
  },
  {
    path: ["replacementOrderId"],
    message: "Vui lòng nhập mã đơn hàng thay thế",
  }
);

const warrantyStatusUpdateSchema = z.object({
  status: z.string({
    required_error: "Vui lòng chọn trạng thái",
  }).refine(
    (val) => ["pending", "processing", "completed", "rejected"].includes(val),
    {
      message: "Trạng thái không hợp lệ",
    }
  ),
  adminNote: z.string().optional(),
  rejectReason: z.string().optional(),
});

const statusConfig = {
  pending: { label: 'Đang chờ', color: 'bg-yellow-500', variant: 'secondary' },
  processing: { label: 'Đang xử lý', color: 'bg-blue-500', variant: 'default' },
  completed: { label: 'Hoàn thành', color: 'bg-green-500', variant: 'default' },
  rejected: { label: 'Từ chối', color: 'bg-red-500', variant: 'destructive' },
};

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

const WarrantyManagement = () => {
  const [warranties, setWarranties] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [reasonFilter, setReasonFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarranty, setSelectedWarranty] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdateStatusDialogOpen, setIsUpdateStatusDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [action, setAction] = useState('view');
  const { toast } = useToast();
  const itemsPerPage = 10;

  const { control, handleSubmit, reset, formState: { errors }, watch } = useForm({
    resolver: zodResolver(warrantyResponseSchema),
    defaultValues: {
      action: '',
      adminNote: '',
      rejectReason: '',
      replacementOrderId: '',
    },
  });

  const { control: updateStatusControl, handleSubmit: handleUpdateStatusSubmit, reset: resetUpdateStatus, formState: { errors: updateStatusErrors }, watch: watchUpdateStatus } = useForm({
    resolver: zodResolver(warrantyStatusUpdateSchema),
    defaultValues: {
      status: '',
      adminNote: '',
      rejectReason: '',
    },
  });

  const watchedAction = watch('action');
  const watchedStatus = watchUpdateStatus('status');

  const columns = [
    {
      key: 'warrantyRequestId',
      label: 'Mã yêu cầu',
      render: (value) => (
        <span className="font-mono text-sm">{value?.slice(0, 8) || 'N/A'}</span>
      ),
    },
    {
      key: 'customerName',
      label: 'Khách hàng',
      sortable: true,
    },
    {
      key: 'productName',
      label: 'Sản phẩm',
      sortable: true,
    },
    {
      key: 'submitDate',
      label: 'Ngày gửi',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('vi-VN'),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (value) => (
        <Badge variant={statusConfig[value]?.variant || 'secondary'}>
          {statusConfig[value]?.label || value}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (value, item) => {
        const warranty = item.warranty || item;
        return (
          <div className="flex items-center gap-2">
            {warranty.status === 'processing' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpdateStatus(item)}
              >
                <Clock className="h-4 w-4 mr-1" />
                Cập nhật
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    loadWarranties();
  }, [currentPage, statusFilter, reasonFilter, searchTerm]);

  const loadWarranties = async () => {
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (reasonFilter !== 'all') params.reason = reasonFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await getAllWarrantyRequests(params);
      const transformedData = response.data.map((warranty) => ({
        id: warranty._id,
        warrantyRequestId: warranty._id,
        customerName: warranty.customerId?.fullName || 'N/A',
        productName: warranty.productId?.name || 'N/A',
        submitDate: warranty.createdAt,
        status: warranty.status,
        warranty: warranty,
      }));
      setWarranties(transformedData);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách yêu cầu bảo hành',
        variant: 'destructive',
      });
      console.error('Error loading warranties:', err);
    }
  };

  const handleOpenDialog = (warrantyItem, actionType = 'view') => {
    const warranty = warrantyItem.warranty || warrantyItem;
    
    if (actionType === 'process' && warranty.status !== 'pending') {
      toast({
        title: 'Cảnh báo',
        description: 'Chỉ có thể xử lý yêu cầu ở trạng thái "Chờ duyệt"',
        variant: 'destructive',
      });
      return;
    }
    
    setSelectedWarranty(warranty);
    setAction(actionType);
    
    reset({
      action: '',
      adminNote: warranty.adminNote || '',
      rejectReason: warranty.rejectReason || '',
      replacementOrderId: warranty.replacementOrderId || '',
    });
    setIsDialogOpen(true);
  };

  const onSubmitWarrantyResponse = async (data) => {
    try {
      await processWarrantyRequest(selectedWarranty._id, {
        action: data.action,
        adminNote: data.adminNote,
        replacementOrderId: data.replacementOrderId,
        rejectReason: data.rejectReason,
      });

      toast({
        title: 'Thành công',
        description: 'Phản hồi yêu cầu bảo hành thành công',
      });
      setIsDialogOpen(false);
      reset();
      loadWarranties();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể xử lý yêu cầu',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = (warrantyItem) => {
    const warranty = warrantyItem.warranty || warrantyItem;
    setSelectedWarranty(warranty);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteWarrantyRequest(selectedWarranty._id);
      toast({
        title: 'Đã xóa',
        description: 'Xóa yêu cầu bảo hành thành công',
      });
      setIsDeleteDialogOpen(false);
      loadWarranties();
    } catch (err) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa yêu cầu',
        variant: 'destructive',
      });
      console.error('Error deleting warranty:', err);
    }
  };

  const handleView = (warrantyItem) => {
    handleOpenDialog(warrantyItem, 'view');
  };

  const handleUpdateStatus = (warrantyItem) => {
    const warranty = warrantyItem.warranty || warrantyItem;
    setSelectedWarranty(warranty);
    
    resetUpdateStatus({
      status: warranty.status || '',
      result: warranty.result || '',
      resolutionNote: warranty.resolutionNote || '',
      adminNote: warranty.adminNote || '',
      rejectReason: warranty.rejectReason || '',
      replacementOrderId: warranty.replacementOrderId || '',
    });
    
    setIsUpdateStatusDialogOpen(true);
  };

  const onSubmitStatusUpdate = async (data) => {
    try {
      await updateWarrantyStatus(selectedWarranty._id, {
        status: data.status,
        adminNote: data.adminNote || null,
        rejectReason: data.rejectReason || null,
      });

      toast({
        title: 'Thành công',
        description: 'Cập nhật trạng thái yêu cầu bảo hành thành công',
      });
      setIsUpdateStatusDialogOpen(false);
      resetUpdateStatus();
      loadWarranties();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: error.response?.data?.message || 'Không thể cập nhật trạng thái',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý yêu cầu bảo hành</h1>
        <p className="text-muted-foreground">
          Xem và xử lý các yêu cầu bảo hành từ khách hàng
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Trạng thái</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Lý do</label>
              <Select value={reasonFilter} onValueChange={setReasonFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn lý do" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả lý do</SelectItem>
                  {Object.entries(reasonConfig).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <DataTable
        title={`Danh sách yêu cầu bảo hành (${warranties.length})`}
        data={warranties}
        columns={columns}
        onView={handleView}
        onEdit={(item) => handleOpenDialog(item, 'process')}
        onDelete={handleDelete}
        searchPlaceholder="Tìm kiếm theo mã, khách hàng, sản phẩm..."
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
      />

       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
         <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
              <DialogTitle>
                {action === 'process'
                  ? 'Phản hồi yêu cầu bảo hành'
                  : 'Chi tiết yêu cầu bảo hành'}
              </DialogTitle>
              <DialogDescription>
                {action === 'process'
                  ? 'Chọn hành động cho yêu cầu bảo hành này (Chấp nhận, Đổi sản phẩm, hoặc Từ chối)'
                  : 'Xem chi tiết yêu cầu bảo hành'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmitWarrantyResponse)}>
                      {action === 'view' && selectedWarranty ? (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Thông tin khách hàng</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Tên khách hàng</label>
                    <p className="font-medium">{selectedWarranty.customerId?.fullName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Email</label>
                    <p className="font-medium">{selectedWarranty.customerId?.email || 'N/A'}</p>
                  </div>
                                     <div>
                     <label className="text-sm text-muted-foreground">Số điện thoại</label>
                     <p className="font-medium">{selectedWarranty.customerId?.phone || 'N/A'}</p>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Mã đơn hàng
                  </label>
                  <p className="font-medium font-mono">{selectedWarranty.orderId?._id || selectedWarranty.orderId || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Mã sản phẩm
                  </label>
                  <p className="font-medium font-mono">{selectedWarranty.productId?._id || selectedWarranty.productId || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Tên sản phẩm
                  </label>
                  <p className="font-medium">{selectedWarranty.productId?.name || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Mã yêu cầu
                  </label>
                  <p className="font-medium font-mono">{selectedWarranty._id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Màu
                  </label>
                  <p className="font-medium">{selectedWarranty.selectedColor || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Kích thước
                  </label>
                  <p className="font-medium">{selectedWarranty.selectedSize || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Trạng thái
                  </label>
                  <div>
                    <Badge variant={statusConfig[selectedWarranty.status]?.variant}>
                      {statusConfig[selectedWarranty.status]?.label}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Ngày gửi
                  </label>
                  <p className="font-medium">
                    {new Date(selectedWarranty.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Lý do
                  </label>
                  <p className="font-medium">
                    {reasonConfig[selectedWarranty.reason] || selectedWarranty.reason}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Mô tả
                </label>
                <p className="font-medium">{selectedWarranty.description}</p>
              </div>

              {selectedWarranty.adminNote && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Ghi chú
                  </label>
                  <p className="font-medium">{selectedWarranty.adminNote}</p>
                </div>
              )}
            </div>
                     ) : action === 'process' ? (
             <div className="space-y-4">
               <div>
                  <label className="text-sm font-medium">
                    Hành động <span className="text-red-500">*</span>
                  </label>
                 <Controller
                   name="action"
                   control={control}
                   render={({ field }) => (
                     <Select value={field.value || ''} onValueChange={field.onChange}>
                       <SelectTrigger>
                         <SelectValue placeholder="Chọn hành động" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="approve">
                           <div className="flex items-center gap-2">
                             <ShieldCheck className="h-4 w-4 text-green-600" />
                             Chấp nhận
                           </div>
                         </SelectItem>
                         <SelectItem value="replace">
                           <div className="flex items-center gap-2">
                             <FileText className="h-4 w-4 text-blue-600" />
                             Đổi sản phẩm
                           </div>
                         </SelectItem>
                         <SelectItem value="reject">
                           <div className="flex items-center gap-2">
                             <ShieldX className="h-4 w-4 text-red-600" />
                             Từ chối
                           </div>
                         </SelectItem>
                       </SelectContent>
                     </Select>
                   )}
                 />
                 {errors.action && (
                   <p className="text-sm text-destructive mt-1">{errors.action.message}</p>
                 )}
               </div>

               {watchedAction === 'reject' && (
                 <div>
                   <label className="text-sm font-medium">Lý do từ chối <span className="text-red-500">*</span></label>
                   <Controller
                     name="rejectReason"
                     control={control}
                     render={({ field }) => (
                       <Textarea
                         {...field}
                         rows={3}
                         placeholder="Nhập lý do từ chối..."
                       />
                     )}
                   />
                   {errors.rejectReason && (
                     <p className="text-sm text-destructive mt-1">{errors.rejectReason.message}</p>
                   )}
                 </div>
               )}

               {watchedAction === 'replace' && (
                 <div>
                   <label className="text-sm font-medium">
                     Mã đơn hàng thay thế <span className="text-red-500">*</span>
                   </label>
                   <Controller
                     name="replacementOrderId"
                     control={control}
                     render={({ field }) => (
                       <Input
                         {...field}
                         placeholder="Nhập mã đơn hàng thay thế"
                       />
                     )}
                   />
                   {errors.replacementOrderId && (
                     <p className="text-sm text-destructive mt-1">{errors.replacementOrderId.message}</p>
                   )}
                 </div>
               )}

               <div>
                 <label className="text-sm font-medium">Ghi chú (tùy chọn)</label>
                 <Controller
                   name="adminNote"
                   control={control}
                   render={({ field }) => (
                     <Textarea
                       {...field}
                       rows={4}
                       placeholder="Nhập ghi chú cho khách hàng..."
                     />
                   )}
                 />
               </div>
             </div>
           ) : null}

           <DialogFooter>
             <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
               Hủy
             </Button>
             {action === 'process' && (
               <Button type="submit">Phản hồi</Button>
             )}
           </DialogFooter>
           </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isUpdateStatusDialogOpen} onOpenChange={setIsUpdateStatusDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cập nhật trạng thái yêu cầu bảo hành</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpdateStatusSubmit(onSubmitStatusUpdate)}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  Trạng thái <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="status"
                  control={updateStatusControl}
                  render={({ field }) => (
                    <Select value={field.value || ''} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {updateStatusErrors.status && (
                  <p className="text-sm text-destructive mt-1">{updateStatusErrors.status.message}</p>
                )}
              </div>

              

              {watchedStatus === 'rejected' && (
                <div>
                  <label className="text-sm font-medium">Lý do từ chối</label>
                  <Controller
                    name="rejectReason"
                    control={updateStatusControl}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        rows={3}
                        placeholder="Nhập lý do từ chối..."
                      />
                    )}
                  />
                </div>
              )}

              

              <div>
                <label className="text-sm font-medium">Ghi chú admin</label>
                <Controller
                  name="adminNote"
                  control={updateStatusControl}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder="Nhập ghi chú cho admin..."
                    />
                  )}
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button variant="outline" type="button" onClick={() => setIsUpdateStatusDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit">Cập nhật</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa yêu cầu bảo hành này? Hành động này không thể hoàn
              tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Xác nhận xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default WarrantyManagement;
