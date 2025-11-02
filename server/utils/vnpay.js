import crypto from 'crypto';
import qs from 'qs'; // Dùng qs thay vì querystring để đúng với code mẫu VNPay
import dotenv from 'dotenv';

// Đảm bảo dotenv được load (nếu chưa load ở config.js)
dotenv.config();

// VNPay Configuration
const VNPAY_TMN_CODE = process.env.VNPAY_TMN_CODE || '';
const VNPAY_SECRET_KEY = process.env.VNPAY_SECRET_KEY || '';

// Log để debug (chỉ khi chưa có giá trị)
if (!VNPAY_TMN_CODE || !VNPAY_SECRET_KEY) {
  console.error('⚠️ VNPay config missing!');
  console.error('VNPAY_TMN_CODE:', VNPAY_TMN_CODE ? 'OK' : 'MISSING');
  console.error('VNPAY_SECRET_KEY:', VNPAY_SECRET_KEY ? 'OK' : 'MISSING');
}
const VNPAY_URL = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const VNPAY_RETURN_URL = process.env.VNPAY_RETURN_URL || 'http://localhost:3000/api/orders/payment/vnpay-return';
const VNPAY_IPN_URL = process.env.VNPAY_IPN_URL || 'http://localhost:3000/api/orders/payment/vnpay-ipn';

/**
 * Sắp xếp object theo thứ tự alphabet (theo chuẩn VNPay)
 * Copy từ code mẫu VNPay để đảm bảo tính chính xác
 * @param {Object} obj - Object cần sắp xếp
 * @returns {Object} Object đã được sắp xếp
 */
// Function sortObject - COPY NGUYÊN TỪ CODE MẪU VNPAY (line 304-318)
// Phải giống Y HỆT code mẫu để hash đúng - không được thay đổi logic!
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    // Code mẫu dùng: obj[str[key]] - không decode!
    // Vì các key như "vnp_Amount", "vnp_Command" khi encode vẫn giữ nguyên
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

/**
 * Tạo payment URL từ VNPay
 * @param {Object} params - Thông tin thanh toán
 * @param {String} params.orderId - Mã đơn hàng
 * @param {Number} params.amount - Số tiền thanh toán (VND)
 * @param {String} params.orderDescription - Mô tả đơn hàng
 * @param {String} params.orderType - Loại đơn hàng
 * @param {String} params.locale - Ngôn ngữ (vn, en)
 * @param {String} params.ipAddr - Địa chỉ IP khách hàng
 * @returns {String} Payment URL
 */
