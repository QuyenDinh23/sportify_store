import Header from "../../components/Header";
import Footer from "../../components/Footer";

const Section = ({ title, children }) => (
  <section className="space-y-2">
    <h2 className="text-xl font-semibold">{title}</h2>
    <div className="text-sm text-muted-foreground leading-6">{children}</div>
  </section>
);

const ReturnWarrantyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-10 max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Chính sách Đổi trả & Bảo hành</h1>
          <p className="text-muted-foreground mt-2">
            Áp dụng cho tất cả sản phẩm mua tại SportShop. Vui lòng đọc kỹ điều khoản trước khi gửi yêu cầu.
          </p>
        </div>

        <Section title="1. Thời hạn & phạm vi">
          <ul className="list-disc ml-5 space-y-1">
            <li>Đổi trả trong 7 ngày kể từ ngày nhận hàng khi sản phẩm còn nguyên vẹn, đầy đủ phụ kiện, tem/nhãn.</li>
            <li>Bảo hành 30 ngày đối với lỗi kỹ thuật của nhà sản xuất.</li>
            <li>Không áp dụng cho hư hỏng do sử dụng sai cách hoặc tác động ngoại lực (rách, cháy, biến dạng...).</li>
          </ul>
        </Section>

        <Section title="2. Hình thức xử lý">
          <ul className="list-disc ml-5 space-y-1">
            <li>Sửa chữa/bảo hành miễn phí nếu do lỗi kỹ thuật.</li>
            <li>Đổi mới cùng mẫu hoặc tương đương nếu không thể sửa chữa.</li>
            <li>Hoàn tiền trong một số trường hợp theo mục 3.</li>
          </ul>
        </Section>

        <Section title="3. Quy định hoàn tiền">
          <ul className="list-disc ml-5 space-y-1">
            <li>Chỉ áp dụng cho đơn đã giao hàng và thanh toán không phải COD.</li>
            <li>Khi yêu cầu hoàn tiền, cần cung cấp thông tin tài khoản ngân hàng chính chủ.</li>
            <li>Nếu sản phẩm hoàn về nguyên vẹn: nhập kho lại, tiến hành hoàn tiền.</li>
            <li>Nếu sản phẩm hoàn về rách/hỏng: loại bỏ, không cộng tồn kho; vẫn hoàn tiền nếu đủ điều kiện.</li>
          </ul>
        </Section>

        <Section title="4. Cách gửi yêu cầu">
          <ul className="list-decimal ml-5 space-y-1">
            <li>Đăng nhập tài khoản và vào mục Tài khoản → Yêu cầu bảo hành.</li>
            <li>Chọn đơn hàng/sản phẩm cần hỗ trợ và mô tả vấn đề, kèm hình ảnh/video.</li>
            <li>Nếu chọn hoàn tiền, điền thông tin ngân hàng ở mục Hoàn tiền.</li>
            <li>Đội ngũ CSKH sẽ phản hồi trong vòng 24-48 giờ làm việc.</li>
          </ul>
        </Section>

        <Section title="5. Liên hệ hỗ trợ">
          <p>
            Trung tâm CSKH: 1900-XXXX (8:00 - 21:00) • Email: cskh@sportshop.vn
          </p>
        </Section>
      </main>
      <Footer />
    </div>
  );
};

export default ReturnWarrantyPolicy;


