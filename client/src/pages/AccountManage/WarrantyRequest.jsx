import { useEffect, useState } from "react";
import { useToast } from "../../hooks/use-toast";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { MainNavigation } from "../../components/MainNavigation";
import AccountSideBar from "../../components/AccountSideBar";
import { getMyWarrantyRequests } from "../../api/warranty/warrantyApi";
import { Badge } from "../../components/ui/badge";
import { Check, X, Clock, FileText, Eye } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

const statusConfig = {
  pending: { label: "Đang chờ", color: "bg-yellow-500", icon: Clock },
  processing: { label: "Đang xử lý", color: "bg-blue-500", icon: FileText },
  completed: { label: "Hoàn thành", color: "bg-green-500", icon: Check },
  rejected: { label: "Từ chối", color: "bg-red-500", icon: X },
};

const resultConfig = {
  completed: { label: "Đã bảo hành", color: "bg-green-500", icon: Check },
  replaced: { label: "Đổi mới", color: "bg-blue-500", icon: FileText },
  rejected: { label: "Từ chối", color: "bg-red-500", icon: X },
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

const WarrantyRequest = () => {
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedWarranty, setSelectedWarranty] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadWarranties = async () => {
      try {
        setLoading(true);
        const params = filterStatus !== "all" ? { status: filterStatus } : {};
        const data = await getMyWarrantyRequests(params);
        setWarranties(data);
      } catch (err) {
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách yêu cầu bảo hành",
          variant: "destructive",
        });
        console.error("Error loading warranties:", err);
      } finally {
        setLoading(false);
      }
    };
    loadWarranties();
  }, [filterStatus]);

  

  const handleViewDetails = (warranty) => {
    setSelectedWarranty(warranty);
    setIsDetailDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MainNavigation />
      <main style={{ display: "flex" }}>
        <AccountSideBar path="warranty" />
        <div style={{ flex: 1, padding: "50px 150px" }}>
                     <div className="mb-6">
             <h1 style={{ fontSize: "25px", fontWeight: "bold" }}>
               Quản lý yêu cầu bảo hành
             </h1>
             <p className="text-muted-foreground">
               Xem các yêu cầu bảo hành cho sản phẩm của bạn
             </p>
           </div>

          <div className="mb-4 flex items-center gap-4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {Object.keys(statusConfig).map((status) => (
                  <SelectItem key={status} value={status}>
                    {statusConfig[status].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

                     {loading ? (
             <div className="text-center py-10">Đang tải...</div>
           ) : warranties.length === 0 ? (
             <div className="text-center py-10 text-muted-foreground">
               Chưa có yêu cầu bảo hành nào
             </div>
           ) : (
             <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-12 gap-4 bg-muted p-4 font-semibold text-sm">
                  <div className="col-span-2">Mã yêu cầu</div>
                  <div className="col-span-4">Tên sản phẩm</div>
                  <div className="col-span-2">Ngày gửi</div>
                  <div className="col-span-2">Trạng thái</div>
                  <div className="col-span-1 text-center">Thao tác</div>
                </div>

               <div className="divide-y">
                                   {warranties.map((warranty) => (
                    <div
                      key={warranty._id}
                      className="grid grid-cols-12 gap-4 p-4 hover:bg-muted/50 transition-colors items-center"
                    >
                      <div className="col-span-2">
                        <p className="font-mono text-sm">
                          {warranty._id.slice(0, 8)}
                        </p>
                      </div>
                      <div className="col-span-4">
                        <p className="text-sm font-medium">
                          {warranty.productId?.name || "N/A"}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm">
                          {new Date(warranty.createdAt).toLocaleDateString("vi-VN", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <Badge className={statusConfig[warranty.status]?.color}>
                          {statusConfig[warranty.status]?.label}
                        </Badge>
                      </div>
                      <div className="col-span-1 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(warranty)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
               </div>
             </div>
           )}

           <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
             <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
               <DialogHeader>
                 <DialogTitle>Chi tiết yêu cầu bảo hành</DialogTitle>
                 <DialogDescription>
                   Thông tin chi tiết về yêu cầu bảo hành của bạn
                 </DialogDescription>
               </DialogHeader>

               {selectedWarranty && (
                 <div className="space-y-4">
                   {selectedWarranty.productId?.image && (
                     <div className="flex gap-4">
                       <img
                         src={Array.isArray(selectedWarranty.productId.image)
                           ? selectedWarranty.productId.image[0]
                           : selectedWarranty.productId.image}
                         alt={selectedWarranty.productId.name || 'Product'}
                         className="w-32 h-32 object-cover rounded-lg border"
                       />
                       <div className="flex-1">
                         <h3 className="font-semibold text-lg">
                           {selectedWarranty.productId?.name || "Sản phẩm"}
                         </h3>
                         <p className="text-sm text-muted-foreground">
                           Mã yêu cầu: {selectedWarranty._id}
                         </p>
                       </div>
                     </div>
                   )}

                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <p className="text-sm text-muted-foreground">Trạng thái</p>
                       <Badge className={statusConfig[selectedWarranty.status]?.color}>
                         {statusConfig[selectedWarranty.status]?.label}
                       </Badge>
                     </div>
                     <div>
                       <p className="text-sm text-muted-foreground">Ngày gửi</p>
                       <p className="text-sm font-medium">
                         {new Date(selectedWarranty.createdAt).toLocaleDateString("vi-VN", {
                           year: "numeric",
                           month: "long",
                           day: "numeric",
                         })}
                       </p>
                     </div>
                     <div>
                       <p className="text-sm text-muted-foreground">Lý do</p>
                       <p className="text-sm font-medium">
                         {reasonConfig[selectedWarranty.reason] || selectedWarranty.reason}
                       </p>
                     </div>
                     {selectedWarranty.issueDate && (
                       <div>
                         <p className="text-sm text-muted-foreground">Ngày phát hiện lỗi</p>
                         <p className="text-sm font-medium">
                           {new Date(selectedWarranty.issueDate).toLocaleDateString("vi-VN")}
                         </p>
                       </div>
                     )}
                   </div>

                   <div>
                     <p className="text-sm text-muted-foreground mb-1">Mô tả</p>
                     <p className="text-sm">{selectedWarranty.description}</p>
                   </div>

                   {selectedWarranty.contactInfo && (
                     <div>
                       <p className="text-sm text-muted-foreground mb-1">Thông tin liên hệ</p>
                       <p className="text-sm">{selectedWarranty.contactInfo}</p>
                     </div>
                   )}

                   {selectedWarranty.attachments && selectedWarranty.attachments.length > 0 && (
                     <div>
                       <p className="text-sm text-muted-foreground mb-2">Hình ảnh/video đính kèm</p>
                       <div className="flex flex-wrap gap-2">
                         {selectedWarranty.attachments.map((attachment, idx) => (
                           <a
                             key={idx}
                             href={attachment}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="w-24 h-24 rounded-md border overflow-hidden hover:opacity-80 transition-opacity"
                           >
                             <img
                               src={attachment}
                               alt={`Attachment ${idx + 1}`}
                               className="w-full h-full object-cover"
                               onError={(e) => {
                                 e.target.style.display = 'none';
                               }}
                             />
                           </a>
                         ))}
                       </div>
                     </div>
                   )}

                    {(selectedWarranty.status === 'completed' || selectedWarranty.status === 'rejected') && selectedWarranty.result && (
                      <div className="border-t pt-4 mt-4">
                        <h4 className="font-semibold text-lg mb-3">Kết quả bảo hành</h4>
                        
                        <div className="mb-3">
                          <p className="text-sm text-muted-foreground mb-1">Kết quả</p>
                          <Badge className={resultConfig[selectedWarranty.result]?.color}>
                            {resultConfig[selectedWarranty.result]?.label}
                          </Badge>
                        </div>

                        {selectedWarranty.resolutionDate && (
                          <div className="mb-3">
                            <p className="text-sm text-muted-foreground mb-1">Ngày hoàn tất xử lý</p>
                            <p className="text-sm font-medium">
                              {new Date(selectedWarranty.resolutionDate).toLocaleDateString("vi-VN", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        )}

                        {selectedWarranty.resolutionNote && (
                          <div className="mb-3">
                            <p className="text-sm text-muted-foreground mb-1">Ghi chú về cách xử lý</p>
                            <p className="text-sm">{selectedWarranty.resolutionNote}</p>
                          </div>
                        )}

                        {selectedWarranty.result === 'rejected' && selectedWarranty.rejectReason && (
                          <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                              Lý do từ chối:
                            </p>
                            <p className="text-sm text-red-800 dark:text-red-200">{selectedWarranty.rejectReason}</p>
                          </div>
                        )}

                        {selectedWarranty.result === 'replaced' && selectedWarranty.replacementOrderId && (
                          <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                              Mã đơn hàng thay thế:
                            </p>
                            <p className="text-sm text-blue-800 dark:text-blue-200">{selectedWarranty.replacementOrderId}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedWarranty.adminNote && (!selectedWarranty.result || (selectedWarranty.status !== 'completed' && selectedWarranty.status !== 'rejected')) && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                          Ghi chú từ admin:
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-200">{selectedWarranty.adminNote}</p>
                      </div>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WarrantyRequest;