export const createPaymentUrl = (params) => {
  // Kiểm tra cấu hình VNPay
  if (!VNPAY_TMN_CODE || !VNPAY_SECRET_KEY) {
    throw new Error('VNPAY_TMN_CODE và VNPAY_SECRET_KEY phải được cấu hình trong .env');
  }

  const {
    orderId,
    amount,
    orderDescription = 'Thanh toan don hang',
    orderType = 'other',
    locale = 'vn',
    ipAddr = '127.0.0.1'
  } = params;

  // Validate inputs
  if (!orderId) {
    throw new Error('orderId is required');
  }
  if (!amount || amount <= 0) {
    throw new Error('amount must be greater than 0');
  }

  // Set timezone GMT+7 (Asia/Ho_Chi_Minh) - QUAN TRỌNG!
  process.env.TZ = 'Asia/Ho_Chi_Minh';
  const date = new Date();
  
  // Format date: yyyyMMddHHmmss (theo chuẩn VNPay, GMT+7)
  // Code mẫu VNPay dùng: moment(date).format('YYYYMMDDHHmmss')
  // Với process.env.TZ = 'Asia/Ho_Chi_Minh', các hàm getFullYear/getMonth... đã tự động dùng GMT+7
  // Đơn giản và chính xác nhất: dùng các hàm local time
  const formatDateVNPay = (d) => {
    // Khi process.env.TZ = 'Asia/Ho_Chi_Minh', các hàm này sẽ trả về thời gian GMT+7
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  };
  
  const createDate = formatDateVNPay(date);
  console.log('VNPay createDate (GMT+7):', createDate);
  console.log('Current server time:', new Date().toString());
  
  // Expire date: +45 phút (tăng thêm để đảm bảo đủ thời gian)
  const expireDateObj = new Date(date.getTime() + 45 * 60 * 1000);
  const expireDate = formatDateVNPay(expireDateObj);
  console.log('VNPay expireDate (GMT+7):', expireDate);
  console.log('Expire time difference:', (expireDateObj.getTime() - date.getTime()) / 1000 / 60, 'minutes');
  
  // Validate dates
  if (createDate.length !== 14) {
    throw new Error(`Invalid createDate format: ${createDate} (must be yyyyMMddHHmmss)`);
  }
  if (expireDate.length !== 14) {
    throw new Error(`Invalid expireDate format: ${expireDate} (must be yyyyMMddHHmmss)`);
  }

  // Chuẩn hóa mô tả đơn hàng (Tiếng Việt không dấu, không ký tự đặc biệt)
  const normalizeOrderInfo = (text) => {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu
      .replace(/[^\w\s]/g, ' ') // Thay ký tự đặc biệt bằng space
      .replace(/\s+/g, ' ') // Xóa space thừa
      .trim();
  };

  // Kiểm tra các giá trị trước khi tạo params
  console.log('VNPay params validation:');
  console.log('  orderId:', orderId);
  console.log('  amount:', amount, '-> vnp_Amount:', Math.round(amount * 100));
  console.log('  createDate:', createDate);
  console.log('  ipAddr:', ipAddr);
  console.log('  returnUrl:', VNPAY_RETURN_URL);

  // Tạo params - theo ĐÚNG code mẫu VNPay
  // Lưu ý: Code mẫu VNPay KHÔNG có vnp_ExpireDate
  // Chỉ thêm các params có trong code mẫu để đảm bảo hash đúng
  const vnp_Params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: VNPAY_TMN_CODE,
    vnp_Locale: locale,
    vnp_CurrCode: 'VND',
    vnp_TxnRef: String(orderId), // Đảm bảo là string
    vnp_OrderInfo: normalizeOrderInfo(orderDescription),
    vnp_OrderType: orderType,
    vnp_Amount: Math.round(amount * 100), // VNPay yêu cầu số tiền nhân 100, phải là số nguyên
    vnp_ReturnUrl: VNPAY_RETURN_URL,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate
    // KHÔNG thêm vnp_ExpireDate vì code mẫu VNPay không có
    // Nếu thêm sẽ làm hash sai!
  };

  // Sắp xếp lại các tham số theo thứ tự alphabet (theo chuẩn VNPay)
  const sortedParams = sortObject(vnp_Params);

  // Tạo query string để tính chữ ký (theo chuẩn VNPay)
  // Code mẫu dùng qs.stringify với encode: false
  const signData = qs.stringify(sortedParams, { encode: false });
  console.log('VNPay signData (để tính hash):', signData);
  console.log('VNPay sortedParams:', sortedParams);
  
  // Tạo chữ ký với SHA512 (theo chuẩn VNPay)
  // Code mẫu VNPay dùng: new Buffer(signData, 'utf-8')
  // Trong Node.js hiện đại, dùng Buffer.from() hoặc truyền string trực tiếp
  const hmac = crypto.createHmac('sha512', VNPAY_SECRET_KEY);
  // Code mẫu dùng: hmac.update(new Buffer(signData, 'utf-8'))
  // Buffer.from() là cách hiện đại thay thế new Buffer()
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  console.log('VNPay secureHash:', signed);
  console.log('VNPay secretKey length:', VNPAY_SECRET_KEY.length);
  console.log('VNPay tmnCode:', VNPAY_TMN_CODE);
  
  // Thêm chữ ký vào params
  sortedParams['vnp_SecureHash'] = signed;

  // Tạo URL thanh toán (theo chuẩn VNPay - dùng qs.stringify với encode: false)
  const paymentUrl = VNPAY_URL + '?' + qs.stringify(sortedParams, { encode: false });
  console.log('VNPay paymentUrl:', paymentUrl);
  
  return paymentUrl;
};

/**
 * Xác thực chữ ký từ VNPay callback
 * @param {Object} vnp_Params - Các tham số từ VNPay callback
 * @returns {Boolean} true nếu chữ ký hợp lệ
 */
export const verifySecureHash = (vnp_Params) => {
  const secureHash = vnp_Params['vnp_SecureHash'];
  
  // Tạo object copy để không thay đổi object gốc
  const paramsCopy = { ...vnp_Params };
  delete paramsCopy['vnp_SecureHash'];
  delete paramsCopy['vnp_SecureHashType'];

  // Sắp xếp lại các tham số (theo chuẩn VNPay)
  const sortedParams = sortObject(paramsCopy);

  // Tạo query string để tính chữ ký (theo chuẩn VNPay)
  const signData = qs.stringify(sortedParams, { encode: false });
  
  // Tạo chữ ký với SHA512
  const hmac = crypto.createHmac('sha512', VNPAY_SECRET_KEY);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  
  return secureHash === signed;
};

// Export các URL để sử dụng trong controller
export { VNPAY_RETURN_URL, VNPAY_IPN_URL };

